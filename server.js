const express = require("express");
const cors = require('cors')
const app = express()
app.use(cors())
app.use(express.json());

//db connection
const connectToMongo = require("./config/db");
connectToMongo();

// user route
const userRouter = require('./routes/user')
app.use('/user',userRouter)

app.get("/", (req, res) => {
    res.send("hello")
});

app.listen(5000, () => {
    console.log("listening")
});