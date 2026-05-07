const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { sendSuccess, sendError } = require('../utils/responseUtils');

const productsPath = path.join(__dirname, '../data/products.json');
const getProducts = () => JSON.parse(fs.readFileSync(productsPath, 'utf8'));
const saveProducts = (data) => fs.writeFileSync(productsPath, JSON.stringify(data, null, 2));

const getAllProducts = (req, res) => {
  let products = getProducts();
  
  // Filter by category
  if (req.query.category) {
    products = products.filter(p => p.category === req.query.category);
  }

  // Price filtering
  if (req.query.minPrice) {
    products = products.filter(p => p.price >= parseFloat(req.query.minPrice));
  }
  if (req.query.maxPrice) {
    products = products.filter(p => p.price <= parseFloat(req.query.maxPrice));
  }
  
  // Search
  if (req.query.search) {
    const search = req.query.search.toLowerCase();
    products = products.filter(p => p.name.toLowerCase().includes(search) || p.description.toLowerCase().includes(search));
  }
  
  // Sorting
  if (req.query.sort) {
    const order = req.query.order === 'desc' ? -1 : 1;
    const field = req.query.sort;
    products.sort((a, b) => {
      if (a[field] < b[field]) return -1 * order;
      if (a[field] > b[field]) return 1 * order;
      return 0;
    });
  }

  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  
  const total = products.length;
  products = products.slice(startIndex, endIndex);

  sendSuccess(res, 200, 'Products retrieved', products, { total, page, limit });
};

const getProductById = (req, res) => {
  const products = getProducts();
  const product = products.find(p => p.id === req.params.id);
  
  if (!product) {
    return sendError(res, 404, 'Product not found');
  }
  
  sendSuccess(res, 200, 'Product retrieved', product);
};

const createProduct = (req, res) => {
  const products = getProducts();
  const newProduct = {
    id: uuidv4(),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  
  products.push(newProduct);
  saveProducts(products);
  
  sendSuccess(res, 201, 'Product created successfully', newProduct);
};

module.exports = { getAllProducts, getProductById, createProduct };
