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
//     const user = await User.findById({ "_id": "62c81345ada4bb9f1ac66983" })
//     await user.populate({
//         path: 'roles',
//         populate:
//             {
//                 path: 'permissions',
//                 model: 'Permission',
//                 select : 'name',
//             }
//     })
//     console.log(user.roles[0].permissions[0].name)

// }
// myFunction()