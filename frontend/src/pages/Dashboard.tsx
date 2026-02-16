import { useState, useEffect } from 'react';
import { api, User, MFAAccount } from '../api';
import MFACard from '../components/MFACard';
import AddMFAModal from '../components/AddMFAModal';
import './Dashboard.css';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

function Dashboard({ user, onLogout }: DashboardProps) {
  const [mfaAccounts, setMfaAccounts] = useState<MFAAccount[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  useEffect(() => {
    loadMFAAccounts();
  }, []);

  const loadMFAAccounts = async (): Promise<void> => {
    try {
      const accounts = await api.getMFAAccounts();
      setMfaAccounts(accounts);
    } catch (error) {
      console.error('Failed to load MFA accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async (): Promise<void> => {
    try {
      await api.logout();
      onLogout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleAddMFA = async (): Promise<void> => {
    await loadMFAAccounts();
    setShowAddModal(false);
  };

  const handleDeleteMFA = async (id: number): Promise<void> => {
    if (window.confirm('Are you sure you want to delete this MFA account?')) {
      try {
        await api.deleteMFA(id);
        await loadMFAAccounts();
      } catch (error) {
        console.error('Failed to delete MFA:', error);
        alert('Failed to delete MFA account');
      }
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Shared MFA</h1>
          <div className="header-actions">
            <span className="user-name">Welcome, {user.name}</span>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-content">
          <div className="content-header">
            <h2>Your MFA Accounts</h2>
            <button onClick={() => setShowAddModal(true)} className="add-button">
              + Add MFA
            </button>
          </div>

          {loading ? (
            <div className="loading">Loading MFA accounts...</div>
          ) : mfaAccounts.length === 0 ? (
            <div className="empty-state">
              <p>No MFA accounts yet.</p>
              <p>Click "Add MFA" to register your first account.</p>
            </div>
          ) : (
            <div className="mfa-grid">
              {mfaAccounts.map((account) => (
                <MFACard
                  key={account.id}
                  account={account}
                  onDelete={handleDeleteMFA}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {showAddModal && (
        <AddMFAModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddMFA}
        />
      )}
    </div>
  );
}

export default Dashboard;
