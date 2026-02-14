import { useState, useRef, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { api } from '../api';
import './AddMFAModal.css';

function AddMFAModal({ onClose, onAdd }) {
  const [mode, setMode] = useState('manual'); // 'manual' or 'qr'
  const [formData, setFormData] = useState({
    name: '',
    secret: '',
    issuer: '',
  });
  const [qrData, setQrData] = useState('');
  const [customName, setCustomName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef(null);
  const qrScannerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (qrScannerRef.current) {
        qrScannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.secret) {
      setError('Name and secret are required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await api.addMFA(formData);
      onAdd();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const startScanner = async () => {
    try {
      setScanning(true);
      setError('');
      
      const html5QrCode = new Html5Qrcode("qr-reader");
      qrScannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        async (decodedText) => {
          setQrData(decodedText);
          await html5QrCode.stop();
          setScanning(false);
        },
        (errorMessage) => {
          // Ignore continuous scanning errors
        }
      );
    } catch (error) {
      console.error('Error starting scanner:', error);
      setError('Failed to start camera. Please ensure camera permissions are granted.');
      setScanning(false);
    }
  };

  const stopScanner = async () => {
    if (qrScannerRef.current) {
      try {
        await qrScannerRef.current.stop();
      } catch (error) {
        console.error('Error stopping scanner:', error);
      }
    }
    setScanning(false);
  };

  const handleQRSubmit = async (e) => {
    e.preventDefault();
    if (!qrData) {
      setError('Please scan a QR code first');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await api.addMFAFromQR({ qrData, customName });
      onAdd();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add MFA Account</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="mode-selector">
          <button
            className={`mode-button ${mode === 'manual' ? 'active' : ''}`}
            onClick={() => {
              setMode('manual');
              stopScanner();
              setQrData('');
              setError('');
            }}
          >
            Manual Entry
          </button>
          <button
            className={`mode-button ${mode === 'qr' ? 'active' : ''}`}
            onClick={() => {
              setMode('qr');
              setError('');
            }}
          >
            Scan QR Code
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {mode === 'manual' ? (
          <form onSubmit={handleManualSubmit} className="mfa-form">
            <div className="form-group">
              <label htmlFor="name">Account Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., GitHub, AWS"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="secret">Secret Key *</label>
              <input
                type="text"
                id="secret"
                name="secret"
                value={formData.secret}
                onChange={handleInputChange}
                placeholder="Base32 encoded secret"
                required
              />
              <small>Enter the secret key provided by the service</small>
            </div>
            <div className="form-group">
              <label htmlFor="issuer">Issuer (Optional)</label>
              <input
                type="text"
                id="issuer"
                name="issuer"
                value={formData.issuer}
                onChange={handleInputChange}
                placeholder="e.g., GitHub"
              />
            </div>
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? 'Adding...' : 'Add MFA Account'}
            </button>
          </form>
        ) : (
          <div className="qr-scanner-section">
            {!qrData ? (
              <>
                <div id="qr-reader" ref={scannerRef} style={{ width: '100%' }}></div>
                {!scanning ? (
                  <button onClick={startScanner} className="scan-button">
                    Start Camera
                  </button>
                ) : (
                  <button onClick={stopScanner} className="scan-button stop">
                    Stop Camera
                  </button>
                )}
              </>
            ) : (
              <form onSubmit={handleQRSubmit} className="mfa-form">
                <div className="success-message">QR Code scanned successfully!</div>
                <div className="form-group">
                  <label htmlFor="customName">Custom Name (Optional)</label>
                  <input
                    type="text"
                    id="customName"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Leave empty to use default name"
                  />
                </div>
                <button type="submit" className="submit-button" disabled={loading}>
                  {loading ? 'Adding...' : 'Add MFA Account'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setQrData('');
                    setCustomName('');
                  }}
                  className="scan-again-button"
                >
                  Scan Again
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AddMFAModal;
