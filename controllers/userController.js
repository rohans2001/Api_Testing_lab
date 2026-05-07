const fs = require('fs');
const path = require('path');
const { sendSuccess, sendError } = require('../utils/responseUtils');

const usersPath = path.join(__dirname, '../data/users.json');
const getUsers = () => JSON.parse(fs.readFileSync(usersPath, 'utf8'));
const saveUsers = (data) => fs.writeFileSync(usersPath, JSON.stringify(data, null, 2));

const getAllUsers = (req, res) => {
  let users = getUsers().filter(u => !u.deletedAt);
  
  // Filtering
  if (req.query.role) {
    users = users.filter(u => u.role === req.query.role);
  }
  
  // Search
  if (req.query.search) {
    const search = req.query.search.toLowerCase();
    users = users.filter(u => u.name.toLowerCase().includes(search) || u.email.toLowerCase().includes(search));
  }
  
  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  
  const total = users.length;
  users = users.slice(startIndex, endIndex);
  
  // Remove passwords
  users = users.map(({ password, ...user }) => user);

  sendSuccess(res, 200, 'Users retrieved', users, { total, page, limit });
};

const getUserById = (req, res) => {
  const user = users.find(u => u.id === req.params.id && !u.deletedAt);
  
  if (!user) {
    return sendError(res, 404, 'User not found');
  }
  
  const { password, ...userWithoutPassword } = user;
  sendSuccess(res, 200, 'User retrieved', userWithoutPassword);
};
const deleteUser = (req, res) => {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.id === req.params.id && !u.deletedAt);
  
  if (userIndex === -1) {
    return sendError(res, 404, 'User not found');
  }

  // Soft delete
  users[userIndex].deletedAt = new Date().toISOString();
  saveUsers(users);

  sendSuccess(res, 200, 'User deleted successfully');
};

module.exports = { getAllUsers, getUserById, deleteUser };
