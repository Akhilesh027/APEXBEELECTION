import React, { useState } from 'react';
import { ShieldAlert, Globe, Monitor, Smartphone, Eye, Clock, ArrowRight } from 'lucide-react';

export const AuditLogTable = ({ logs, loading }) => {
  const [selectedLog, setSelectedLog] = useState(null);
  const [displayMode, setDisplayMode] = useState(() => {
    return typeof window !== 'undefined' && window.innerWidth <= 768 ? 'cards' : 'table';
  });

  const getActionBadge = (type) => {
    switch (type) {
      case 'LOGIN':
        return <span style={{ background: '#ecfdf5', color: '#059669', padding: '3px 8px', borderRadius: '4px', fontWeight: 700, fontSize: '11px' }}>LOGIN</span>;
      case 'USER_CREATE':
        return <span style={{ background: '#eff6ff', color: '#2563eb', padding: '3px 8px', borderRadius: '4px', fontWeight: 700, fontSize: '11px' }}>+ USER ADD</span>;
      case 'USER_STATUS_CHANGE':
        return <span style={{ background: '#fffbeb', color: '#d97706', padding: '3px 8px', borderRadius: '4px', fontWeight: 700, fontSize: '11px' }}>STATUS CHANGE</span>;
      case 'USER_DELETE':
        return <span style={{ background: '#fef2f2', color: '#dc2626', padding: '3px 8px', borderRadius: '4px', fontWeight: 700, fontSize: '11px' }}>USER DELETE</span>;
      case 'VOTER_ADD':
        return <span style={{ background: '#ecfdf5', color: '#059669', padding: '3px 8px', borderRadius: '4px', fontWeight: 700, fontSize: '11px' }}>+ VOTER ADD</span>;
      case 'VOTER_UPDATE':
        return <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '3px 8px', borderRadius: '4px', fontWeight: 700, fontSize: '11px' }}>VOTER EDIT</span>;
      case 'VOTER_DELETE':
        return <span style={{ background: '#fef2f2', color: '#dc2626', padding: '3px 8px', borderRadius: '4px', fontWeight: 700, fontSize: '11px' }}>VOTER DELETE</span>;
      case 'VOTER_SEARCH':
        return <span style={{ background: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: '4px', fontWeight: 700, fontSize: '11px' }}>SEARCH</span>;
      default:
        return <span style={{ background: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: '4px', fontWeight: 700, fontSize: '11px' }}>{type}</span>;
    }
  };

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
        Loading real-time audit stream & IP telemetry...
      </div>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
        No audit activity recorded matching criteria.
      </div>
    );
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ fontSize: '13px', color: '#64748b' }}>
          చట్టబద్ధ ఆడిట్ రికార్డులు: <strong>{logs.length}</strong>
        </div>

        <div style={{ display: 'flex', gap: '4px', background: '#e2e8f0', padding: '3px', borderRadius: '6px' }}>
          <button
            onClick={() => setDisplayMode('table')}
            className="btn btn-sm"
            style={{
              background: displayMode === 'table' ? '#ffffff' : 'transparent',
              color: displayMode === 'table' ? '#0a1e3f' : '#64748b',
              boxShadow: displayMode === 'table' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              padding: '3px 8px',
              fontSize: '11.5px',
              fontWeight: 700
            }}
          >
            📋 Table
          </button>
          <button
            onClick={() => setDisplayMode('cards')}
            className="btn btn-sm"
            style={{
              background: displayMode === 'cards' ? '#ffffff' : 'transparent',
              color: displayMode === 'cards' ? '#0a1e3f' : '#64748b',
              boxShadow: displayMode === 'cards' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              padding: '3px 8px',
              fontSize: '11.5px',
              fontWeight: 700
            }}
          >
            🗂️ Cards
          </button>
        </div>
      </div>

      {displayMode === 'table' ? (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Actor & Role</th>
                <th>Action Event</th>
                <th>IP Address & Location</th>
                <th>Device / Agent</th>
                <th>Activity Summary</th>
                <th>Diff</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log._id}>
                  {/* Timestamp */}
                  <td style={{ whiteSpace: 'nowrap', fontSize: '12px', color: '#64748b' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Clock size={13} />
                      {formatDate(log.createdAt)}
                    </div>
                  </td>

                  {/* Actor & Role */}
                  <td>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{log.actorName}</div>
                    <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>{log.actorEmail}</span>
                      <span style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: '1px 5px',
                        borderRadius: '3px',
                        background: log.actorRole === 'SUPER_ADMIN' ? '#fdf2f8' : log.actorRole === 'ADMIN' ? '#eff6ff' : '#f0fdf4',
                        color: log.actorRole === 'SUPER_ADMIN' ? '#db2777' : log.actorRole === 'ADMIN' ? '#2563eb' : '#16a34a'
                      }}>
                        {log.actorRole}
                      </span>
                    </div>
                  </td>

                  {/* Action Type */}
                  <td>{getActionBadge(log.actionType)}</td>

                  {/* IP Address & Location */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Globe size={13} color="#2563eb" />
                      <span className="badge badge-ip">{log.ipAddress}</span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                      📍 {log.location?.city || 'Regional'}, {log.location?.country || 'IN'}
                    </div>
                  </td>

                  {/* Device & Browser */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px' }}>
                      {log.deviceInfo?.device === 'Mobile' ? (
                        <Smartphone size={14} color="#64748b" />
                      ) : (
                        <Monitor size={14} color="#64748b" />
                      )}
                      <span>{log.deviceInfo?.browser || 'Browser'} / {log.deviceInfo?.os || 'OS'}</span>
                    </div>
                  </td>

                  {/* Details */}
                  <td style={{ maxWidth: '320px', fontSize: '13px' }}>
                    {log.details}
                  </td>

                  {/* View Diff */}
                  <td>
                    {log.changesDiff && Object.keys(log.changesDiff).length > 0 ? (
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 8px', fontSize: '11px' }}
                      >
                        <Eye size={12} />
                        View Diff
                      </button>
                    ) : (
                      <span style={{ color: '#cbd5e1', fontSize: '12px' }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Mobile-Optimized Audit Logs Cards */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '10px' }}>
          {logs.map((log) => (
            <div key={log._id} className="card" style={{ padding: '12px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                {getActionBadge(log.actionType)}
                <span style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <Clock size={11} /> {formatDate(log.createdAt)}
                </span>
              </div>

              <div style={{ marginBottom: '6px' }}>
                <span style={{ fontWeight: 700, fontSize: '13.5px', color: '#0f172a' }}>{log.actorName}</span>
                <span style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  marginLeft: '6px',
                  padding: '1px 5px',
                  borderRadius: '3px',
                  background: log.actorRole === 'SUPER_ADMIN' ? '#fdf2f8' : log.actorRole === 'ADMIN' ? '#eff6ff' : '#f0fdf4',
                  color: log.actorRole === 'SUPER_ADMIN' ? '#db2777' : log.actorRole === 'ADMIN' ? '#2563eb' : '#16a34a'
                }}>
                  {log.actorRole}
                </span>
              </div>

              <div style={{ fontSize: '12px', color: '#475569', marginBottom: '8px', lineHeight: '1.4' }}>
                {log.details}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '8px', flexWrap: 'wrap', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Globe size={12} color="#2563eb" />
                  <span className="badge badge-ip" style={{ fontSize: '11px' }}>{log.ipAddress}</span>
                </div>

                {log.changesDiff && Object.keys(log.changesDiff).length > 0 && (
                  <button
                    onClick={() => setSelectedLog(log)}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '3px 8px', fontSize: '11px' }}
                  >
                    <Eye size={11} /> Diff
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Changes Diff */}
      {selectedLog && (
        <div className="modal-overlay">
          <div className="modal-body" style={{ maxWidth: '600px' }}>
            <h3 style={{ fontSize: '17px', fontWeight: 800, marginBottom: '6px' }}>
              Action Audit Snapshot & Data Diff
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
              Logged on {formatDate(selectedLog.createdAt)} from IP <strong style={{ color: '#0f172a' }}>{selectedLog.ipAddress}</strong>
            </p>

            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '14px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>ACTION DESCRIPTION</div>
              <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#0f172a' }}>{selectedLog.details}</div>
            </div>

            <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>PAYLOAD / FIELD DIFFERENCE</div>
            <pre style={{
              background: '#0f172a',
              color: '#38bdf8',
              padding: '14px',
              borderRadius: '8px',
              fontSize: '12px',
              overflowX: 'auto',
              lineHeight: '1.5'
            }}>
              {JSON.stringify(selectedLog.changesDiff, null, 2)}
            </pre>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button onClick={() => setSelectedLog(null)} className="btn btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
