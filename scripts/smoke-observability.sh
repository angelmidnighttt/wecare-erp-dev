#!/usr/bin/env bash
# Smoke test: generate traffic, then verify metrics (Prometheus) and logs (Elasticsearch).
set -u
GW=http://localhost:3000/api
PROM=http://localhost:9090
ES=http://localhost:9200

echo "### waiting for gateway to be ready..."
until curl -sf "$GW/health" >/dev/null 2>&1; do sleep 2; done
echo "gateway ready."

echo "### generating traffic"
curl -s -X POST "$GW/auth/register" -H "Content-Type: application/json" -d '{"email":"khoa@wecare.dev","password":"secret123"}' >/dev/null
TOKEN=$(curl -s -X POST "$GW/auth/login" -H "Content-Type: application/json" -d '{"email":"khoa@wecare.dev","password":"secret123"}' | python -c "import sys,json;print(json.load(sys.stdin)['accessToken'])")
for i in 1 2 3 4 5; do
  curl -s -X POST "$GW/auth/register" -H "Content-Type: application/json" -d "{\"email\":\"u$i@wecare.dev\",\"password\":\"p$i\"}" >/dev/null
  curl -s -X POST "$GW/orders" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d "{\"total\":$((i*50))}" >/dev/null
  curl -s "$GW/orders/order_x$i" -H "Authorization: Bearer $TOKEN" >/dev/null
done
# one failed login (warn log + error path)
curl -s -X POST "$GW/auth/login" -H "Content-Type: application/json" -d '{"email":"khoa@wecare.dev","password":"WRONG"}' >/dev/null
echo "traffic done."

echo "### waiting for a Prometheus scrape that captures business traffic..."
until curl -s "$PROM/api/v1/query?query=rpc_requests_total" | grep -q '"pattern"'; do sleep 3; done

echo
echo "================ HTTP metrics (gateway routes) ================"
curl -s "$PROM/api/v1/query?query=http_requests_total" | python -c "
import sys,json
d=json.load(sys.stdin)['data']['result']
for m in sorted(d, key=lambda x:(x['metric'].get('service',''), x['metric'].get('route',''))):
    L=m['metric']
    print(f\"{L.get('service'):14} {L.get('method'):5} {L.get('route'):24} {L.get('status_code')} => {m['value'][1]}\")"

echo
echo "================ RPC metrics (microservice handlers) ================"
curl -s "$PROM/api/v1/query?query=rpc_requests_total" | python -c "
import sys,json
d=json.load(sys.stdin)['data']['result']
for m in d:
    L=m['metric']
    print(f\"{L.get('service'):14} {L.get('pattern'):34} {L.get('status'):8} => {m['value'][1]}\")"

echo
echo "================ Elasticsearch log counts by service ================"
curl -s "$ES/wecare-logs/_search" -H "Content-Type: application/json" -d '{"size":0,"aggs":{"by_service":{"terms":{"field":"service"}}}}' | python -c "
import sys,json
b=json.load(sys.stdin)['aggregations']['by_service']['buckets']
for x in b: print(f\"{x['key']:14} {x['doc_count']} logs\")"

echo
echo "================ Sample business logs (msg + metadata) ================"
curl -s "$ES/wecare-logs/_search" -H "Content-Type: application/json" -d '{"size":6,"query":{"terms":{"context":["registeruserhandler","loginhandler","createorderhandler"]}},"_source":["time","service","context","msg","email","userId","orderId","level"],"sort":[{"time":"desc"}]}' | python -c "
import sys,json
h=json.load(sys.stdin)['hits']['hits']
for x in h:
    s=x['_source']
    extra={k:s[k] for k in ('email','userId','orderId') if k in s}
    print(f\"{s.get('time')} [{s.get('service')}] {s.get('msg'):32} {extra}\")"
echo
echo "### DONE"
