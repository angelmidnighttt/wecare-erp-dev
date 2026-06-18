-- =====================================================================
-- ClickHouse CDC sink for the Order service.
--
-- Pipeline: postgres(orders) -> Debezium -> Kafka topic
--           "wecare.public.orders" -> Kafka engine table
--           -> materialized view -> ReplacingMergeTree target.
--
-- Debezium message (value.converter.schemas.enable=false) looks like:
--   { "before": {...}, "after": { "id": "...", "customerId": "...",
--     "total": 99000, "status": "PENDING" }, "op": "c", "ts_ms": 123 }
-- We read each message as a raw JSON string and extract fields in the MV.
-- =====================================================================

CREATE DATABASE IF NOT EXISTS wecare_analytics;

-- 1) Kafka engine table — consumes the Debezium topic, one JSON doc per row.
CREATE TABLE IF NOT EXISTS wecare_analytics.kafka_orders_queue
(
    raw String
)
ENGINE = Kafka
SETTINGS
    kafka_broker_list = 'kafka:9092',
    kafka_topic_list = 'wecare.public.orders',
    kafka_group_name = 'clickhouse_orders_sink',
    kafka_format = 'JSONAsString',
    kafka_num_consumers = 1,
    kafka_skip_broken_messages = 100;

-- 2) Target analytics table.
CREATE TABLE IF NOT EXISTS wecare_analytics.orders
(
    id          String,
    customerId  String,
    total       Float64,
    status      String,
    op          LowCardinality(String),       -- c=create, u=update, d=delete, r=snapshot
    ts_ms       UInt64,
    synced_at   DateTime DEFAULT now()
)
ENGINE = ReplacingMergeTree(ts_ms)
ORDER BY id;

-- 3) Materialized view — parses the Debezium envelope into the target table.
CREATE MATERIALIZED VIEW IF NOT EXISTS wecare_analytics.orders_mv
TO wecare_analytics.orders AS
SELECT
    JSONExtractString(raw, 'after', 'id')         AS id,
    JSONExtractString(raw, 'after', 'customerId') AS customerId,
    JSONExtractFloat(raw, 'after', 'total')       AS total,
    JSONExtractString(raw, 'after', 'status')     AS status,
    JSONExtractString(raw, 'op')                  AS op,
    JSONExtractUInt(raw, 'ts_ms')                 AS ts_ms
FROM wecare_analytics.kafka_orders_queue
WHERE JSONExtractString(raw, 'op') != 'd';        -- skip deletes (after is null)
