# 🚀 Quick Start Guide - New Features

## Overview
This guide helps you quickly understand and use the newly implemented features based on the audit documentation.

---

## 🔐 Security Features

### 1. Banned IP Management
**URL**: `/admin/security/ips`

**Quick Actions**:
```typescript
// Ban an IP address
await api.security.banIP({
  ip_address: '192.168.1.100',
  reason: 'Multiple failed login attempts',
  duration_hours: 24 // or 0 for permanent
});

// Unban an IP
await api.security.unbanIP(ipId);

// Get all banned IPs
const ips = await api.security.bannedIPs();
```

**Use Cases**:
- Block malicious IPs after failed login attempts
- Prevent DDoS attacks
- Temporary bans for suspicious activity
- Permanent bans for confirmed threats

### 2. Two-Factor Authentication
**URL**: `/admin/security/2fa`

**Quick Actions**:
```typescript
// Get 2FA statistics
const stats = await api.security.twoFactorStats();

// Toggle enforcement (require 2FA for all admins)
await api.security.toggleEnforcement(true);

// Reset 2FA for an admin
await api.security.reset2FA(adminId);

// Get all admins with 2FA status
const admins = await api.security.twoFactorAdmins();
```

**Use Cases**:
- Enforce 2FA for all admin accounts
- Reset 2FA when admin loses device
- Monitor 2FA adoption rate
- Track last 2FA usage

---

## 📊 Analytics Features

### 3. User Retention Analysis
**URL**: `/admin/analytics/retention`

**Quick Actions**:
```typescript
// Get retention data
const data = await api.advancedAnalytics.retention('month');

// Get churn data
const churn = await api.advancedAnalytics.churn('month');
```

**Metrics Available**:
- Day 1, 7, 14, 30, 60, 90 retention rates
- Cohort analysis by period
- Churn rate calculation
- Trend indicators

**Use Cases**:
- Measure product-market fit
- Identify drop-off points
- Compare cohort performance
- Track retention improvements

---

## 🔍 Audit & Compliance

### 4. Admin Action Logs
**URL**: `/admin/audit/actions`

**Quick Actions**:
```typescript
// Get all admin actions
const logs = await api.audit.actions();

// Filter by category
const userActions = await api.audit.actions('user');
const securityActions = await api.audit.actions('security');

// Get moderation logs
const modLogs = await api.audit.moderation();
```

**Tracked Actions**:
- User management (ban, suspend, warn, restore)
- Settings changes
- Security events
- Content moderation
- Admin account changes

**Use Cases**:
- Compliance audits
- Security investigations
- Track admin activity
- Identify unauthorized changes

---

## 🤖 Content Moderation

### 5. AI Toxic Content Flags
**URL**: `/admin/moderation/ai-flags`

**Quick Actions**:
```typescript
// Get AI-flagged content
const flags = await api.moderation.aiFlags({ status: 'pending' });

// Take action on flagged content
await api.moderation.takeAction(flagId, 'remove', 'Confirmed toxic content');

// Actions: 'approve', 'remove', 'dismiss'
```

**Flag Types**:
- Toxic/harassment
- Spam
- NSFW content
- Hate speech

**Confidence Scores**:
- 90-100%: High confidence (red)
- 70-89%: Medium confidence (orange)
- 50-69%: Low confidence (yellow)
- <50%: Very low confidence (gray)

**Use Cases**:
- Automated content moderation
- Reduce manual review workload
- Catch toxic content early
- Maintain community standards

---

## 🎯 Quick Integration Guide

### Backend Setup Required

#### 1. Create Controllers
```php
// api/app/Http/Controllers/Api/Admin/SecurityController.php
class SecurityController extends Controller
{
    public function getBannedIPs() {
        return BannedIP::with('admin')->latest()->get();
    }
    
    public function banIP(Request $request) {
        $validated = $request->validate([
            'ip_address' => 'required|ip',
            'reason' => 'required|string',
            'duration_hours' => 'required|integer|min:0'
        ]);
        
        $bannedIP = BannedIP::create([
            'ip_address' => $validated['ip_address'],
            'reason' => $validated['reason'],
            'banned_by' => auth()->id(),
            'expires_at' => $validated['duration_hours'] > 0 
                ? now()->addHours($validated['duration_hours'])
                : null
        ]);
        
        return response()->json(['success' => true, 'data' => $bannedIP]);
    }
}
```

#### 2. Create Migrations
```php
// api/database/migrations/xxxx_create_banned_ips_table.php
Schema::create('banned_ips', function (Blueprint $table) {
    $table->id();
    $table->string('ip_address')->unique();
    $table->text('reason');
    $table->foreignId('banned_by')->constrained('users');
    $table->timestamp('banned_at')->useCurrent();
    $table->timestamp('expires_at')->nullable();
    $table->integer('attempts')->default(0);
    $table->timestamps();
    
    $table->index('ip_address');
    $table->index('expires_at');
});
```

