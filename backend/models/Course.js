import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  university: { type: String, required: true, index: true },
  country: { type: String, required: true, index: true },
  degree: { type: String, required: true },
  field: { type: String, required: true },
  duration: { type: String, required: true },
  tuitionPerYear: { type: String, required: true },
  requirements: [{ type: String }],
  curriculumHighlights: [{ type: String }],
  website: { type: String, required: true },
  lastVerified: { type: String, default: () => new Date().toISOString() }
}, {
  timestamps: true
});

export const Course = mongoose.models.Course || mongoose.model('Course', courseSchema);
