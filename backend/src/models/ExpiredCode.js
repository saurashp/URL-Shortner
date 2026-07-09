import mongoose from 'mongoose';

const expiredCodeSchema = new mongoose.Schema({
  shortCode: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: { expires: 30 * 24 * 60 * 60 } // Automatically deleted after 30 days (2,592,000 seconds)
  }
});

const ExpiredCode = mongoose.model('ExpiredCode', expiredCodeSchema);

export default ExpiredCode;
