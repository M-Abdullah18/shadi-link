import mongoose from 'mongoose';

// Declare cached connection interface on globalThis for serverless invocation reuse
declare global {
  // eslint-disable-next-line no-var
  var mongooseConnection: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  } | undefined;
}

let cached = globalThis.mongooseConnection;

if (!cached) {
  cached = globalThis.mongooseConnection = { conn: null, promise: null };
}

/**
 * Connects to MongoDB with connection caching across serverless invocations.
 * Never logs or exposes MONGODB_URI.
 */
export async function connectDb(): Promise<typeof mongoose | null> {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) {
    return null;
  }

  if (cached!.conn && mongoose.connection.readyState === 1) {
    return cached!.conn;
  }

  if (!cached!.promise) {
    cached!.promise = mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      bufferCommands: false,
    }).then((m) => {
      cached!.conn = m;
      return m;
    }).catch((err) => {
      cached!.promise = null;
      cached!.conn = null;
      throw err;
    });
  }

  try {
    cached!.conn = await cached!.promise;
    return cached!.conn;
  } catch (error) {
    cached!.promise = null;
    cached!.conn = null;
    throw error;
  }
}

/**
 * Performs a real database ping.
 * Returns 'connected' if ping succeeds, 'error' if it fails, or 'not_configured' if MONGODB_URI is missing.
 * Never leaks any credentials or error details.
 */
export async function pingDb(): Promise<'connected' | 'error' | 'not_configured'> {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) {
    return 'not_configured';
  }

  try {
    const conn = await connectDb();
    if (!conn || !conn.connection || !conn.connection.db) {
      return 'error';
    }
    const adminDb = conn.connection.db.admin();
    await adminDb.ping();
    return 'connected';
  } catch (_error) {
    return 'error';
  }
}
