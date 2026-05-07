const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { sendSuccess, sendError } = require('../utils/responseUtils');

const ordersPath = path.join(__dirname, '../data/orders.json');
const getOrders = () => JSON.parse(fs.readFileSync(ordersPath, 'utf8'));
const saveOrders = (data) => fs.writeFileSync(ordersPath, JSON.stringify(data, null, 2));

const createOrder = (req, res) => {
  const { items, totalAmount } = req.body;
  const orders = getOrders();
  
  const newOrder = {
    id: uuidv4(),
    userId: req.user.id,
    items,
    totalAmount,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  
  orders.push(newOrder);
  saveOrders(orders);
  
  sendSuccess(res, 201, 'Order created successfully', newOrder);
};

const getOrdersByUser = (req, res) => {
  const orders = getOrders();
  // Admins see all, users see their own
  let userOrders = req.user.role === 'admin' ? orders : orders.filter(o => o.userId === req.user.id);
  
  sendSuccess(res, 200, 'Orders retrieved', userOrders);
};

const updateOrderStatus = (req, res) => {
  const { status } = req.body;
  const orders = getOrders();
  const orderIndex = orders.findIndex(o => o.id === req.params.id);
  
  if (orderIndex === -1) {
    return sendError(res, 404, 'Order not found');
  }
  
  orders[orderIndex].status = status;
  saveOrders(orders);
  
  sendSuccess(res, 200, 'Order status updated', orders[orderIndex]);
};

module.exports = { createOrder, getOrdersByUser, updateOrderStatus };
