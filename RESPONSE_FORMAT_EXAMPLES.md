# API Response Format with ResponseInterceptor

## Overview

Your `ResponseInterceptor` automatically wraps all API responses in a consistent format:

```typescript
{
  statusCode: number,
  message: string,
  data: any
}
```

## Success Response Examples

### POST /auth/signin (Login) - 200

**Before Interceptor:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "role": "user"
  }
}
```

**After ResponseInterceptor:**

```json
{
  "statusCode": 200,
  "message": "Data created successfully",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "email": "user@example.com",
      "role": "user"
    }
  }
}
```

### POST /auth/signup (Register) - 201

**After ResponseInterceptor:**

```json
{
  "statusCode": 201,
  "message": "Data created successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "newuser@example.com",
    "username": "newuser",
    "role": "user",
    "created_at": "2024-01-01T12:00:00.000Z",
    "updated_at": "2024-01-01T12:00:00.000Z"
  }
}
```

### GET /categories - 200

**After ResponseInterceptor:**

```json
{
  "statusCode": 200,
  "message": "Data get successfully",
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Excavators",
      "imageUrl": "https://example.com/image.jpg",
      "createdAt": "2024-01-01T12:00:00.000Z",
      "updatedAt": "2024-01-01T12:00:00.000Z"
    }
  ]
}
```

### DELETE /categories/:id - 200

**After ResponseInterceptor:**

```json
{
  "statusCode": 200,
  "message": "Data deleted successfully",
  "data": {
    "message": "Категорията е изтрита успешно"
  }
}
```

## Error Response Examples

### 400 Bad Request

```json
{
  "statusCode": 400,
  "message": "Bad Request",
  "error": "BadRequestException",
  "timestamp": 1704067200000,
  "data": {}
}
```

### 401 Unauthorized

```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "UnauthorizedException",
  "timestamp": 1704067200000,
  "data": {}
}
```

### 403 Forbidden

```json
{
  "statusCode": 403,
  "message": "Access denied - Admin role required",
  "error": "ForbiddenException",
  "timestamp": 1704067200000,
  "data": {}
}
```

### 404 Not Found

```json
{
  "statusCode": 404,
  "message": "Category not found",
  "error": "NotFoundException",
  "timestamp": 1704067200000,
  "data": {}
}
```

### 409 Conflict

```json
{
  "statusCode": 409,
  "message": "Category with this name already exists",
  "error": "ConflictException",
  "timestamp": 1704067200000,
  "data": {}
}
```

### 500 Internal Server Error

```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "InternalServerErrorException",
  "timestamp": 1704067200000,
  "data": {}
}
```

## HTTP Method Message Mapping

Your interceptor automatically sets messages based on HTTP method:

- **GET**: "Data get successfully"
- **POST**: "Data created successfully"
- **PATCH/PUT**: "Data updated successfully"
- **DELETE**: "Data deleted successfully"

## Frontend Usage

```javascript
// Example frontend code for login
const response = await fetch('/api/auth/signin', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
  }),
});

const result = await response.json();

console.log('Status:', result.statusCode);
console.log('Message:', result.message);
console.log('Token:', result.data.access_token);
console.log('User:', result.data.user);
```

## Swagger Documentation

The Swagger documentation now shows:

1. **Success Responses**: Use `ApiResponseDto<T>` where T is your actual data type
2. **Error Responses**: Use `ErrorResponseDto` for all error cases
3. **Consistent Structure**: All endpoints show the same response format

This ensures your API documentation accurately reflects what your frontend will actually receive after the ResponseInterceptor processes the response.

