#!/bin/bash

BASE_URL="http://127.0.0.1:8000/api/v1"
TOKEN_QA="35|I1IBBfERxyJfDTfA9lNeTcgTsNrFLiuaELXPpWnm84bb12e2"
ID_QA=3
ID_QA2=4
ID_POST=7

echo "--- 14.1a: Submit report (User) ---"
curl -s -X POST "$BASE_URL/reports" \
  -H "Authorization: Bearer $TOKEN_QA" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d "{\"reportable_type\": \"user\", \"reportable_id\": $ID_QA2, \"type\": \"harassment\", \"description\": \"Test harassment report\"}" | jq .

echo -e "\n--- 14.1b: Submit report (Post) ---"
curl -s -X POST "$BASE_URL/reports" \
  -H "Authorization: Bearer $TOKEN_QA" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d "{\"reportable_type\": \"post\", \"reportable_id\": $ID_POST, \"type\": \"spam\", \"description\": \"Test spam report\"}" | jq .

echo -e "\n--- 14.1c: Prevent self-report ---"
curl -s -X POST "$BASE_URL/reports" \
  -H "Authorization: Bearer $TOKEN_QA" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d "{\"reportable_type\": \"user\", \"reportable_id\": $ID_QA, \"type\": \"spam\"}" | jq .

echo -e "\n--- 14.1d: Prevent duplicate report ---"
curl -s -X POST "$BASE_URL/reports" \
  -H "Authorization: Bearer $TOKEN_QA" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d "{\"reportable_type\": \"user\", \"reportable_id\": $ID_QA2, \"type\": \"harassment\"}" | jq .

echo -e "\n--- 14.2: List my reports ---"
curl -s -X GET "$BASE_URL/reports/my" \
  -H "Authorization: Bearer $TOKEN_QA" \
  -H "Accept: application/json" | jq .
