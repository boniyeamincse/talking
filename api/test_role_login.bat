@echo off
echo ========================================
echo BaniTalk Role-Based Login Test
echo ========================================
echo.

echo [1/6] Testing Super Admin Login...
curl -X POST http://localhost:8000/api/v1/auth/login ^
  -H "Content-Type: application/json" ^
  -H "Accept: application/json" ^
  -d "{\"email\":\"admin@banitalk.com\",\"password\":\"Admin@2026!\"}" ^
  -w "\nStatus: %%{http_code}\n\n"

echo.
echo [2/6] Testing Admin Login...
curl -X POST http://localhost:8000/api/v1/auth/login ^
  -H "Content-Type: application/json" ^
  -H "Accept: application/json" ^
  -d "{\"email\":\"moderator@banitalk.com\",\"password\":\"Moderator@2026!\"}" ^
  -w "\nStatus: %%{http_code}\n\n"

echo.
echo [3/6] Testing Invalid Credentials...
curl -X POST http://localhost:8000/api/v1/auth/login ^
  -H "Content-Type: application/json" ^
  -H "Accept: application/json" ^
  -d "{\"email\":\"admin@banitalk.com\",\"password\":\"wrongpassword\"}" ^
  -w "\nStatus: %%{http_code}\n\n"

echo.
echo ========================================
echo Test Complete!
echo ========================================
echo.
echo To test admin routes, first login and copy the token, then:
echo.
echo Super Admin Routes (requires super_admin role):
echo curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8000/api/v1/admin/admins
echo.
echo Admin Routes (requires admin or super_admin role):
echo curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8000/api/v1/admin/users
echo.
pause
