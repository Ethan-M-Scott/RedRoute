
// config/mongodb.ts
import { MongoClient, ServerApiVersion } from "mongodb";
import mongoose from "mongoose";

declare global {
  // eslint-disable-next-line no-var
  var _mongoClient: MongoClient | undefined;
}

const { MONGODB_URI, NODE_ENV } = process.env;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined in environment variables.");
}

const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
};

// Client used by better-auth
export const mongoClient =
  NODE_ENV === "development"
    ? (global._mongoClient ??= new MongoClient(MONGODB_URI, options))
    : new MongoClient(MONGODB_URI, options);

// Ensure MongoClient is connected
if (!(mongoClient as any).topology) {
  await mongoClient.connect();
}

// Ensure default Mongoose connection is connected
if (mongoose.connection.readyState === 0) {
  await mongoose.connect(MONGODB_URI);
}


/*
// I'm keeping the old code around for now in case its structure ends up being a better fit.

const connectMongoDB = async (): Promise<mongoose.Mongoose> => {
  try {
    const mongooseInstance = await mongoose.connect(MONGODB_URI);

    console.log("Connected to MongoDB.");
    return mongooseInstance;
  } catch (error) {
    console.log("Error connecting to MongoDB:", (error as Error).message);
    throw error;
  }
};

export const getMongooseDatabase = async (): Promise<mongoose.mongo.Db> => {
  const conn = await connectMongoDB();
  return conn.connection.getClient().db(process.env.MONGODB_DATABASE);
}

export default connectMongoDB;
*/