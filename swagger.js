const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Legisense API Documentation',
    version: '1.0.0',
    description: 'Documentation for legisense Express API',
  },
  servers: [
    {
      url: `https://legisense-backend.onrender.com/`, // Update with your actual server URL
      description: 'onrender server',
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ['server.js'], // Update with the name of your main app file
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
