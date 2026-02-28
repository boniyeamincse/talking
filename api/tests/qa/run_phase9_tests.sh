#!/bin/bash

BASE_URL="http://127.0.0.1:8000/api/v1"
TOKEN_QA="15|JsZYJyb3r9MDVm4oNYlRMTftcncsujabCNbWKRwM73348278"
TOKEN_QA2="16|nM9GXoUkUd684vyu3b6ILibTffaB6UD863XQNjfT501517ec"
TOKEN_QA3="17|bAXBWcpIWKo8rfePdctiaP4OFNk0ez9bKTjLhhGA2f8a4d0b"
ID_QA=3
ID_QA2=4
ID_QA3=5

echo "--- 9.2: Create post (QA) ---"
CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL/posts" \
  -H "Authorization: Bearer $TOKEN_QA" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d "{\"content\": \"This is a new test post from QA user!\"}")
echo "$CREATE_RESPONSE" | jq .
POST_ID=$(echo "$CREATE_RESPONSE" | jq -r '.data.id')

echo -e "\n--- 9.1: List feed (QA2) ---"
curl -s -X GET "$BASE_URL/posts" \
  -H "Authorization: Bearer $TOKEN_QA2" \
  -H "Accept: application/json" | jq '.data[0,1]'

echo -e "\n--- 9.3: View single post ---"
curl -s -X GET "$BASE_URL/posts/$POST_ID" \
  -H "Authorization: Bearer $TOKEN_QA3" \
  -H "Accept: application/json" | jq .

echo -e "\n--- 9.5: Like post (QA2) ---"
curl -s -X POST "$BASE_URL/posts/$POST_ID/like" \
  -H "Authorization: Bearer $TOKEN_QA2" \
  -H "Accept: application/json" | jq .

echo -e "\n--- 9.7: List likes ---"
curl -s -X GET "$BASE_URL/posts/$POST_ID/likes" \
  -H "Authorization: Bearer $TOKEN_QA" \
  -H "Accept: application/json" | jq .

echo -e "\n--- 9.8: Add comment (QA3) ---"
COMMENT_RESPONSE=$(curl -s -X POST "$BASE_URL/posts/$POST_ID/comments" \
  -H "Authorization: Bearer $TOKEN_QA3" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d "{\"content\": \"Great post, QA!\"}")
echo "$COMMENT_RESPONSE" | jq .
COMMENT_ID=$(echo "$COMMENT_RESPONSE" | jq -r '.data.id')

echo -e "\n--- 9.9: List comments ---"
curl -s -X GET "$BASE_URL/posts/$POST_ID/comments" \
  -H "Authorization: Bearer $TOKEN_QA2" \
  -H "Accept: application/json" | jq .

echo -e "\n--- 9.11: Save post (QA3) ---"
curl -s -X POST "$BASE_URL/posts/$POST_ID/save" \
  -H "Authorization: Bearer $TOKEN_QA3" \
  -H "Accept: application/json" | jq .

echo -e "\n--- 9.13: List saved posts (QA3) ---"
curl -s -X GET "$BASE_URL/posts/saved" \
  -H "Authorization: Bearer $TOKEN_QA3" \
  -H "Accept: application/json" | jq .

echo -e "\n--- 9.6: Unlike post (QA2) ---"
curl -s -X DELETE "$BASE_URL/posts/$POST_ID/like" \
  -H "Authorization: Bearer $TOKEN_QA2" \
  -H "Accept: application/json" | jq .

echo -e "\n--- 9.12: Unsave post (QA3) ---"
curl -s -X DELETE "$BASE_URL/posts/$POST_ID/save" \
  -H "Authorization: Bearer $TOKEN_QA3" \
  -H "Accept: application/json" | jq .

echo -e "\n--- 9.10: Delete comment (QA3) ---"
curl -s -X DELETE "$BASE_URL/comments/$COMMENT_ID" \
  -H "Authorization: Bearer $TOKEN_QA3" \
  -H "Accept: application/json" | jq .

echo -e "\n--- Security: Unauthorized Update (QA2 trying to edit QA's post) ---"
curl -s -X PUT "$BASE_URL/posts/$POST_ID" \
  -H "Authorization: Bearer $TOKEN_QA2" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d "{\"content\": \"Hacked content\"}" | jq .

echo -e "\n--- 9.4: Upload post media (QA) ---"
# Creating a dummy text file to act as an image for upload testing
echo "fake-image-content" > dummy.png
curl -s -X POST "$BASE_URL/posts/$POST_ID/media" \
  -H "Authorization: Bearer $TOKEN_QA" \
  -H "Accept: application/json" \
  -F "media=@dummy.png" | jq .
rm dummy.png