#### 3. Add Routes
```php
// api/routes/api.php
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    // Security
    Route::get('security/banned-ips', [SecurityController::class, 'getBannedIPs']);
    Route::post('security/banned-ips', [SecurityController::class, 'banIP']);
    Route::post('security/banned-ips/{id}/unban', [SecurityController::class, 'unbanIP']);
    
    // 2FA
    Route::get('security/2fa/stats', [SecurityController::class, 'get2FAStats']);
    Route::get('security/2fa/admins', [SecurityController::class, 'get2FAAdmins']);
    Route::post('security/2fa/enforcement', [SecurityController::class, 'toggleEnforcement']);
    Route::post('security/2fa/{id}/reset', [SecurityController::class, 'reset2FA']);
    
    // Audit
    Route::get('audit/actions', [AuditController::class, 'getActions']);
    Route::get('audit/moderation', [AuditController::class, 'getModeration']);
    
    // Analytics
    Route::get('analytics/retention', [AnalyticsController::class, 'getRetention']);
    Route::get('analytics/churn', [AnalyticsController::class, 'getChurn']);
    
    // Moderation
    Route::get('moderation/ai-flags', [ModerationController::class, 'getAIFlags']);
    Route::post('moderation/{id}/action', [ModerationController::class, 'takeAction']);
});
```

---

## 🧪 Testing the Features

### 1. Test Banned IPs
```bash
# Navigate to dashboard
cd dashboard
npm run dev

# Open browser
http://localhost:3000/admin/security/ips

# Test actions:
1. Click "Ban IP Address"
2. Enter IP: 192.168.1.100
3. Enter reason: "Testing"
4. Select duration: 24 hours
5. Click "Ban IP"
6. Verify IP appears in table
7. Click "Unban" to remove
```

### 2. Test 2FA Management
```bash
# Navigate to
http://localhost:3000/admin/security/2fa

# Test actions:
1. View current 2FA statistics
2. Toggle enforcement switch
3. View admin list with 2FA status
4. Click "Reset 2FA" for test admin
```

### 3. Test Audit Logs
```bash
# Navigate to
http://localhost:3000/admin/audit/actions

# Test actions:
1. View all admin actions
2. Filter by "user" category
3. Search for specific admin
4. View action details
```

### 4. Test Retention Analytics
```bash
# Navigate to
http://localhost:3000/admin/analytics/retention

# Test actions:
1. View retention statistics
2. Change period (week/month/quarter/year)
3. View cohort table
4. Check color-coded retention rates
```

### 5. Test AI Flags
```bash
# Navigate to
http://localhost:3000/admin/moderation/ai-flags

# Test actions:
1. View pending AI flags
2. Filter by status
3. Review flagged content
4. Take action (approve/remove/dismiss)
```

---

## 📱 Mobile Responsive

All new features are fully responsive:
- **Desktop**: Full table views with all columns
- **Tablet**: Optimized layouts with scrollable tables
- **Mobile**: Stacked cards with essential information

---

## 🎨 Design Consistency

All features follow the established design system:
- Glass morphism effects
- Dark mode support
- Consistent color palette
- Smooth animations
- Loading states
- Empty states
- Error handling

---

## 🔗 API Endpoint Reference

### Security Endpoints
```
GET    /api/v1/admin/security/banned-ips
POST   /api/v1/admin/security/banned-ips
POST   /api/v1/admin/security/banned-ips/:id/unban
GET    /api/v1/admin/security/2fa/stats
GET    /api/v1/admin/security/2fa/admins
POST   /api/v1/admin/security/2fa/enforcement
POST   /api/v1/admin/security/2fa/:id/reset
```

### Audit Endpoints
```
GET    /api/v1/admin/audit/actions
GET    /api/v1/admin/audit/moderation
GET    /api/v1/admin/audit/api
GET    /api/v1/admin/audit/errors
GET    /api/v1/admin/audit/system
```

### Analytics Endpoints
```
GET    /api/v1/admin/analytics/retention
GET    /api/v1/admin/analytics/churn
GET    /api/v1/admin/analytics/countries
GET    /api/v1/admin/analytics/language-heatmap
```

### Moderation Endpoints
```
GET    /api/v1/admin/moderation/ai-flags
POST   /api/v1/admin/moderation/:id/action
GET    /api/v1/admin/moderation/posts
GET    /api/v1/admin/moderation/comments
```

---

## 💡 Pro Tips

### 1. Security Best Practices
- Always ban IPs with clear reasons
- Use temporary bans for first offenses
- Enforce 2FA for all super admins
- Review audit logs weekly

### 2. Analytics Insights
- Monitor Day 1 retention closely (target: 65%+)
- Focus on Day 7 to Day 14 drop-off
- Compare cohorts to measure improvements
- Use insights to guide product decisions

### 3. Content Moderation
- Review high-confidence AI flags first (90%+)
- Dismiss false positives to improve AI
- Take action quickly on confirmed violations
- Track moderation patterns

### 4. Audit Compliance
- Export logs monthly for compliance
- Review security events daily
- Track admin activity patterns
- Investigate suspicious actions immediately

---

## 🆘 Troubleshooting

### Issue: API endpoints return 404
**Solution**: Ensure backend routes are registered and controllers exist

### Issue: Data not loading
**Solution**: Check API_BASE_URL in `dashboard/src/lib/api.ts`

### Issue: Authentication errors
**Solution**: Verify token is set correctly and not expired

### Issue: Empty states showing
**Solution**: Ensure backend is returning data in correct format

---

## 📚 Additional Resources

- [Main Documentation](./IMPLEMENTATION_COMPLETE_SUMMARY.md)
- [Missing Features List](./MISSING_FEATURES_IMPLEMENTED.md)
- [Dashboard README](./dashboard/README.md)
- [API Service](./dashboard/src/lib/api.ts)

---

**Quick Start Complete!** 🎉

You now have all the information needed to use and integrate the new features. For detailed implementation guides, refer to the comprehensive documentation files.

