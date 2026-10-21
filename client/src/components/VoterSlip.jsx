import React from 'react';
import { Printer, X } from 'lucide-react';
import { maskVoterId } from '../utils/translator';

export const VoterSlip = ({ voter, onClose, maskId = false }) => {
  if (!voter) return null;

  const handlePrint = () => {
    window.print();
  };

  const getGenderTelugu = (gender) => {
    if (gender === 'MALE') return 'పు (పురుషుడు)';
    if (gender === 'FEMALE') return 'స్త్రీ';
    return 'ఇతర';
  };

  const getRelationLabelTelugu = (type) => {
    switch (type) {
      case 'HUSBAND':
        return 'భర్త పేరు';
      case 'MOTHER':
        return 'తల్లి పేరు';
      case 'GUARDIAN':
        return 'సంరక్షకుని పేరు';
      default:
        return 'తండ్రి పేరు';
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-body" style={{ maxWidth: '580px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0a1e3f' }}>Voter Information Slip</h3>
            <p style={{ fontSize: '12px', color: '#64748b' }}>Voter Details • ఓటరు సమాచార పత్రం</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handlePrint} className="btn btn-primary btn-sm">
              <Printer size={15} />
              Print Slip / ప్రింట్
            </button>
            <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ padding: '6px' }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div className="printable-area">
          <div className="electoral-slip-card">
            {/* Header with Serial and Assembly Numbers */}
            <div className="slip-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>Ward Serial / వరుస నం:</span>
                <span className="slip-box-num">{voter.wardVoterSerialNo || '1'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>Ward / వార్డు సంఖ్య: </span>
                <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#1a56db' }}>
                  {voter.electionLocation?.wardNo || '24'}
                </span>
              </div>
            </div>

            {/* Content Details & Photo */}
            <div className="slip-content-grid">
              <div className="slip-details">
                {/* Voter Name */}
                <div className="slip-field-row">
                  <span className="slip-label">Voter Name / పేరు :</span>
                  <span className="slip-value">
                    <span style={{ fontSize: '14px', fontWeight: 800 }}>{voter.fullName}</span>
                    {voter.fullNameLocal && (
                      <span className="telugu-text" style={{ fontSize: '12.5px', display: 'block', color: '#1e3a8a', fontWeight: 600 }}>
                        {voter.fullNameLocal}
                      </span>
                    )}
                  </span>
                </div>

                {/* Relative Name */}
                <div className="slip-field-row">
                  <span className="slip-label">Relative / బంధువు :</span>
                  <span className="slip-value">
                    <span>{voter.relativeName}</span>
                    {voter.relativeNameLocal && (
                      <span className="telugu-text" style={{ fontSize: '12px', display: 'block', color: '#475569' }}>
                        {voter.relativeNameLocal} ({getRelationLabelTelugu(voter.relationType)})
                      </span>
                    )}
                  </span>
                </div>

                {/* Age & Gender */}
                <div className="slip-field-row" style={{ alignItems: 'center' }}>
                  <span className="slip-label">Age / వయస్సు :</span>
                  <span className="slip-value" style={{ maxWidth: '65px' }}>{voter.age} Yrs</span>
                  <span style={{ fontWeight: 600, width: '95px' }}>Gender / లింగం:</span>
                  <span className="slip-value">{voter.gender === 'MALE' ? 'Male (పు)' : voter.gender === 'FEMALE' ? 'Female (స్త్రీ)' : 'Other'}</span>
                </div>

                {/* House Number */}
                <div className="slip-field-row">
                  <span className="slip-label">House No. / సంఖ్య:</span>
                  <span className="slip-value"><strong>{voter.houseNumber}</strong></span>
                </div>

                <div className="slip-field-row" style={{ marginTop: '4px', fontSize: '11px', color: '#222' }}>
                  <span style={{ fontWeight: 600, width: '130px' }}>Ward / వార్డు:</span>
                  <span style={{ flex: 1, fontWeight: 700 }}>వార్డు {voter.electionLocation?.wardNo || '24'}</span>
                </div>
              </div>

              {/* Photo Box */}
              <div className="slip-photo-box">
                {voter.photoUrl ? (
                  <img src={voter.photoUrl} alt={voter.fullName} />
                ) : (
                  <div style={{ textAlign: 'center', color: '#64748b', fontSize: '11px', padding: '6px' }}>
                    PHOTO<br />ఫోటో
                  </div>
                )}
              </div>
            </div>

            {/* Footer with EPIC / Voter ID Card Number */}
            <div className="slip-footer">
              <span>EPIC / Voter ID (ఓటరు ఐడి కార్డు నెం.) :</span>
              <span style={{ letterSpacing: '0.05em', fontFamily: 'monospace' }}>
                {maskId ? maskVoterId(voter.voterIdNumber) : voter.voterIdNumber}
              </span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '16px', background: '#f8fafc', padding: '12px', borderRadius: '8px', fontSize: '12px', color: '#64748b' }}>
          💡 <strong>Note:</strong> Voter details displayed with Telugu translation for convenient reference.
        </div>
      </div>
    </div>
  );
};
