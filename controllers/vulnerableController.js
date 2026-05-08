const fs = require('fs');
const path = require('path');
const { sendSuccess, sendError } = require('../utils/responseUtils');

const usersPath = path.join(__dirname, '../data/users.json');
const getUsers = () => JSON.parse(fs.readFileSync(usersPath, 'utf8'));
const saveUsers = (data) => fs.writeFileSync(usersPath, JSON.stringify(data, null, 2));

// 1. Insecure Direct Object Reference (IDOR)
const getAnyUserProfile = (req, res) => {
  // Vulnerability: No check if req.user.id matches req.params.id or if user is admin
  const users = getUsers();
  const user = users.find(u => u.id === req.params.id);
  
  if (!user) {
    return sendError(res, 404, 'User profile not found');
  }
  
  sendSuccess(res, 200, 'User profile retrieved successfully', user);
};

// 2. Open Redirect
const redirectUrl = (req, res) => {
  // Vulnerability: Unvalidated redirect parameter
  const target = req.query.url;
  if (!target) {
    return sendError(res, 400, 'Missing url parameter for redirection');
  }
  
  res.redirect(target);
};

// 3. Mass Assignment
const updateProfile = (req, res) => {
  // Vulnerability: Directly merging req.body into user object (allows changing role/status)
  const users = getUsers();
  const userIndex = users.findIndex(u => u.id === req.user.id);
  
  if (userIndex === -1) return sendError(res, 404, 'User profile not found');
  
  users[userIndex] = { ...users[userIndex], ...req.body };
  saveUsers(users);
  
  sendSuccess(res, 200, 'User profile updated successfully', users[userIndex]);
};

module.exports = { getAnyUserProfile, redirectUrl, updateProfile };
