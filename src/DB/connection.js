import mongoose from "mongoose";

export const connectionDB = async () => {
    try {
        await mongoose.connect(process.env.MONGOOSE_URL,
            {
                serverSelectionTimeoutMS: 5000
            }
        );
        console.log(`database connected successfully`)
    } catch (error) {
        console.log(`database connection failed:${error.message}`)
    }
}