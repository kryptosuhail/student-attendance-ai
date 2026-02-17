import mongoose from "mongoose";

const timetableSchema = new mongoose.Schema(
  {
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true
    },
    staffId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  default: null
},
    subject: {
      type: String,
      required: true
    },
    day: {
      type: String,
      enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      required: true
    },
    period: {
      type: Number,
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Timetable", timetableSchema);
