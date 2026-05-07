const fs = require('fs');
const path = require('path');
const { sendSuccess, sendError } = require('../utils/responseUtils');

const cartsPath = path.join(__dirname, '../data/carts.json');
const getCarts = () => JSON.parse(fs.readFileSync(cartsPath, 'utf8'));
const saveCarts = (data) => fs.writeFileSync(cartsPath, JSON.stringify(data, null, 2));

const getCart = (req, res) => {
  const carts = getCarts();
  const cart = carts.find(c => c.userId === req.user.id) || { userId: req.user.id, items: [] };
  sendSuccess(res, 200, 'Cart retrieved', cart);
};

const addToCart = (req, res) => {
  const { productId, quantity } = req.body;
  const carts = getCarts();
  let cart = carts.find(c => c.userId === req.user.id);
  
  if (!cart) {
    cart = { userId: req.user.id, items: [], updatedAt: new Date().toISOString() };
    carts.push(cart);
  }
  
  const existingItem = cart.items.find(i => i.productId === productId);
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({ productId, quantity });
  }
  
  cart.updatedAt = new Date().toISOString();
  saveCarts(carts);
  
  sendSuccess(res, 200, 'Added to cart', cart);
};

module.exports = { getCart, addToCart };
