const express = require("express");
const cors = require('cors')
const app = express()
app.use(cors())
app.use(express.json());

//db connection
const connectTOMongo = require("./config/db");
connectTOMongo()

// user route
const userRouter = require('./routes/user')
app.use('/user',userRouter)

app.get("/", (req, res) => {
    res.send("hello")
});

app.listen(5000, () => {
    console.log("listening")
});

// testing transpoter
// transpoter.verify((error, success) => {
//     if (error) {
//         console.log(error);
//     } else {
//         console.log("Ready for message");
//         console.log(success);
//     }
// })