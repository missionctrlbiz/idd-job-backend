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
        const conn = await mongoose.connect(process.env.MONGO_DB);

        console.log(`MongoDB Atlas Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;
