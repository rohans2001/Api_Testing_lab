const fs = require('fs');
const path = require('path');

const swaggerPath = path.join(__dirname, 'docs/swagger.json');
let swagger = JSON.parse(fs.readFileSync(swaggerPath, 'utf8'));

// 1. Add tags
swagger.tags = [
  { name: 'Authentication', description: 'User authentication and session management' },
  { name: 'Users', description: 'User management and administration' },
  { name: 'Products', description: 'Product catalog operations' },
  { name: 'Orders', description: 'Order processing and tracking' },
  { name: 'Cart', description: 'Shopping cart operations' },
  { name: 'Payments', description: 'Payment processing' },
  { name: 'Uploads', description: 'File upload handling' },
  { name: 'Notifications', description: 'System and user notifications' },
  { name: 'Analytics', description: 'System analytics and dashboards' },
  { name: 'Webhooks', description: 'External webhooks integration' },
  { name: 'Jobs', description: 'Background job processing' },
  { name: 'Feature Flags', description: 'Application feature toggles' },
  { name: 'Microservices', description: 'Simulated microservice communications' },
  { name: 'Third-Party Mocks', description: 'Mocked external provider APIs' },
  { name: 'Vulnerabilities (Security)', description: 'Deliberately vulnerable endpoints for testing' },
  { name: 'Admin', description: 'System administration tasks' },
  { name: 'Testing / Debug', description: 'Diagnostic and testing utilities' },
  { name: 'System', description: 'System level endpoints' }
];

// 2. Add schemas
if (!swagger.components) swagger.components = {};
swagger.components.schemas = {
  User: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      name: { type: 'string' },
      email: { type: 'string' },
      role: { type: 'string', enum: ['user', 'admin', 'manager', 'super_admin'] }
    }
  },
  Product: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      name: { type: 'string' },
      description: { type: 'string' },
      price: { type: 'number' },
      stock: { type: 'integer' },
      category: { type: 'string' }
    }
  },
  Order: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      userId: { type: 'string' },
      items: { type: 'array', items: { type: 'object' } },
      totalAmount: { type: 'number' },
      status: { type: 'string', enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'] }
    }
  },
  ErrorResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: false },
      message: { type: 'string' },
      error: { type: 'object' }
    }
  },
  SuccessResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string' },
      data: { type: 'object' }
    }
  }
};

const defaultErrorResponses = {
  "400": {
    description: "Bad Request",
    content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } }
  },
  "401": {
    description: "Unauthorized",
    content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } }
  },
  "403": {
    description: "Forbidden",
    content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } }
  },
  "404": {
    description: "Not Found",
    content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } }
  },
  "500": {
    description: "Internal Server Error",
    content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } }
  }
};

const standardHeaders = {
  "X-Request-Id": {
    schema: { type: "string" },
    description: "Unique identifier for the request"
  }
};

// 3. Iterate over all paths and add standard elements
Object.keys(swagger.paths).forEach(pathStr => {
  const methods = swagger.paths[pathStr];
  Object.keys(methods).forEach(method => {
    const operation = methods[method];
    
    // Add success content schema if it doesn't exist
    if (operation.responses) {
      Object.keys(operation.responses).forEach(status => {
        if (status.startsWith('2') && !operation.responses[status].content) {
          operation.responses[status].content = {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" }
            }
          };
        }
        
        // Add headers
        if (!operation.responses[status].headers) {
          operation.responses[status].headers = { ...standardHeaders };
        }
      });
      
      // Inject standard error codes
      if (!operation.responses['400'] && (operation.requestBody || method === 'post' || method === 'put' || method === 'patch')) {
        operation.responses['400'] = defaultErrorResponses['400'];
      }
      
      // If not marked as public (security: []), assume protected
      const isPublic = operation.security && operation.security.length === 0;
      if (!isPublic && !operation.responses['401']) {
        operation.responses['401'] = defaultErrorResponses['401'];
      }
      if (!isPublic && !operation.responses['403']) {
        operation.responses['403'] = defaultErrorResponses['403'];
      }
      if (!operation.responses['404'] && method === 'get' && pathStr.includes('{')) {
        operation.responses['404'] = defaultErrorResponses['404'];
      }
      if (!operation.responses['500']) {
        operation.responses['500'] = defaultErrorResponses['500'];
      }
    }
  });
});

// 4. Add /health
swagger.paths['/health'] = {
  get: {
    tags: ['System'],
    summary: 'Health check endpoint',
    security: [],
    responses: {
      "200": {
        description: "API is healthy and running",
        headers: { ...standardHeaders },
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                success: { type: "boolean", example: true },
                message: { type: "string", example: "API is healthy and running" },
                data: { 
                  type: "object",
                  properties: {
                    timestamp: { type: "string" },
                    version: { type: "string" }
                  }
                }
              }
            }
          }
        }
      },
      "500": defaultErrorResponses['500']
    }
  }
};

// 5. Replace inline schemas with $refs where appropriate
if (swagger.paths['/api/users'] && swagger.paths['/api/users'].get) {
  swagger.paths['/api/users'].get.responses['200'].content['application/json'].schema = {
    type: "object",
    properties: {
      success: { type: "boolean" },
      data: { type: "array", items: { $ref: "#/components/schemas/User" } }
    }
  };
}
if (swagger.paths['/api/users/{id}'] && swagger.paths['/api/users/{id}'].get) {
  swagger.paths['/api/users/{id}'].get.responses['200'].content['application/json'].schema = {
    type: "object",
    properties: {
      success: { type: "boolean" },
      data: { $ref: "#/components/schemas/User" }
    }
  };
}
if (swagger.paths['/api/products'] && swagger.paths['/api/products'].get) {
  swagger.paths['/api/products'].get.responses['200'].content['application/json'].schema = {
    type: "object",
    properties: {
      success: { type: "boolean" },
      data: { type: "array", items: { $ref: "#/components/schemas/Product" } }
    }
  };
}
if (swagger.paths['/api/products/{id}'] && swagger.paths['/api/products/{id}'].get) {
  swagger.paths['/api/products/{id}'].get.responses['200'].content['application/json'].schema = {
    type: "object",
    properties: {
      success: { type: "boolean" },
      data: { $ref: "#/components/schemas/Product" }
    }
  };
}
if (swagger.paths['/api/orders'] && swagger.paths['/api/orders'].get) {
  swagger.paths['/api/orders'].get.responses['200'].content['application/json'].schema = {
    type: "object",
    properties: {
      success: { type: "boolean" },
      data: { type: "array", items: { $ref: "#/components/schemas/Order" } }
    }
  };
}

fs.writeFileSync(swaggerPath, JSON.stringify(swagger, null, 2));
console.log('Swagger updated successfully!');
