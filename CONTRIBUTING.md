# Contributing to Shared MFA

Thank you for considering contributing to Shared MFA! This document provides guidelines and instructions for contributing.

## Code of Conduct

Please be respectful and constructive in all interactions with the project and community.

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with:
- A clear title and description
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Your environment (OS, Node version, browser, etc.)

### Suggesting Features

Feature suggestions are welcome! Please create an issue with:
- A clear title and description
- Use case and benefits
- Proposed implementation (optional)

### Pull Requests

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature-name`)
3. Make your changes
4. Test your changes thoroughly
5. Commit your changes (`git commit -m 'Add some feature'`)
6. Push to the branch (`git push origin feature/your-feature-name`)
7. Open a Pull Request

### Development Guidelines

#### Backend (Node.js)
- Follow existing code style
- Use raw SQL queries (no ORM as per project requirements)
- Always use parameterized queries to prevent SQL injection
- Add appropriate error handling
- Test all endpoints

#### Frontend (React)
- Follow existing component structure
- Keep components small and focused
- Use functional components with hooks
- Add appropriate prop validation
- Ensure responsive design

#### Database
- No ORM usage (project requirement)
- Use parameterized queries
- Keep schema changes documented
- Update schema.sql file for any database changes

#### Code Style
- Use consistent indentation (2 spaces)
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

### Testing

Before submitting a PR:
1. Test the application locally
2. Verify all existing features still work
3. Test your new feature/fix thoroughly
4. Test on different browsers (if frontend changes)

### Security

- Never commit sensitive data (API keys, passwords, etc.)
- Follow security best practices
- Report security vulnerabilities privately to the maintainers

## Project Structure

```
shared-mfa/
├── backend/
│   ├── routes/          # API routes
│   ├── middleware/      # Express middleware
│   ├── db.js           # Database connection
│   ├── server.js       # Express server setup
│   └── schema.sql      # Database schema
├── frontend/
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── pages/      # Page components
│   │   ├── api.js      # API client
│   │   └── App.jsx     # Main App component
│   └── vite.config.js  # Vite configuration
└── README.md
```

## Questions?

Feel free to open an issue for any questions or clarifications.

Thank you for contributing! 🎉
