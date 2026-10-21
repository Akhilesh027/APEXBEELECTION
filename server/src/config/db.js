import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI is not defined in .env');
    }

    if (uri.includes('<db_username>')) {
      console.warn('⚠️ WARNING: <db_username> placeholder detected in MONGODB_URI!');
      console.warn('👉 Please open server/.env and replace <db_username> with your actual MongoDB Atlas database username.');
    }

    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error('👉 Make sure your IP address is whitelisted in MongoDB Atlas Network Access (0.0.0.0/0 or Current IP).');
    process.exit(1);
  }
};
