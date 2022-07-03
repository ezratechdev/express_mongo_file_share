import express from "express";
import helmet from "helmet";
import ejs from "ejs";
import mongoose from "mongoose";
import http from "http";
import hpp from "hpp";
import { auth } from "./routes/auth";
import cookieParser from 'cookie-parser';

// @features
// login 
// lock files with password
// if not logged in user can access

//constants
const { log } = console;
const app = express();
const Server = http.createServer(app);
const PORT = process.env.PORT || 4600;
const mongo_string = 'your_mongo_string_goes_here';

// middlewares
app.use(helmet({
    crossOriginResourcePolicy:true,
}));
app.use(hpp());
app.use(express.json({ limit : '10kb'}));
app.use(express.urlencoded( { extended : true , limit : '10kb'}));
app.use(cookieParser("secret_cookie_key"));

// view engine
app.set('view engine' , 'ejs');
app.set('views' , `${__dirname}/views`);



//  routes 
app.get('/' , (req:any, res:any) =>{ res.render('index')});
app.use('/auth' , auth);


// server start
mongoose.connect(mongo_string)
.then(() =>{
    // let server listen to set port
    Server.listen(PORT , () =>{ log(`Server is running on port : ${PORT}`);});
})
.catch((error:any) =>{
    throw new Error(`Could not connect to the database.Try again later`);
})