import mongoose from "mongoose";
import dotenv from "dotenv";
import { DB_NAME } from "../constents.js";

// Load environment variables
dotenv.config();

const connectDB = async () => {
    try {
        // Build the connection string
        const connectionString = `${process.env.MONGODB_URI}/${DB_NAME}`;
        
        // Connect to MongoDB
        const connectionInstance = await mongoose.connect(connectionString);
        
        console.log(`\n MONGODB Connected !! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.error("MONGODB connection error: ", error.message);
        console.error("Stack Trace: ", error.stack);
        
        // Exit the process if unable to connect
        process.exit(1);
    }
};

export default connectDB;









/* import mongoose from "mongoose";
import { DB_NAME } from "../constents.js";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect
        (`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`\n MONGODB Connected !! DB HOST: ${connectionInstance.connection.host}`)
    } catch (error) {
        console.log("MONGODB connection error: ", error);
        process.exit(1);
        
    }

}

export default connectDB; */
