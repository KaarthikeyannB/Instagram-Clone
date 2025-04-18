import moongoose from "mongoose";

const connectDB = async () => {
    try {
        await moongoose.connect(process.env.MONGO_URL);
        console.log('Connected to DB');
    } catch (error) {
        console.log(`Error in connecting db :${error}`);
        process.exit(1);
    }
}

export default connectDB;