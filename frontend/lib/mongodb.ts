import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const options = {
  maxPoolSize: 10,
  minPoolSize: 5,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000,
};

let client;
let clientPromise: Promise<MongoClient>;

declare global {
  var _mongoClientPromise: Promise<MongoClient>;
}

if (!global._mongoClientPromise) {
  client = new MongoClient(uri, options);
  global._mongoClientPromise = client.connect().catch((error) => {
    console.error("[MongoDB] Connection failed:", error.message);
    throw error;
  });
}

clientPromise = global._mongoClientPromise;

export default clientPromise;