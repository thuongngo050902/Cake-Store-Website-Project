# Registration Password Validation Tests

## Test Setup

These tests verify that user registration enforces strong password requirements and proper validation.

**Base URL:** `http://localhost:3000/api/auth/register`

---

## Test 1: ✅ Valid Registration (Should Succeed)

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "testuser@example.com",
    "password": "StrongPass123!"
  }'
```

**Expected Result:**

- Status: `201 Created`
- Response:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "...",
        "name": "Test User",
        "email": "testuser@example.com",
        "is_admin": false,
        ...
      },
      "token": "eyJhbGc..."
    }
  }
  ```
- User created in database with hashed password
- `is_admin` is `false` (cannot be set during registration)

---

## Test 2: ❌ Password Too Short (Should Fail)

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Short Pass User",
    "email": "short@example.com",
    "password": "short"
  }'
```

**Expected Result:**

- Status: `400 Bad Request`
- Response:
  ```json
  {
    "success": false,
    "error": "Password must be at least 8 characters long"
  }
  ```

---

## Test 3: ❌ Password Too Long (Should Fail)

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Long Pass User",
    "email": "long@example.com",
    "password": "'$(python3 -c "print('a' * 200)")'"
  }'
```

**Expected Result:**

- Status: `400 Bad Request`
- Response:
  ```json
  {
    "success": false,
    "error": "Password is too long (max 128 characters)"
  }
  ```

---

## Test 4: ❌ Weak Password - "password" (Should Fail)

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Weak Pass User",
    "email": "weak@example.com",
    "password": "password"
  }'
```

**Expected Result:**

- Status: `400 Bad Request`
- Response:
  ```json
  {
    "success": false,
    "error": "Password is too weak. Please choose a stronger password."
  }
  ```

---

## Test 5: ❌ Weak Password - "12345678" (Should Fail)

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Numbers User",
    "email": "numbers@example.com",
    "password": "12345678"
  }'
```

**Expected Result:**

- Status: `400 Bad Request`
- Response:
  ```json
  {
    "success": false,
    "error": "Password is too weak. Please choose a stronger password."
  }
  ```

---

## Test 6: ❌ Weak Password - "Password123" (Should Fail)

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Common Pass User",
    "email": "common@example.com",
    "password": "Password123"
  }'
```

**Expected Result:**

- Status: `400 Bad Request`
- Response:
  ```json
  {
    "success": false,
    "error": "Password is too weak. Please choose a stronger password."
  }
  ```

---

## Test 7: ❌ Password is Whitespace Only (Should Fail)

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Space User",
    "email": "space@example.com",
    "password": "        "
  }'
```

**Expected Result:**

- Status: `400 Bad Request`
- Response:
  ```json
  {
    "success": false,
    "error": "Password cannot be empty or whitespace only"
  }
  ```

---

## Test 8: ❌ Password is Not a String (Should Fail)

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Number Pass User",
    "email": "numpass@example.com",
    "password": 12345678
  }'
```

**Expected Result:**

- Status: `400 Bad Request`
- Response:
  ```json
  {
    "success": false,
    "error": "Password must be a string"
  }
  ```

---

## Test 9: ❌ Missing Password (Should Fail)

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "No Pass User",
    "email": "nopass@example.com"
  }'
```

**Expected Result:**

- Status: `400 Bad Request`
- Response:
  ```json
  {
    "success": false,
    "error": "Name, email, and password are required"
  }
  ```

---

## Test 10: ❌ Invalid Email Format (Should Fail)

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bad Email User",
    "email": "not-an-email",
    "password": "ValidPass123!"
  }'
```

**Expected Result:**

- Status: `400 Bad Request`
- Response:
  ```json
  {
    "success": false,
    "error": "Invalid email format"
  }
  ```

---

## Test 11: ❌ Name Too Long (Should Fail)

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "'$(python3 -c "print('A' * 101)")'"
    "email": "longname@example.com",
    "password": "ValidPass123!"
  }'
```

**Expected Result:**

- Status: `400 Bad Request`
- Response:
  ```json
  {
    "success": false,
    "error": "Name is too long (max 100 characters)"
  }
  ```

---

## Test 12: ❌ Empty Name (Should Fail)

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "   ",
    "email": "emptyname@example.com",
    "password": "ValidPass123!"
  }'
```

**Expected Result:**

- Status: `400 Bad Request`
- Response:
  ```json
  {
    "success": false,
    "error": "Name cannot be empty"
  }
  ```

---

## Test 13: ❌ Attempt to Set is_admin During Registration (Should Be Ignored)

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin Wannabe",
    "email": "wannabe@example.com",
    "password": "ValidPass123!",
    "is_admin": true
  }'
```

**Expected Result:**

- Status: `201 Created`
- Response: User created successfully
- **CRITICAL:** `is_admin` field in database must be `false` (not `true`)
- The `is_admin: true` from request body must be ignored by the service layer

**Verify in database:**

```sql
SELECT name, email, is_admin FROM users WHERE email = 'wannabe@example.com';
-- Expected: is_admin = false
```

---

## Test 14: ✅ Valid Minimum Length Password (Should Succeed)

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Min Pass User",
    "email": "minpass@example.com",
    "password": "Pass1234"
  }'
```

**Expected Result:**

- Status: `201 Created`
- Response: User created successfully
- Exactly 8 characters should be accepted

---

## Test 15: ✅ Valid Maximum Length Password (Should Succeed)

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Max Pass User",
    "email": "maxpass@example.com",
    "password": "'$(python3 -c "print('A' * 128)")'"
  }'
```

**Expected Result:**

- Status: `201 Created`
- Response: User created successfully
- Exactly 128 characters should be accepted

---

## Security Verification Checklist

After running all tests, verify:

- [x] **Password Minimum Length**: < 8 chars rejected
- [x] **Password Maximum Length**: > 128 chars rejected
- [x] **Password Type**: Non-string values rejected
- [x] **Empty/Whitespace Password**: Rejected
- [x] **Weak Password Detection**: Common weak passwords rejected
- [x] **Name Validation**: Empty/too long names rejected
- [x] **Email Validation**: Invalid email format rejected
- [x] **Required Fields**: Missing name/email/password rejected
- [x] **Privilege Escalation Prevention**: `is_admin` cannot be set during registration
- [x] **Password Hashing**: Stored password is bcrypt hashed (starts with `$2b$` or `$2a$`)
- [x] **Consistent Error Format**: All errors use `{ "success": false, "error": "..." }` format

---

## Comparison: Registration vs Profile Update

Both endpoints now enforce **identical password rules**:

| Rule                  | Registration | Profile Update |
| --------------------- | ------------ | -------------- |
| Min 8 chars           | ✅           | ✅             |
| Max 128 chars         | ✅           | ✅             |
| Type: string          | ✅           | ✅             |
| No whitespace-only    | ✅           | ✅             |
| Reject weak passwords | ✅           | ✅             |
| Bcrypt hashing        | ✅           | ✅             |

---

## Database Verification

After successful registration, verify password is properly hashed:

```sql
-- Check user was created
SELECT id, name, email, is_admin, created_at FROM users
WHERE email = 'testuser@example.com';

-- Verify password is hashed (should start with $2b$ or $2a$)
SELECT password FROM users WHERE email = 'testuser@example.com';
-- Expected: $2b$10$... (bcrypt hash)

-- Verify is_admin is false
SELECT is_admin FROM users WHERE email = 'testuser@example.com';
-- Expected: false
```
