import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config()

if(!process.env.MONGODB_URI){
    throw new Error('connection string is not avilable')
}
 
const connectDB=async()=>{
    try{
        await mongoose.connect(process.env.MONGODB_URI)
        console.log('database conneced')
    }
    catch(error){
        console.log('mongodb uri connection error',error)
        process.exit(1)
    }
}

export default connectDB