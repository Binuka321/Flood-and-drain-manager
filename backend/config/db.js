import mongoose from 'mongoose';

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  try {
    console.log("🔗 Connecting to MongoDB Atlas...");
    console.log("URI:", uri);

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });

    console.log("✅ MongoDB Connected (Atlas)");
  } catch (error) {
    console.error("❌ MongoDB REAL ERROR:");
    console.error(error); // FULL error (important)
    process.exit(1);
  }
};

export default connectDB;