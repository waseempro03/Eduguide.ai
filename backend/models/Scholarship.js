import mongoose from 'mongoose';

const scholarshipSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  country: { type: String, required: true, index: true },
  university: { type: String, default: 'Multiple Universities' },
  degree: [{ type: String, index: true }], // Undergraduate, Masters, PhD, Postdoc
  fields: [{ type: String, index: true }], // Computer Science, Engineering, Business, All Fields
  nationalityEligibility: [{ type: String }], // International, Developing Countries, India, etc.
  eligibility: {
    minCGPA: { type: Number, default: 0 },
    languageRequirement: { type: String },
    workExperienceYears: { type: Number, default: 0 },
    ageLimit: { type: String }
  },
  funding: { type: String, required: true }, // Fully Funded, Partial, Tuition Waiver
  amount: { type: String, required: true },
  deadline: { type: String, required: true },
  applicationUrl: { type: String, required: true },
  officialWebsite: { type: String, required: true },
  description: { type: String, required: true },
  lastVerified: { type: String, default: () => new Date().toISOString() },
  source: { type: String, required: true }
}, {
  timestamps: true
});

export const Scholarship = mongoose.models.Scholarship || mongoose.model('Scholarship', scholarshipSchema);
