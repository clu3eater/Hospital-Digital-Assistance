import mongoose, { Schema, Document } from "mongoose";
// Ensure referenced models are registered before population
import "@/lib/models/Hospital";
import "@/lib/models/Doctor";
import "@/lib/models/Patient";

export interface IAppointment extends Document {
  patientId: mongoose.Types.ObjectId;
  hospitalId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  appointmentDate: Date;
  appointmentTime: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  reason: string;
  notes?: string;
  visitType: "in_person" | "telehealth";
  meetingUrl?: string;
  preVisitQuestions?: Array<{
    question: string;
    answer?: string;
  }>;
  postVisitNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    hospitalId: {
      type: Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    appointmentDate: {
      type: Date,
      required: [true, "Appointment date is required"],
    },
    appointmentTime: {
      type: String,
      required: [true, "Appointment time is required"],
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
    reason: {
      type: String,
      required: [true, "Reason for appointment is required"],
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    visitType: {
      type: String,
      enum: ["in_person", "telehealth"],
      default: "in_person",
    },
    meetingUrl: {
      type: String,
      trim: true,
    },
    preVisitQuestions: [
      {
        question: {
          type: String,
          required: true,
          trim: true,
        },
        answer: {
          type: String,
          trim: true,
        },
      },
    ],
    postVisitNotes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Appointment = mongoose.models.Appointment || mongoose.model<IAppointment>("Appointment", AppointmentSchema);

export default Appointment;
