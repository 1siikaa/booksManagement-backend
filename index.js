const express = require("express")
const mongoose = require("mongoose")
const route = require('./src/route/route');
const app = express()
const cors = require('cors')


const multer= require("multer");
app.use(cors())
app.use( multer().any())
app.use(express.json())


mongoose.connect("mongodb+srv://1siikaa07:1siikaa07@cluster0.lhrj8le.mongodb.net/booksManagement?retryWrites=true&w=majority")
.then(() => console.log("MongoDB is connected"))
.catch((error) => console.log(error))

app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', 'https://main--adorable-croissant-6c39f3.netlify.app/');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); 
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
    });

app.use('/', route);


app.listen(3001, function () {
console.log('Express app running on port ' + 3001)})