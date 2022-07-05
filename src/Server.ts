import express, { NextFunction } from "express";
import helmet from "helmet";
import ejs from "ejs";
import mongoose from "mongoose";
import http from "http";
import hpp from "hpp";
import { auth } from "./routes/auth";
import cookieParser from 'cookie-parser';
import path from "path";
import jwt from "jsonwebtoken";
import { file_router } from "./routes/files";
import { jwt_key } from "./global/middlewares/jwt_key";
import { check_auth } from "./global/middlewares/check_auth";
require('dotenv').config({ path : path.join(`${__dirname}/.env`)});

// @features
// login 
// lock files with password
// if not logged in user can access

//constants
const { log } = console;
const app = express();
const Server = http.createServer(app);
const PORT = process.env.PORT || 4600;
const io = require('socket.io')(Server);


// socket events

io.on('connection' , (socket:any) =>{
    console.log('Connection made');
    socket.on('data' , (data:any) => console.log(data));
});

// middlewares
app.use(helmet({
    crossOriginResourcePolicy:true,
}));
app.use(hpp());
app.use(express.json(/*{ limit : '10kb'}*/));
app.use(express.urlencoded( { extended : true , /*limit : '10kb'*/}));
app.use(cookieParser("secret_cookie_key"));
// static files
app.use(express.static(path.join(`${__dirname}/public`)));
app.use( express.static(`${__dirname}/uploads`))
// view engine
// ejs
app.set('view engine' , 'ejs');
app.set('views' , `${__dirname}/views`);



//  routes 
app.get('/' , [ jwt_key , check_auth ,  ], (_:any, res:any) =>{ res.render('index')});
// check if user is already logged in if so show modal
// apis
app.use('/authenication' , auth);
app.use('/files' , file_router);


// error 404
app.use((req:any , res:any) =>{
    res.render('404');
});

// server start
mongoose.connect(`${process.env.mongo_string}`)
.then(() =>{
    // let server listen to set port
    Server.listen(PORT , () =>{ log(`Server is running on port : ${PORT}`);});
})
.catch((error:any) =>{
    throw new Error(`Could not connect to the database.Try again later`);
})