import User from "../models/User.js";
import bcrypt from "bcryptjs";

// ─────────────────────────────────────────
// @route   POST /api/auth/register
// @desc    Register user + save to MongoDB
// ─────────────────────────────────────────
export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check duplicate email
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user with default starter notes
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      notes: [
        {
          title: "Bring Grocery",
          description: "Bring grocery from the supermarket: milk, apples, strawberry.",
          importance: "Important",
        },
        {
          title: "Swimming",
          description: "Remember to pack swimming gear and check pool timings.",
          importance: "Low",
        },
        {
          title: "Examination",
          description: "Prepare all necessary documents and stationery for the exam.",
          importance: "Very Important",
        },
      ],
    });

    // Return user without password
    const { password: _, ...userData } = user.toObject();
    res.status(201).json({ message: "User registered successfully", user: userData });

  } catch (error) {
    console.error("registerUser error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─────────────────────────────────────────
// @route   GET /api/auth/:id
// @desc    Get user profile
// ─────────────────────────────────────────
export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    console.error("getUser error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─────────────────────────────────────────
// @route   GET /api/auth/:id/notes
// @desc    Get all notes for a user
// ─────────────────────────────────────────
export const getNotes = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("notes username email");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ notes: user.notes, username: user.username, email: user.email });
  } catch (error) {
    console.error("getNotes error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─────────────────────────────────────────
// @route   POST /api/auth/:id/notes
// @desc    Add a new note
// ─────────────────────────────────────────
export const addNote = async (req, res) => {
  try {
    const { title, description, importance } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.notes.unshift({ title, description, importance }); // add to front
    await user.save();

    res.status(201).json({ message: "Note added", note: user.notes[0] });
  } catch (error) {
    console.error("addNote error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─────────────────────────────────────────
// @route   PUT /api/auth/:id/notes/:noteId
// @desc    Update a note
// ─────────────────────────────────────────
export const updateNote = async (req, res) => {
  try {
    const { title, description, importance } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const note = user.notes.id(req.params.noteId);
    if (!note) return res.status(404).json({ message: "Note not found" });

    note.title       = title       ?? note.title;
    note.description = description ?? note.description;
    note.importance  = importance  ?? note.importance;

    await user.save();
    res.status(200).json({ message: "Note updated", note });
  } catch (error) {
    console.error("updateNote error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─────────────────────────────────────────
// @route   DELETE /api/auth/:id/notes/:noteId
// @desc    Delete a note
// ─────────────────────────────────────────
export const deleteNote = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const note = user.notes.id(req.params.noteId);
    if (!note) return res.status(404).json({ message: "Note not found" });

    note.deleteOne();
    await user.save();

    res.status(200).json({ message: "Note deleted" });
  } catch (error) {
    console.error("deleteNote error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};