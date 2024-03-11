import mongoose from "mongoose";


// variable to check a db is connected
let isConnected = false; 


export const connectToDB = async () => {
    mongoose.set('strictQuery', true);

    if (!process.env.MONGODB_URL) return console.log("MONGODB_URL not found");

    if (isConnected) return console.log("Connected to MongoDB");

    try {
        await mongoose.connect(process.env.MONGODB_URL);

        isConnected = true;
    } catch (error) {
        console.log("Error : " + error);
    }
}


