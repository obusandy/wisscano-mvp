import mongoose from "mongoose";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global._mongooseCache ?? {
  conn: null,
  promise: null,
};

if (!global._mongooseCache) {
  global._mongooseCache = cached;
}

export async function connectDB(): Promise<typeof mongoose> {
  // If mongoose is already connected (e.g., tests using mongodb-memory-server),
  // reuse the existing connection instead of creating a new one.
  if (mongoose.connection.readyState >= 1) {
    return mongoose;
  }

  if (cached.conn) {
    return cached.conn;
  }

  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error(
      "MONGODB_URI is not defined. Add it to .env before starting the server."
    );
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
      bufferCommands: false,
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    // Reset promise so the next request can retry the connection
    // instead of being stuck with a permanently rejected promise.
    cached.promise = null;
    throw err;
  }

  return cached.conn;
}
