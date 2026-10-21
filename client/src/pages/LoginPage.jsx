import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, AlertCircle, ArrowRight, Building2 } from 'lucide-react';

export const LoginPage = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#f1f5f9'
    }}>
      {/* Top Accent Bar */}
      <div className="gov-top-bar" />

      {/* Portal Top Header */}
      <div className="gov-sub-bar">
        <div className="gov-sub-inner">
          <div style={{ fontWeight: 700, color: '#0f172a' }}>
            Ward Voter Search Portal • వార్డు ఓటర్ల శోధన పోర్టల్
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1e40af', fontWeight: 600 }}>
            <span>Secure Portal Access</span>
          </div>
        </div>
      </div>

      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px 14px',
        background: 'linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)'
      }}>
        <div style={{
          maxWidth: '440px',
          width: '100%',
          background: '#ffffff',
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(10, 30, 63, 0.1)',
          border: '1px solid #cbd5e1',
          borderTop: '4px solid #1a56db',
          padding: '24px 18px'
        }}>
          {/* Emblem & Title */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{
              width: '54px',
              height: '54px',
              background: '#0a1e3f',
              borderRadius: '8px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38bdf8',
              marginBottom: '12px',
              boxShadow: '0 2px 8px rgba(10, 30, 63, 0.2)'
            }}>
              <Building2 size={28} />
            </div>

            <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#0a1e3f', letterSpacing: '-0.02em', marginTop: '2px' }}>
              Ward Voter Search Portal Login
            </h1>
            <div className="telugu-text" style={{ fontSize: '13px', fontWeight: 600, color: '#2563eb', marginTop: '2px' }}>
              వార్డు ఓటర్ల శోధన పోర్టల్ • లాగిన్
            </div>
            <p style={{ fontSize: '12.5px', color: '#64748b', marginTop: '3px' }}>
              Ward Voter Directory & Search Access
            </p>
          </div>

          {error && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#b91c1c',
              padding: '10px 14px',
              borderRadius: '6px',
              marginBottom: '18px',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Email Address (ఈమెయిల్) *
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '11px' }} />
                <input
                  type="email"
                  required
                  placeholder="admin@election.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '38px' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '22px' }}>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Password (పాస్‌వర్డ్) *
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '11px' }} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '38px' }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '11px', fontSize: '14px', fontWeight: 700 }}
            >
              {loading ? 'Verifying Credentials...' : 'Sign In / లాగిన్ అవ్వండి'}
              <ArrowRight size={15} />
            </button>
          </form>

          {/* Notice */}
          <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '11.5px', color: '#64748b', textAlign: 'center', lineHeight: '1.5' }}>
              🔒 <strong>Secure Access:</strong> Sign in with your assigned credentials to manage voter records.
              <div className="telugu-text" style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                ఓటర్ల వివరాలను నిర్వహించడానికి మీ ఖాతాతో లాగిన్ అవ్వండి.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
