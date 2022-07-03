const mongoose = require('mongoose');
const mongoUrl = "mongodb://localhost:27017/backendPrac";
const connectTOMongo = () =>{
    mongoose.connect(mongoUrl,()=>{
        console.log("Connected to mongo successfuly");
    })
}
module.exports = connectTOMongo;