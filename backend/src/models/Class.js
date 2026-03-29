import mongoose from "mongoose";

const classSchema = new mongoose.Schema(
  {
    department: {
      type: String,
      required: true
    },
    year: {
      type: Number,
      required: true
    },
    section: {
      type: String,
      required: true
    },
    inchargeStaff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("Class", classSchema);
