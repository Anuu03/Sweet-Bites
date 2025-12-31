const connectDB = require("./config/db");

console.log("=== Testing MongoDB Connection ===\n");

connectDB()
    .then(() => {
        console.log("\n✅ Connection test successful!");
        process.exit(0);
    })
    .catch((err) => {
        console.log("\n❌ Connection test failed!");
        process.exit(1);
    });
