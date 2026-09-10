import mongoose from 'mongoose';
import { config } from './env';

let memoryServer: any = null;

export const connectDatabase = async (): Promise<typeof mongoose> => {
  const uri = config.MONGODB_URI;

  if (uri) {
    try {
      console.log(`[Database] Attempting connection to MongoDB at: ${uri.replace(/:([^:@]{3,})@/, ':***@')}`);
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 4000
      });
      console.log(`[Database] MongoDB connected successfully (${conn.connection.host})`);
      return conn;
    } catch (err: any) {
      console.warn(`[Database] Connection to provided MONGODB_URI failed: ${err.message}`);
      if (config.isProduction) {
        throw err;
      }
      console.log('[Database] Falling back to embedded in-memory MongoDB for seamless local evaluation...');
    }
  }

  // Development / Test fallback: MongoMemoryServer
  try {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create();
    const memUri = memoryServer.getUri();
    console.log(`[Database] Starting embedded MongoMemoryServer at: ${memUri}`);
    const conn = await mongoose.connect(memUri);
    console.log('[Database] Embedded MongoDB connected successfully (zero-setup mode active)');
    return conn;
  } catch (memErr: any) {
    console.error(`[Database] Failed to initialize embedded MongoDB: ${memErr.message}`);
    throw memErr;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
  console.log('[Database] MongoDB disconnected cleanly');
};
