import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { VoterFormModal } from '../components/VoterFormModal';
import { VoterSlip } from '../components/VoterSlip';
import {
  UserPlus,
  Edit3,
  Search,
  Filter,
  Eye,
  FileSpreadsheet,
  RefreshCw,
  Home,
  Building,
  CheckCircle2,
  FileText,
  User
} from 'lucide-react';

export const AdminView = () => {
  const { token, user } = useAuth();
  const [voters, setVoters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedWard, setSelectedWard] = useState('ALL');
  const [selectedGender, setSelectedGender] = useState('ALL');
  const [displayMode, setDisplayMode] = useState(() => {
    return typeof window !== 'undefined' && window.innerWidth <= 768 ? 'cards' : 'table';
  });

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVoter, setEditingVoter] = useState(null);
  const [selectedSlipVoter, setSelectedSlipVoter] = useState(null);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkJson, setBulkJson] = useState('');
  const [bulkStatus, setBulkStatus] = useState('');

  const fetchVoters = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.append('search', search);
      if (selectedWard !== 'ALL') query.append('wardNo', selectedWard);
      if (selectedGender !== 'ALL') query.append('gender', selectedGender);
      query.append('limit', '50');

      const res = await fetch(`/api/voters?${query.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setVoters(data.voters);
      }
    } catch (err) {
      console.error('Failed to load voters:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVoters();
  }, [selectedBooth, selectedGender]);

  // Bulk Import Handler
  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    setBulkStatus('నమోదు ప్రక్రియ జరుగుతోంది (Processing batch enrollment)...');
    try {
      const parsed = JSON.parse(bulkJson);
      const res = await fetch('/api/voters/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ voters: parsed }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Batch import failed');

      setBulkStatus(`✅ ${data.message}`);
      fetchVoters();
      setTimeout(() => setShowBulkModal(false), 2000);
    } catch (err) {
      setBulkStatus(`❌ Error: ${err.message}`);
    }
  };

  return (
    <div className="main-content">
      {/* Official Officer Banner */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #cbd5e1',
        borderLeft: '4px solid #1a56db',
        borderRadius: '8px',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '22px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#1a56db' }}>
            Administrator Workspace
          </div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#0a1e3f', marginTop: '2px' }}>
            Voter Directory Management & Enrollment Section
          </div>
          <div className="telugu-text" style={{ fontSize: '12.5px', color: '#64748b', marginTop: '3px' }}>
            ఓటర్ల వివరాల నమోదు మరియు సవరణల పోర్టల్.
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={() => setShowBulkModal(true)} className="btn btn-secondary btn-sm">
            <FileSpreadsheet size={14} /> Batch Voter Upload (బల్క్ నమోదు)
          </button>
          <button onClick={() => setShowAddModal(true)} className="btn btn-primary btn-sm" style={{ fontWeight: 700 }}>
            <UserPlus size={15} /> + Add Voter (కొత్త ఓటరు నమోదు)
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          {/* Quick Search */}
          <div>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
              SEARCH VOTER LIST (ఓటరు శోధన)
            </label>
            <div style={{ position: 'relative' }}>
              <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input
                type="text"
                placeholder="EPIC Card No., Full Name, House No... (ఓటరు ఐడి / పేరు)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchVoters()}
                className="form-input"
                style={{ paddingLeft: '36px' }}
              />
            </div>
          </div>

          {/* Ward Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
              WARD (వార్డు)
            </label>
            <select value={selectedWard} onChange={(e) => setSelectedWard(e.target.value)} className="form-select">
              <option value="ALL">All Wards (అన్ని వార్డులు)</option>
              <option value="24">Ward 24 (వార్డు 24)</option>
              <option value="1">Ward 1 (వార్డు 1)</option>
              <option value="2">Ward 2 (వార్డు 2)</option>
              <option value="3">Ward 3 (వార్డు 3)</option>
              <option value="4">Ward 4 (వార్డు 4)</option>
              <option value="5">Ward 5 (వార్డు 5)</option>
            </select>
          </div>

          {/* Gender */}
          <div>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
              GENDER (లింగము)
            </label>
            <select value={selectedGender} onChange={(e) => setSelectedGender(e.target.value)} className="form-select">
              <option value="ALL">All (అందరూ)</option>
              <option value="MALE">Male (పురుషుడు - పు)</option>
              <option value="FEMALE">Female (స్త్రీ)</option>
            </select>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
            <button onClick={fetchVoters} className="btn btn-primary" style={{ flex: 1 }}>
              <Search size={14} /> Search Roll / శోధించండి
            </button>
            <button onClick={() => { setSearch(''); setSelectedBooth('ALL'); setSelectedGender('ALL'); fetchVoters(); }} className="btn btn-secondary" title="Reset Filters (రీసెట్)">
              <RefreshCw size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* View Switcher & Counter */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <span style={{ fontSize: '15px', fontWeight: 800, color: '#0a1e3f' }}>
            Registered Voters List (నమోదైన ఓటర్ల జాబితా)
          </span>
          <span style={{ fontSize: '12px', color: '#64748b', marginLeft: '8px' }}>
            ({voters.length} entries)
          </span>
        </div>

        <div style={{ display: 'flex', gap: '4px', background: '#e2e8f0', padding: '3px', borderRadius: '6px' }}>
          <button
            onClick={() => setDisplayMode('table')}
            className="btn btn-sm"
            style={{
              background: displayMode === 'table' ? '#ffffff' : 'transparent',
              color: displayMode === 'table' ? '#0a1e3f' : '#64748b',
              boxShadow: displayMode === 'table' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              padding: '4px 10px',
              fontSize: '12px',
              fontWeight: 700
            }}
          >
            📋 Table (పట్టిక)
          </button>
          <button
            onClick={() => setDisplayMode('cards')}
            className="btn btn-sm"
            style={{
              background: displayMode === 'cards' ? '#ffffff' : 'transparent',
              color: displayMode === 'cards' ? '#0a1e3f' : '#64748b',
              boxShadow: displayMode === 'cards' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              padding: '4px 10px',
              fontSize: '12px',
              fontWeight: 700
            }}
          >
            🗂️ Cards (కార్డులు)
          </button>
        </div>
      </div>

      {/* Official Roll Table or Responsive Cards */}
      {displayMode === 'table' ? (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>EPIC CARD NO. (ఓటరు ఐడి)</th>
                <th>VOTER NAME (ఓటరు పేరు)</th>
                <th>RELATIVE NAME (సంబంధీకుడు)</th>
                <th>AGE & GENDER (వయస్సు / లింగము)</th>
                <th>HOUSE NO. (ఇంటి సంఖ్య)</th>
                <th>WARD (వార్డు)</th>
                <th>STATUS (స్థితి)</th>
                <th>ACTIONS (చర్యలు)</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                    ఓటరు జాబితా పరిశీలిస్తోంది (Loading Voter List)...
                  </td>
                </tr>
              ) : voters.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                    నమోదైన ఓటర్ల వివరాలు లభించలేదు.
                  </td>
                </tr>
              ) : (
                voters.map((v) => (
                  <tr key={v._id}>
                    <td>
                      <span style={{ fontWeight: 800, fontFamily: 'monospace', color: '#1a56db' }}>
                        {v.voterIdNumber}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700 }}>{v.fullName}</div>
                      {v.fullNameLocal && (
                        <div className="telugu-text" style={{ fontSize: '12px', color: '#64748b' }}>
                          {v.fullNameLocal}
                        </div>
                      )}
                    </td>
                    <td>
                      <div>{v.relativeName}</div>
                      <div className="telugu-text" style={{ fontSize: '11px', color: '#64748b' }}>
                        ({v.relationType === 'HUSBAND' ? 'భర్త' : 'తండ్రి'})
                      </div>
                    </td>
                    <td>
                      {v.age} సం. • {v.gender === 'MALE' ? 'పు' : v.gender === 'FEMALE' ? 'స్త్రీ' : 'ఇతర'}
                    </td>
                    <td>
                      <strong>{v.houseNumber}</strong>
                    </td>
                    {/* Photo & Ward */}
                    <td style={{ fontSize: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {v.photoUrl ? (
                          <img
                            src={v.photoUrl}
                            alt={v.fullName}
                            style={{
                              width: '40px',
                              height: '48px',
                              objectFit: 'cover',
                              borderRadius: '6px',
                              border: '1.5px solid #cbd5e1',
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
                            width: '40px',
                            height: '48px',
                            borderRadius: '6px',
                            background: '#e2e8f0',
                            display: v.photoUrl ? 'none' : 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#64748b',
                            fontSize: '10px',
                            border: '1px solid #cbd5e1',
                            flexShrink: 0
                          }}
                        >
                          <User size={16} color="#94a3b8" />
                          <span style={{ fontSize: '9px', marginTop: '1px' }}>ఫోటో</span>
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, color: '#0a1e3f', fontSize: '13px' }}>
                            వార్డు {v.electionLocation?.wardNo || '24'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${v.status === 'ACTIVE' ? 'badge-active' : 'badge-suspended'}`}>
                        {v.status === 'ACTIVE' ? 'నమోదిత (Active)' : v.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => setEditingVoter(v)}
                          className="btn btn-primary btn-sm"
                          style={{ padding: '5px 10px', fontSize: '12px' }}
                          title="సవరణ (Edit Voter Details)"
                        >
                          <Edit3 size={13} />
                          సవరణ (Edit)
                        </button>
                        <button
                          onClick={() => setSelectedSlipVoter(v)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '5px 8px' }}
                          title="ఓటరు పత్రం పరిశీలన (View Voter Slip)"
                        >
                          <Eye size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* Mobile-Optimized Cards View */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
          {loading ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#64748b', gridColumn: '1 / -1' }}>
              ఓటరు జాబితా పరిశీలిస్తోంది...
            </div>
          ) : voters.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#64748b', gridColumn: '1 / -1' }}>
              నమోదైన ఓటర్ల వివరాలు లభించలేదు.
            </div>
          ) : (
            voters.map((v) => (
              <div key={v._id} className="mobile-voter-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>EPIC NO.</div>
                    <div style={{ fontSize: '15px', fontWeight: 800, fontFamily: 'monospace', color: '#1a56db' }}>
                      {v.voterIdNumber}
                    </div>
                  </div>
                  <span className={`badge ${v.status === 'ACTIVE' ? 'badge-active' : 'badge-suspended'}`}>
                    {v.status === 'ACTIVE' ? 'నమోదిత' : v.status}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                  {v.photoUrl ? (
                    <div style={{ width: '46px', height: '56px', borderRadius: '4px', overflow: 'hidden', border: '1px solid #cbd5e1', flexShrink: 0 }}>
                      <img src={v.photoUrl} alt={v.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ) : (
                    <div style={{ width: '46px', height: '56px', borderRadius: '4px', background: '#f1f5f9', border: '1px dashed #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#94a3b8', flexShrink: 0 }}>
                      నో ఫోటో
                    </div>
                  )}
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '15px', color: '#0a1e3f' }}>{v.fullName}</div>
                    {v.fullNameLocal && (
                      <div className="telugu-text" style={{ fontSize: '13px', color: '#475569', fontWeight: 600 }}>
                        {v.fullNameLocal}
                      </div>
                    )}
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      {v.gender === 'MALE' ? 'పురుషుడు' : 'స్త్రీ'} • {v.age} సం.
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '12.5px', color: '#475569', marginBottom: '4px' }}>
                  {v.relationType === 'HUSBAND' ? 'భర్త' : 'తండ్రి'}: <strong>{v.relativeName}</strong>
                </div>

                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>
                  ఇంటి సంఖ్య: <strong>{v.houseNumber}</strong> • వార్డు: {v.electionLocation?.wardNo || '24'}
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setEditingVoter(v)}
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1, padding: '8px' }}
                  >
                    <Edit3 size={14} /> సవరణ (Edit)
                  </button>
                  <button
                    onClick={() => setSelectedSlipVoter(v)}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '8px 12px' }}
                    title="View Voter Slip"
                  >
                    <Eye size={14} /> స్లిప్
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add Voter Modal */}
      {showAddModal && (
        <VoterFormModal
          voter={null}
          token={token}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => fetchVoters()}
        />
      )}

      {/* Edit Voter Modal */}
      {editingVoter && (
        <VoterFormModal
          voter={editingVoter}
          token={token}
          onClose={() => setEditingVoter(null)}
          onSuccess={() => fetchVoters()}
        />
      )}

      {/* Official Voter Slip Modal */}
      {selectedSlipVoter && (
        <VoterSlip
          voter={selectedSlipVoter}
          onClose={() => setSelectedSlipVoter(null)}
        />
      )}

      {/* Batch Upload Modal */}
      {showBulkModal && (
        <div className="modal-overlay">
          <div className="modal-body" style={{ maxWidth: '580px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '6px', color: '#0a1e3f' }}>
              బల్క్ ఓటరు నమోదు (Batch Voter Enrollment)
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
              ఒకేసారి బహుళ ఓటర్ల వివరాలను జాబితాలోకి నమోదు చేయడానికి JSON డేటాను ఎంటర్ చేయండి.
            </p>

            {bulkStatus && (
              <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '6px', fontSize: '13px', marginBottom: '14px', fontWeight: 600 }}>
                {bulkStatus}
              </div>
            )}

            <form onSubmit={handleBulkSubmit}>
              <textarea
                rows="8"
                required
                placeholder='[{"voterIdNumber": "XBC1893999", "fullName": "Anil Kumar", "relativeName": "Rao", "age": 32, "gender": "MALE", "houseNumber": "9-5-185", "wardVoterSerialNo": "1042", "assemblyPartSerialCode": "116 - 34 - 460"}]'
                value={bulkJson}
                onChange={(e) => setBulkJson(e.target.value)}
                className="form-input"
                style={{ fontFamily: 'monospace', fontSize: '12px' }}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button type="button" onClick={() => setShowBulkModal(false)} className="btn btn-secondary">
                  రద్దు (Cancel)
                </button>
                <button type="submit" className="btn btn-primary">
                  నమోదు చేయండి (Process Enrollment)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
