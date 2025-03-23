import dotenv from "dotenv";
import connectDB from "./db/index.js";

dotenv.config({
    path: "./env"
})

connectDB()
.then( () => {
        app.listen(process.env.PORT || 7000, () => {
        console.log(`Server is on port ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("MongoDB connection Faild: ", err);
    
})













/* import express from "express";
import mongoose from "mongoose";
const app = express();

( async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on( "Error ", (error) => {
            console.log("Error ", error);
            throw error;
        })

        app.listen(process.env.PORT, () => {
                console.log(`App is listening on post ${process.env.PORT}`);
        })
    } catch (error) {
        console.error("Error ", error);
        throw error;
    }
} )() */

   