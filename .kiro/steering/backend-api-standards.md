---
inclusion: fileMatch
fileMatchPattern: "backend/src/**/*.ts"
---

# Backend API Standards for Pager2077

This steering document is automatically included when working on backend code.

## Architecture Pattern

Follow the **Service/Repository Pattern**:

```
Handler → Service → Repository → Database
   ↓         ↓          ↓
 Thin    Business    Data Access
         Logic
```

### Handler Layer (Lambda Functions)
- Parse request
- Validate input
- Call service methods
- Format response
- Handle errors

**Keep handlers thin!** No business logic here.

### Service Layer
- Business logic
- Orchestrate multiple repositories
- Handle transactions
- Validate business rules
- Call external services (S3, SNS)

### Repository Layer
- Database queries only
- CRUD operations
- Use parameterized queries
- Return typed data

## API Response Format

### Success Response
```typescript
{
  success: true,
  data: {
    // Response data
  }
}
```

### Error Response
```typescript
{
  success: false,
  error: {
    code: 'ERROR_CODE',
    message: 'User-friendly error message',
    details?: any  // Optional, only in development
  }
}
```

## Error Handling

### Custom Error Class
```typescript
class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    public message: string,
    public details?: any
  ) {
    super(message);
  }
}
```

### Error Codes
```typescript
const ErrorCodes = {
  // User errors (400)
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  INVALID_HEX_CODE: 'INVALID_HEX_CODE',
  INVALID_INPUT: 'INVALID_INPUT',
  
  // Conflict errors (409)
  DUPLICATE_REQUEST: 'DUPLICATE_REQUEST',
  FRIENDSHIP_EXISTS: 'FRIENDSHIP_EXISTS',
  
  // Auth errors (401, 403)
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INVALID_TOKEN: 'INVALID_TOKEN',
  
  // Resource errors (404)
  NOT_FOUND: 'NOT_FOUND',
  VOICE_NOTE_EXPIRED: 'VOICE_NOTE_EXPIRED',
  
  // Server errors (500)
  DATABASE_ERROR: 'DATABASE_ERROR',
  UPLOAD_FAILED: 'UPLOAD_FAILED',
  NOTIFICATION_FAILED: 'NOTIFICATION_FAILED',
};
```

### HTTP Status Codes
- 200: Success
- 201: Created
- 400: Bad Request (client error)
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 409: Conflict
- 500: Internal Server Error

## Database Best Practices

### Always Use Parameterized Queries
```typescript
// ✅ Good - Prevents SQL injection
const result = await db.query(
  'SELECT * FROM users WHERE hex_code = $1',
  [hexCode]
);

// ❌ Bad - SQL injection vulnerability
const result = await db.query(
  `SELECT * FROM users WHERE hex_code = '${hexCode}'`
);
```

### Use Transactions for Multiple Operations
```typescript
const client = await pool.connect();
try {
  await client.query('BEGIN');
  
  // Multiple operations
  await client.query('UPDATE ...');
  await client.query('INSERT ...');
  
  await client.query('COMMIT');
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  client.release();
}
```

### Handle Database Errors
```typescript
try {
  const result = await db.query(query, params);
  return result.rows;
} catch (error) {
  console.error('Database error:', error);
  throw new AppError(500, 'DATABASE_ERROR', 'Database operation failed');
}
```

## Authentication & Authorization

### JWT Token Structure
```typescript
interface JWTPayload {
  userId: string;
  hexCode: string;
  iat: number;  // Issued at
  exp: number;  // Expiration
}
```

### Verify Token in Handlers
```typescript
const token = request.headers.authorization?.replace('Bearer ', '');
if (!token) {
  throw new AppError(401, 'UNAUTHORIZED', 'No token provided');
}

const payload = verifyJWT(token);
const userId = payload.userId;
```

### Check Resource Ownership
```typescript
// Always verify user owns the resource
if (resource.userId !== userId) {
  throw new AppError(403, 'FORBIDDEN', 'Access denied');
}
```

## S3 Operations

### Generate Presigned Upload URL
```typescript
const uploadUrl = await s3.getSignedUrl('putObject', {
  Bucket: BUCKET_NAME,
  Key: `voice-notes/${voiceNoteId}.m4a`,
  Expires: 300,  // 5 minutes
  ContentType: 'audio/m4a',
});
```

### Generate Presigned Download URL
```typescript
const downloadUrl = await s3.getSignedUrl('getObject', {
  Bucket: BUCKET_NAME,
  Key: s3Key,
  Expires: 300,  // 5 minutes
});
```

### Set Lifecycle Policy
```typescript
// In Terraform, not code
lifecycle_rule {
  enabled = true
  expiration {
    days = 2  // Auto-delete after 48 hours
  }
}
```

## SNS Push Notifications

### Send Notification
```typescript
await sns.publish({
  TargetArn: deviceToken,
  Message: JSON.stringify({
    notification: {
      title: 'New Voice Note',
      body: `From ${senderHexCode}`,
    },
    data: {
      type: 'VOICE_NOTE',
      voiceNoteId: voiceNoteId,
      senderId: senderId,
    },
  }),
  MessageStructure: 'json',
});
```

### Handle Notification Errors
```typescript
try {
  await sendNotification(deviceToken, payload);
} catch (error) {
  // Log but don't fail the request
  console.error('Notification failed:', error);
  // Voice note is still saved, user can check later
}
```

## Input Validation

### Validate Hex Codes
```typescript
function isValidHexCode(hexCode: string): boolean {
  return /^[0-9A-Fa-f]{8}$/.test(hexCode);
}

if (!isValidHexCode(hexCode)) {
  throw new AppError(400, 'INVALID_HEX_CODE', 'Hex code must be 8 characters');
}
```

