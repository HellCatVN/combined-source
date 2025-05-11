import { Schema } from 'mongoose';

export const versionTrackingSchema = new Schema({
  currentVersion: {
    type: String,
    required: true
  },
  lastUpdated: {
    type: Date,
    required: true,
    default: Date.now
  },
  isUpdateInProgress: {
    type: Boolean,
    required: true,
    default: false
  },
  sourceId: {
    type: String,
    required: true,
    unique: true
  }
}, {
  timestamps: true,
  collection: 'versionTracking'
});