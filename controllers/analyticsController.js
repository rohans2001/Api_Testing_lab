const { sendSuccess } = require('../utils/responseUtils');
const fs = require('fs');
const path = require('path');

const usersPath = path.join(__dirname, '../data/users.json');
const ordersPath = path.join(__dirname, '../data/orders.json');
const productsPath = path.join(__dirname, '../data/products.json');

const getDashboardStats = (req, res) => {
  const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
  const orders = JSON.parse(fs.readFileSync(ordersPath, 'utf8'));
  const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
  
  const stats = {
    totalUsers: users.length,
    totalOrders: orders.length,
    totalProducts: products.length,
    totalRevenue: orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
  };
  
  sendSuccess(res, 200, 'Dashboard stats retrieved', stats);
};

module.exports = { getDashboardStats };
