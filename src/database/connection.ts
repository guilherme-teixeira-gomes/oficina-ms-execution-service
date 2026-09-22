import mongoose from "mongoose";

export async function connectMongo(): Promise<void> {
  const uri = process.env.MONGO_URL || "mongodb://localhost:27017/execution_service";
  await mongoose.connect(uri);
}

export async function disconnectMongo(): Promise<void> {
  await mongoose.disconnect();
}
