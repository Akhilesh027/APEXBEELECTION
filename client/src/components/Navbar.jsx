import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Shield, User, LogOut, Globe, Building2, Languages } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { language, setLanguage } = useLanguage();

  const getRoleBadge = (role) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return (
          <span className="badge badge-super" title="Super Admin">
            ⚡ Super Admin • ముఖ్య నిర్వాహకుడు
          </span>
        );
      case 'ADMIN':
        return (
          <span className="badge badge-admin" title="Admin">
            📋 Admin • అడ్మిన్ నిర్వాహకుడు
          </span>
        );
      case 'VIEWER':
        return (
          <span className="badge badge-viewer" title="Viewer">
            🔍 Viewer • పరిశీలకుడు
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 50, background: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
      {/* Top Accent Bar */}
      <div className="gov-top-bar" />

      {/* Sub-header */}
      <div className="gov-sub-bar">
        <div className="gov-sub-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, color: '#0f172a' }}>
              Ward Voter Search Portal
            </span>
            <span style={{ color: '#cbd5e1' }}>|</span>
            <span className="telugu-text" style={{ color: '#64748b', fontSize: '11px' }}>
              వార్డు ఓటర్ల శోధన పోర్టల్
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            {/* Language / Translation Selector */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              padding: '2px 6px',
              fontSize: '11px'
            }}>
              <Languages size={12} color="#1a56db" />
              <span style={{ fontWeight: 700, color: '#475569', marginRight: '2px' }}>Language:</span>
              <button
                onClick={() => setLanguage('EN')}
                style={{
                  border: 'none',
                  background: language === 'EN' ? '#1a56db' : 'transparent',
                  color: language === 'EN' ? '#ffffff' : '#334155',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: '11px'
                }}
                title="English (Default)"
              >
                English
              </button>
              <button
                onClick={() => setLanguage('BOTH')}
                style={{
                  border: 'none',
                  background: language === 'BOTH' ? '#1a56db' : 'transparent',
                  color: language === 'BOTH' ? '#ffffff' : '#334155',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: '11px'
                }}
                title="Bilingual: English + Telugu"
              >
                EN + తె
              </button>
              <button
                onClick={() => setLanguage('TE')}
                style={{
                  border: 'none',
                  background: language === 'TE' ? '#1a56db' : 'transparent',
                  color: language === 'TE' ? '#ffffff' : '#334155',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: '11px'
                }}
                title="తెలుగు (Telugu)"
              >
                తెలుగు
              </button>
            </div>

            {user?.lastLoginIp && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#475569', fontFamily: 'monospace', fontSize: '11px' }}>
                <Globe size={11} color="#2563eb" />
                <span>IP: {user.lastLoginIp}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div style={{ borderBottom: '1px solid #e2e8f0', background: '#ffffff' }}>
        <div style={{
          maxWidth: '1360px',
          margin: '0 auto',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          {/* Emblem & Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: '1 1 auto' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #0a1e3f, #1a56db)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: '0 2px 6px rgba(10, 30, 63, 0.25)',
              flexShrink: 0
            }}>
              <Building2 size={22} color="#38bdf8" />
            </div>

            <div style={{ minWidth: 0 }}>
              <div className="gov-header-title" style={{ fontSize: '16.5px', fontWeight: 800, color: '#0a1e3f', letterSpacing: '-0.02em', lineHeight: '1.2' }}>
                Ward Voter Search Portal
              </div>
              <div className="telugu-text gov-header-sub" style={{ fontSize: '12px', fontWeight: 600, color: '#2563eb', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                వార్డు ఓటర్ల శోధన పోర్టల్
              </div>
            </div>
          </div>

          {/* User Status & Officer Controls */}
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', width: 'auto' }}>
              <div className="desktop-badge">
                {getRoleBadge(user.role)}
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '12.5px',
                maxWidth: '180px',
                overflow: 'hidden'
              }}>
                <User size={13} color="#64748b" style={{ flexShrink: 0 }} />
                <span style={{ fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.fullName}
                </span>
              </div>

              <button
                onClick={logout}
                className="btn btn-secondary btn-sm"
                style={{ color: '#dc2626', borderColor: '#fca5a5', padding: '5px 10px', fontSize: '12px' }}
                title="Sign out from portal"
              >
                <LogOut size={13} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
