import mongoose from 'mongoose';

const voterSchema = new mongoose.Schema(
  {
    // Electoral Photo Identity Card (EPIC) / Voter ID (e.g. XBC1893429)
    voterIdNumber: {
      type: String,
      required: [true, 'Voter ID / EPIC Number is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    // Ward Serial Number: వార్డు ఓ. జా. వ. నం. (e.g. 1037)
    wardVoterSerialNo: {
      type: String,
      required: [true, 'Ward voter serial number is required'],
      trim: true,
      index: true,
    },
    // Assembly Part Serial Code: అ. ఓ. జా. వ. నం. (e.g. 116 - 34 - 452)
    assemblyPartSerialCode: {
      type: String,
      required: [true, 'Assembly part serial code is required'],
      trim: true,
      index: true,
    },
    // Voter Name in English (e.g. Ramesh Jonnalagadda)
    fullName: {
      type: String,
      required: [true, 'Voter full name is required'],
      trim: true,
      index: true,
    },
    // Voter Name in Telugu / Local Script (e.g. రమేష్ జొన్నలగడ్డ)
    fullNameLocal: {
      type: String,
      trim: true,
      default: '',
    },
    // Relation: FATHER / HUSBAND / MOTHER / GUARDIAN (తండ్రి / భర్త / తల్లి)
    relationType: {
      type: String,
      enum: ['FATHER', 'HUSBAND', 'MOTHER', 'GUARDIAN'],
      default: 'FATHER',
    },
    // Relative's Name in English (e.g. Janikiramaiah Jonnalagadda)
    relativeName: {
      type: String,
      required: [true, "Father or Husband's name is required"],
      trim: true,
    },
    // Relative's Name in Telugu / Local Script (e.g. జానికిరామయ్య జొన్నలగడ్డ)
    relativeNameLocal: {
      type: String,
      trim: true,
      default: '',
    },
    // Age in Years: వయస్సు (e.g. 52)
    age: {
      type: Number,
      required: [true, 'Age is required'],
      min: [18, 'Voter must be at least 18 years old'],
      max: [130, 'Invalid age'],
      index: true,
    },
    // Gender: లింగము (MALE = పు, FEMALE = స్త్రీ, OTHER = ఇతర)
    gender: {
      type: String,
      enum: ['MALE', 'FEMALE', 'OTHER'],
      required: true,
      index: true,
    },
    // House / Door Number: ఇంటి సంఖ్య (e.g. 9-5-173) - Crucial for household grouping
    houseNumber: {
      type: String,
      required: [true, 'House/Door number is required'],
      trim: true,
      index: true,
    },
    // Photo URL or Base64 avatar
    photoUrl: {
      type: String,
      default: '',
    },
    // Contact / Phone Number
    contactNumber: {
      type: String,
      trim: true,
      default: '',
    },
    // Extended Election Demographics
    electionLocation: {
      state: { type: String, default: 'Andhra Pradesh' },
      district: { type: String, default: 'Guntur' },
      constituencyNo: { type: String, default: '116', index: true },
      constituencyName: { type: String, default: 'Guntur West' },
      partOrBoothNo: { type: String, default: '34', index: true },
      boothSerialNo: { type: String, default: '452' },
      pollingStationName: { type: String, default: 'M.P.P. Elementary School, Room No. 2' },
      wardNo: { type: String, default: 'Ward 5', index: true },
    },
    // Voter Status
    status: {
      type: String,
      enum: ['ACTIVE', 'DECEASED', 'TRANSFERRED', 'FLAGGED'],
      default: 'ACTIVE',
      index: true,
    },
    // Auditing References
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound text index for fuzzy search across name, local name, EPIC number, and house number
voterSchema.index({
  fullName: 'text',
  fullNameLocal: 'text',
  voterIdNumber: 'text',
  houseNumber: 'text',
  relativeName: 'text',
});

export const Voter = mongoose.model('Voter', voterSchema);
