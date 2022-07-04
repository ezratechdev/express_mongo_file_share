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
app.use(express.json({ limit : '10kb'}));
app.use(express.urlencoded( { extended : true , limit : '10kb'}));
app.use(cookieParser("secret_cookie_key"));
// static files
app.use(express.static(path.join(`${__dirname}/public`)));

// view engine
app.set('view engine' , 'ejs');
app.set('views' , `${__dirname}/views`);



//  routes 

// auth middlewares
const jwt_key = (req:any , _:any , next:any) =>{
    req.jwtkey = `very_secret_jwt_key`;
    next();
}
function isTokenExpired(token:string) {
    const payloadBase64 = token.split('.')[1];
    const decodedJson = Buffer.from(payloadBase64, 'base64').toString();
    const decoded = JSON.parse(decodedJson)
    const exp = decoded.exp;
    const expired = (Date.now() >= exp * 1000)
    return expired
}

// jwt checker
const verify_token = (token:string , secKey:string) =>{
    try{
        if(!(token && secKey)) throw new Error(`${(token) ? undefined : "token not passed"}`)
        if(isTokenExpired(token)) throw new Error(`Token has expired`);
        else return jwt.verify(token , `${secKey}`);
    } catch(error){
        console.log(error);
        throw new Error(`Faced an error while authenicating.Contact suppport`);
    }
}


const check_auth = (req:any , res:any , next:NextFunction) =>{
    if(!req.signedCookies['auth']){
        res.status(401)
        .render('auth');
    }else{
        // get token and check token
        req.token_data = verify_token(req.signedCookies.auth ,req.jwtkey);
        next();
    }
};

// ejs
app.get('/' , [ jwt_key , check_auth ,  ], (_:any, res:any) =>{ res.render('index')});
// check if user is already logged in if so show modal
// apis
app.use('/authenication' , auth);


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