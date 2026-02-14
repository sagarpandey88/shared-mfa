import { useState, useEffect } from 'react';
import { api } from '../api';
import './MFACard.css';

function MFACard({ account, onDelete }) {
  const [token, setToken] = useState('------');
  const [remainingTime, setRemainingTime] = useState(30);
  const [loading, setLoading] = useState(false);
  const [showToken, setShowToken] = useState(false);

  useEffect(() => {
    let interval;
    if (showToken) {
      fetchToken();
      interval = setInterval(fetchToken, 30000); // Refresh every 30 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showToken, account.id]);

  useEffect(() => {
    let countdown;
    if (showToken && remainingTime > 0) {
      countdown = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1) {
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (countdown) clearInterval(countdown);
    };
  }, [showToken, remainingTime]);

  const fetchToken = async () => {
    try {
      setLoading(true);
      const data = await api.getToken(account.id);
      setToken(data.token);
      setRemainingTime(data.remainingTime);
    } catch (error) {
      console.error('Failed to fetch token:', error);
      setToken('Error');
    } finally {
      setLoading(false);
    }
  };

  const toggleToken = () => {
    setShowToken(!showToken);
    if (!showToken) {
      fetchToken();
    } else {
      setToken('------');
      setRemainingTime(30);
    }
  };

  const copyToken = () => {
    if (token && token !== '------' && token !== 'Error') {
      navigator.clipboard.writeText(token);
      alert('Token copied to clipboard!');
    }
  };

  return (
    <div className="mfa-card">
      <div className="mfa-card-header">
        <h3 className="mfa-name">{account.name}</h3>
        <button
          onClick={() => onDelete(account.id)}
          className="delete-button"
          title="Delete"
        >
          🗑️
        </button>
      </div>
      {account.issuer && (
        <p className="mfa-issuer">{account.issuer}</p>
      )}
      <div className="mfa-token-section">
        {showToken ? (
          <>
            <div className="token-display">
              <span className="token-value">{loading ? 'Loading...' : token}</span>
              {token !== '------' && token !== 'Error' && (
                <button onClick={copyToken} className="copy-button" title="Copy">
                  📋
                </button>
              )}
            </div>
            <div className="token-timer">
              <div className="timer-bar">
                <div
                  className="timer-fill"
                  style={{ width: `${(remainingTime / 30) * 100}%` }}
                ></div>
              </div>
              <span className="timer-text">{remainingTime}s</span>
            </div>
          </>
        ) : (
          <div className="token-hidden">Click "Show Token" to view</div>
        )}
      </div>
      <button onClick={toggleToken} className="show-token-button">
        {showToken ? 'Hide Token' : 'Show Token'}
      </button>
    </div>
  );
}

export default MFACard;
