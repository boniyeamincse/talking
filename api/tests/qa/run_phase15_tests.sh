#!/bin/bash

BASE_URL="http://127.0.0.1:8000/api/v1"
TOKEN_SUPER="40|Yiw4UNvWUmORS2aqvB3TaklPSrok7FO065LnYy4F28135a11"
TOKEN_ADMIN="41|sCamHOyzsYKMzKSKW300uJ0fjN9NgeF5ND9fD60a830e49f2"

ID_TARGET=9
ID_DEMOTE=10
ID_REPORT=5
ID_GIFT=31
ID_CATEGORY=8

echo "=== Admin-Level Routes (Role: admin) ==="

echo -e "\n--- 15.1: List users ---"
curl -s -X GET "$BASE_URL/admin/users" \
  -H "Authorization: Bearer $TOKEN_ADMIN" \
  -H "Accept: application/json" | jq '.data | .[0,1]'

echo -e "\n--- 15.2: User detail ---"
curl -s -X GET "$BASE_URL/admin/users/$ID_TARGET" \
  -H "Authorization: Bearer $TOKEN_ADMIN" \
  -H "Accept: application/json" | jq .

echo -e "\n--- 15.3: Suspend user ---"
curl -s -X POST "$BASE_URL/admin/users/$ID_TARGET/suspend" \
  -H "Authorization: Bearer $TOKEN_ADMIN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"reason": "QA Test Suspension", "days": 7}' | jq .

echo -e "\n--- 15.4: Restore user ---"
curl -s -X POST "$BASE_URL/admin/users/$ID_TARGET/restore" \
  -H "Authorization: Bearer $TOKEN_ADMIN" \
  -H "Accept: application/json" | jq .

echo -e "\n--- 15.5: Warn user ---"
curl -s -X POST "$BASE_URL/admin/users/$ID_TARGET/warn" \
  -H "Authorization: Bearer $TOKEN_ADMIN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"reason": "QA Warning", "details": "Please follow guidelines"}' | jq .

echo -e "\n--- 15.6: List reports ---"
curl -s -X GET "$BASE_URL/admin/reports?status=pending" \
  -H "Authorization: Bearer $TOKEN_ADMIN" \
  -H "Accept: application/json" | jq '.data | .[0]'

echo -e "\n--- 15.7: Report detail ---"
curl -s -X GET "$BASE_URL/admin/reports/$ID_REPORT" \
  -H "Authorization: Bearer $TOKEN_ADMIN" \
  -H "Accept: application/json" | jq .

echo -e "\n--- 15.8: Resolve report ---"
curl -s -X POST "$BASE_URL/admin/reports/$ID_REPORT/resolve" \
  -H "Authorization: Bearer $TOKEN_ADMIN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"status": "resolved", "admin_notes": "Report investigated and resolved"}' | jq .

echo -e "\n--- 15.9: User analytics ---"
curl -s -X GET "$BASE_URL/admin/analytics/users" \
  -H "Authorization: Bearer $TOKEN_ADMIN" \
  -H "Accept: application/json" | jq .

echo -e "\n--- 15.10: Call analytics ---"
curl -s -X GET "$BASE_URL/admin/analytics/calls" \
  -H "Authorization: Bearer $TOKEN_ADMIN" \
  -H "Accept: application/json" | jq .

echo -e "\n\n=== Super Admin Routes (Role: super_admin) ==="

echo -e "\n--- 15.11: Ban user ---"
curl -s -X POST "$BASE_URL/admin/users/$ID_TARGET/ban" \
  -H "Authorization: Bearer $TOKEN_SUPER" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"reason": "Serious QA violation"}' | jq .

echo -e "\n--- 15.12: List admins ---"
curl -s -X GET "$BASE_URL/admin/admins" \
  -H "Authorization: Bearer $TOKEN_SUPER" \
  -H "Accept: application/json" | jq '.data | .[0,1]'

echo -e "\n--- 15.13: Create admin ---"
NEW_ADMIN_USER="admin_$(date +%s)"
curl -s -X POST "$BASE_URL/admin/admins" \
  -H "Authorization: Bearer $TOKEN_SUPER" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d "{\"name\": \"Temp Admin\", \"username\": \"$NEW_ADMIN_USER\", \"email\": \"$NEW_ADMIN_USER@example.com\", \"password\": \"password\", \"role\": \"admin\"}" | jq .

echo -e "\n--- 15.14: Update admin ---"
curl -s -X PUT "$BASE_URL/admin/admins/$ID_DEMOTE" \
  -H "Authorization: Bearer $TOKEN_SUPER" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"name": "Updated Admin Name"}' | jq .

echo -e "\n--- 15.15: Remove admin ---"
curl -s -X DELETE "$BASE_URL/admin/admins/$ID_DEMOTE" \
  -H "Authorization: Bearer $TOKEN_SUPER" \
  -H "Accept: application/json" | jq .

echo -e "\n--- 15.16: Platform overview ---"
curl -s -X GET "$BASE_URL/admin/analytics/overview" \
  -H "Authorization: Bearer $TOKEN_SUPER" \
  -H "Accept: application/json" | jq .

echo -e "\n--- 15.17: Revenue analytics ---"
curl -s -X GET "$BASE_URL/admin/analytics/revenue" \
  -H "Authorization: Bearer $TOKEN_SUPER" \
  -H "Accept: application/json" | jq .

echo -e "\n--- 15.18: Get settings ---"
curl -s -X GET "$BASE_URL/admin/settings" \
  -H "Authorization: Bearer $TOKEN_SUPER" \
  -H "Accept: application/json" | jq .

echo -e "\n--- 15.19: Update settings ---"
curl -s -X PUT "$BASE_URL/admin/settings" \
  -H "Authorization: Bearer $TOKEN_SUPER" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"settings": {"test_setting": {"value": "new_test_value", "type": "string"}}}' | jq .

echo -e "\n--- 15.20: List gifts ---"
curl -s -X GET "$BASE_URL/admin/gifts" \
  -H "Authorization: Bearer $TOKEN_SUPER" \
  -H "Accept: application/json" | jq '.data | .[0]'

echo -e "\n--- 15.21: Create gift ---"
curl -s -X POST "$BASE_URL/admin/gifts" \
  -H "Authorization: Bearer $TOKEN_SUPER" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d "{\"gift_category_id\": $ID_CATEGORY, \"name\": \"New Admin Gift\", \"price_coins\": 50, \"rarity\": \"rare\"}" | jq .

echo -e "\n--- 15.22: Update gift ---"
curl -s -X PUT "$BASE_URL/admin/gifts/$ID_GIFT" \
  -H "Authorization: Bearer $TOKEN_SUPER" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"price_coins": 15}' | jq .

echo -e "\n--- 15.23: Delete gift ---"
curl -s -X DELETE "$BASE_URL/admin/gifts/$ID_GIFT" \
  -H "Authorization: Bearer $TOKEN_SUPER" \
  -H "Accept: application/json" | jq .
