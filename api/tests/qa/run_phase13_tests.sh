#!/bin/bash

BASE_URL="http://127.0.0.1:8000/api/v1"
TOKEN_QA="34|cxkv8uarMcHZE75jh1JFTpTW4rdoZ0epuMBGyLdl8eb72181"
NOTIF_ID=1

echo "--- 13.1: List notifications ---"
curl -s -X GET "$BASE_URL/notifications" \
  -H "Authorization: Bearer $TOKEN_QA" \
  -H "Accept: application/json" | jq .

echo -e "\n--- 13.2: Mark one as read ---"
curl -s -X POST "$BASE_URL/notifications/$NOTIF_ID/read" \
  -H "Authorization: Bearer $TOKEN_QA" \
  -H "Accept: application/json" | jq .

echo -e "\n--- 13.3: Mark all as read ---"
curl -s -X POST "$BASE_URL/notifications/read-all" \
  -H "Authorization: Bearer $TOKEN_QA" \
  -H "Accept: application/json" | jq .

echo -e "\n--- 13.4: Get notification settings ---"
curl -s -X GET "$BASE_URL/notifications/settings" \
  -H "Authorization: Bearer $TOKEN_QA" \
  -H "Accept: application/json" | jq .

echo -e "\n--- 13.5: Update notification settings ---"
curl -s -X PUT "$BASE_URL/notifications/settings" \
  -H "Authorization: Bearer $TOKEN_QA" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d "{\"mute_all\": true, \"push_enabled\": false}" | jq .

echo -e "\n--- 13.6: Register device token ---"
curl -s -X POST "$BASE_URL/notifications/device-token" \
  -H "Authorization: Bearer $TOKEN_QA" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d "{\"token\": \"test_token_123\", \"platform\": \"android\", \"device_name\": \"QA_Phone\"}" | jq .

echo -e "\n--- 13.7: Remove device token ---"
curl -s -X DELETE "$BASE_URL/notifications/device-token" \
  -H "Authorization: Bearer $TOKEN_QA" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d "{\"token\": \"test_token_123\"}" | jq .
