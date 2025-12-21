# Profile Update Security Tests

## Test Setup
First, register and login to get a token:

```bash
# Register a test user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "TestPassword123"
  }'

# Login to get token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123"
  }'
```

**Save the token from login response** and use it in the tests below as `YOUR_TOKEN_HERE`.

---

## Test A: ✅ Update Name (Should Succeed)

```bash
curl -X PUT http://localhost:3000/api/auth/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "New Name"
  }'
```

**Expected Result:** 
- Status: `200 OK`
- Response: `{ "success": true, "data": { "id": ..., "name": "New Name", ... } }`
- Name is updated in database

---

## Test B: ✅ Update Password (Should Succeed)

```bash
curl -X PUT http://localhost:3000/api/auth/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "password": "NewPassword123"
  }'
```

**Expected Result:**
- Status: `200 OK`
- Response: `{ "success": true, "data": { ... } }` (password not in response)
- Password is hashed and updated in database
- Can login with new password

**Verify new password works:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "NewPassword123"
  }'
```

---

## Test C: ❌ Attempt to Update is_admin (Should Fail)

```bash
curl -X PUT http://localhost:3000/api/auth/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "is_admin": true
  }'
```

**Expected Result:**
- Status: `403 Forbidden`
- Response: `{ "success": false, "error": "Forbidden. Cannot update admin/role fields." }`
- User's `is_admin` field remains `false` in database

---

## Test D: ❌ Attempt to Update Email (Should Fail)

```bash
curl -X PUT http://localhost:3000/api/auth/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "email": "hacker@evil.com"
  }'
```

**Expected Result:**
- Status: `403 Forbidden`
- Response: `{ "success": false, "error": "Email cannot be updated through this endpoint. Use email verification flow." }`
- User's email remains unchanged in database

---

## Test E: ❌ Attempt Privilege Escalation (Combined Attack)

```bash
curl -X PUT http://localhost:3000/api/auth/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Legit Name",
    "is_admin": true,
    "email": "admin@evil.com"
  }'
```

**Expected Result:**
- Status: `403 Forbidden`
- Validation middleware catches `is_admin` or `email` and rejects the entire request
- No fields are updated

---

## Test F: ✅ Update Both Name and Password (Should Succeed)

```bash
curl -X PUT http://localhost:3000/api/auth/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Updated User",
    "password": "AnotherPassword456"
  }'
```

**Expected Result:**
- Status: `200 OK`
- Both name and password are updated
- Can login with new password

---

## Test G: ❌ Weak Password (Should Fail)

```bash
curl -X PUT http://localhost:3000/api/auth/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "password": "123"
  }'
```

**Expected Result:**
- Status: `400 Bad Request`
- Response: `{ "success": false, "error": "Password must be at least 8 characters long" }`

---

## Test H: ❌ Empty Name (Should Fail)

```bash
curl -X PUT http://localhost:3000/api/auth/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "   "
  }'
```

**Expected Result:**
- Status: `400 Bad Request`
- Response: `{ "success": false, "error": "Name cannot be empty" }`

---

## Test I: ❌ No Valid Fields (Should Fail)

```bash
curl -X PUT http://localhost:3000/api/auth/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "random_field": "value"
  }'
```

**Expected Result:**
- Status: `400 Bad Request`
- Response: `{ "success": false, "error": "At least one field (name or password) must be provided for update" }`

---

## Security Verification Checklist

- [x] **Authentication Required**: Route protected by `protect` middleware
- [x] **User Ownership**: Updates only `req.user.id` (own profile)
- [x] **Whitelist Approach**: Only `name` and `password` allowed
- [x] **Blocked Fields**: `is_admin`, `role`, `email`, `id`, `created_at`, `updated_at`
- [x] **Password Hashing**: bcrypt with salt rounds = 10
- [x] **Input Validation**: Name length, password length, non-empty checks
- [x] **Weak Password Prevention**: Basic common password checks
- [x] **No Password Logging**: Raw passwords not logged
- [x] **Error Handling**: Proper error messages without leaking info

---

## Database Verification

After running tests, verify in database:

```sql
-- Check that is_admin remains false
SELECT id, name, email, is_admin FROM users WHERE email = 'test@example.com';

-- Verify password is hashed (starts with $2b$ or $2a$)
SELECT password FROM users WHERE email = 'test@example.com';
```
