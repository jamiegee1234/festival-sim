import * as dotenv from 'dotenv';
import { simulatorServer } from './server';
import { logger } from './utils/logger';

// Load environment variables
dotenv.config();

const PORT = parseInt(process.env.PORT || '8080', 10);
const NODE_ENV = process.env.NODE_ENV || 'development';

async function startServer(): Promise<void> {
  try {
    logger.info('🎪 Starting Festival Simulator Server...', {
      port: PORT,
      environment: NODE_ENV,
      nodeVersion: process.version
    });

    // Start the server
    await simulatorServer.start(PORT);
    
    // Create a default festival for demonstration
    await simulatorServer.initializeFestival();
    
    logger.info('✅ Festival Simulator Server started successfully!');
    
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown handlers
const gracefulShutdown = async (signal: string): Promise<void> => {
  logger.info(`📡 Received ${signal}. Shutting down gracefully...`);
  
  try {
    await simulatorServer.stop();
    logger.info('✅ Server stopped successfully');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
};

// Handle process signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer();