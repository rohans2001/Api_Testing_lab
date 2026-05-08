const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { generateToken, generateRefreshToken } = require('../utils/tokenUtils');
const { sendSuccess, sendError } = require('../utils/responseUtils');

const usersPath = path.join(__dirname, '../data/users.json');
const refreshTokensPath = path.join(__dirname, '../data/refreshTokens.json');
const sessionsPath = path.join(__dirname, '../data/sessions.json');

const getUsers = () => JSON.parse(fs.readFileSync(usersPath, 'utf8'));
const saveUsers = (data) => fs.writeFileSync(usersPath, JSON.stringify(data, null, 2));

const getRefreshTokens = () => JSON.parse(fs.readFileSync(refreshTokensPath, 'utf8'));
const saveRefreshTokens = (data) => fs.writeFileSync(refreshTokensPath, JSON.stringify(data, null, 2));

const getSessions = () => {
  if (!fs.existsSync(sessionsPath)) fs.writeFileSync(sessionsPath, JSON.stringify([]));
  return JSON.parse(fs.readFileSync(sessionsPath, 'utf8'));
};
const saveSessions = (data) => fs.writeFileSync(sessionsPath, JSON.stringify(data, null, 2));

const register = async (req, res) => {
  const { name, password, role } = req.body;
  const email = req.body.email.toLowerCase();

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Read users after the async operation to avoid race conditions
  const users = getUsers();

  if (users.find(u => u.email.toLowerCase() === email)) {
    return sendError(res, 400, 'User already exists');
  }

  const newUser = {
    id: uuidv4(),
    name,
    email,
    password: hashedPassword,
    role: role || 'user',
    status: 'active',
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  saveUsers(users);

  sendSuccess(res, 201, 'User registered successfully', { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role });
};

const login = async (req, res) => {
  const { password } = req.body;
  const email = req.body.email.toLowerCase();
  const users = getUsers();

  const userIndex = users.findIndex(u => u.email.toLowerCase() === email);
  if (userIndex === -1) {
    return sendError(res, 401, 'Invalid credentials');
  }

  const user = users[userIndex];

  if (user.status !== 'active') {
    return sendError(res, 401, 'Account inactive');
  }

  // Check account lock
  if (user.lockUntil && new Date(user.lockUntil) > new Date()) {
    return sendError(res, 403, 'Account is temporarily locked due to multiple failed login attempts');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  
  if (!isMatch) {
    // Increment failed attempts
    user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
    if (user.failedLoginAttempts >= 3) {
      user.lockUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // lock for 15 mins
    }
    saveUsers(users);
    return sendError(res, 401, 'Invalid credentials');
  }

  // Reset lock
  user.failedLoginAttempts = 0;
  user.lockUntil = null;
  saveUsers(users);

  const token = generateToken(user.id, user.role);
  const refreshToken = generateRefreshToken(user.id);

  const tokens = getRefreshTokens();
  tokens.push({ token: refreshToken, userId: user.id });
  saveRefreshTokens(tokens);

  // Record session
  const sessions = getSessions();
  const newSession = {
    id: uuidv4(),
    userId: user.id,
    userAgent: req.headers['user-agent'] || 'unknown',
    ip: req.ip || 'unknown',
    loginTime: new Date().toISOString()
  };
  sessions.push(newSession);
  saveSessions(sessions);

  sendSuccess(res, 200, 'Login successful', {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    token,
    refreshToken,
    sessionId: newSession.id
  });
};

const logout = (req, res) => {
  const { refreshToken } = req.body;
  let tokens = getRefreshTokens();
  
  tokens = tokens.filter(t => t.token !== refreshToken);
  saveRefreshTokens(tokens);

  sendSuccess(res, 200, 'Logged out successfully');
};

const getProfile = (req, res) => {
  const users = getUsers();
  const user = users.find(u => u.id === req.user.id);
  
  if (!user) {
    return sendError(res, 404, 'User not found');
  }

  const { password, ...userWithoutPassword } = user;
  sendSuccess(res, 200, 'Profile retrieved', userWithoutPassword);
};

const getUserSessions = (req, res) => {
  const sessions = getSessions();
  const userSessions = sessions.filter(s => s.userId === req.user.id);
  sendSuccess(res, 200, 'Sessions retrieved', userSessions);
};

const deleteSession = (req, res) => {
  let sessions = getSessions();
  const sessionIndex = sessions.findIndex(s => s.id === req.params.id && s.userId === req.user.id);
  
  if (sessionIndex === -1) {
    return sendError(res, 404, 'Session not found');
  }
  
  sessions.splice(sessionIndex, 1);
  saveSessions(sessions);
  
  sendSuccess(res, 200, 'Session deleted successfully');
};

module.exports = { register, login, logout, getProfile, getUserSessions, deleteSession };