### Validate UUIDs
```typescript
function isValidUUID(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}
```

### Sanitize Inputs
```typescript
// Trim whitespace
const hexCode = input.hexCode.trim().toUpperCase();

// Validate length
if (hexCode.length !== 8) {
  throw new AppError(400, 'INVALID_INPUT', 'Invalid hex code length');
}
```

## Logging

### Log Format
```typescript
console.log(JSON.stringify({
  timestamp: new Date().toISOString(),
  level: 'INFO',
  userId: userId,
  action: 'SEND_VOICE_NOTE',
  details: { recipientId, duration },
}));
```

### What to Log
- Request start/end
- User actions (send message, add friend)
- Errors with context
- Performance metrics

### What NOT to Log
- Passwords or tokens
- Full request/response bodies
- Personal information (beyond user IDs)

## Performance Optimization

### Use Connection Pooling
```typescript
const pool = new Pool({
  host: DB_HOST,
  database: DB_NAME,
  user: DB_USER,
  password: DB_PASSWORD,
  max: 20,  // Max connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### Add Database Indexes
```sql
-- Index frequently queried fields
CREATE INDEX idx_users_hex_code ON users(hex_code);
CREATE INDEX idx_friendships_user1 ON friendships(user_id_1);
CREATE INDEX idx_voice_notes_recipient ON voice_notes(recipient_id, status);
```

### Cache Frequently Accessed Data
```typescript
// Example: Cache user hex code lookups
const userCache = new Map<string, User>();

async function getUserByHexCode(hexCode: string): Promise<User | null> {
  if (userCache.has(hexCode)) {
    return userCache.get(hexCode)!;
  }
  
  const user = await repository.getUserByHexCode(hexCode);
  if (user) {
    userCache.set(hexCode, user);
  }
  return user;
}
```

## Testing

### Unit Test Services
```typescript
describe('FriendshipService', () => {
  it('should reject self friend requests', async () => {
    await expect(
      friendshipService.sendFriendRequest(userId, ownHexCode)
    ).rejects.toThrow('Cannot add yourself');
  });
});
```

### Mock Repositories
```typescript
const mockUserRepo = {
  getUserByHexCode: jest.fn(),
  createUser: jest.fn(),
};
```

### Test Error Cases
```typescript
it('should throw USER_NOT_FOUND for invalid hex code', async () => {
  mockUserRepo.getUserByHexCode.mockResolvedValue(null);
  
  await expect(
    service.sendFriendRequest(userId, 'INVALID1')
  ).rejects.toThrow(AppError);
});
```

## Security Checklist

- [ ] Use parameterized queries (prevent SQL injection)
- [ ] Validate all inputs
- [ ] Verify JWT tokens
- [ ] Check resource ownership
- [ ] Use HTTPS only
- [ ] Set short expiration on presigned URLs
- [ ] Implement rate limiting
- [ ] Use least privilege IAM roles
- [ ] Encrypt sensitive data at rest
- [ ] Never log sensitive information
- [ ] Sanitize error messages (no stack traces to client)

## Environment Variables

### Required Variables
```typescript
const DB_HOST = process.env.DB_HOST!;
const DB_NAME = process.env.DB_NAME!;
const DB_USER = process.env.DB_USER!;
const DB_PASSWORD = process.env.DB_PASSWORD!;
const S3_BUCKET = process.env.S3_BUCKET!;
const JWT_SECRET = process.env.JWT_SECRET!;
```

### Validate on Startup
```typescript
function validateEnv() {
  const required = ['DB_HOST', 'DB_NAME', 'S3_BUCKET', 'JWT_SECRET'];
  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing required env var: ${key}`);
    }
  }
}
```

## Code Organization Example

### Handler
```typescript
export async function sendFriendRequestHandler(event: APIGatewayEvent) {
  try {
    const userId = getUserIdFromToken(event);
    const { toHexCode } = JSON.parse(event.body);
    
    const request = await friendshipService.sendFriendRequest(userId, toHexCode);
    
    return {
      statusCode: 201,
      body: JSON.stringify({ success: true, data: request }),
    };
  } catch (error) {
    return handleError(error);
  }
}
```

### Service
```typescript
export class FriendshipService {
  constructor(
    private userRepo: UserRepository,
    private friendshipRepo: FriendshipRepository
  ) {}
  
  async sendFriendRequest(fromUserId: string, toHexCode: string) {
    // Validate
    if (!isValidHexCode(toHexCode)) {
      throw new AppError(400, 'INVALID_HEX_CODE', 'Invalid hex code format');
    }
    
    // Get recipient
    const toUser = await this.userRepo.getUserByHexCode(toHexCode);
    if (!toUser) {
      throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
    }
    
    // Check self-add
    if (fromUserId === toUser.id) {
      throw new AppError(400, 'INVALID_INPUT', 'Cannot add yourself');
    }
    
    // Create request
    return await this.friendshipRepo.createFriendRequest(fromUserId, toUser.id);
  }
}
```

### Repository
```typescript
export class FriendshipRepository {
  constructor(private db: Pool) {}
  
  async createFriendRequest(fromUserId: string, toUserId: string) {
    const result = await this.db.query(
      `INSERT INTO friend_requests (from_user_id, to_user_id, status)
       VALUES ($1, $2, 'pending')
       RETURNING *`,
      [fromUserId, toUserId]
    );
    return result.rows[0];
  }
}
```

## When in Doubt

- Keep handlers thin
- Put business logic in services
- Use repositories for database access
- Always validate inputs
- Return consistent response format
- Log errors with context
- Test error cases
- Follow security checklist
