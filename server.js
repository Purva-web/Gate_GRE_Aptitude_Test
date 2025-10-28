const express = require('express');
const bodyParser = require('body-parser');
const { Low, JSONFile } = require('lowdb');
const path = require('path');

const app = express();
const PORT = 5000;

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
app.use(express.static(__dirname)); // Serve static files

// Register route
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  await db.read();

  if (db.data.users.find(u => u.username === username)) {
    return res.json({ message: "Account already exists." });
  }

  db.data.users.push({ username, password });
  // Reassign sequential IDs
  db.data.users.forEach((u, index) => u.id = index + 1);

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

// Add new user (admin)
app.post('/users', async (req, res) => {
  const { username, password } = req.body;
  await db.read();

  if (db.data.users.find(u => u.username === username)) {
    return res.json({ message: "User already exists." });
  }

  db.data.users.push({ username, password });
  db.data.users.forEach((u, index) => u.id = index + 1);

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
  db.data.users.forEach((u, index) => u.id = index + 1);
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

// Serve index.html
app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
const fs = require('fs');
const path = require('path');

app.get('/questions', (req, res) => {
  const { exam, category } = req.query;
  const questionsDB = JSON.parse(fs.readFileSync(path.join(__dirname, 'questions.json')));
  let questions = questionsDB.questions;

  if (exam) questions = questions.filter(q => q.exam === exam);
  if (category) questions = questions.filter(q => q.category === category);

  res.json(questions);
});
const questionsFile = path.join(__dirname, 'questions.json');

// Ensure file exists
if(!fs.existsSync(questionsFile)) fs.writeFileSync(questionsFile, JSON.stringify({questions: []}, null, 2));

app.post('/add-question', (req, res) => {
  const { exam, category, question, options, answer } = req.body;
  if(!exam || !category || !question || !options || !answer) {
    return res.status(400).json({message: "All fields are required"});
  }

  const db = JSON.parse(fs.readFileSync(questionsFile));
  const id = db.questions.length ? db.questions[db.questions.length - 1].id + 1 : 1;

  db.questions.push({ id, exam, category, question, options, answer });
  fs.writeFileSync(questionsFile, JSON.stringify(db, null, 2));
  res.json({message: "Question added successfully!"});
});

// Read questions by exam and category
app.get('/questions/:exam/:category', async (req, res) => {
  const { exam, category } = req.params;
  await db.read();
  const questions = db.data.questions?.[exam]?.[category] || [];
  res.json(questions);
});

// Add new question
app.post('/questions/add', async (req, res) => {
  const { exam, category, question, options, answer } = req.body;
  await db.read();
  if (!db.data.questions[exam]) db.data.questions[exam] = {};
  if (!db.data.questions[exam][category]) db.data.questions[exam][category] = [];
  const list = db.data.questions[exam][category];
  const newQuestion = {
    id: list.length + 1,
    question,
    options,
    answer
  };
  list.push(newQuestion);
  await db.write();
  res.json({ message: "Question added!", question: newQuestion });
});

// Delete question
app.delete('/questions/:exam/:category/:id', async (req, res) => {
  const { exam, category, id } = req.params;
  await db.read();
  if (!db.data.questions[exam] || !db.data.questions[exam][category]) {
    return res.status(404).json({ message: "Category not found." });
  }
  db.data.questions[exam][category] = db.data.questions[exam][category].filter(q => q.id != id);
  await db.write();
  res.json({ message: "Question deleted." });
});
