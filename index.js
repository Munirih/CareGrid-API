require("dotenv").config();
const connectDB = require("./src/config/connectDB")
const app = require('./src/app')
const port = process.env.PORT || 3000;


const startServer = async () => {
    await connectDB();

    app.listen(port, async() => {
    console.log(`CareGrid Server is running on port ${port}`);
});

};

startServer();