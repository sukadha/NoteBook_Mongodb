import { useState, useEffect } from "react";
import "./Note.css";

// ── Base API URL — must match your Express route mount ──
const API_URL = "http://localhost:5000/api/auth"; // ✅ FIXED (was /api/users)

// ════════════════════════════
// API HELPER FUNCTIONS
// ════════════════════════════

const apiRegister = async ({ username, email, password }) => {
  const res = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Registration failed");
  return data.user;
};

const apiFetchNotes = async (userId) => {
  const res = await fetch(`${API_URL}/${userId}/notes`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch notes");
  return data.notes;
};

const apiAddNote = async (userId, note) => {
  const res = await fetch(`${API_URL}/${userId}/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(note),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to add note");
  return data.note;
};

const apiUpdateNote = async (userId, noteId, note) => {
  const res = await fetch(`${API_URL}/${userId}/notes/${noteId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(note),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to update note");
  return data.note;
};

const apiDeleteNote = async (userId, noteId) => {
  const res = await fetch(`${API_URL}/${userId}/notes/${noteId}`, {
    method: "DELETE",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to delete note");
  return data;
};

// ════════════════════════════
// SPLASH SCREEN
// ════════════════════════════
function SplashScreen({ onStart }) {
  return (
    <div className="screen splash-screen">
      <div className="splash-blob-wrapper">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>
      <div className="splash-content">
        <h1 className="splash-title">Refine Your Life Management</h1>
        <p className="splash-subtitle">
          A minimalist Notes app which helps you manage your time and be
          productive. The monochrome design avoids it from being distracting.
        </p>
        <button className="btn-primary" onClick={onStart}>Let's Start</button>
        <div className="dots">
          <span className="dot active" />
          <span className="dot" />
          <span className="dot" />
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════
// CREATE PROFILE SCREEN
// ════════════════════════════
function CreateProfileScreen({ onContinue }) {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleContinue = async () => {
    if (!form.username.trim() || !form.email.trim() || !form.password.trim()) {
      setError("All fields are required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const user = await apiRegister(form);
      onContinue(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="screen profile-screen">
      <h2 className="screen-title">Create Profile</h2>

      <div className="avatar-wrapper">
        <div className="avatar-circle">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
          </svg>
        </div>
      </div>

      <div className="form-group">
        <label>Username</label>
        <div className="input-row">
          <span className="input-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
          </span>
          <input
            placeholder="Enter your username"
            value={form.username}
            onChange={e => setForm({ ...form, username: e.target.value })}
          />
        </div>
      </div>

      <div className="form-group">
        <label>Email or Phone Number</label>
        <div className="input-row">
          <span className="input-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M2 7l10 7 10-7" />
            </svg>
          </span>
          <input
            placeholder="Enter your email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
          />
        </div>
      </div>

      <div className="form-group">
        <label>Password</label>
        <div className="input-row">
          <span className="input-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="5" y="11" width="14" height="10" rx="2" />
              <path d="M8 11V7a4 4 0 018 0v4" />
            </svg>
          </span>
          <input
            type="password"
            placeholder="Enter password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
          />
        </div>
      </div>

      {error && (
        <p style={{ color: "#e03e3e", fontSize: "12px", textAlign: "center", marginTop: "-8px" }}>
          {error}
        </p>
      )}

      <button className="btn-primary" onClick={handleContinue} disabled={loading}>
        {loading ? "Creating Profile…" : "Continue"}
      </button>
    </div>
  );
}

// ════════════════════════════
// PROFILE MODAL
// ════════════════════════════
function ProfileModal({ user, onClose }) {
  const initials = user.username
    .split(" ")
    .map(w => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-avatar">
          <span>{initials}</span>
        </div>
        <h3 className="modal-name">{user.username}</h3>
        <div className="modal-info-row">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14">
            <rect x="2" y="4" width="20" height="16" rx="2" /><path d="M2 7l10 7 10-7" />
          </svg>
          <span>{user.email}</span>
        </div>
        <div className="modal-divider" />
        <p className="modal-note-count">Your notebook is active ✦</p>
      </div>
    </div>
  );
}

// ════════════════════════════
// SHARE MODAL
// ════════════════════════════
function ShareModal({ notes, user, onClose }) {
  const [copied, setCopied] = useState(false);

  const buildShareLink = () => {
    const noteText = notes
      .map((n, i) => `${i + 1}. [${n.importance}] ${n.title}: ${n.description}`)
      .join(" | ");
    const payload = `📓 ${user.username}'s Notebook | ${user.email} | Notes: ${noteText}`;
    const encoded = encodeURIComponent(payload);
    return `${window.location.origin}?notebook=${encoded}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(buildShareLink()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box share-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="share-icon-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="26" height="26">
            <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
        </div>
        <h3 className="modal-name">Share Notebook</h3>
        <p className="share-subtitle">
          Share all <strong>{notes.length} notes</strong> from <strong>{user.username}</strong>'s notebook
        </p>

        <div className="share-link-box">
          <span className="share-link-text">{buildShareLink().slice(0, 42)}…</span>
          <button className={`copy-btn ${copied ? "copied" : ""}`} onClick={handleCopy}>
            {copied ? (
              <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><polyline points="20 6 9 17 4 12" /></svg> Copied!</>
            ) : (
              <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="13" height="13"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg> Copy Link</>
            )}
          </button>
        </div>

        <div className="share-notes-preview">
          {notes.slice(0, 4).map(n => (
            <div key={n._id || n.id} className="share-note-item">
              <span className={`dot-importance ${n.importance === "Very Important" ? "red" : n.importance === "Important" ? "yellow" : "green"}`} />
              <span>{n.title}</span>
            </div>
          ))}
          {notes.length > 4 && <p className="share-more">+{notes.length - 4} more notes included</p>}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════
// NOTES LIST SCREEN
// ════════════════════════════
function NotesListScreen({ notes, onEdit, onAdd, onDelete, user }) {
  const [search, setSearch] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [showShare, setShowShare] = useState(false);

  const filtered = notes.filter(n =>
    n.title.toLowerCase().includes(search.toLowerCase())
  );

  const firstName = user.username.split(" ")[0];

  return (
    <div className="screen notes-screen">
      {showProfile && <ProfileModal user={user} onClose={() => setShowProfile(false)} />}
      {showShare && <ShareModal notes={notes} user={user} onClose={() => setShowShare(false)} />}

      <div className="notes-header">
        <div>
          <p className="hello-text">Hello {firstName} –</p>
          <h2 className="notes-title">Your Notes –</h2>
        </div>
        <div className="header-icons">
          <button className="icon-btn" onClick={() => setShowShare(true)} title="Share notebook">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
          </button>
          <button className="icon-btn avatar-btn" onClick={() => setShowProfile(true)} title="View profile">
            <span className="avatar-initials">
              {user.username.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)}
            </span>
          </button>
        </div>
      </div>

      <div className="search-row">
        <div className="search-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            placeholder="Search Notes"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button className="add-btn" onClick={onAdd}>+</button>
      </div>

      <div className="notes-grid">
        {filtered.map(note => (
          <div
            key={note._id || note.id}
            className="note-card"
            onClick={() => onEdit(note)}
          >
            <div className="note-card-header">
              <h4>{note.title}</h4>
              <span className={`dot-importance ${note.importance === "Very Important" ? "red" : note.importance === "Important" ? "yellow" : "green"}`} />
            </div>
            <p>{note.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════
// EDIT NOTE SCREEN
// ════════════════════════════
function EditNoteScreen({ note, onBack, onSave, onDelete }) {
  const [form, setForm] = useState({ ...note });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setLoading(true);
    setError("");
    try {
      await onSave(form);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this note?")) return;
    setLoading(true);
    try {
      await onDelete(note._id || note.id);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="screen edit-screen">
      <h2 className="screen-title edit-screen-title">Edit –</h2>

      <div className="edit-field">
        <span className="edit-label">Header:</span>
        <input
          className="edit-input"
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
        />
      </div>

      <div className="edit-field column">
        <span className="edit-label">Description:</span>
        <textarea
          className="edit-textarea"
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
        />
      </div>

      <div className="edit-field">
        <span className="edit-label">Importance :</span>
        <select
          className={`importance-select ${form.importance === "Very Important" ? "red" : form.importance === "Important" ? "yellow" : "green"}`}
          value={form.importance}
          onChange={e => setForm({ ...form, importance: e.target.value })}
        >
          <option>Low</option>
          <option>Important</option>
          <option>Very Important</option>
        </select>
      </div>

      {error && (
        <p style={{ color: "#e03e3e", fontSize: "12px", textAlign: "center" }}>{error}</p>
      )}

      <div className="edit-actions">
        <button
          className="btn-outline"
          onClick={handleDelete}
          disabled={loading}
          style={{ borderColor: "#e03e3e", color: "#e03e3e" }}
        >
          Delete
        </button>
        <button className="btn-outline" onClick={onBack} disabled={loading}>
          Cancel
        </button>
        <button className="btn-primary" onClick={handleSave} disabled={loading}>
          {loading ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════
// APP ROOT
// ════════════════════════════
export default function Note() {
  const [screen, setScreen] = useState("splash");
  const [notes, setNotes] = useState([]);
  const [activeNote, setActiveNote] = useState(null);
  const [user, setUser] = useState(null);

  const handleProfileContinue = async (mongoUser) => {
    setUser(mongoUser);
    setNotes(mongoUser.notes || []);
    setScreen("notes");
  };

  const handleEditNote = (note) => {
    setActiveNote(note);
    setScreen("edit");
  };

  const handleAddNote = async () => {
    const newNote = { title: "New Note", description: "", importance: "Low" };
    try {
      const saved = await apiAddNote(user._id, newNote);
      setNotes(prev => [saved, ...prev]);
      setActiveNote(saved);
      setScreen("edit");
    } catch (err) {
      console.error("Add note failed:", err.message);
    }
  };

  const handleSaveNote = async (updated) => {
    const noteId = updated._id || updated.id;
    const saved = await apiUpdateNote(user._id, noteId, updated);
    setNotes(prev =>
      prev.map(n => (n._id === noteId || n.id === noteId) ? { ...n, ...saved } : n)
    );
    setScreen("notes");
  };

  const handleDeleteNote = async (noteId) => {
    await apiDeleteNote(user._id, noteId);
    setNotes(prev => prev.filter(n => n._id !== noteId && n.id !== noteId));
    setScreen("notes");
  };

  return (
    <div className="app-wrapper">
      <div className="phone-frame">
        {screen === "splash" && (
          <SplashScreen onStart={() => setScreen("profile")} />
        )}
        {screen === "profile" && (
          <CreateProfileScreen onContinue={handleProfileContinue} />
        )}
        {screen === "notes" && user && (
          <NotesListScreen
            notes={notes}
            user={user}
            onEdit={handleEditNote}
            onAdd={handleAddNote}
            onDelete={handleDeleteNote}
          />
        )}
        {screen === "edit" && activeNote && user && (
          <EditNoteScreen
            note={activeNote}
            onBack={() => setScreen("notes")}
            onSave={handleSaveNote}
            onDelete={handleDeleteNote}
          />
        )}
      </div>
    </div>
  );
}