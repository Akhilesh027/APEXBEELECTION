import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { AuditLogTable } from '../components/AuditLogTable';
import { VoterSlip } from '../components/VoterSlip';
import { VoterFormModal } from '../components/VoterFormModal';
import {
  ShieldAlert,
  Users,
  Activity,
  Globe,
  UserPlus,
  RefreshCw,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Trash2,
  Eye,
  Edit,
  Database,
  Building2,
  FileText,
  User
} from 'lucide-react';

export const SuperAdminView = () => {
  const { token, user } = useAuth();
  const [activeTab, setActiveTab] = useState('audit'); // 'audit' | 'users' | 'voters'

  // Audit Logs State
  const [logs, setLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditFilter, setAuditFilter] = useState({ role: 'ALL', actionType: 'ALL', search: '', ipAddress: '' });
  const [analytics, setAnalytics] = useState(null);

  // Users State
  const [usersList, setUsersList] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserData, setNewUserData] = useState({ fullName: '', email: '', password: '', role: 'ADMIN', assignedConstituency: '116 - Guntur West' });
  const [userError, setUserError] = useState('');

  // Voters State
  const [voters, setVoters] = useState([]);
  const [votersLoading, setVotersLoading] = useState(false);
  const [voterSearch, setVoterSearch] = useState('');
  const [selectedSlipVoter, setSelectedSlipVoter] = useState(null);
  const [editingVoter, setEditingVoter] = useState(null);
  const [showAddVoterModal, setShowAddVoterModal] = useState(false);
  const [voterDisplayMode, setVoterDisplayMode] = useState(() => {
    return typeof window !== 'undefined' && window.innerWidth <= 768 ? 'cards' : 'table';
  });

  // Fetch Audit Logs & Analytics
  const fetchAuditData = async () => {
    setAuditLoading(true);
    try {
      const query = new URLSearchParams();
      if (auditFilter.role !== 'ALL') query.append('role', auditFilter.role);
      if (auditFilter.actionType !== 'ALL') query.append('actionType', auditFilter.actionType);
      if (auditFilter.search) query.append('search', auditFilter.search);
      if (auditFilter.ipAddress) query.append('ipAddress', auditFilter.ipAddress);

      const [logRes, analyticsRes] = await Promise.all([
        fetch(`/api/audit?${query.toString()}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/audit/analytics', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const logData = await logRes.json();
      const analyticsData = await analyticsRes.json();

      if (logData.success) setLogs(logData.logs);
      if (analyticsData.success) setAnalytics(analyticsData);
    } catch (err) {
      console.error('Failed to fetch audit data:', err);
    } finally {
      setAuditLoading(false);
    }
  };

  // Fetch Users
  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await fetch('/api/users', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setUsersList(data.users);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  // Fetch Voters
  const fetchVoters = async () => {
    setVotersLoading(true);
    try {
      const query = new URLSearchParams();
      if (voterSearch) query.append('search', voterSearch);
      query.append('limit', '50');

      const res = await fetch(`/api/voters?${query.toString()}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setVoters(data.voters);
    } catch (err) {
      console.error('Failed to fetch voters:', err);
    } finally {
      setVotersLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditData();
    fetchUsers();
    fetchVoters();
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'audit') fetchAuditData();
    if (tab === 'users') fetchUsers();
    if (tab === 'voters') fetchVoters();
  };

  // Create User
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setUserError('');
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newUserData),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to create user account');

      setShowAddUserModal(false);
      setNewUserData({ fullName: '', email: '', password: '', role: 'ADMIN', assignedConstituency: '116 - Guntur West' });
      fetchUsers();
      fetchAuditData();
    } catch (err) {
      setUserError(err.message);
    }
  };

  // Toggle User Status
  const handleToggleStatus = async (userId) => {
    try {
      const res = await fetch(`/api/users/${userId}/status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchUsers();
        fetchAuditData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Voter
  const handleDeleteVoter = async (voterId) => {
    if (!window.confirm('ఈ ఓటరు రికార్డును శాశ్వతంగా తొలగించాలనుకుంటున్నారా? (Are you sure you want to permanently delete this voter record?)')) return;
    try {
      const res = await fetch(`/api/voters/${voterId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchVoters();
        fetchAuditData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="main-content">
      {/* Top Government Executive Banner */}
      <div style={{ marginBottom: '22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#1a56db' }}>
              System Administration
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0a1e3f', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building2 size={26} color="#1a56db" />
              Super Admin Management Portal
            </h1>
            <p className="telugu-text" style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
              అడ్మిన్ పోర్టల్ • యూజర్లు, ఆడిట్ లాగ్‌లు & మాస్టర్ ఓటరు జాబితా నిర్వహణ.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button onClick={() => { fetchAuditData(); fetchUsers(); fetchVoters(); }} className="btn btn-secondary btn-sm">
              <RefreshCw size={13} /> Refresh Data / రీఫ్రెష్
            </button>
            <button onClick={() => setShowAddUserModal(true)} className="btn btn-primary btn-sm">
              <UserPlus size={14} /> + Add User (కొత్త యూజర్ నమోదు)
            </button>
          </div>
        </div>

        {/* Official Overview Cards */}
        <div className="gov-stats-grid">
          <div className="card" style={{ padding: '16px 20px', borderLeft: '4px solid #1a56db' }}>
            <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748b' }}>SYSTEM USERS (సిస్టమ్ యూజర్లు)</div>
            <div style={{ fontSize: '24px', fontWeight: 800, marginTop: '4px', color: '#0a1e3f' }}>{usersList.length} Active Accounts</div>
            <div style={{ fontSize: '12px', color: '#1a56db', marginTop: '2px' }}>
              {usersList.filter(u => u.role === 'ADMIN').length} Admins • {usersList.filter(u => u.role === 'VIEWER').length} Viewers
            </div>
          </div>

          <div className="card" style={{ padding: '16px 20px', borderLeft: '4px solid #ff9933' }}>
            <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748b' }}>REGISTERED VOTERS (ఓటర్ల జాబితా)</div>
            <div style={{ fontSize: '24px', fontWeight: 800, marginTop: '4px', color: '#0a1e3f' }}>{voters.length}+ Voters</div>
            <div style={{ fontSize: '12px', color: '#2563eb', marginTop: '2px' }}>Master Voter Records (మొత్తం ఓటర్ల జాబితా)</div>
          </div>

          <div className="card" style={{ padding: '16px 20px', borderLeft: '4px solid #138808' }}>
            <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748b' }}>AUDITED ACTIONS (ఆడిట్ లాగ్ రికార్డులు)</div>
            <div style={{ fontSize: '24px', fontWeight: 800, marginTop: '4px', color: '#0a1e3f' }}>{analytics?.totalActions || logs.length} Audited Logs</div>
            <div style={{ fontSize: '12px', color: '#15803d', marginTop: '2px' }}>
              ⚡ {analytics?.actionsLast24h || logs.length} actions in the last 24h (గత 24 గంటల్లో)
            </div>
          </div>

          <div className="card" style={{ padding: '16px 20px', borderLeft: '4px solid #6366f1' }}>
            <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748b' }}>MONITORED NETWORKS (IP నెట్‌వర్క్‌లు)</div>
            <div style={{ fontSize: '24px', fontWeight: 800, marginTop: '4px', color: '#0a1e3f' }}>
              {analytics?.topIps?.length || 1} Active Gateways
            </div>
            <div style={{ fontSize: '12px', color: '#4f46e5', marginTop: '2px' }}>Real-time IP telemetry logging</div>
          </div>
        </div>
      </div>

      {/* Official Tabs */}
      <div className="gov-tabs-bar" style={{ borderBottom: '2px solid #cbd5e1', marginBottom: '22px' }}>
        <button
          onClick={() => handleTabChange('audit')}
          className="btn"
          style={{
            borderRadius: '6px 6px 0 0',
            borderBottom: activeTab === 'audit' ? '3px solid #1a56db' : 'none',
            color: activeTab === 'audit' ? '#1a56db' : '#64748b',
            background: activeTab === 'audit' ? '#ffffff' : 'transparent',
            fontWeight: 700,
            padding: '10px 18px',
            fontSize: '13.5px'
          }}
        >
          <Activity size={15} /> Activity & Audit Logs ({logs.length})
        </button>

        <button
          onClick={() => handleTabChange('users')}
          className="btn"
          style={{
            borderRadius: '6px 6px 0 0',
            borderBottom: activeTab === 'users' ? '3px solid #1a56db' : 'none',
            color: activeTab === 'users' ? '#1a56db' : '#64748b',
            background: activeTab === 'users' ? '#ffffff' : 'transparent',
            fontWeight: 700,
            padding: '10px 18px',
            fontSize: '13.5px'
          }}
        >
          <Users size={15} /> System Users ({usersList.length})
        </button>

        <button
          onClick={() => handleTabChange('voters')}
          className="btn"
          style={{
            borderRadius: '6px 6px 0 0',
            borderBottom: activeTab === 'voters' ? '3px solid #1a56db' : 'none',
            color: activeTab === 'voters' ? '#1a56db' : '#64748b',
            background: activeTab === 'voters' ? '#ffffff' : 'transparent',
            fontWeight: 700,
            padding: '10px 18px',
            fontSize: '13.5px'
          }}
        >
          <Database size={15} /> Master Voter List ({voters.length})
        </button>
      </div>

      {/* TAB 1: AUDIT LOGS & IP SURVEILLANCE */}
      {activeTab === 'audit' && (
        <div>
          {/* Filter Bar */}
          <div className="card" style={{ padding: '16px 20px', marginBottom: '18px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>
                  USER ROLE (హోదా)
                </label>
                <select
                  value={auditFilter.role}
                  onChange={(e) => setAuditFilter({ ...auditFilter, role: e.target.value })}
                  className="form-select"
                >
                  <option value="ALL">All Roles (అన్ని హోదాలు)</option>
                  <option value="SUPER_ADMIN">Super Admin (ముఖ్య నిర్వాహకుడు)</option>
                  <option value="ADMIN">Admin (అడ్మిన్)</option>
                  <option value="VIEWER">Viewer (పరిశీలకుడు)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>
                  ACTION TYPE (చర్య రకం)
                </label>
                <select
                  value={auditFilter.actionType}
                  onChange={(e) => setAuditFilter({ ...auditFilter, actionType: e.target.value })}
                  className="form-select"
                >
                  <option value="ALL">All Event Types (అన్ని చర్యలు)</option>
                  <option value="LOGIN">User Login (లాగిన్)</option>
                  <option value="VOTER_ADD">Voter Enrollment (ఓటరు నమోదు)</option>
                  <option value="VOTER_UPDATE">Voter Revision (సవరణ)</option>
                  <option value="VOTER_DELETE">Voter Deletion (తొలగింపు)</option>
                  <option value="USER_CREATE">User Account Created (ఖాతా సృష్టి)</option>
                  <option value="USER_STATUS_CHANGE">User Status Change (స్థితి మార్పు)</option>
                  <option value="VOTER_SEARCH">Voter Searches (జాబితా శోధన)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>
                  FILTER BY IP ADDRESS (IP చిరునామా)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 103.24.120.45"
                  value={auditFilter.ipAddress}
                  onChange={(e) => setAuditFilter({ ...auditFilter, ipAddress: e.target.value })}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button onClick={fetchAuditData} className="btn btn-primary" style={{ width: '100%' }}>
                  <Filter size={14} /> Apply Filter / ఫిల్టర్
                </button>
              </div>
            </div>
          </div>

          <AuditLogTable logs={logs} loading={auditLoading} />
        </div>
      )}

      {/* TAB 2: ELECTORAL OFFICERS DIRECTORY */}
      {activeTab === 'users' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0a1e3f' }}>
              Users Directory (సిస్టమ్ యూజర్లు)
            </h3>
            <button onClick={() => setShowAddUserModal(true)} className="btn btn-primary btn-sm">
              <UserPlus size={14} /> + Add User (కొత్త యూజర్ నమోదు)
            </button>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>NAME (పేరు)</th>
                  <th>EMAIL (ఈమెయిల్)</th>
                  <th>ROLE (హోదా)</th>
                  <th>STATUS (స్థితి)</th>
                  <th>ASSIGNED CONSTITUENCY (నియోజకవర్గం)</th>
                  <th>LAST LOGIN IP (చివరి IP)</th>
                  <th>TIMESTAMP (సమయం)</th>
                  <th>ACTIONS (చర్యలు)</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map((u) => (
                  <tr key={u._id}>
                    <td style={{ fontWeight: 700 }}>{u.fullName}</td>
                    <td style={{ color: '#64748b' }}>{u.email}</td>
                    <td>
                      <span className={`badge ${u.role === 'SUPER_ADMIN' ? 'badge-super' : u.role === 'ADMIN' ? 'badge-admin' : 'badge-viewer'}`}>
                        {u.role === 'SUPER_ADMIN' ? 'ముఖ్య నిర్వాహకుడు (Super Admin)' : u.role === 'ADMIN' ? 'అడ్మిన్ (Admin)' : 'పరిశీలకుడు (Viewer)'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${u.status === 'ACTIVE' ? 'badge-active' : 'badge-suspended'}`}>
                        {u.status === 'ACTIVE' ? 'క్రియాశీల (Active)' : 'నిలిపివేసిన (Suspended)'}
                      </span>
                    </td>
                    <td style={{ fontSize: '12.5px' }}>{u.assignedConstituency || 'మొత్తం (All)'}</td>
                    <td>
                      {u.lastLoginIp ? (
                        <div>
                          <span className="badge badge-ip">{u.lastLoginIp}</span>
                          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                            {u.lastLoginLocation || 'Network Location'}
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '12px' }}>లాగిన్ కాలేదు</span>
                      )}
                    </td>
                    <td style={{ fontSize: '12px', color: '#64748b' }}>
                      {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString('en-IN') : '—'}
                    </td>
                    <td>
                      {u.role !== 'SUPER_ADMIN' && (
                        <button
                          onClick={() => handleToggleStatus(u._id)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 8px', fontSize: '11.5px' }}
                        >
                          {u.status === 'ACTIVE' ? (
                            <span style={{ color: '#d97706' }}>ఖాతా నిలిపివేయి (Suspend)</span>
                          ) : (
                            <span style={{ color: '#16a34a' }}>పునరుద్ధరించు (Activate)</span>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: MASTER ELECTORAL ROLL */}
      {activeTab === 'voters' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '8px', flex: 1, maxWidth: '480px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                <input
                  type="text"
                  placeholder="EPIC ID, పేరు, ఇంటి సంఖ్య ద్వారా శోధించండి..."
                  value={voterSearch}
                  onChange={(e) => setVoterSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchVoters()}
                  className="form-input"
                  style={{ paddingLeft: '38px' }}
                />
              </div>
              <button onClick={fetchVoters} className="btn btn-primary btn-sm">
                <Search size={14} /> శోధించండి
              </button>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Table / Cards Switcher */}
              <div style={{ display: 'flex', gap: '4px', background: '#e2e8f0', padding: '3px', borderRadius: '6px' }}>
                <button
                  onClick={() => setVoterDisplayMode('table')}
                  className="btn btn-sm"
                  style={{
                    background: voterDisplayMode === 'table' ? '#ffffff' : 'transparent',
                    color: voterDisplayMode === 'table' ? '#0a1e3f' : '#64748b',
                    boxShadow: voterDisplayMode === 'table' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    padding: '3px 8px',
                    fontSize: '11.5px',
                    fontWeight: 700
                  }}
                >
                  📋 Table
                </button>
                <button
                  onClick={() => setVoterDisplayMode('cards')}
                  className="btn btn-sm"
                  style={{
                    background: voterDisplayMode === 'cards' ? '#ffffff' : 'transparent',
                    color: voterDisplayMode === 'cards' ? '#0a1e3f' : '#64748b',
                    boxShadow: voterDisplayMode === 'cards' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    padding: '3px 8px',
                    fontSize: '11.5px',
                    fontWeight: 700
                  }}
                >
                  🗂️ Cards
                </button>
              </div>

              <button onClick={() => setShowAddVoterModal(true)} className="btn btn-primary btn-sm">
                <UserPlus size={14} /> కొత్త ఓటరు నమోదు (Add)
              </button>
            </div>
          </div>

          {voterDisplayMode === 'table' ? (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>ఓటరు ఐడి (EPIC NO.)</th>
                    <th>ఓటరు పేరు (VOTER NAME)</th>
                    <th>సంబంధీకుడు</th>
                    <th>వయస్సు / లింగము</th>
                    <th>ఇంటి సంఖ్య</th>
                    <th>వార్డు (WARD)</th>
                    <th>స్థితి</th>
                    <th>చర్యలు</th>
                  </tr>
                </thead>
                <tbody>
                  {voters.map((v) => (
                    <tr key={v._id}>
                      <td><strong style={{ fontFamily: 'monospace', color: '#1a56db' }}>{v.voterIdNumber}</strong></td>
                      <td>
                        <div style={{ fontWeight: 700 }}>{v.fullName}</div>
                        {v.fullNameLocal && <div className="telugu-text" style={{ fontSize: '12px', color: '#64748b' }}>{v.fullNameLocal}</div>}
                      </td>
                      <td>{v.relativeName}</td>
                      <td>{v.age} సం. / {v.gender === 'MALE' ? 'పు' : v.gender === 'FEMALE' ? 'స్త్రీ' : 'ఇతర'}</td>
                      <td><strong>{v.houseNumber}</strong></td>
                      {/* Photo & Ward */}
                      <td style={{ fontSize: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {v.photoUrl ? (
                            <img
                              src={v.photoUrl}
                              alt={v.fullName}
                              style={{
                                width: '36px',
                                height: '44px',
                                objectFit: 'cover',
                                borderRadius: '4px',
                                border: '1px solid #cbd5e1',
                                backgroundColor: '#f1f5f9',
                                flexShrink: 0
                              }}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div
                            style={{
                              width: '36px',
                              height: '44px',
                              borderRadius: '4px',
                              background: '#e2e8f0',
                              display: v.photoUrl ? 'none' : 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#64748b',
                              fontSize: '9px',
                              border: '1px solid #cbd5e1',
                              flexShrink: 0
                            }}
                          >
                            <User size={14} color="#94a3b8" />
                            <span style={{ fontSize: '8px' }}>ఫోటో</span>
                          </div>
                          <div>
                            <div style={{ fontWeight: 800, color: '#0a1e3f' }}>
                              వార్డు {v.electionLocation?.wardNo || '24'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${v.status === 'ACTIVE' ? 'badge-active' : 'badge-suspended'}`}>{v.status}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => setSelectedSlipVoter(v)} className="btn btn-secondary btn-sm" style={{ padding: '4px 8px' }} title="ఓటరు పత్రం చూడండి">
                            <Eye size={13} />
                          </button>
                          <button onClick={() => setEditingVoter(v)} className="btn btn-secondary btn-sm" style={{ padding: '4px 8px' }} title="సవరణ">
                            <Edit size={13} />
                          </button>
                          <button onClick={() => handleDeleteVoter(v._id)} className="btn btn-secondary btn-sm" style={{ padding: '4px 8px', color: '#dc2626' }} title="తొలగించు">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* Mobile Cards Layout for Super Admin */
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
              {voters.map((v) => (
                <div key={v._id} className="mobile-voter-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>EPIC NO.</div>
                      <div style={{ fontSize: '15px', fontWeight: 800, fontFamily: 'monospace', color: '#1a56db' }}>
                        {v.voterIdNumber}
                      </div>
                    </div>
                    <span className={`badge ${v.status === 'ACTIVE' ? 'badge-active' : 'badge-suspended'}`}>
                      {v.status}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                    {v.photoUrl ? (
                      <div style={{ width: '44px', height: '54px', borderRadius: '4px', overflow: 'hidden', border: '1px solid #cbd5e1', flexShrink: 0 }}>
                        <img src={v.photoUrl} alt={v.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ) : (
                      <div style={{ width: '44px', height: '54px', borderRadius: '4px', background: '#f1f5f9', border: '1px dashed #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#94a3b8', flexShrink: 0 }}>
                        ఫోటో లేదు
                      </div>
                    )}
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '14.5px', color: '#0a1e3f' }}>{v.fullName}</div>
                      {v.fullNameLocal && (
                        <div className="telugu-text" style={{ fontSize: '12.5px', color: '#475569', fontWeight: 600 }}>
                          {v.fullNameLocal}
                        </div>
                      )}
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        {v.gender === 'MALE' ? 'పు' : 'స్త్రీ'} • {v.age} సం.
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: '12px', color: '#475569', marginBottom: '4px' }}>
                    సంబంధీకుడు: <strong>{v.relativeName}</strong> ({v.relationType})
                  </div>

                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>
                    ఇంటి సంఖ్య: <strong>{v.houseNumber}</strong> • బూత్: {v.assemblyPartSerialCode}
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => setSelectedSlipVoter(v)} className="btn btn-secondary btn-sm" style={{ flex: 1, padding: '6px' }}>
                      <Eye size={13} /> స్లిప్ (Slip)
                    </button>
                    <button onClick={() => setEditingVoter(v)} className="btn btn-primary btn-sm" style={{ flex: 1, padding: '6px' }}>
                      <Edit size={13} /> సవరణ (Edit)
                    </button>
                    <button onClick={() => handleDeleteVoter(v._id)} className="btn btn-secondary btn-sm" style={{ padding: '6px 10px', color: '#dc2626' }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="modal-overlay">
          <div className="modal-body" style={{ maxWidth: '480px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '4px', color: '#0a1e3f' }}>కొత్త యూజర్ ఖాతా సృష్టి</h3>
            <p style={{ fontSize: '12.5px', color: '#64748b', marginBottom: '16px' }}>
              అడ్మిన్ (Admin) లేదా పరిశీలకుడికి (Viewer) యాక్సెస్ అందించండి.
            </p>

            {userError && (
              <div style={{ background: '#fef2f2', color: '#dc2626', padding: '10px', borderRadius: '6px', fontSize: '13px', marginBottom: '14px' }}>
                {userError}
              </div>
            )}

            <form onSubmit={handleCreateUser}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>పూర్తి పేరు *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. రమేష్ రావు"
                  value={newUserData.fullName}
                  onChange={(e) => setNewUserData({ ...newUserData, fullName: e.target.value })}
                  className="form-input"
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>ఈమెయిల్ ఐడి *</label>
                <input
                  type="email"
                  required
                  placeholder="user@election.com"
                  value={newUserData.email}
                  onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                  className="form-input"
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>రహస్య సంకేత పదం (Password) *</label>
                <input
                  type="password"
                  required
                  placeholder="కనీసం 6 అక్షరాలు"
                  value={newUserData.password}
                  onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                  className="form-input"
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>హోదా / Role *</label>
                <select
                  value={newUserData.role}
                  onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
                  className="form-select"
                >
                  <option value="ADMIN">అడ్మిన్ (Admin - Add & Edit Voters)</option>
                  <option value="VIEWER">పరిశీలకుడు (Viewer - Search & View Only)</option>
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>నియోజకవర్గం / పరిధి</label>
                <input
                  type="text"
                  placeholder="e.g. 116 - గుంటూరు పశ్చిమ"
                  value={newUserData.assignedConstituency}
                  onChange={(e) => setNewUserData({ ...newUserData, assignedConstituency: e.target.value })}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setShowAddUserModal(false)} className="btn btn-secondary">
                  రద్దు (Cancel)
                </button>
                <button type="submit" className="btn btn-primary">
                  ఖాతా సృష్టించండి (Create Account)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Voter Slip Modal */}
      {selectedSlipVoter && (
        <VoterSlip voter={selectedSlipVoter} onClose={() => setSelectedSlipVoter(null)} />
      )}

      {/* Voter Add Modal */}
      {showAddVoterModal && (
        <VoterFormModal
          voter={null}
          token={token}
          onClose={() => setShowAddVoterModal(false)}
          onSuccess={() => {
            fetchVoters();
            fetchAuditData();
          }}
        />
      )}

      {/* Voter Edit Modal */}
      {editingVoter && (
        <VoterFormModal
          voter={editingVoter}
          token={token}
          onClose={() => setEditingVoter(null)}
          onSuccess={() => {
            fetchVoters();
            fetchAuditData();
          }}
        />
      )}
    </div>
  );
};
