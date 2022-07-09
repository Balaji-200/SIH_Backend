const express = require("express");
var mongoose = require('mongoose');
const cors = require('cors')
const app = express()
app.use(cors())
app.use(express.json());

//db connection
const connectToMongo = require("./config/db");
connectToMongo();

const User = require('./models/UserModel');
const Role = require('./models/RoleModel');
const Permission = require('./models/PermissionModel');

// RoutePermission Model 
const RoutePermission = require("./models/RoutePermissionModel")
// user route
const userRouter = require('./routes/user')
app.use('/user',userRouter)

app.get("/", (req, res) => {
    res.send("hello")
});

app.listen(5000, () => {
    console.log("listening")
});


// const myFunction = async () => {
//     const user = await User.findById({ "_id": "62c81345ada4bb9f1ac66983" })
//     await user.populate({
//         path: 'roles',
//         populate:
//             {
//                 path: 'permissions',
//                 model: 'permission',
//                 select : 'name',
//             }
//     })
//     console.log(user.roles[0].permissions[0].name)

// }
// myFunction()