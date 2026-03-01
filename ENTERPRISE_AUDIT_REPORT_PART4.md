# 🏢 ENTERPRISE AUDIT REPORT - PART 4
## CI/CD, Mobile Fixes & Production Readiness

---

## 🔄 PHASE 6: CI/CD PIPELINE

### 6.1 GitHub Actions Workflow

**Create:** `.github/workflows/backend-tests.yml`
```yaml
name: Backend Tests & Security Scan

on:
  push:
    branches: [ main, develop ]
    paths:
      - 'api/**'
  pull_request:
    branches: [ main, develop ]
    paths:
      - 'api/**'

jobs:
  tests:
    runs-on: ubuntu-latest
    
    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: password
          MYSQL_DATABASE: testing
        ports:
          - 3306:3306
        options: --health-cmd="mysqladmin ping" --health-interval=10s --health-timeout=5s --health-retries=3
      
      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379
        options: --health-cmd="redis-cli ping" --health-interval=10s --health-timeout=5s --health-retries=3
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.2'
          extensions: mbstring, pdo, pdo_mysql, zip, redis
          coverage: xdebug
      
      - name: Copy .env
        run: |
          cd api
          cp .env.example .env
          php artisan key:generate
      
      - name: Install Dependencies
        run: |
          cd api
          composer install --prefer-dist --no-progress
      
      - name: Run Tests
        run: |
          cd api
          php artisan test --coverage --min=80
        env:
          DB_CONNECTION: mysql
          DB_HOST: 127.0.0.1
          DB_PORT: 3306
          DB_DATABASE: testing
          DB_USERNAME: root
          DB_PASSWORD: password
          REDIS_HOST: 127.0.0.1
      
      - name: Upload Coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./api/coverage.xml
          flags: backend
  
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Security Audit
        run: |
          cd api
          composer audit
      
      - name: Static Analysis
        run: |
          cd api
          composer require --dev phpstan/phpstan
          vendor/bin/phpstan analyse app --level=5
  
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.2'
      
      - name: Install Dependencies
        run: |
          cd api
          composer install --prefer-dist --no-progress
      
      - name: Run Laravel Pint
        run: |
          cd api
          ./vendor/bin/pint --test
```

**Create:** `.github/workflows/deploy-production.yml`
```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]
    tags:
      - 'v*'

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1
      
      - name: Build and Push Docker Image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          ECR_REPOSITORY: banitalk-api
          IMAGE_TAG: ${{ github.sha }}
        run: |
          cd api
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
          docker tag $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG $ECR_REGISTRY/$ECR_REPOSITORY:latest
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:latest
      
      - name: Deploy to ECS
        run: |
          aws ecs update-service --cluster banitalk-cluster --service banitalk-api --force-new-deployment
      
      - name: Run Database Migrations
        run: |
          aws ecs run-task \
            --cluster banitalk-cluster \
            --task-definition banitalk-migration \
            --launch-type FARGATE \
            --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx],assignPublicIp=ENABLED}"
      
      - name: Notify Deployment
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'Production deployment completed'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
        if: always()
```

**Create:** `.github/workflows/mobile-build.yml`
```yaml
name: Flutter Build & Test

on:
  push:
    branches: [ main, develop ]
    paths:
      - 'apk/**'
  pull_request:
    branches: [ main, develop ]
    paths:
      - 'apk/**'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Flutter
        uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.11.0'
          channel: 'stable'
      
      - name: Install Dependencies
        run: |
          cd apk
          flutter pub get
      
      - name: Run Tests
        run: |
          cd apk
          flutter test --coverage
      
      - name: Analyze Code
        run: |
          cd apk
          flutter analyze
      
      - name: Upload Coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./apk/coverage/lcov.info
          flags: mobile
  
  build-android:
    runs-on: ubuntu-latest
    needs: test
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Flutter
        uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.11.0'
      
      - name: Setup Java
        uses: actions/setup-java@v3
        with:
          distribution: 'zulu'
          java-version: '11'
      
      - name: Decode Keystore
        run: |
          echo "${{ secrets.ANDROID_KEYSTORE_BASE64 }}" | base64 --decode > apk/android/app/keystore.jks
      
      - name: Build APK
        run: |
          cd apk
          flutter build apk --release --flavor prod
        env:
          KEYSTORE_PASSWORD: ${{ secrets.KEYSTORE_PASSWORD }}
          KEY_ALIAS: ${{ secrets.KEY_ALIAS }}
          KEY_PASSWORD: ${{ secrets.KEY_PASSWORD }}
      
      - name: Upload APK
        uses: actions/upload-artifact@v3
        with:
          name: app-prod-release.apk
          path: apk/build/app/outputs/flutter-apk/app-prod-release.apk
  
  build-ios:
    runs-on: macos-latest
    needs: test
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Flutter
        uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.11.0'
      
      - name: Install CocoaPods
        run: |
          cd apk/ios
          pod install
      
      - name: Build iOS
        run: |
          cd apk
          flutter build ios --release --no-codesign --flavor prod
```

