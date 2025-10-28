const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const { Low, JSONFile } = require('lowdb');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Setup LowDB
const file = path.join(__dirname, 'db.json');
const adapter = new JSONFile(file);
const db = new Low(adapter);

async function initDB() {
  await db.read();
  db.data ||= { users: [] };
  await db.write();
}
initDB();

app.use(bodyParser.json());
app.use(express.static(__dirname)); // Serve static files (HTML, CSS, JS)

// ==================== USER MANAGEMENT ====================

// Register route
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  await db.read();

  if (db.data.users.find(u => u.username === username)) {
    return res.json({ message: "Account already exists." });
  }

  db.data.users.push({ username, password });
  db.data.users.forEach((u, index) => (u.id = index + 1));

  await db.write();
  res.json({ message: "Registration successful!" });
});

// Login route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  await db.read();
  const user = db.data.users.find(u => u.username === username && u.password === password);
  if (user) return res.json({ message: "Login successful!" });
  res.json({ message: "Invalid username or password." });
});

// Admin add user
app.post('/users', async (req, res) => {
  const { username, password } = req.body;
  await db.read();

  if (db.data.users.find(u => u.username === username)) {
    return res.json({ message: "User already exists." });
  }

  db.data.users.push({ username, password });
  db.data.users.forEach((u, index) => (u.id = index + 1));

  await db.write();
  res.json({ message: "User added.", users: db.data.users });
});

// Get all users
app.get('/users', async (req, res) => {
  await db.read();
  res.json(db.data.users);
});

// Delete user
app.delete('/users/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  await db.read();
  db.data.users = db.data.users.filter(u => u.id !== id);
  db.data.users.forEach((u, index) => (u.id = index + 1));
  await db.write();
  res.json({ message: "User deleted.", users: db.data.users });
});

// Update user
app.put('/users/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { username, password } = req.body;
  await db.read();
  const user = db.data.users.find(u => u.id === id);
  if (!user) return res.status(404).json({ message: "User not found." });
  user.username = username;
  user.password = password;
  await db.write();
  res.json({ message: "User updated." });
});

// ==================== QUESTION MANAGEMENT ====================

const questionsFile = path.join(__dirname, 'questions.json');
if (!fs.existsSync(questionsFile))
  fs.writeFileSync(questionsFile, JSON.stringify({ questions: [] }, null, 2));

// Get all questions (filtered)
app.get('/questions', (req, res) => {
  const { exam, category } = req.query;
  const questionsDB = JSON.parse(fs.readFileSync(questionsFile));
  let questions = questionsDB.questions;

  if (exam) questions = questions.filter(q => q.exam === exam);
  if (category) questions = questions.filter(q => q.category === category);

  res.json(questions);
});

// Add question
app.post('/add-question', (req, res) => {
  const { exam, category, question, options, answer } = req.body;
  if (!exam || !category || !question || !options || !answer) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const data = JSON.parse(fs.readFileSync(questionsFile));
  const id = data.questions.length ? data.questions[data.questions.length - 1].id + 1 : 1;

  data.questions.push({ id, exam, category, question, options, answer });
  fs.writeFileSync(questionsFile, JSON.stringify(data, null, 2));
  res.json({ message: "Question added successfully!" });
});

// Delete question
app.delete('/questions/:exam/:category/:id', (req, res) => {
  const { exam, category, id } = req.params;
  const data = JSON.parse(fs.readFileSync(questionsFile));
  data.questions = data.questions.filter(q => !(q.exam === exam && q.category === category && q.id == id));
  fs.writeFileSync(questionsFile, JSON.stringify(data, null, 2));
  res.json({ message: "Question deleted." });
});

// ==================== ROUTING ====================

// Home route → index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ==================== SERVER START ====================

app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
