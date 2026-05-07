const { buildSchema } = require('graphql');
const fs = require('fs');
const path = require('path');

const usersPath = path.join(__dirname, '../data/users.json');
const productsPath = path.join(__dirname, '../data/products.json');

const getUsers = () => JSON.parse(fs.readFileSync(usersPath, 'utf8'));
const getProducts = () => JSON.parse(fs.readFileSync(productsPath, 'utf8'));

// GraphQL Schema Definition
const schema = buildSchema(`
  type User {
    id: String!
    name: String!
    email: String!
    role: String!
    status: String!
  }

  type Product {
    id: String!
    name: String!
    description: String!
    price: Float!
    stock: Int!
    category: String!
  }

  type Query {
    user(id: String!): User
    users: [User]
    product(id: String!): Product
    products(category: String): [Product]
  }
`);

// Resolvers
const root = {
  user: ({ id }, context) => {
    // Basic auth check
    if (!context.user) throw new Error('Unauthorized');
    return getUsers().find(u => u.id === id);
  },
  users: (args, context) => {
    if (!context.user || context.user.role !== 'admin') throw new Error('Forbidden');
    return getUsers();
  },
  product: ({ id }) => getProducts().find(p => p.id === id),
  products: ({ category }) => {
    const products = getProducts();
    if (category) return products.filter(p => p.category === category);
    return products;
  }
};

module.exports = { schema, root };
