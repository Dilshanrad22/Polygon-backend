# FarmInvest Backend API

A minimal Express.js server with MySQL to serve farm investment data with authentication.

## Prerequisites

- Node.js (v16 or higher)
- MySQL Server (v8.0 or higher)

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Create a `.env` file with your MySQL credentials:

```bash
cp .env.example .env
```

Edit `.env` with your MySQL connection details:

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=farminvestlite
PORT=3000
JWT_SECRET=your_secret_key
```

### 3. Setup Database

Create the database and tables:

```bash
npm run setup-db
```

Or manually with MySQL:

```bash
mysql -u root -p < schema.sql
```

### 4. Seed Database (Optional)

Populate with sample data:

```bash
npm run seed
```

### 5. Start the Server

**Development mode** (with auto-reload):
```bash
npm run dev
```

**Production mode**:
```bash
npm start
```

Server will run on `http://localhost:3000`

## API Endpoints

### Authentication

#### POST /api/auth/register

Register a new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (201 Created):**
```json
{
  "message": "Registration successful",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### POST /api/auth/login

Login a user.

**Request Body:**
```json
{
  "email": "demo@farminvest.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "name": "Demo User",
    "email": "demo@farminvest.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Investments

#### GET /api/investments

Returns list of all investments.

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "farmer_name": "John Doe",
    "amount": 5000.00,
    "crop": "Wheat",
    "created_at": "2025-12-01T10:00:00.000Z"
  }
]
```

#### POST /api/investments

Creates a new investment.

**Request Body:**
```json
{
  "farmer_name": "John Doe",
  "amount": 5000,
  "crop": "Wheat"
}
```

**Response (201 Created):**
```json
{
  "id": 11,
  "farmer_name": "John Doe",
  "amount": 5000.00,
  "crop": "Wheat",
  "created_at": "2026-01-03T10:00:00.000Z"
}
```

### Health

#### GET /api/health

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-03T10:00:00.000Z",
  "database": "connected"
}
```

## Test Credentials

After seeding the database:
- Email: `demo@farminvest.com`
- Password: `password123`

## cURL Examples

```bash
# Register new user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Test User", "email": "test@example.com", "password": "password123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "demo@farminvest.com", "password": "password123"}'

# Get all investments
curl http://localhost:3000/api/investments

# Create new investment
curl -X POST http://localhost:3000/api/investments \
  -H "Content-Type: application/json" \
  -d '{"farmer_name": "Test Farmer", "amount": 1000, "crop": "Wheat"}'

# Health check
curl http://localhost:3000/api/health
```

## Error Handling

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created successfully |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Invalid credentials |
| 403 | Forbidden - Invalid token |
| 500 | Internal Server Error |
