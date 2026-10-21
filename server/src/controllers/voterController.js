import { Voter } from '../models/Voter.js';
import { recordAuditLog } from '../middleware/auditLogger.js';
import { getCloudinary } from '../config/cloudinary.js';

// @desc    Get All Voters with Multi-faceted Filtering & Instant Search
// @route   GET /api/voters
// @access  Private (SUPER_ADMIN, ADMIN, VIEWER)
export const getVoters = async (req, res) => {
  try {
    const {
      search,
      gender,
      status,
      constituencyNo,
      partOrBoothNo,
      wardNo,
      houseNumber,
      minAge,
      maxAge,
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {};

    // Text search or regex match
    if (search && search.trim() !== '') {
      const cleanSearch = search.trim();
      const regex = new RegExp(cleanSearch, 'i');
      filter.$or = [
        { voterIdNumber: regex },
        { fullName: regex },
        { fullNameLocal: regex },
        { relativeName: regex },
        { relativeNameLocal: regex },
        { houseNumber: regex },
        { wardVoterSerialNo: regex },
        { assemblyPartSerialCode: regex },
      ];
    }

    if (gender && gender !== 'ALL') {
      filter.gender = gender;
    }

    if (status && status !== 'ALL') {
      filter.status = status;
    }

    if (constituencyNo && constituencyNo !== 'ALL') {
      filter['electionLocation.constituencyNo'] = constituencyNo;
    }

    if (partOrBoothNo && partOrBoothNo !== 'ALL') {
      filter['electionLocation.partOrBoothNo'] = partOrBoothNo;
    }

    if (wardNo && wardNo !== 'ALL') {
      filter['electionLocation.wardNo'] = wardNo;
    }

    if (houseNumber && houseNumber.trim() !== '') {
      filter.houseNumber = new RegExp(houseNumber.trim(), 'i');
    }

    if (minAge || maxAge) {
      filter.age = {};
      if (minAge) filter.age.$gte = Number(minAge);
      if (maxAge) filter.age.$lte = Number(maxAge);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const totalCount = await Voter.countDocuments(filter);

    const voters = await Voter.find(filter)
      .sort({ 'electionLocation.boothSerialNo': 1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('createdBy', 'fullName role')
      .populate('updatedBy', 'fullName role');

    // Optional lightweight log if user searched
    if (search && search.length > 2) {
      await recordAuditLog({
        req,
        actionType: 'VOTER_SEARCH',
        targetEntity: 'VOTER',
        details: `Voter search performed for query: "${search}" (Returned ${totalCount} results)`,
      });
    }

    res.json({
      success: true,
      totalCount,
      page: Number(page),
      totalPages: Math.ceil(totalCount / Number(limit)),
      voters,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get Single Voter by ID
// @route   GET /api/voters/:id
// @access  Private (SUPER_ADMIN, ADMIN, VIEWER)
export const getVoterById = async (req, res) => {
  try {
    const voter = await Voter.findById(req.params.id)
      .populate('createdBy', 'fullName role email')
      .populate('updatedBy', 'fullName role email');

    if (!voter) {
      return res.status(404).json({ success: false, message: 'Voter record not found' });
    }

    res.json({ success: true, voter });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Add New Voter (Single)
// @route   POST /api/voters
// @access  Private (SUPER_ADMIN, ADMIN)
export const createVoter = async (req, res) => {
  try {
    const {
      voterIdNumber,
      wardVoterSerialNo,
      assemblyPartSerialCode,
      fullName,
      fullNameLocal,
      relationType,
      relativeName,
      relativeNameLocal,
      age,
      gender,
      houseNumber,
      photoUrl,
      contactNumber,
      electionLocation,
      status,
    } = req.body;

    // Check for duplicate Voter ID
    const existing = await Voter.findOne({ voterIdNumber: voterIdNumber.trim().toUpperCase() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Voter with ID '${voterIdNumber.toUpperCase()}' is already registered.`,
      });
    }

    const voter = await Voter.create({
      voterIdNumber: voterIdNumber.trim().toUpperCase(),
      wardVoterSerialNo: wardVoterSerialNo?.trim() || '1',
      assemblyPartSerialCode: assemblyPartSerialCode?.trim() || '116 - 34 - 1',
      fullName: fullName.trim(),
      fullNameLocal: fullNameLocal?.trim() || '',
      relationType: relationType || 'FATHER',
      relativeName: relativeName.trim(),
      relativeNameLocal: relativeNameLocal?.trim() || '',
      age: Number(age),
      gender,
      houseNumber: houseNumber.trim(),
      photoUrl: photoUrl || '',
      contactNumber: contactNumber?.trim() || '',
      electionLocation: {
        ...(electionLocation || {}),
        wardNo: electionLocation?.wardNo || '24',
      },
      status: status || 'ACTIVE',
      createdBy: req.user._id,
    });

    // Capture Audit Log with full snapshot
    await recordAuditLog({
      req,
      actionType: 'VOTER_ADD',
      targetEntity: 'VOTER',
      targetId: voter._id,
      details: `${req.user.role} (${req.user.fullName}) enrolled voter: ${voter.fullName} [${voter.voterIdNumber}]`,
      changesDiff: {
        newVoter: {
          voterIdNumber: voter.voterIdNumber,
          fullName: voter.fullName,
          age: voter.age,
          gender: voter.gender,
          houseNumber: voter.houseNumber,
          assemblyPartSerialCode: voter.assemblyPartSerialCode,
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Voter enrolled successfully',
      voter,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update Voter Details
// @route   PUT /api/voters/:id
// @access  Private (SUPER_ADMIN, ADMIN)
export const updateVoter = async (req, res) => {
  try {
    const voter = await Voter.findById(req.params.id);
    if (!voter) {
      return res.status(404).json({ success: false, message: 'Voter not found' });
    }

    // Preserve previous snapshot for diff logging
    const previousSnapshot = voter.toObject();

    // Check if voter ID is being modified and conflict exists
    if (req.body.voterIdNumber && req.body.voterIdNumber.toUpperCase() !== voter.voterIdNumber) {
      const conflict = await Voter.findOne({ voterIdNumber: req.body.voterIdNumber.toUpperCase() });
      if (conflict) {
        return res.status(400).json({
          success: false,
          message: `Voter ID '${req.body.voterIdNumber.toUpperCase()}' is already in use by another voter.`,
        });
      }
      voter.voterIdNumber = req.body.voterIdNumber.trim().toUpperCase();
    }

    if (req.body.fullName) voter.fullName = req.body.fullName.trim();
    if (req.body.fullNameLocal !== undefined) voter.fullNameLocal = req.body.fullNameLocal.trim();
    if (req.body.wardVoterSerialNo) voter.wardVoterSerialNo = req.body.wardVoterSerialNo.trim();
    if (req.body.assemblyPartSerialCode) voter.assemblyPartSerialCode = req.body.assemblyPartSerialCode.trim();
    if (req.body.relationType) voter.relationType = req.body.relationType;
    if (req.body.relativeName) voter.relativeName = req.body.relativeName.trim();
    if (req.body.relativeNameLocal !== undefined) voter.relativeNameLocal = req.body.relativeNameLocal.trim();
    if (req.body.age !== undefined) voter.age = Number(req.body.age);
    if (req.body.gender) voter.gender = req.body.gender;
    if (req.body.houseNumber) voter.houseNumber = req.body.houseNumber.trim();
    if (req.body.photoUrl !== undefined) voter.photoUrl = req.body.photoUrl;
    if (req.body.contactNumber !== undefined) voter.contactNumber = req.body.contactNumber.trim();
    if (req.body.status) voter.status = req.body.status;
    if (req.body.electionLocation) {
      voter.electionLocation = { ...voter.electionLocation.toObject(), ...req.body.electionLocation };
    }

    voter.updatedBy = req.user._id;
    await voter.save();

    // Calculate changed fields for diff auditing
    const changesDiff = {
      before: {},
      after: {},
    };

    const keysToTrack = [
      'voterIdNumber',
      'fullName',
      'fullNameLocal',
      'relativeName',
      'age',
      'gender',
      'houseNumber',
      'status',
      'wardVoterSerialNo',
      'assemblyPartSerialCode',
    ];

    keysToTrack.forEach((key) => {
      if (previousSnapshot[key] !== voter[key]) {
        changesDiff.before[key] = previousSnapshot[key];
        changesDiff.after[key] = voter[key];
      }
    });

    // Record audit log with exact before/after difference
    await recordAuditLog({
      req,
      actionType: 'VOTER_UPDATE',
      targetEntity: 'VOTER',
      targetId: voter._id,
      details: `${req.user.role} (${req.user.fullName}) updated voter ${voter.fullName} [${voter.voterIdNumber}]`,
      changesDiff,
    });

    res.json({
      success: true,
      message: 'Voter details updated successfully',
      voter,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete Voter (Super Admin Only)
// @route   DELETE /api/voters/:id
// @access  Private (SUPER_ADMIN only)
export const deleteVoter = async (req, res) => {
  try {
    const voter = await Voter.findById(req.params.id);
    if (!voter) {
      return res.status(404).json({ success: false, message: 'Voter not found' });
    }

    await Voter.findByIdAndDelete(req.params.id);

    await recordAuditLog({
      req,
      actionType: 'VOTER_DELETE',
      targetEntity: 'VOTER',
      targetId: req.params.id,
      details: `Super Admin permanently deleted voter: ${voter.fullName} [${voter.voterIdNumber}]`,
      changesDiff: { deletedVoter: voter },
    });

    res.json({ success: true, message: 'Voter record removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Bulk Import Voters (JSON / CSV payload)
// @route   POST /api/voters/bulk-import
// @access  Private (SUPER_ADMIN, ADMIN)
export const bulkImportVoters = async (req, res) => {
  try {
    const { voters } = req.body;
    if (!Array.isArray(voters) || voters.length === 0) {
      return res.status(400).json({ success: false, message: 'Array of voter records is required' });
    }

    let insertedCount = 0;
    let skippedCount = 0;
    const errors = [];

    for (const v of voters) {
      try {
        const id = v.voterIdNumber?.trim().toUpperCase();
        if (!id || !v.fullName) {
          skippedCount++;
          continue;
        }

        const exists = await Voter.findOne({ voterIdNumber: id });
        if (exists) {
          skippedCount++;
          continue;
        }

        const loc = v.electionLocation || {};
        if (!loc.wardNo) loc.wardNo = '24';

        await Voter.create({
          ...v,
          voterIdNumber: id,
          electionLocation: loc,
          createdBy: req.user._id,
        });
        insertedCount++;
      } catch (e) {
        skippedCount++;
        errors.push(e.message);
      }
    }

    await recordAuditLog({
      req,
      actionType: 'VOTER_ADD',
      targetEntity: 'VOTER',
      details: `Bulk import executed by ${req.user.fullName}: Inserted ${insertedCount} voters, skipped ${skippedCount}`,
    });

    res.json({
      success: true,
      message: `Bulk import completed. Inserted: ${insertedCount}, Skipped: ${skippedCount}`,
      insertedCount,
      skippedCount,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Upload Voter Photo to Cloudinary
// @route   POST /api/voters/upload-photo
// @access  Private (SUPER_ADMIN, ADMIN)
export const uploadVoterPhoto = async (req, res) => {
  try {
    const { image } = req.body;

    console.log('\n======================================================');
    console.log(`📸 [Photo Upload] Initiated by: ${req.user.fullName} (${req.user.role})`);
    console.log(`🌐 [Photo Upload] Actor IP: ${req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1'}`);

    if (!image) {
      console.warn('⚠️ [Photo Upload] Failed: No image payload provided in request body');
      console.log('======================================================\n');
      return res.status(400).json({ success: false, message: 'Please provide base64 image data' });
    }

    const payloadKb = (image.length / 1024).toFixed(1);
    console.log(`📦 [Photo Upload] Base64 payload size: ${payloadKb} KB`);

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
    const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
    const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

    console.log(`☁️ [Cloudinary] Using Cloud Name: "${cloudName}" | API Key: "${apiKey?.substring(0, 6)}***"`);

    if (!cloudName || !apiKey || !apiSecret || cloudName === 'your_cloud_name') {
      console.error('❌ [Cloudinary Error] Incomplete credentials in server/.env');
      console.log('======================================================\n');
      return res.status(500).json({
        success: false,
        message: 'Cloudinary credentials missing in server/.env (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET)',
      });
    }

    const cloud = getCloudinary();
    console.log(`⏳ [Cloudinary] Uploading to "election_portal_voters" folder...`);

    const result = await cloud.uploader.upload(image, {
      folder: 'election_portal_voters',
      resource_type: 'auto',
      transformation: [
        { width: 500, height: 600, crop: 'limit' },
      ],
    });

    console.log(`✅ [Cloudinary] Success! Public ID: ${result.public_id}`);
    console.log(`🔗 [Cloudinary] Permanent URL: ${result.secure_url}`);
    console.log('======================================================\n');

    res.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (err) {
    console.error(`❌ [Cloudinary Upload Error]: ${err.message || err}`);
    if (err.http_code) console.error(`   HTTP Status Code: ${err.http_code}`);
    console.log('======================================================\n');
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to upload image to Cloudinary',
    });
  }
};

// @desc    Generate Signed Parameters for Direct Browser-to-Cloudinary Upload
// @route   GET /api/voters/cloudinary-sign
// @access  Private (SUPER_ADMIN, ADMIN)
export const getCloudinarySignature = async (req, res) => {
  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
    const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
    const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

    if (!cloudName || !apiKey || !apiSecret || cloudName === 'your_cloud_name') {
      return res.status(500).json({
        success: false,
        message: 'Cloudinary credentials missing in server/.env',
      });
    }

    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = 'election_portal_voters';
    const cloud = getCloudinary();

    const signature = cloud.utils.api_sign_request(
      {
        folder,
        timestamp,
      },
      apiSecret
    );

    console.log(`🔑 [Cloudinary Auth] Generated direct upload signature for ${req.user.fullName} (${cloudName})`);

    res.json({
      success: true,
      signature,
      timestamp,
      apiKey,
      cloudName,
      folder,
    });
  } catch (err) {
    console.error('❌ Cloudinary Signature Error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