---

## 📱 PHASE 7: MOBILE APP FIXES

### 7.1 Environment Configuration

**Create:** `apk/lib/core/config/env_config.dart`
```dart
import 'package:flutter/foundation.dart';

enum Environment { dev, staging, prod }

class EnvConfig {
  static Environment _environment = Environment.dev;
  
  static void setEnvironment(Environment env) {
    _environment = env;
  }
  
  static String get apiBaseUrl {
    switch (_environment) {
      case Environment.dev:
        return 'http://10.0.2.2:8000/api/v1'; // Android emulator
      case Environment.staging:
        return 'https://staging-api.banitalk.com/api/v1';
      case Environment.prod:
        return 'https://api.banitalk.com/api/v1';
    }
  }
  
  static String get wsUrl {
    switch (_environment) {
      case Environment.dev:
        return 'ws://10.0.2.2:6001';
      case Environment.staging:
        return 'wss://staging-api.banitalk.com';
      case Environment.prod:
        return 'wss://api.banitalk.com';
    }
  }
  
  static bool get isProduction => _environment == Environment.prod;
  static bool get isDevelopment => _environment == Environment.dev;
  
  static String get appName {
    switch (_environment) {
      case Environment.dev:
        return 'BaniTalk Dev';
      case Environment.staging:
        return 'BaniTalk Staging';
      case Environment.prod:
        return 'BaniTalk';
    }
  }
}
```

**Update:** `apk/lib/main.dart`
```dart
import 'package:flutter/material.dart';
import 'package:banitalk/core/theme/app_theme.dart';
import 'package:banitalk/core/routing/app_router.dart';
import 'package:banitalk/core/di/service_locator.dart' as di;
import 'package:banitalk/core/config/env_config.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Set environment based on flavor
  const flavor = String.fromEnvironment('FLAVOR', defaultValue: 'dev');
  EnvConfig.setEnvironment(_getEnvironment(flavor));
  
  await di.init();
  runApp(const BaniTalkApp());
}

Environment _getEnvironment(String flavor) {
  switch (flavor) {
    case 'prod':
      return Environment.prod;
    case 'staging':
      return Environment.staging;
    default:
      return Environment.dev;
  }
}

class BaniTalkApp extends StatelessWidget {
  const BaniTalkApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: EnvConfig.appName,
      debugShowCheckedModeBanner: !EnvConfig.isProduction,
      theme: BaniTalkTheme.darkTheme,
      routerConfig: AppRouter.router,
    );
  }
}
```

---

### 7.2 Secure Token Storage

**Create:** `apk/lib/core/storage/secure_storage.dart`
```dart
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class SecureStorage {
  static const _storage = FlutterSecureStorage(
    aOptions: AndroidOptions(
      encryptedSharedPreferences: true,
    ),
    iOptions: IOSOptions(
      accessibility: KeychainAccessibility.first_unlock,
    ),
  );
  
  // Keys
  static const String _keyAuthToken = 'auth_token';
  static const String _keyRefreshToken = 'refresh_token';
  static const String _keyUserId = 'user_id';
  static const String _keyBiometricEnabled = 'biometric_enabled';
  
  // Auth Token
  static Future<void> saveAuthToken(String token) async {
    await _storage.write(key: _keyAuthToken, value: token);
  }
  
  static Future<String?> getAuthToken() async {
    return await _storage.read(key: _keyAuthToken);
  }
  
  static Future<void> deleteAuthToken() async {
    await _storage.delete(key: _keyAuthToken);
  }
  
  // Refresh Token
  static Future<void> saveRefreshToken(String token) async {
    await _storage.write(key: _keyRefreshToken, value: token);
  }
  
  static Future<String?> getRefreshToken() async {
    return await _storage.read(key: _keyRefreshToken);
  }
  
  // User ID
  static Future<void> saveUserId(String userId) async {
    await _storage.write(key: _keyUserId, value: userId);
  }
  
  static Future<String?> getUserId() async {
    return await _storage.read(key: _keyUserId);
  }
  
  // Biometric
  static Future<void> setBiometricEnabled(bool enabled) async {
    await _storage.write(key: _keyBiometricEnabled, value: enabled.toString());
  }
  
  static Future<bool> isBiometricEnabled() async {
    final value = await _storage.read(key: _keyBiometricEnabled);
    return value == 'true';
  }
  
  // Clear all
  static Future<void> clearAll() async {
    await _storage.deleteAll();
  }
}
```

