import mongoose from 'mongoose';

// Default to local MongoDB if not set in .env.local
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bookhaven';

// Use a global cache to prevent multiple connections in dev (Next.js HMR)
const globalForMongoose = globalThis as unknown as {
  mongooseConn?: typeof mongoose;
  mongoosePromise?: Promise<typeof mongoose>;
};

async function connectMongoDB(): Promise<typeof mongoose> {
  if (globalForMongoose.mongooseConn) {
    return globalForMongoose.mongooseConn;
  }

  const uri = process.env.MONGODB_URI || MONGODB_URI;

  if (!globalForMongoose.mongoosePromise) {
    globalForMongoose.mongoosePromise = mongoose
      .connect(uri, { bufferCommands: false })
      .then((m) => {
        globalForMongoose.mongooseConn = m;
         console.log("MongoDB Connected Successfully!");
      console.log("Database Name:", m.connection.name);
        return m;
      })
      .catch((err) => {
        globalForMongoose.mongoosePromise = undefined;
        console.error('[MongoDB Connection Error]:', err.message);
        throw err;
      });
  }

  return globalForMongoose.mongoosePromise;
}

export default connectMongoDB;
