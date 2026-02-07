import mongoose from 'mongoose';

/**
 * Database Connection Handler
 * 
 * Environment Variable Used: MONGO_DB
 * Expected format: mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>
 * 
 * Note: Ensure password is URL-encoded if it contains special characters
 * Example: password "p@ss!" should be encoded as "p%40ss%21"
 */
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_DB || process.env.MONGO_URI);

        console.log(`MongoDB Atlas Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        console.error('---------------------------------------------------');
        console.error('❌ FAILED TO CONNECT TO MONGODB');
        console.error('Common causes:');
        console.error('1. IP Whitelist: Your current IP (or Render/Vercel IP) is not allowed in MongoDB Atlas.');
        console.error('   Solution: Add 0.0.0.0/0 to Network Access in Atlas for production/cloud hosting.');
        console.error('2. Invalid Credentials: Check your MONGO_DB connection string in .env');
        console.error('---------------------------------------------------');
        process.exit(1);
    }
};

export default connectDB;
