import express from 'express';
import { createUser, validateCredentials, listUsers, getUserByUsername, defaultAdminUsername, defaultAdminPassword } from '../data/userDatabase.js';
import crypto from 'crypto';

const authRouter = express.Router();

// In-memory session store: token -> username
const sessions = new Map();

function createToken(user) {
  const token = crypto.randomUUID();
  sessions.set(token, { username: user.username, role: user.role });
  return token;
}

function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return res.status(401).json({ message: 'Authorization required' });

  const token = header.split(' ')[1];
  const session = sessions.get(token);
  if (!session) return res.status(401).json({ message: 'Invalid or expired token' });

  req.user = session;
  req.token = token;
  next();
}

function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Authorization required' });
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
}

// Register a new normal user
authRouter.post('/register', (req, res) => {
  const { name, username, password } = req.body;

  if (!name || !username || !password) {
    return res.status(400).json({ message: 'Name, username, and password are required' });
  }

  if (username === defaultAdminUsername) {
    return res.status(403).json({ message: 'Cannot register admin username' });
  }

  try {
    const newUser = createUser({ name, username, password });
    return res.status(201).json({ message: 'User registered successfully', user: { name: newUser.name, username: newUser.username, role: newUser.role } });
  } catch (error) {
    return res.status(409).json({ message: error.message });
  }
});

// Login route
authRouter.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  const user = validateCredentials(username, password);
  if (!user) {
    return res.status(401).json({ message: 'Invalid username/password' });
  }

  const token = createToken(user);
  res.json({ token, user: { username: user.username, name: user.name, role: user.role } });
});

// Get logged-in user info
authRouter.get('/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

// Admin-only endpoint to view user list
authRouter.get('/users', authenticate, authorize('admin'), (req, res) => {
  res.json({ users: listUsers() });
});

// Admin default credentials info (read-only, for demonstration)
authRouter.get('/admin-default-credentials', (req, res) => {
  res.json({ username: defaultAdminUsername, password: defaultAdminPassword, note: 'Admin credentials are fixed at server startup and cannot be changed via API.' });
});

export { authRouter, authenticate, authorize };
