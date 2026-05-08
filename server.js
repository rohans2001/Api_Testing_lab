const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./docs/swagger.json');
const { graphqlHTTP } = require('express-graphql');
const { schema, root } = require('./graphql/schema');
const { protect } = require('./middleware/authMiddleware');
const { sendSuccess, sendError } = require('./utils/responseUtils');
const http = require('http');
const { Server } = require('socket.io');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// Socket.io Realtime simulation
io.on('connection', (socket) => {
  console.log('A client connected via WebSocket:', socket.id);
  
  socket.on('subscribe_order', (orderId) => {
    socket.join(`order_${orderId}`);
    socket.emit('notification', { message: `Subscribed to updates for order ${orderId}` });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Set port
const PORT = process.env.PORT || 5000;

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, process.env.UPLOAD_DIR || 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(morgan('dev'));

// Custom Middleware will be imported and mounted here
const { requestIdMiddleware } = require('./middleware/requestIdMiddleware');
const { maintenanceMiddleware } = require('./middleware/maintenanceMiddleware');
const { rateLimitMiddleware } = require('./middleware/rateLimitMiddleware');
const { errorMiddleware } = require('./middleware/errorMiddleware');
const { idempotencyMiddleware } = require('./middleware/idempotencyMiddleware');

app.use(requestIdMiddleware);
app.use(maintenanceMiddleware);
app.use(idempotencyMiddleware);
app.use('/api', rateLimitMiddleware);

// Static files
app.use('/uploads', express.static(uploadDir));

// Route definitions
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const cartRoutes = require('./routes/cartRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const webhookRoutes = require('./routes/webhookRoutes');
const adminRoutes = require('./routes/adminRoutes');
const testRoutes = require('./routes/testRoutes');
const vulnerableRoutes = require('./routes/vulnerableRoutes');
const thirdPartyMockRoutes = require('./routes/thirdPartyMockRoutes');
const jobRoutes = require('./routes/jobRoutes');
const featureFlagRoutes = require('./routes/featureFlagRoutes');
const microserviceRoutes = require('./routes/microserviceRoutes');

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/test', testRoutes);
app.use('/api/vulnerable', vulnerableRoutes);
app.use('/api/mock', thirdPartyMockRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/feature-flags', protect, featureFlagRoutes);
app.use('/api/services', microserviceRoutes);

// GraphQL Endpoint
app.use('/graphql', graphqlHTTP((req) => {
  // Simple auth extraction for GraphQL context
  let user = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer')) {
    try {
      const token = authHeader.split(' ')[1];
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_123');
      const fs = require('fs');
      const users = JSON.parse(fs.readFileSync(require('path').join(__dirname, 'data/users.json')));
      user = users.find(u => u.id === decoded.id);
    } catch (err) {}
  }

  return {
    schema: schema,
    rootValue: root,
    graphiql: process.env.NODE_ENV !== 'production',
    context: { req, user }
  };
}));

// Health check endpoint
app.get('/health', (req, res) => {
  sendSuccess(res, 200, 'API is healthy and running', { timestamp: new Date(), version: '1.0.0' });
});

// 404 handler
app.use((req, res, next) => {
  sendError(res, 404, 'The requested endpoint could not be found', { path: req.originalUrl });
});

// Global error handler
app.use(errorMiddleware);

// API Versioning - v1 maps to base /api
app.use('/api/v1', rateLimitMiddleware, (req, res, next) => {
  req.url = req.url.replace('/api/v1', '/api');
  next();
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
