#!/bin/bash

# Pre-Upload Verification Script
# Run this before uploading to GitHub

echo "🔍 Talkin API - Pre-Upload Verification"
echo "========================================"
echo ""

cd /home/boni/Documents/boniyeamin

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check counter
CHECKS_PASSED=0
CHECKS_FAILED=0

# Function to check file exists
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1"
        ((CHECKS_PASSED++))
    else
        echo -e "${RED}✗${NC} $1 - MISSING"
        ((CHECKS_FAILED++))
    fi
}

# Function to check directory exists
check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} $1/"
        ((CHECKS_PASSED++))
    else
        echo -e "${RED}✗${NC} $1/ - MISSING"
        ((CHECKS_FAILED++))
    fi
}

echo "📋 Checking Phase 1 Files..."
echo ""

echo "Migrations:"
check_file "api/database/migrations/2024_01_01_000001_create_languages_table.php"
check_file "api/database/migrations/2024_01_01_000002_update_users_table.php"
check_file "api/database/migrations/2024_01_01_000003_create_profiles_table.php"
check_file "api/database/migrations/2024_01_01_000004_create_user_languages_table.php"
check_file "api/database/migrations/2024_01_01_000005_create_password_reset_tokens_table.php"
echo ""

echo "Models:"
check_file "api/app/Models/User.php"
check_file "api/app/Models/Profile.php"
check_file "api/app/Models/Language.php"
check_file "api/app/Models/UserLanguage.php"
echo ""

echo "Controllers:"
check_file "api/app/Http/Controllers/Api/BaseController.php"
check_file "api/app/Http/Controllers/Api/AuthController.php"
check_file "api/app/Http/Controllers/Api/UserController.php"
check_file "api/app/Http/Controllers/Api/ProfileController.php"
echo ""

echo "Resources:"
check_file "api/app/Http/Resources/UserResource.php"
check_file "api/app/Http/Resources/ProfileResource.php"
check_file "api/app/Http/Resources/UserLanguageResource.php"
echo ""

echo "Requests:"
check_file "api/app/Http/Requests/Auth/RegisterRequest.php"
check_file "api/app/Http/Requests/Auth/LoginRequest.php"
check_file "api/app/Http/Requests/Auth/ForgotPasswordRequest.php"
check_file "api/app/Http/Requests/Auth/ResetPasswordRequest.php"
echo ""

echo "Middleware:"
check_file "api/app/Http/Middleware/ForceJsonResponse.php"
check_file "api/app/Http/Middleware/UpdateLastSeen.php"
echo ""

echo "Seeders:"
check_file "api/database/seeders/LanguageSeeder.php"
check_file "api/database/seeders/DatabaseSeeder.php"
echo ""

echo "Routes & Config:"
check_file "api/routes/api.php"
check_file "api/bootstrap/app.php"
echo ""

echo "Documentation:"
check_file "README.md"
check_file "PHASE1_COMPLETE.md"
check_file "DEVELOPMENT_PLAN.md"
check_file "api/PHASE1_SETUP.md"
check_file "api/Talkin_API_Phase1.postman_collection.json"
check_file "GITHUB_UPLOAD_GUIDE.md"
echo ""

echo "Git Files:"
check_file ".gitignore"
check_file "api/.gitignore"
check_file "GIT_COMMIT_PHASE1.sh"
echo ""

# Summary
echo "========================================"
echo -e "Summary: ${GREEN}${CHECKS_PASSED} passed${NC}, ${RED}${CHECKS_FAILED} failed${NC}"
echo ""

if [ $CHECKS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed! Ready to upload to GitHub.${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Run: chmod +x GIT_COMMIT_PHASE1.sh"
    echo "2. Run: ./GIT_COMMIT_PHASE1.sh"
    echo "3. Follow instructions in GITHUB_UPLOAD_GUIDE.md"
else
    echo -e "${RED}❌ Some files are missing. Please check the errors above.${NC}"
    echo ""
    echo "Review the missing files and ensure Phase 1 is complete."
fi

echo ""
echo "📊 Additional Checks:"
echo ""

# Check if .env exists (should not be committed)
if [ -f "api/.env" ]; then
    echo -e "${YELLOW}⚠${NC}  api/.env exists (will be ignored by .gitignore)"
else
    echo -e "${GREEN}✓${NC} api/.env not present (good for git)"
fi

# Check if vendor exists (should not be committed)
if [ -d "api/vendor" ]; then
    echo -e "${YELLOW}⚠${NC}  api/vendor/ exists (will be ignored by .gitignore)"
else
    echo -e "${GREEN}✓${NC} api/vendor/ not present"
fi

# Check if node_modules exists (should not be committed)
if [ -d "api/node_modules" ]; then
    echo -e "${YELLOW}⚠${NC}  api/node_modules/ exists (will be ignored by .gitignore)"
else
    echo -e "${GREEN}✓${NC} api/node_modules/ not present"
fi

echo ""
echo "🎉 Pre-upload check complete!"
