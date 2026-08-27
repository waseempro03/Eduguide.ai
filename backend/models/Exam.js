import mongoose from 'mongoose';

const examSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  fullName: { type: String, required: true },
  purpose: { type: String, required: true },
  countries: [{ type: String }],
  eligibility: { type: String, required: true },
  sections: [{
    name: { type: String },
    description: { type: String },
    scoreRange: { type: String }
  }],
  totalScore: { type: String, required: true },
  duration: { type: String, required: true },
  fee: { type: String, required: true },
  officialWebsite: { type: String, required: true },
  preparationTips: [{ type: String }],
  lastVerified: { type: String, default: () => new Date().toISOString() }
}, {
  timestamps: true
});

export const Exam = mongoose.models.Exam || mongoose.model('Exam', examSchema);
