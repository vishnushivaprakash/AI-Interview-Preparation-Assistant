import mongoose from 'mongoose';

const InterviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  role: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  strengths: [String],
  weaknesses: [String],
}, { timestamps: true });

const Interview = mongoose.model('Interview', InterviewSchema);

export default Interview;
