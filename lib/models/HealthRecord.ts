import mongoose, { Schema, Document } from "mongoose"
import "@/lib/models/Patient"

export interface IHealthRecord extends Document {
  patientId: mongoose.Types.ObjectId
  recordType: string
  description: string
  hospitalName?: string
  recordDate: Date
  fileUrl?: string
  fileName?: string
  createdAt: Date
  updatedAt: Date
}

const HealthRecordSchema = new Schema<IHealthRecord>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    recordType: {
      type: String,
      required: [true, "Record type is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    hospitalName: {
      type: String,
      trim: true,
    },
    recordDate: {
      type: Date,
      required: [true, "Record date is required"],
    },
    fileUrl: {
      type: String,
      trim: true,
    },
    fileName: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
)

const HealthRecord = mongoose.models.HealthRecord || mongoose.model<IHealthRecord>("HealthRecord", HealthRecordSchema)

export default HealthRecord
