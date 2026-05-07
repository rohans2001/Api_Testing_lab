const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const dataDir = path.join(__dirname, '../data');

console.log('Generating realistic datasets...');

// Generate 10k users
const generateUsers = () => {
  const users = [];
  for (let i = 0; i < 10000; i++) {
    users.push({
      id: uuidv4(),
      name: `Test User ${i}`,
      email: `user${i}@example.com`,
      role: 'user',
      status: 'active',
      password: 'hashed_password_mock' // Avoid slow bcrypt for 10k users
    });
  }
  fs.writeFileSync(path.join(dataDir, 'users_large.json'), JSON.stringify(users, null, 2));
  console.log('Generated 10,000 users in data/users_large.json');
};

// Generate 50k products
const generateProducts = () => {
  const products = [];
  for (let i = 0; i < 50000; i++) {
    products.push({
      id: `prod_${i}`,
      name: `Product ${i}`,
      price: parseFloat((Math.random() * 1000).toFixed(2)),
      stock: Math.floor(Math.random() * 500),
      category: i % 2 === 0 ? 'electronics' : 'clothing'
    });
  }
  fs.writeFileSync(path.join(dataDir, 'products_large.json'), JSON.stringify(products, null, 2));
  console.log('Generated 50,000 products in data/products_large.json');
};

generateUsers();
generateProducts();
console.log('Data generation complete!');
