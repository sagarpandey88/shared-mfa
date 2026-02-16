# Shared MFA

An Open Source Web-based shared MFA (Multi-Factor Authentication) token generator designed for teams and companies who need developers to share MFA tokens for testing purposes.

## Features

- 🔐 **Microsoft OAuth Authentication** - Secure login using Microsoft accounts
- 📱 **TOTP Token Generation** - Generate time-based one-time passwords
- 📷 **QR Code Scanner** - Easily add MFA accounts by scanning QR codes
- ⌨️ **Manual Entry** - Add MFA accounts by manually entering secret keys
- 🔄 **Real-time Token Updates** - Tokens automatically refresh every 30 seconds
- 🗂️ **Multiple MFA Accounts** - Manage multiple MFA accounts in one place
- 👥 **Team Collaboration** - Share MFA access across your team

## Tech Stack

### Frontend
- React with Vite
- TypeScript for type safety
- React Router for navigation
- HTML5-QRCode for QR code scanning
- Responsive CSS

### Backend
- Node.js with Express
- PostgreSQL (no ORM - raw SQL queries)
- Passport.js for Microsoft OAuth
- Speakeasy for TOTP generation
- Express Session for authentication

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- Microsoft Azure AD application (for OAuth)

## Setup Instructions

You can set up the application in two ways:

### Option 1: Docker Setup (Recommended)

The easiest way to get started is using Docker Compose:

1. Clone the repository:
```bash
git clone https://github.com/sagarpandey88/shared-mfa.git
cd shared-mfa
```

2. Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

3. Update the `.env` file with your Microsoft OAuth credentials:
```env
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
```

4. Start the application:
```bash
docker-compose up
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- PostgreSQL: localhost:5432

### Option 2: Quick Setup Script

Use the automated setup script:

```bash
git clone https://github.com/sagarpandey88/shared-mfa.git
cd shared-mfa
./setup.sh
```

The script will:
- Create the PostgreSQL database
- Set up the database schema
- Install backend and frontend dependencies
- Create .env files from examples

After running the script, update `backend/.env` with your configuration and start the servers.

### Option 3: Manual Setup

### 1. Clone the Repository

```bash
git clone https://github.com/sagarpandey88/shared-mfa.git
cd shared-mfa
```

### 2. Database Setup

Create a PostgreSQL database:

```bash
createdb shared_mfa
```

Run the schema to create tables:

```bash
psql -d shared_mfa -f backend/schema.sql
```

### 3. Backend Setup

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Update the `.env` file with your configurations:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=shared_mfa
DB_USER=postgres
DB_PASSWORD=your_password

# Server Configuration
PORT=3001
NODE_ENV=development

# Session Secret (generate a random string)
SESSION_SECRET=your-session-secret-change-this

# Microsoft OAuth (get these from Azure Portal)
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
MICROSOFT_CALLBACK_URL=http://localhost:3001/auth/microsoft/callback

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### 4. Microsoft OAuth Setup

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to "Azure Active Directory" > "App registrations"
3. Click "New registration"
4. Set redirect URI to: `http://localhost:3001/auth/microsoft/callback`
5. Copy the Application (client) ID and create a client secret
6. Add these values to your `.env` file

### 5. Frontend Setup

Navigate to the frontend directory and install dependencies:

```bash
cd ../frontend
npm install
```

Create a `.env` file (optional, defaults are already set):

```bash
cp .env.example .env
```

### 6. Running the Application

Start the backend server:

```bash
cd backend
npm start
```

In a new terminal, start the frontend:

```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## Usage

### Login
1. Navigate to http://localhost:5173
2. Click "Sign in with Microsoft"
3. Authenticate with your Microsoft account

### Add MFA Account

#### Manual Entry:
1. Click "+ Add MFA" button
2. Select "Manual Entry"
3. Enter account name and secret key
4. Optionally add issuer
5. Click "Add MFA Account"

#### QR Code:
1. Click "+ Add MFA" button
2. Select "Scan QR Code"
3. Click "Start Camera"
4. Scan the QR code from the service
5. Optionally provide a custom name
6. Click "Add MFA Account"

### View TOTP Token
1. Find the MFA account in your dashboard
2. Click "Show Token"
3. The 6-digit token will be displayed
4. Token refreshes automatically every 30 seconds
5. Click the copy button to copy to clipboard

### Delete MFA Account
1. Click the trash icon on any MFA card
2. Confirm deletion

## API Endpoints

### Authentication
- `GET /auth/microsoft` - Initiate Microsoft OAuth
- `GET /auth/microsoft/callback` - OAuth callback
- `POST /auth/logout` - Logout
- `GET /auth/user` - Get current user

### MFA Management
- `GET /api/mfa` - Get all MFA accounts
- `GET /api/mfa/:id/token` - Get TOTP token for account
- `POST /api/mfa` - Add new MFA account (manual)
- `POST /api/mfa/from-qr` - Add MFA account from QR code
- `DELETE /api/mfa/:id` - Delete MFA account

## Security Considerations

- MFA secrets are stored in plain text in the database (suitable for internal team use)
- For production use, consider encrypting secrets at rest
- Sessions use secure HTTP-only cookies
- CORS is configured to only allow requests from the frontend
- Microsoft OAuth provides secure authentication
- No ORM to prevent SQL injection (parameterized queries used)
- Rate limiting implemented to prevent abuse (100 requests per 15 minutes per IP)
- CSRF protection on all state-changing endpoints
- Separate rate limiting for authentication endpoints (5 attempts per 15 minutes)
- This application is designed for internal development/testing environments

## Development

### Backend Development
```bash
cd backend
npm run dev
```

### Frontend Development
```bash
cd frontend
npm run dev
```

## Production Deployment

1. Set `NODE_ENV=production` in backend `.env`
2. Update `FRONTEND_URL` to your production domain
3. Update Microsoft OAuth callback URL in Azure Portal
4. Build frontend: `cd frontend && npm run build`
5. Serve frontend build directory with a web server
6. Use a process manager like PM2 for the backend

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the Apache License 2.0 - see the LICENSE file for details.

## Support

For issues and questions, please open an issue on GitHub.

## Disclaimer

This application is designed for development and testing environments. While security measures are in place, please review your organization's security policies before using in production.
