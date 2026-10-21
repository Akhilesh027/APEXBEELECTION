import React from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LoginPage } from './pages/LoginPage';
import { SuperAdminView } from './pages/SuperAdminView';
import { AdminView } from './pages/AdminView';
import { ViewerView } from './pages/ViewerView';

export function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0f172a',
        color: 'white',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          border: '3px solid rgba(255,255,255,0.2)',
          borderTopColor: '#38bdf8',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        <div style={{ fontSize: '14px', fontWeight: 600, color: '#94a3b8' }}>
          Verifying secure session & IP gateway...
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="app-container">
      <Navbar />

      {/* Render Role-Specific Portal View */}
      {user.role === 'SUPER_ADMIN' && <SuperAdminView />}
      {user.role === 'ADMIN' && <AdminView />}
      {user.role === 'VIEWER' && <ViewerView />}
    </div>
  );
}

export default App;