**Update:** `apk/lib/core/network/auth_interceptor.dart`
```dart
import 'package:dio/dio.dart';
import 'package:banitalk/core/storage/secure_storage.dart';

class AuthInterceptor extends Interceptor {
  @override
  void onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final token = await SecureStorage.getAuthToken();

    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }

    return handler.next(options);
  }
  
  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    // Handle 401 - Token expired
    if (err.response?.statusCode == 401) {
      // Try to refresh token
      final refreshed = await _refreshToken();
      
      if (refreshed) {
        // Retry original request
        final options = err.requestOptions;
        final token = await SecureStorage.getAuthToken();
        options.headers['Authorization'] = 'Bearer $token';
        
        try {
          final response = await Dio().fetch(options);
          return handler.resolve(response);
        } catch (e) {
          return handler.reject(err);
        }
      } else {
        // Logout user
        await SecureStorage.clearAll();
        // Navigate to login
      }
    }
    
    return handler.next(err);
  }
  
  Future<bool> _refreshToken() async {
    try {
      final refreshToken = await SecureStorage.getRefreshToken();
      if (refreshToken == null) return false;
      
      final dio = Dio();
      final response = await dio.post(
        '${EnvConfig.apiBaseUrl}/auth/refresh',
        data: {'refresh_token': refreshToken},
      );
      
      if (response.statusCode == 200) {
        final newToken = response.data['data']['access_token'];
        await SecureStorage.saveAuthToken(newToken);
        return true;
      }
      
      return false;
    } catch (e) {
      return false;
    }
  }
}
```

---

### 7.3 Certificate Pinning

**Create:** `apk/lib/core/network/certificate_pinning.dart`
```dart
import 'dart:io';
import 'package:dio/dio.dart';
import 'package:dio/io.dart';

class CertificatePinning {
  static void setupCertificatePinning(Dio dio) {
    (dio.httpClientAdapter as IOHttpClientAdapter).createHttpClient = () {
      final client = HttpClient();
      
      client.badCertificateCallback = (X509Certificate cert, String host, int port) {
        // Production certificate fingerprints
        const allowedFingerprints = [
          'SHA256_FINGERPRINT_HERE', // Replace with actual certificate fingerprint
        ];
        
        // In development, allow all certificates
        if (!EnvConfig.isProduction) {
          return true;
        }
        
        // Verify certificate fingerprint
        final certFingerprint = cert.sha256.toString();
        return allowedFingerprints.contains(certFingerprint);
      };
      
      return client;
    };
  }
}
```

**Update:** `apk/lib/core/network/api_client.dart`
```dart
import 'package:dio/dio.dart';
import 'package:banitalk/core/config/env_config.dart';
import 'auth_interceptor.dart';
import 'certificate_pinning.dart';

class ApiClient {
  final Dio dio;

  ApiClient() : dio = Dio(
    BaseOptions(
      baseUrl: EnvConfig.apiBaseUrl,
      connectTimeout: const Duration(seconds: 30),
      receiveTimeout: const Duration(seconds: 30),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    ),
  ) {
    // Setup certificate pinning
    CertificatePinning.setupCertificatePinning(dio);
    
    // Add interceptors
    if (!EnvConfig.isProduction) {
      dio.interceptors.add(LogInterceptor(
        responseBody: true,
        requestBody: true,
        error: true,
      ));
    }
    
    dio.interceptors.add(AuthInterceptor());
  }
}
```

---

### 7.4 Offline Support with Local Database

**Add to:** `apk/pubspec.yaml`
```yaml
dependencies:
  drift: ^2.14.0
  sqlite3_flutter_libs: ^0.5.0
  path_provider: ^2.1.2
  path: ^1.8.3
```

