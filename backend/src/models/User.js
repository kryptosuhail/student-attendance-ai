import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ["student", "staff", "management"],
      required: true
    },

    // ✅ Separate identifiers
    realName: {
      type: String,
      default: ""
    },
    registerNo: {
      type: String,
      default: ""
    },
    
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      default: null
    }
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
