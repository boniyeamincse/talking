#!/bin/bash

BASE_URL="http://127.0.0.1:8000/api/v1"
TOKEN_QA="25|9CM6oleVIWuL7nwYeYeqwTrrIRYrUhY6MHfnDO4M7f7e0397"
TOKEN_QA2="26|fDwgT92hnbGoWyBvmvARshQS64lmlgHt899ruAkVa680d5ab"
ID_QA2=4
ID_GIFT=1

echo "--- 11.1: List gifts ---"
curl -s -X GET "$BASE_URL/gifts" \
  -H "Authorization: Bearer $TOKEN_QA" \
  -H "Accept: application/json" | jq '.data[0,1]'

echo -e "\n--- 11.2: Gift categories ---"
curl -s -X GET "$BASE_URL/gifts/categories" \
  -H "Authorization: Bearer $TOKEN_QA" \
  -H "Accept: application/json" | jq '.data[0]'

echo -e "\n--- 11.6: Coin balance (Initial) ---"
curl -s -X GET "$BASE_URL/gifts/coins/balance" \
  -H "Authorization: Bearer $TOKEN_QA" \
  -H "Accept: application/json" | jq .

echo -e "\n--- 11.7: Top-up coins (Mock) ---"
# Note: This might fail if Stripe is not configured, but we want to see the error or behavior
TOPUP_RES=$(curl -s -X POST "$BASE_URL/gifts/coins/topup" \
  -H "Authorization: Bearer $TOKEN_QA" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d "{\"amount\": 500, \"payment_method_id\": \"pm_card_visa\"}")
echo "$TOPUP_RES" | jq .

# If Stripe fails, we can't get a real intent ID, but we can try to guess or use a dummy for the confirm endpoint
# The confirm endpoint in CoinService doesn't strictly verify the intent against Stripe in its current form
# (it just takes the coin_amount and credits it).

echo -e "\n--- 11.8: Confirm top-up ---"
curl -s -X POST "$BASE_URL/gifts/coins/confirm" \
  -H "Authorization: Bearer $TOKEN_QA" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d "{\"payment_intent_id\": \"pi_mock_123\", \"coin_amount\": 500}" | jq .

echo -e "\n--- 11.6: Coin balance (After Top-up) ---"
curl -s -X GET "$BASE_URL/gifts/coins/balance" \
  -H "Authorization: Bearer $TOKEN_QA" \
  -H "Accept: application/json" | jq .

echo -e "\n--- 11.3: Send gift (QA -> QA2) ---"
curl -s -X POST "$BASE_URL/gifts/send" \
  -H "Authorization: Bearer $TOKEN_QA" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d "{\"gift_id\": $ID_GIFT, \"receiver_id\": $ID_QA2, \"message\": \"Enjoy this gift!\"}" | jq .

echo -e "\n--- 11.4: Gift history (QA - Sent) ---"
curl -s -X GET "$BASE_URL/gifts/history?type=sent" \
  -H "Authorization: Bearer $TOKEN_QA" \
  -H "Accept: application/json" | jq '.data[0]'

echo -e "\n--- 11.4: Gift history (QA2 - Received) ---"
curl -s -X GET "$BASE_URL/gifts/history?type=received" \
  -H "Authorization: Bearer $TOKEN_QA2" \
  -H "Accept: application/json" | jq '.data[0]'

echo -e "\n--- 11.5: Leaderboard ---"
curl -s -X GET "$BASE_URL/gifts/leaderboard" \
  -H "Authorization: Bearer $TOKEN_QA" \
  -H "Accept: application/json" | jq .

echo -e "\n--- 11.9: Coin transactions ---"
curl -s -X GET "$BASE_URL/gifts/coins/transactions" \
  -H "Authorization: Bearer $TOKEN_QA" \
  -H "Accept: application/json" | jq '.data[0,1]'
