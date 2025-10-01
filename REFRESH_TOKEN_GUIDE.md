# Refresh Token Implementation Guide

## Overview

This application now includes refresh token functionality with HTTP-only cookies for enhanced security. The implementation follows industry best practices for JWT token management.

## Features

- **Access Tokens**: Short-lived (15 minutes) for API requests
- **Refresh Tokens**: Long-lived (7 days) stored in HTTP-only cookies
- **Automatic Token Refresh**: Seamless token renewal without user intervention
- **Secure Cookie Storage**: HTTP-only, secure, and same-site cookies
- **Token Invalidation**: Proper logout with token cleanup

## Environment Variables

Add these to your `.env` file:

```env
JWT_SECRET=your-super-secure-jwt-secret-key-here
JWT_REFRESH_SECRET=your-super-secure-jwt-refresh-secret-key-here
```

## API Endpoints

### 1. Login

**POST** `/auth/signin`

**Request:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "role": "USER"
  }
}
```

**Cookies Set:**

- `refresh_token`: HTTP-only cookie with 7-day expiration

### 2. Refresh Token

**POST** `/auth/refresh`

**Request:** No body required (uses HTTP-only cookie)

**Response:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Cookies Updated:**

- `refresh_token`: New HTTP-only cookie with 7-day expiration

### 3. Logout

**POST** `/auth/logout`

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response:**

```json
{
  "message": "Logged out successfully"
}
```

**Cookies Cleared:**

- `refreshToken`: Removed from browser

## Frontend Implementation

### JavaScript/TypeScript Example

```typescript
class AuthService {
  private baseUrl = 'http://localhost:3000';
  private accessToken: string | null = null;

  async login(email: string, password: string) {
    const response = await fetch(`${this.baseUrl}/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important for cookies
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const data = await response.json();
      this.accessToken = data.access_token;
      return data;
    }
    throw new Error('Login failed');
  }

  async refreshToken() {
    const response = await fetch(`${this.baseUrl}/auth/refresh`, {
      method: 'POST',
      credentials: 'include', // Important for cookies
    });

    if (response.ok) {
      const data = await response.json();
      this.accessToken = data.accessToken;
      return data.accessToken;
    }
    throw new Error('Token refresh failed');
  }

  async logout() {
    const response = await fetch(`${this.baseUrl}/auth/logout`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
      credentials: 'include', // Important for cookies
    });

    if (response.ok) {
      this.accessToken = null;
    }
  }

  async makeAuthenticatedRequest(url: string, options: RequestInit = {}) {
    let response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${this.accessToken}`,
      },
      credentials: 'include',
    });

    // If token expired, try to refresh
    if (response.status === 401) {
      try {
        await this.refreshToken();
        // Retry the original request
        response = await fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${this.accessToken}`,
          },
          credentials: 'include',
        });
      } catch (error) {
        // Refresh failed, redirect to login
        this.accessToken = null;
        window.location.href = '/login';
        throw error;
      }
    }

    return response;
  }
}
```

### React Hook Example

```typescript
import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  const login = async (email: string, password: string) => {
    const response = await fetch('/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const data = await response.json();
      setAccessToken(data.access_token);
      setUser(data.user);
      return data;
    }
    throw new Error('Login failed');
  };

  const refreshToken = async () => {
    const response = await fetch('/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    });

    if (response.ok) {
      const data = await response.json();
      setAccessToken(data.accessToken);
      return data.accessToken;
    }
    throw new Error('Token refresh failed');
  };

  const logout = async () => {
    await fetch('/auth/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      credentials: 'include',
    });
    setAccessToken(null);
    setUser(null);
  };

  return { accessToken, user, login, logout, refreshToken };
};
```

## Security Features

1. **HTTP-Only Cookies**: Refresh tokens are stored in HTTP-only cookies, preventing XSS attacks
2. **Secure Cookies**: In production, cookies are marked as secure (HTTPS only)
3. **Same-Site Protection**: Cookies are set with `SameSite=strict` to prevent CSRF attacks
4. **Token Rotation**: Each refresh generates a new refresh token
5. **Token Invalidation**: Logout properly invalidates refresh tokens
6. **Separate Secrets**: Access and refresh tokens use different secrets

## Database Changes

The `User` entity now includes a `refresh_token` field:

```typescript
@Column({ type: 'varchar', nullable: true })
refresh_token: string | null;
```

You'll need to run a database migration to add this column to your existing users table.

## Migration

If you have existing data, you'll need to add the `refresh_token` column to your users table:

```sql
ALTER TABLE "user" ADD COLUMN "refresh_token" VARCHAR;
```

## Testing

You can test the refresh token functionality using curl:

```bash
# Login
curl -X POST http://localhost:3000/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}' \
  -c cookies.txt

# Use the access token for API calls
curl -X GET http://localhost:3000/auth/validate \
  -H "Authorization: Bearer <access_token>" \
  -b cookies.txt

# Refresh token (uses cookie)
curl -X POST http://localhost:3000/auth/refresh \
  -b cookies.txt \
  -c cookies.txt

# Logout
curl -X POST http://localhost:3000/auth/logout \
  -H "Authorization: Bearer <access_token>" \
  -b cookies.txt
```

## Best Practices

1. **Always use HTTPS in production** for secure cookie transmission
2. **Implement automatic token refresh** in your frontend
3. **Handle token expiration gracefully** with proper error handling
4. **Use the refresh token endpoint** when access tokens expire
5. **Clear tokens on logout** to prevent unauthorized access
6. **Monitor for suspicious activity** and implement rate limiting if needed

## Troubleshooting

### Common Issues

1. **Cookies not being sent**: Ensure `credentials: 'include'` is set in fetch requests
2. **CORS issues**: Make sure your CORS configuration allows credentials
3. **Token validation errors**: Check that JWT secrets are properly configured
4. **Database errors**: Ensure the `refresh_token` column exists in your users table

### Debug Mode

Enable debug logging by setting the log level in your environment:

```env
LOG_LEVEL=debug
```

This will provide detailed information about token generation, validation, and refresh operations.
