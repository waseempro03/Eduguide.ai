import mongoose from 'mongoose';

const placementSchema = new mongoose.Schema({
  university: { type: String, required: true, index: true },
  country: { type: String, required: true, index: true },
  program: { type: String, required: true },
  degree: { type: String, required: true },
  year: { type: Number, required: true },
  averageSalary: { type: String, required: true },
  highestSalary: { type: String, required: true },
  medianSalary: { type: String },
  placementRate: { type: String, required: true },
  topRecruiters: [{ type: String }],
  industryBreakdown: { type: Map, of: String },
  source: { type: String, required: true },
  lastVerified: { type: String, default: () => new Date().toISOString() }
}, {
  timestamps: true
});

export const Placement = mongoose.models.Placement || mongoose.model('Placement', placementSchema);
