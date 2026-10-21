import React, { useState } from 'react';
import { X, Save, AlertCircle, Upload, CheckCircle2, Image as ImageIcon, Loader2, Languages, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { transliterateToTelugu } from '../utils/translator';

export const VoterFormModal = ({ voter, onClose, onSuccess, token }) => {
  const { token: authContextToken } = useAuth();
  const activeToken = token || authContextToken || localStorage.getItem('election_token');
  const isEditing = !!voter;

  const [formData, setFormData] = useState({
    voterIdNumber: voter?.voterIdNumber || '',
    wardVoterSerialNo: voter?.wardVoterSerialNo || '',
    assemblyPartSerialCode: voter?.assemblyPartSerialCode || '116 - 34 - 452',
    fullName: voter?.fullName || '',
    fullNameLocal: voter?.fullNameLocal || '',
    relationType: voter?.relationType || 'FATHER',
    relativeName: voter?.relativeName || '',
    relativeNameLocal: voter?.relativeNameLocal || '',
    age: voter?.age || '',
    gender: voter?.gender || 'MALE',
    houseNumber: voter?.houseNumber || '',
    photoUrl: voter?.photoUrl || '',
    contactNumber: voter?.contactNumber || '',
    status: voter?.status || 'ACTIVE',
    pollingStationName: voter?.electionLocation?.pollingStationName || 'M.P.P. Elementary School',
    wardNo: voter?.electionLocation?.wardNo || 'Ward 5',
    partOrBoothNo: voter?.electionLocation?.partOrBoothNo || '34',
    constituencyNo: voter?.electionLocation?.constituencyNo || '116',
  });

  const [error, setError] = useState('');
  const [photoError, setPhotoError] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [photoPreview, setPhotoPreview] = useState(voter?.photoUrl || '');
  const [translatingName, setTranslatingName] = useState(false);
  const [translatingRelative, setTranslatingRelative] = useState(false);

  // Auto-translate English name to Telugu
  const handleTranslateFullName = async () => {
    if (!formData.fullName) return;
    setTranslatingName(true);
    try {
      const telugu = await transliterateToTelugu(formData.fullName);
      if (telugu) {
        setFormData((prev) => ({ ...prev, fullNameLocal: telugu }));
      }
    } catch (err) {
      console.warn('Translate error:', err);
    } finally {
      setTranslatingName(false);
    }
  };

  // Auto-translate Relative name to Telugu
  const handleTranslateRelativeName = async () => {
    if (!formData.relativeName) return;
    setTranslatingRelative(true);
    try {
      const telugu = await transliterateToTelugu(formData.relativeName);
      if (telugu) {
        setFormData((prev) => ({ ...prev, relativeNameLocal: telugu }));
      }
    } catch (err) {
      console.warn('Translate error:', err);
    } finally {
      setTranslatingRelative(false);
    }
  };

  // Translate all English fields to Telugu
  const handleTranslateAll = async () => {
    handleTranslateFullName();
    handleTranslateRelativeName();
  };

  // Handle direct image file upload to Cloudinary
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPhotoError('');

    if (!file.type.startsWith('image/')) {
      setPhotoError('⚠️ Invalid file format. Please upload a JPG, JPEG, or PNG image.');
      e.target.value = '';
      return;
    }

    // Check file size (e.g., maximum 5MB)
    const MAX_SIZE_BYTES = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE_BYTES) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      setPhotoError(`⚠️ File is too large (${sizeMb} MB). Maximum allowed photo size is 5.0 MB. Please select a smaller photo.`);
      setUploadStatus('');
      e.target.value = '';
      return;
    }

    console.log(`🖼️ [Client] Selected photo: "${file.name}" (${(file.size / 1024).toFixed(1)} KB)`);

    // Immediate local preview so user sees their photo right away
    const localPreviewUrl = URL.createObjectURL(file);
    setPhotoPreview(localPreviewUrl);
    setUploadingPhoto(true);
    setUploadStatus('Uploading directly to Cloudinary...');
    setError('');

    try {
      console.log('🔑 [Client] Requesting Cloudinary upload signature...');
      const signRes = await fetch('/api/voters/cloudinary-sign', {
        headers: { Authorization: `Bearer ${activeToken}` },
      });
      const signData = await signRes.json();

      if (!signRes.ok || !signData.success) {
        throw new Error(signData.message || 'Could not get Cloudinary signature');
      }

      const { signature, timestamp, apiKey, cloudName, folder } = signData;
      console.log(`🚀 [Client] Uploading direct to https://api.cloudinary.com/v1_1/${cloudName}/image/upload...`);

      // 2. Direct browser upload with FormData
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('api_key', apiKey);
      uploadFormData.append('timestamp', timestamp);
      uploadFormData.append('signature', signature);
      uploadFormData.append('folder', folder);

      const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: uploadFormData,
      });

      const cloudData = await cloudRes.json();
      console.log('📥 [Client] Cloudinary response:', cloudData);

      if (!cloudRes.ok || cloudData.error) {
        throw new Error(cloudData.error?.message || 'Direct Cloudinary upload failed');
      }

      console.log(`✅ [Client] Cloudinary secure link: ${cloudData.secure_url}`);
      setFormData((prev) => ({ ...prev, photoUrl: cloudData.secure_url }));
      setPhotoPreview(cloudData.secure_url);
      setUploadStatus('Uploaded to Cloudinary ✅');
    } catch (err) {
      console.warn('⚠️ Direct upload failed, attempting server relay fallback...', err.message);
      
      // Fallback: Base64 upload via server
      try {
        const reader = new FileReader();
        reader.onload = async () => {
          try {
            const fallbackRes = await fetch('/api/voters/upload-photo', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${activeToken}`,
              },
              body: JSON.stringify({ image: reader.result }),
            });
            const fallbackData = await fallbackRes.json();
            if (!fallbackRes.ok || !fallbackData.success) {
              throw new Error(fallbackData.message || err.message);
            }
            setFormData((prev) => ({ ...prev, photoUrl: fallbackData.url }));
            setPhotoPreview(fallbackData.url);
            setUploadStatus('Uploaded to Cloudinary ✅');
          } catch (fallbackErr) {
            setError(`Photo Upload Failed: ${fallbackErr.message}`);
            setUploadStatus('');
          } finally {
            setUploadingPhoto(false);
          }
        };
        reader.readAsDataURL(file);
        return;
      } catch (innerErr) {
        setError(`Photo Upload Failed: ${err.message}`);
        setUploadStatus('');
      }
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        voterIdNumber: formData.voterIdNumber.trim().toUpperCase(),
        wardVoterSerialNo: formData.wardVoterSerialNo.trim(),
        assemblyPartSerialCode: formData.assemblyPartSerialCode.trim(),
        fullName: formData.fullName.trim(),
        fullNameLocal: formData.fullNameLocal.trim(),
        relationType: formData.relationType,
        relativeName: formData.relativeName.trim(),
        relativeNameLocal: formData.relativeNameLocal.trim(),
        age: Number(formData.age),
        gender: formData.gender,
        houseNumber: formData.houseNumber.trim(),
        photoUrl: formData.photoUrl.trim(),
        contactNumber: formData.contactNumber.trim(),
        status: formData.status,
        electionLocation: {
          constituencyNo: formData.constituencyNo,
          partOrBoothNo: formData.partOrBoothNo,
          wardNo: formData.wardNo,
          pollingStationName: formData.pollingStationName,
        },
      };

      const url = isEditing ? `/api/voters/${voter._id}` : '/api/voters';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${activeToken}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Operation failed');
      }

      onSuccess(data.voter);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-body">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#ff9933' }}>
              Election Commission of India • భారత ఎన్నికల సంఘం
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0a1e3f', marginTop: '2px' }}>
              {isEditing ? 'Form 8: Correction of Particulars (ఫారం 8: వివరాల సవరణ)' : 'Form 6: New Voter Enrollment (ఫారం 6: కొత్త ఓటరు నమోదు)'}
            </h3>
            <p style={{ fontSize: '12.5px', color: '#64748b', marginTop: '2px' }}>
              Official Electoral Roll Entry Portal (English default with automated Telugu translation)
            </p>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ padding: '6px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Translation Assistant Bar */}
        <div style={{
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          padding: '8px 12px',
          borderRadius: '6px',
          fontSize: '12px',
          color: '#166534',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={14} color="#15803d" />
            <span>Type name in English (Default) then click <strong>⚡ Translate</strong> to auto-generate Telugu.</span>
          </div>
          <button
            type="button"
            onClick={handleTranslateAll}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '11px', padding: '3px 8px', background: '#ffffff', borderColor: '#86efac', color: '#15803d' }}
          >
            Translate All Names to Telugu 🌐
          </button>
        </div>

        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '10px 14px',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="form-grid-responsive">
          {/* EPIC / Voter ID */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '5px' }}>
              Voter ID / EPIC Card No. * (ఓటరు ఐడి)
            </label>
            <input
              type="text"
              name="voterIdNumber"
              required
              placeholder="e.g. XBC1893429"
              value={formData.voterIdNumber}
              onChange={handleChange}
              className="form-input"
              style={{ textTransform: 'uppercase', fontFamily: 'monospace', fontWeight: 600 }}
            />
          </div>

          {/* Ward Serial Number */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '5px' }}>
              Ward Voter Serial No. * (వార్డు ఓ.జా.వ.నం)
            </label>
            <input
              type="text"
              name="wardVoterSerialNo"
              required
              placeholder="e.g. 1037"
              value={formData.wardVoterSerialNo}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          {/* Assembly Part Code */}
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '5px' }}>
              Assembly Part Serial Code * (అ.ఓ.జా.వ.నం)
            </label>
            <input
              type="text"
              name="assemblyPartSerialCode"
              required
              placeholder="e.g. 116 - 34 - 452 (Constituency - Booth - Serial)"
              value={formData.assemblyPartSerialCode}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          {/* Voter Name in English */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '5px' }}>
              Voter Full Name (English) *
            </label>
            <input
              type="text"
              name="fullName"
              required
              placeholder="e.g. Ramesh Jonnalagadda"
              value={formData.fullName}
              onChange={handleChange}
              onBlur={() => { if (!formData.fullNameLocal) handleTranslateFullName(); }}
              className="form-input"
            />
          </div>

          {/* Voter Name in Telugu with Instant Translate Button */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700 }}>
                Voter Name in Telugu (ఓటరు పేరు)
              </label>
              <button
                type="button"
                onClick={handleTranslateFullName}
                disabled={translatingName || !formData.fullName}
                className="btn btn-secondary btn-sm"
                style={{ padding: '2px 8px', fontSize: '11px', color: '#1a56db', borderColor: '#bfdbfe' }}
                title="Translate English name to Telugu"
              >
                <Sparkles size={11} /> {translatingName ? 'Translating...' : '⚡ Translate'}
              </button>
            </div>
            <input
              type="text"
              name="fullNameLocal"
              placeholder="e.g. రమేష్ జొన్నలగడ్డ"
              value={formData.fullNameLocal}
              onChange={handleChange}
              className="form-input telugu-text"
            />
          </div>

          {/* Relation Type */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '5px' }}>
              Relation Type * (సంబంధము)
            </label>
            <select name="relationType" value={formData.relationType} onChange={handleChange} className="form-select">
              <option value="FATHER">Father (తండ్రి)</option>
              <option value="HUSBAND">Husband (భర్త)</option>
              <option value="MOTHER">Mother (తల్లి)</option>
              <option value="GUARDIAN">Guardian (సంరక్షకుడు)</option>
            </select>
          </div>

          {/* Relative Name in English */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '5px' }}>
              Relative's Name (English) *
            </label>
            <input
              type="text"
              name="relativeName"
              required
              placeholder="e.g. Janikiramaiah Jonnalagadda"
              value={formData.relativeName}
              onChange={handleChange}
              onBlur={() => { if (!formData.relativeNameLocal) handleTranslateRelativeName(); }}
              className="form-input"
            />
          </div>

          {/* Relative Name in Telugu with Instant Translate Button */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700 }}>
                Relative's Name in Telugu (బంధువు పేరు)
              </label>
              <button
                type="button"
                onClick={handleTranslateRelativeName}
                disabled={translatingRelative || !formData.relativeName}
                className="btn btn-secondary btn-sm"
                style={{ padding: '2px 8px', fontSize: '11px', color: '#1a56db', borderColor: '#bfdbfe' }}
                title="Translate English relative name to Telugu"
              >
                <Sparkles size={11} /> {translatingRelative ? 'Translating...' : '⚡ Translate'}
              </button>
            </div>
            <input
              type="text"
              name="relativeNameLocal"
              placeholder="e.g. జానికిరామయ్య జొన్నలగడ్డ"
              value={formData.relativeNameLocal}
              onChange={handleChange}
              className="form-input telugu-text"
            />
          </div>

          {/* Door / House Number */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '5px' }}>
              House / Door Number * (ఇంటి సంఖ్య)
            </label>
            <input
              type="text"
              name="houseNumber"
              required
              placeholder="e.g. 9-5-173"
              value={formData.houseNumber}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          {/* Age & Gender */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '5px' }}>
              Age (వయస్సు) *
            </label>
            <input
              type="number"
              name="age"
              min="18"
              max="120"
              required
              placeholder="e.g. 52"
              value={formData.age}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '5px' }}>
              Gender (లింగము) *
            </label>
            <select name="gender" value={formData.gender} onChange={handleChange} className="form-select">
              <option value="MALE">Male (పురుషుడు - పు)</option>
              <option value="FEMALE">Female (స్త్రీ)</option>
              <option value="OTHER">Other (ఇతర)</option>
            </select>
          </div>

          {/* Polling Station Name */}
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '5px' }}>
              Polling Station Name & Location (పోలింగ్ కేంద్రం)
            </label>
            <input
              type="text"
              name="pollingStationName"
              placeholder="e.g. M.P.P. Elementary School, Room No. 2"
              value={formData.pollingStationName}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          {/* Cloudinary Voter Photo Upload */}
          <div style={{
            gridColumn: 'span 2',
            background: photoError ? '#fff5f5' : '#f8fafc',
            border: photoError ? '1.5px dashed #ef4444' : '1.5px dashed #cbd5e1',
            borderRadius: '10px',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            flexWrap: 'wrap',
            transition: 'all 0.2s ease'
          }}>
            {/* Photo Preview Thumbnail */}
            <div style={{
              width: '90px',
              height: '110px',
              border: '2px solid #0f172a',
              borderRadius: '6px',
              overflow: 'hidden',
              background: '#e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              {photoPreview ? (
                <img src={photoPreview} alt="Voter" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '11px' }}>
                  <ImageIcon size={24} style={{ margin: '0 auto 4px' }} />
                  No Photo
                </div>
              )}
            </div>

            {/* Upload Controls */}
            <div style={{ flex: 1, minWidth: '220px' }}>
              <div style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a', marginBottom: '3px' }}>
                Voter Passport Photo (Upload to Cloudinary)
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>
                Select an image file from your device. It will be automatically uploaded to Cloudinary and converted to a permanent link.
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', background: 'white' }}>
                  <Upload size={14} />
                  {uploadingPhoto ? 'Uploading to Cloudinary...' : 'Choose Photo File'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    disabled={uploadingPhoto}
                    style={{ display: 'none' }}
                  />
                </label>

                <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                  (Max size: <strong>5 MB</strong> • JPG, PNG)
                </span>

                {uploadStatus && (
                  <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: 600 }}>
                    {uploadStatus}
                  </span>
                )}
              </div>

              {/* Dedicated In-Place Error Alert for Large Size */}
              {photoError && (
                <div style={{
                  marginTop: '10px',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#b91c1c',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <AlertCircle size={15} color="#dc2626" style={{ flexShrink: 0 }} />
                  <span>{photoError}</span>
                </div>
              )}

              {/* Generated Cloudinary Link */}
              {formData.photoUrl && (
                <div style={{ marginTop: '8px', fontSize: '11.5px', color: '#475569' }}>
                  Cloudinary Link:{' '}
                  <a href={formData.photoUrl} target="_blank" rel="noreferrer" style={{ color: '#2563eb', wordBreak: 'break-all' }}>
                    {formData.photoUrl}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Status */}
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '5px' }}>
              Voter Status
            </label>
            <select name="status" value={formData.status} onChange={handleChange} className="form-select">
              <option value="ACTIVE">ACTIVE (నమోదిత)</option>
              <option value="TRANSFERRED">TRANSFERRED (బదిలీ)</option>
              <option value="DECEASED">DECEASED (మరణించిన)</option>
              <option value="FLAGGED">FLAGGED (సమీక్షలో)</option>
            </select>
          </div>

          {/* Submit Buttons */}
          <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px', flexWrap: 'wrap' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" style={{ minWidth: '100px' }}>
              Cancel
            </button>
            <button type="submit" disabled={loading || uploadingPhoto} className="btn btn-primary" style={{ minWidth: '150px' }}>
              <Save size={16} />
              {uploadingPhoto ? 'Uploading to Cloudinary...' : loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Register Voter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
