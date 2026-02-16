import { AUTH_URL } from '../api';
import './Login.css';

function Login() {
  const handleLogin = (): void => {
    window.location.href = AUTH_URL;
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Shared MFA</h1>
        <p className="login-description">
          Secure shared MFA token manager for teams
        </p>
        <button onClick={handleLogin} className="login-button">
          <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.5 0.5C4.97715 0.5 0.5 4.97715 0.5 10.5C0.5 16.0228 4.97715 20.5 10.5 20.5C16.0228 20.5 20.5 16.0228 20.5 10.5C20.5 4.97715 16.0228 0.5 10.5 0.5Z" fill="#F25022"/>
            <path d="M10.5 0.5V10.5H0.5C0.5 4.97715 4.97715 0.5 10.5 0.5Z" fill="#7FBA00"/>
            <path d="M20.5 10.5H10.5V0.5C16.0228 0.5 20.5 4.97715 20.5 10.5Z" fill="#00A4EF"/>
            <path d="M10.5 10.5V20.5C4.97715 20.5 0.5 16.0228 0.5 10.5H10.5Z" fill="#FFB900"/>
          </svg>
          Sign in with Microsoft
        </button>
      </div>
    </div>
  );
}

export default Login;
