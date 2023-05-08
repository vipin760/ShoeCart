
require('dotenv').config()
const mongoose = require('mongoose');
mongoose.connect(process.env.DB_URL)
const path = require('path')

const express = require('express');
const app = express();
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const session = require('express-session')
const userController = require('./controller/userController');
const bodyParser=require('body-parser');


//public path connect here
app.use(express.static(path.join(__dirname, 'public')));

//body parser use here
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET_KEY,
    saveUninitialized: true,
    cookie: { maxAge: 6000000 },
    resave: false
}));



//view engine set here
app.set('view engine', 'ejs');
app.set('views','./views/users')

//user section
app.use('/', userRoutes); 

//admin sections
app.use('/admin', adminRoutes);
app.use('*',userController.loadHome)

//require('dotenv').config()
//console.log("process.env", process.env.S3_BUCKET) // remove this after you've confirmed it is working


app.listen(process.env.PORT, () => {
    console.log("server connected");
})