import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { VoterSlip } from '../components/VoterSlip';
import { maskVoterId } from '../utils/translator';
import {
  Search,
  Filter,
  Eye,
  Printer,
  Users,
  Home,
  RefreshCw,
  Building,
  CheckCircle,
  PhoneCall,
  MapPin,
  Calendar,
  User
} from 'lucide-react';

export const ViewerView = () => {
  const { token, user } = useAuth();
  const [voters, setVoters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedGender, setSelectedGender] = useState('ALL');
  const [selectedWard, setSelectedWard] = useState('ALL');
  const [selectedAgeBracket, setSelectedAgeBracket] = useState('ALL');
  const [houseFilter, setHouseFilter] = useState('');
  const [selectedSlipVoter, setSelectedSlipVoter] = useState(null);
  const [displayMode, setDisplayMode] = useState(() => {
    return typeof window !== 'undefined' && window.innerWidth <= 768 ? 'cards' : 'table';
  });

  const fetchVoters = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.append('search', search);
      if (selectedGender !== 'ALL') query.append('gender', selectedGender);
      if (selectedWard !== 'ALL') query.append('wardNo', selectedWard);
      if (houseFilter) query.append('houseNumber', houseFilter);

      if (selectedAgeBracket === '18-25') {
        query.append('minAge', '18');
        query.append('maxAge', '25');
      } else if (selectedAgeBracket === '26-40') {
        query.append('minAge', '26');
        query.append('maxAge', '40');
      } else if (selectedAgeBracket === '41-60') {
        query.append('minAge', '41');
        query.append('maxAge', '60');
      } else if (selectedAgeBracket === '60+') {
        query.append('minAge', '61');
      }

      query.append('limit', '50');

      const res = await fetch(`/api/voters?${query.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setVoters(data.voters);
        setTotalCount(data.totalCount || data.voters.length);
      }
    } catch (err) {
      console.error('Failed to query voters:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVoters();
  }, [selectedGender, selectedWard, selectedAgeBracket, houseFilter]);

  const handleHouseClick = (doorNo) => {
    setHouseFilter(doorNo);
  };

  const handleClearFilters = () => {
    setSearch('');
    setSelectedGender('ALL');
    setSelectedWard('ALL');
    setSelectedAgeBracket('ALL');
    setHouseFilter('');
    fetchVoters();
  };

  return (
    <div className="main-content">
      {/* Citizen Hero Search Banner (English Default First, Telugu Secondary) */}
      <div className="hero-search-card">
        <div style={{ maxWidth: '820px', position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#38bdf8', marginBottom: '4px' }}>
            Ward Voter Search Portal • వార్డు ఓటర్ల శోధన పోర్టల్
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: '1.25' }}>
            Ward Voter Search Portal
          </h1>
          <div className="telugu-text" style={{ fontSize: '15px', color: '#fef08a', marginTop: '4px', fontWeight: 600 }}>
            వార్డు ఓటర్ల జాబితాలో వివరాలు వెతకండి మరియు ఓటరు స్లిప్ డౌన్‌లోడ్ చేసుకోండి
          </div>
          <p style={{ fontSize: '13px', color: '#cbd5e1', marginTop: '6px', marginBottom: '20px' }}>
            Search by EPIC Number, Voter Name, or House Number. Download your Voter Information Slip.
          </p>

          {/* Prominent Citizen Search Bar */}
          <div className="hero-search-input-group" style={{
            display: 'flex',
            background: 'white',
            borderRadius: '8px',
            padding: '4px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
          }}>
            <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
              <Search size={18} color="#94a3b8" style={{ marginLeft: '12px' }} />
              <input
                type="text"
                placeholder="Enter EPIC No. (e.g. XBC1893429), Name, or House No... (ఓటరు ఐడి / పేరు)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchVoters()}
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  padding: '12px 14px',
                  fontSize: '14px',
                  color: '#0f172a'
                }}
              />
            </div>
            <button
              onClick={fetchVoters}
              className="btn btn-primary"
              style={{ padding: '12px 24px', fontSize: '14px', borderRadius: '6px' }}
            >
              Search Roll / శోధించండి
            </button>
          </div>
        </div>
      </div>

      {/* Household / Filter Active Notification */}
      {houseFilter && (
        <div style={{
          background: '#eff6ff',
          border: '1.5px solid #bfdbfe',
          padding: '12px 18px',
          borderRadius: '8px',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e40af', fontWeight: 600 }}>
            <Home size={18} />
            <span>Family Voters in House No: <strong>{houseFilter}</strong> (ఈ ఇంటి పరిధిలోని కుటుంబ ఓటర్లు)</span>
          </div>
          <button
            onClick={() => setHouseFilter('')}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '12px', padding: '4px 10px' }}
          >
            Show All Voters (అందరినీ చూపించు) ✕
          </button>
        </div>
      )}

      {/* Citizen Filter Controls */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '22px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', alignItems: 'flex-end' }}>
          {/* Ward Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#475569', marginBottom: '5px' }}>
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
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#475569', marginBottom: '5px' }}>
              GENDER (లింగము)
            </label>
            <select value={selectedGender} onChange={(e) => setSelectedGender(e.target.value)} className="form-select">
              <option value="ALL">All (అందరూ)</option>
              <option value="MALE">Male (పురుషుడు - పు)</option>
              <option value="FEMALE">Female (స్త్రీ)</option>
              <option value="OTHER">Other (ఇతర)</option>
            </select>
          </div>

          {/* Age Bracket */}
          <div>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#475569', marginBottom: '5px' }}>
              AGE GROUP (వయస్సు వర్గం)
            </label>
            <select value={selectedAgeBracket} onChange={(e) => setSelectedAgeBracket(e.target.value)} className="form-select">
              <option value="ALL">All Ages (అన్ని వయస్సుల వారు)</option>
              <option value="18-25">18 - 25 Yrs (Youth / యువ ఓటర్లు)</option>
              <option value="26-40">26 - 40 Yrs</option>
              <option value="41-60">41 - 60 Yrs</option>
              <option value="60+">60+ Yrs (Senior Citizens / సీనియర్ సిటిజన్లు)</option>
            </select>
          </div>

          {/* Reset Filters */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={fetchVoters} className="btn btn-primary" style={{ flex: 1 }}>
              <Filter size={14} /> Apply Filter / ఫిల్టర్
            </button>
            <button onClick={handleClearFilters} className="btn btn-secondary" title="Reset Filters (పునఃప్రారంభించు)">
              <RefreshCw size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Results Header with View Mode Switcher */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <div style={{ fontSize: '16px', fontWeight: 800, color: '#0a1e3f' }}>
            Voter List Entries (ఓటరు జాబితా వివరాలు)
          </div>
          <div style={{ fontSize: '12.5px', color: '#64748b' }}>
            Total Registered Voters: <strong>{totalCount}</strong> (నమోదైన ఓటర్లు)
          </div>
        </div>

        {/* View Switcher (Great for Mobile phones) */}
        <div style={{ display: 'flex', gap: '6px', background: '#e2e8f0', padding: '3px', borderRadius: '6px' }}>
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

      {/* Public Voter Roll Display (Table or Cards) */}
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
                <th>VOTER SLIP (ఓటరు పత్రం)</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                    Retrieving voter entries... (ఓటరు జాబితా పరిశీలిస్తోంది)
                  </td>
                </tr>
              ) : voters.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                    No voter records found matching your query. Please verify search details. (వివరాలు లభించలేదు)
                  </td>
                </tr>
              ) : (
                voters.map((v) => (
                  <tr key={v._id}>
                    {/* EPIC Number */}
                    <td>
                      <div style={{ fontWeight: 800, fontFamily: 'monospace', color: '#1a56db', fontSize: '13.5px' }}>
                        {maskVoterId(v.voterIdNumber)}
                      </div>
                    </td>

                    {/* Voter Name */}
                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{v.fullName}</div>
                      {v.fullNameLocal && (
                        <div className="telugu-text" style={{ fontSize: '12.5px', color: '#475569', fontWeight: 600 }}>
                          {v.fullNameLocal}
                        </div>
                      )}
                    </td>

                    {/* Relative Name */}
                    <td>
                      <div>{v.relativeName}</div>
                      <div className="telugu-text" style={{ fontSize: '11.5px', color: '#64748b' }}>
                        {v.relativeNameLocal || (v.relationType === 'HUSBAND' ? 'భర్త' : 'తండ్రి')}
                      </div>
                    </td>

                    {/* Age & Gender */}
                    <td>
                      {v.age} సం. • {v.gender === 'MALE' ? 'పురుషుడు (పు)' : v.gender === 'FEMALE' ? 'స్త్రీ' : 'ఇతర'}
                    </td>

                    {/* House Number with Family Grouping Click */}
                    <td>
                      <button
                        onClick={() => handleHouseClick(v.houseNumber)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 8px', fontSize: '12px', fontWeight: 700 }}
                        title="ఈ ఇంట్లోని కుటుంబ సభ్యులందరినీ చూడటానికి క్లిక్ చేయండి"
                      >
                        <Home size={12} color="#1a56db" />
                        {v.houseNumber}
                      </button>
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

                    {/* Voter Slip Button */}
                    <td>
                      <button
                        onClick={() => setSelectedSlipVoter(v)}
                        className="btn btn-primary btn-sm"
                        style={{ padding: '6px 12px' }}
                      >
                        <Printer size={13} />
                        ఓటరు పత్రం (Slip)
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* Mobile-Friendly Cards View */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
          {voters.map((v) => (
            <div key={v._id} className="card" style={{ padding: '16px', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>EPIC NO.</div>
                  <div style={{ fontSize: '15px', fontWeight: 800, fontFamily: 'monospace', color: '#1a56db' }}>
                    {maskVoterId(v.voterIdNumber)}
                  </div>
                </div>
                <span className={`badge ${v.gender === 'MALE' ? 'badge-admin' : 'badge-super'}`}>
                  {v.gender === 'MALE' ? 'పు (Male)' : 'స్త్రీ (Female)'} • {v.age} సం.
                </span>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '10px' }}>
                {v.photoUrl && (
                  <div style={{ width: '48px', height: '58px', borderRadius: '4px', overflow: 'hidden', border: '1px solid #cbd5e1', flexShrink: 0 }}>
                    <img src={v.photoUrl} alt={v.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                <div>
                  <div style={{ fontWeight: 800, fontSize: '15px', color: '#0a1e3f' }}>{v.fullName}</div>
                  {v.fullNameLocal && (
                    <div className="telugu-text" style={{ fontSize: '13px', color: '#475569', fontWeight: 600 }}>
                      {v.fullNameLocal}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ fontSize: '12.5px', color: '#475569', marginBottom: '4px' }}>
                {v.relationType === 'HUSBAND' ? 'భర్త పేరు' : 'తండ్రి పేరు'}: <strong>{v.relativeName}</strong>
              </div>

              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>
                ఇంటి సంఖ్య: <button onClick={() => handleHouseClick(v.houseNumber)} style={{ border: 'none', background: '#eff6ff', color: '#1a56db', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', cursor: 'pointer' }}>{v.houseNumber}</button> • వార్డు: {v.electionLocation?.wardNo || '24'}
              </div>

              <button
                onClick={() => setSelectedSlipVoter(v)}
                className="btn btn-primary btn-sm"
                style={{ width: '100%', padding: '8px' }}
              >
                <Printer size={13} /> ఓటరు పత్రం (Print Voter Slip)
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Voter Slip Modal */}
      {selectedSlipVoter && (
        <VoterSlip
          voter={selectedSlipVoter}
          maskId={true}
          onClose={() => setSelectedSlipVoter(null)}
        />
      )}
    </div>
  );
};
