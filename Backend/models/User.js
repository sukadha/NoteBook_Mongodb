import mongoose from "mongoose";

// ── Note sub-schema (embedded inside User)
const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      default: "New Note",
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    importance: {
      type: String,
      enum: ["Low", "Important", "Very Important"],
      default: "Low",
    },
  },
  { timestamps: true }
);

// ── User schema
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    notes: [noteSchema], // ← embedded notes array
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;