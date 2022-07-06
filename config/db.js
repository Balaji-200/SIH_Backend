// Mongoose Package
const mongoose = require('mongoose');
// env package
require('dotenv').config();

const connectToMongo = () => {
    mongoose.connect(process.env.MONGO_URL)
    .then((s) => console.log('success'))
    .catch((e) => console.log(e));
}
module.exports = connectToMongo;