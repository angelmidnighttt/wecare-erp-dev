# WeCare ERP — NestJS Microservices (DDD + CQRS)

Monorepo NestJS gồm 3 ứng dụng giao tiếp qua **Redis transport**, mỗi service
dùng database PostgreSQL riêng (database-per-service). Auth & Order service được
tổ chức theo **Domain-Driven Design + CQRS**.

```
┌──────────────┐      Redis       ┌────────────────┐   PostgreSQL
│ api-gateway  │  ─────────────▶  │ auth-service   │ ───▶ wecare_auth
│  (HTTP :3000)│                  ├────────────────┤
│              │  ─────────────▶  │ order-service  │ ───▶ wecare_order
└──────────────┘                  └────────────────┘
                                                   │
                          CDC (logical replication)│
                                                   ▼
        wecare_order ─▶ Debezium ─▶ Kafka ─▶ ClickHouse (wecare_analytics.orders)
```

## Cấu trúc thư mục

```
apps/
  api-gateway/            # HTTP REST → proxy message tới các service (Redis)
    src/
      app.controller.ts   # Hello World + /health
      modules/
        auth/             # client proxy → auth-service
        order/            # client proxy → order-service

  auth-service/           # microservice (DDD + CQRS)
    src/
      domain/             # entities, value-objects, events, repository ports
      application/        # commands / queries + handlers (CQRS)
      infrastructure/     # TypeORM persistence + repository implementations
      interface/          # @MessagePattern controllers (Redis)

  order-service/          # microservice (cùng layout DDD + CQRS)

libs/
  shared/                 # constants, message patterns, Redis options dùng chung

docker/
  Dockerfile              # multi-stage, build cho từng APP_NAME
  postgres/init-multiple-dbs.sh   # tạo nhiều database lúc khởi tạo
  debezium/order-connector.json   # cấu hình Debezium PostgreSQL connector
  clickhouse/init.sql             # Kafka engine + MV + bảng đích (CDC sink)
docker-compose.yml        # postgres + redis + 3 services + kafka + debezium + clickhouse
```

### Các tầng DDD (mỗi service)

| Tầng           | Vai trò                                                        |
|----------------|---------------------------------------------------------------|
| `domain`       | Aggregate, value object, domain event, repository **interface**. Không phụ thuộc framework. |
| `application`  | CQRS: `Command`/`Query` + handler. Điều phối use-case.        |
| `infrastructure`| Hiện thực repository bằng TypeORM, ORM entity.               |
| `interface`    | Controller nhận message qua Redis, dịch sang command/query.   |

## Chạy bằng Docker (khuyến nghị)

```bash
cp .env.example .env
docker compose up --build
```

- API Gateway: <http://localhost:3000/api>
- PostgreSQL: `localhost:5432` (2 DB: `wecare_auth`, `wecare_order`)
- Redis: `localhost:6379`

## Chạy local (dev)

```bash
npm install
# bật riêng postgres + redis:
docker compose up -d postgres redis

# mỗi service một terminal:
npm run start:gateway
npm run start:auth
npm run start:order
```

## Thử nhanh các endpoint

```bash
# Hello world
curl http://localhost:3000/api

# Auth (gateway → Redis → auth-service → CQRS command)
curl -X POST http://localhost:3000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"a@b.com","password":"123456"}'

# Order
curl -X POST http://localhost:3000/api/orders \
  -H 'Content-Type: application/json' \
  -d '{"customerId":"user_1","total":99000}'
```

> Lưu ý: phần handler hiện ở mức **Hello World** (chưa hash password, chưa xử lý
> nghiệp vụ thật) — chỉ dựng sẵn khung DDD + CQRS để bạn điền logic.

## CDC: đồng bộ PostgreSQL → ClickHouse (Debezium + Kafka)

Pipeline Change-Data-Capture cho bảng `orders`:

```
Postgres (wal_level=logical)
  └─ Debezium PostgreSQL connector (Kafka Connect :8083)
       └─ Kafka topic: wecare_order.public.orders
            └─ ClickHouse Kafka engine table
                 └─ Materialized View → wecare_analytics.orders (ReplacingMergeTree)
```

Các thành phần trong `docker-compose.yml`:

| Service          | Vai trò                                                  |
|------------------|----------------------------------------------------------|
| `kafka`          | Broker Kafka KRaft (không cần Zookeeper)                  |
| `connect`        | Kafka Connect + Debezium (REST tại `:8083`)              |
| `connector-init` | Job 1 lần: tự `PUT` đăng ký connector (idempotent, retry)|
| `clickhouse`     | Đích phân tích, tự tạo bảng từ `docker/clickhouse/init.sql` (`:8123` HTTP / `:9000` native) |

### Trình tự khởi động

```bash
docker compose up --build
```

`postgres` chạy với `wal_level=logical`; `connector-init` sẽ retry tới khi
`connect` sẵn sàng **và** bảng `public.orders` đã tồn tại (do order-service tạo
qua TypeORM `synchronize`). Vì vậy hãy để order-service chạy ít nhất một lần.

### Kiểm tra dữ liệu đã sync

```bash
# 1. Tạo vài order qua gateway
curl -X POST http://localhost:3000/api/orders \
  -H 'Content-Type: application/json' \
  -d '{"customerId":"user_1","total":99000}'

# 2. Kiểm tra trạng thái connector
curl http://localhost:8083/connectors/wecare-order-connector/status

# 3. Đọc dữ liệu trong ClickHouse
docker exec -it wecare-clickhouse clickhouse-client \
  --user wecare --password wecare_secret \
  --query "SELECT * FROM wecare_analytics.orders FINAL"
```

> Muốn sync thêm bảng/khác service (vd `users` của auth): copy
> `docker/debezium/order-connector.json`, đổi `database.dbname`, `table.include.list`,
> `slot.name`, `topic.prefix`, rồi tạo bảng Kafka engine + MV tương ứng trong ClickHouse.
>
> `init.sql` của ClickHouse chỉ chạy **lần đầu** khi volume còn trống — nếu sửa file
> này sau đó, chạy lại bằng `docker compose down -v` hoặc apply SQL thủ công.
