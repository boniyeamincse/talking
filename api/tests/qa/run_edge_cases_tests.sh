#!/bin/bash

BASE_URL="http://127.0.0.1:8000/api/v1"
TOKEN_USER="44|wgxMdHCwf8Bt5asVZPmy1BbhM5X6JwVABVlPEDpP614cf438"
TOKEN_ADMIN="43|jXA7tYp4apmV3HylgY6im0B7qmdRi6uFOdxeH5UUaf725c5e"
TOKEN_SUPER="42|BzPo4qmMqxatl7pqSiDPD5SF3Z11o6MMHrtJ8eLOe93aceaf"
ID_TARGET=9

echo "--- E.1: Unauthorized request (no token) ---"
curl -s -X GET "$BASE_URL/users/me" \
  -H "Accept: application/json" -i | head -n 1

echo -e "\n--- E.2: Access admin route as regular user ---"
curl -s -X GET "$BASE_URL/admin/users" \
  -H "Authorization: Bearer $TOKEN_USER" \
  -H "Accept: application/json" -i | head -n 1

echo -e "\n--- E.3: Access super_admin route as admin ---"
curl -s -X POST "$BASE_URL/admin/users/$ID_TARGET/ban" \
  -H "Authorization: Bearer $TOKEN_ADMIN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"reason": "Unauthorized ban attempt"}' -i | head -n 1

echo -e "\n--- E.4: Invalid JSON body ---"
curl -s -X POST "$BASE_URL/reports" \
  -H "Authorization: Bearer $TOKEN_USER" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"reportable_type": "User", "description": malformed_json_here}' -i | head -n 1

echo -e "\n--- E.5: Request non-existent resource ---"
curl -s -X GET "$BASE_URL/admin/users/999999" \
  -H "Authorization: Bearer $TOKEN_ADMIN" \
  -H "Accept: application/json" -i | head -n 1

echo -e "\n--- E.6: Rate limiting (Trigger 429) ---"
echo "Sending rapid requests to /auth/login..."
for i in {1..70}
do
   # We don't care about the body, just hitting the route
   STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/auth/login" -H "Accept: application/json")
   if [ "$STATUS" == "429" ]; then
     echo "Rate limit hit at request $i (Status $STATUS)"
     break
   fi
   if [ $(($i % 10)) -eq 0 ]; then echo "Request $i sent..."; fi
done

echo -e "\n--- E.7: Validation error format check ---"
curl -s -X POST "$BASE_URL/reports" \
  -H "Authorization: Bearer $TOKEN_USER" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"reportable_id": 999}' | jq .
