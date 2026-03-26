import express from "express";
import {
  registerUser,
  getUser,
  getNotes,
  addNote,
  updateNote,
  deleteNote,
} from "../controllers/userController.js";

const router = express.Router();

// Auth
router.post("/register", registerUser);

// Profile
router.get("/:id", getUser);

// Notes CRUD
router.get("/:id/notes",            getNotes);
router.post("/:id/notes",           addNote);
router.put("/:id/notes/:noteId",    updateNote);
router.delete("/:id/notes/:noteId", deleteNote);

export default router;