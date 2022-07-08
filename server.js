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

// const User = require('./models/UserModel');

// const myFunction = async () => {
//     const user = await User.findById({ "_id": "62c6f6cca78ff87ca9b152d5" })
//     await user.populate({
//         path: 'roles',
//         populate: [
//             {
//                 path: 'permissions',
//                 model: 'Permission',
//                 select : '_id',
//             }
//         ]
//     })
//     console.log(user)

// }
// myFunction()