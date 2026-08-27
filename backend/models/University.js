import mongoose from 'mongoose';

const universitySchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  country: { type: String, required: true, index: true },
  city: { type: String, required: true },
  website: { type: String, required: true },
  description: { type: String, required: true },
  courses: [{ type: String }],
  tuition: {
    undergraduate: { type: String },
    postgraduate: { type: String }
  },
  admissionRequirements: [{ type: String }],
  ranking: {
    qsWorld: { type: Number },
    timesHigherEd: { type: Number },
    national: { type: Number }
  },
  acceptanceRate: { type: String },
  lastVerified: { type: String, default: () => new Date().toISOString() },
  source: { type: String, required: true }
}, {
  timestamps: true
});

export const University = mongoose.models.University || mongoose.model('University', universitySchema);