**Create:** `apk/lib/core/database/app_database.dart`
```dart
import 'dart:io';
import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as p;

part 'app_database.g.dart';

// Tables
class Messages extends Table {
  IntColumn get id => integer().autoIncrement()();
  IntColumn get serverId => integer().nullable()();
  IntColumn get conversationId => integer()();
  IntColumn get userId => integer()();
  TextColumn get content => text()();
  TextColumn get type => text()();
  TextColumn get status => text()();
  DateTimeColumn get createdAt => dateTime()();
  BoolColumn get isSynced => boolean().withDefault(const Constant(false))();
}

class Conversations extends Table {
  IntColumn get id => integer().autoIncrement()();
  IntColumn get serverId => integer().nullable()();
  TextColumn get type => text()();
  TextColumn get name => text().nullable()();
  DateTimeColumn get updatedAt => dateTime()();
  BoolColumn get isSynced => boolean().withDefault(const Constant(false))();
}

@DriftDatabase(tables: [Messages, Conversations])
class AppDatabase extends _$AppDatabase {
  AppDatabase() : super(_openConnection());

  @override
  int get schemaVersion => 1;
  
  // Messages
  Future<List<Message>> getConversationMessages(int conversationId) {
    return (select(messages)
      ..where((m) => m.conversationId.equals(conversationId))
      ..orderBy([(m) => OrderingTerm.desc(m.createdAt)]))
      .get();
  }
  
  Future<int> insertMessage(MessagesCompanion message) {
    return into(messages).insert(message);
  }
  
  Future<void> updateMessageSyncStatus(int id, bool synced) {
    return (update(messages)..where((m) => m.id.equals(id)))
      .write(MessagesCompanion(isSynced: Value(synced)));
  }
  
  // Conversations
  Future<List<Conversation>> getAllConversations() {
    return (select(conversations)
      ..orderBy([(c) => OrderingTerm.desc(c.updatedAt)]))
      .get();
  }
  
  Future<int> insertConversation(ConversationsCompanion conversation) {
    return into(conversations).insert(conversation);
  }
}

LazyDatabase _openConnection() {
  return LazyDatabase(() async {
    final dbFolder = await getApplicationDocumentsDirectory();
    final file = File(p.join(dbFolder.path, 'banitalk.db'));
    return NativeDatabase(file);
  });
}
```

---

## 📊 PHASE 8: PRODUCTION READINESS CHECKLIST

### 8.1 Backend Checklist

```markdown
## Security
- [ ] Remove .env from version control
- [ ] Set APP_DEBUG=false in production
- [ ] Enable HTTPS enforcement
- [ ] Configure secure session cookies
- [ ] Implement rate limiting on all endpoints
- [ ] Add CSRF protection
- [ ] Implement input sanitization
- [ ] Add SQL injection prevention
- [ ] Configure security headers
- [ ] Implement audit logging
- [ ] Add MFA for admin accounts
- [ ] Encrypt sensitive data at rest
- [ ] Configure firewall rules

## Performance
- [ ] Add database indexes
- [ ] Implement Redis caching
- [ ] Enable query caching
- [ ] Configure connection pooling
- [ ] Enable GZIP compression
- [ ] Optimize N+1 queries
- [ ] Implement CDN for static assets
- [ ] Configure opcache

## Monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Configure application monitoring (New Relic/DataDog)
- [ ] Set up log aggregation (ELK Stack)
- [ ] Configure uptime monitoring
- [ ] Set up performance monitoring
- [ ] Configure alerting

## Backup & Recovery
- [ ] Implement automated database backups
- [ ] Test backup restoration
- [ ] Configure backup retention policy
- [ ] Set up disaster recovery plan
- [ ] Document recovery procedures

## Testing
- [ ] Achieve 80%+ code coverage
- [ ] Run security audit
- [ ] Perform load testing
- [ ] Conduct penetration testing
- [ ] Test backup/restore procedures

## Documentation
- [ ] API documentation (OpenAPI/Swagger)
- [ ] Deployment guide
- [ ] Architecture documentation
- [ ] Runbook for common issues
- [ ] Security policies
```

---

### 8.2 Mobile App Checklist

```markdown
## Security
- [ ] Implement secure token storage
- [ ] Add certificate pinning
- [ ] Enable code obfuscation
- [ ] Implement biometric authentication
- [ ] Add jailbreak/root detection
- [ ] Secure API keys
- [ ] Implement SSL pinning

## Performance
- [ ] Optimize image loading
- [ ] Implement lazy loading
- [ ] Add offline support
- [ ] Optimize bundle size
- [ ] Implement caching strategy
- [ ] Reduce app startup time

## Testing
- [ ] Unit tests (80%+ coverage)
- [ ] Widget tests
- [ ] Integration tests
- [ ] Test on multiple devices
- [ ] Test different OS versions
- [ ] Performance testing

## App Store Preparation
- [ ] Create app icons (all sizes)
- [ ] Prepare screenshots
- [ ] Write app description
- [ ] Set up privacy policy
- [ ] Configure app permissions
- [ ] Test in-app purchases
- [ ] Prepare release notes

## Android Specific
- [ ] Configure ProGuard rules
- [ ] Set up app signing
- [ ] Configure build variants
- [ ] Test on different screen sizes
- [ ] Optimize APK size

## iOS Specific
- [ ] Configure code signing
- [ ] Set up provisioning profiles
- [ ] Test on different iPhone models
- [ ] Configure App Transport Security
- [ ] Prepare for App Store review
```

---

*Continued in ENTERPRISE_AUDIT_REPORT_PART5.md (Final)...*
