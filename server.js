// Load environment config first so dotenv runs before other modules
const { PORT, DB_URL, NODE_ENV } = require('./config/env');
const app = require('./app');
const mongoose = require('mongoose');
const logger = require('./utils/logger');

// Connect to MongoDB and start server
mongoose.connect(DB_URL)
  .then(() => {
    logger.info('MongoDB connected successfully');
    
    app.listen(PORT, () => {
      logger.info(`Realto API Server running on port ${PORT}`);
      logger.info(`Environment: ${NODE_ENV}`);
      logger.info(`Server: api.realto.com`);
    });
  })
  .catch((err) => {
    logger.error(`Failed to connect to MongoDB: ${err}`);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  mongoose.connection.close();
  process.exit(0);
});