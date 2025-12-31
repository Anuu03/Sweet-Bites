const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        // Connection options to handle DNS and network issues
        const options = {
            serverSelectionTimeoutMS: 10000, // Timeout after 10s instead of 30s
            socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
            family: 4, // Use IPv4, skip trying IPv6
        };

        console.log("Attempting to connect to MongoDB...");

        await mongoose.connect(process.env.MONGO_URI, options);

        console.log("✅ MongoDB connected successfully");
        console.log(`📊 Database: ${mongoose.connection.name}`);
    } catch (err) {
        console.error("❌ MongoDB connection failed");
        console.error("Error name:", err.name);
        console.error("Error message:", err.message);

        // Provide helpful error messages based on error type
        if (err.message.includes("ENOTFOUND") || err.message.includes("queryTxt")) {
            console.error("\n🔍 DNS Resolution Error Detected!");
            console.error("Possible solutions:");
            console.error("1. Check your internet connection");
            console.error("2. Verify MONGO_URI in .env file is correct");
            console.error("3. Check if your IP is whitelisted in MongoDB Atlas Network Access");
            console.error("4. Try using a standard mongodb:// connection string instead of mongodb+srv://");
            console.error("5. Check firewall/antivirus settings that might block DNS queries");
        } else if (err.message.includes("authentication")) {
            console.error("\n🔐 Authentication Error!");
            console.error("Check your MongoDB username and password in the connection string");
        }

        console.error("\nFull error details:", err);
        process.exit(1);
    }
};

module.exports = connectDB;