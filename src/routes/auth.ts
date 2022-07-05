import { Router , Request , Response , NextFunction } from "express";
import eah from "express-async-handler";
import ResponseFunction from "../global/utils/ResponseFunction";
import { user_model } from "../schema/user";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { jwt_key } from "../global/middlewares/jwt_key";
import { create_token } from "../global/middlewares/jwt";


export const auth = Router();

// auth middlewares here


const no_req_body = ( req:Request , res:Response , next:NextFunction ) =>{
    if(!req.body){
        res.status(404)
        .json({
            ...ResponseFunction({
                status:404,
                message:`Request body was not found`,
            })
        });
        return;
    }else{
        next();
    }
};

const no_details = (req:any , res:Response , next:NextFunction) =>{
    if(!(req.body.password && req.body.email && req.body.email.includes('@') && req.body.email.includes('.'))){
        res.status(404)
        .json({
            ...ResponseFunction({
                status:404,
                message:`Required details were not passed or not in the correct format`,
            }),
        })
        return;
    }else{
        const { email , password } = req.body;
        req['email'] = email;
        req['password'] = password;
        next();
    }
}

const get_user = async ( req:any , _:any, next:NextFunction ) =>{
    const user = await user_model.findOne({ email : req.email});
    if(!user){
        req.user = undefined;
        next();
    }else{
        req.user = user;
        next();
    }
};




// signup

auth.post('/signup' , [ no_req_body , no_details , get_user , jwt_key ] , eah( async ( req:any , res:any) =>{
    if(req.user){
        res.status(404)
        .json({
            ...ResponseFunction({
                message:`User with a similar email was found`,
                status:403,
            })
        });
        return;
    }

    // hash password
    const hashed_password = await bcrypt.hash(req.password , await bcrypt.genSalt(10));

    const create_user:any = await user_model.create({
        email:req.email,
        password:hashed_password,
    });

    if(!create_user){
        res.status(500)
        .json({
            ...ResponseFunction({
                status:500,
                message:`Unable to create user account`,
            })
        });
        return;
    }

    res.status(200)
    .cookie('auth' , `${create_token(create_user._id ,`auth` , `${req.jwtkey}`)}` , { signed: true , sameSite: true , httpOnly : true , secure:true , maxAge: 1000 * 60 * 24 * 30 })
    .json({
        ...ResponseFunction({
            message:`User with email ${req.email} has been created`,
            status:200,
        }),
    });
}));

// login

auth.post('/login' , [ no_req_body , no_details , get_user , jwt_key ] , eah(async (req:any , res:any) =>{
    if(!req.user){
        res.status(404)
        .json({
            ...ResponseFunction({
                message:`User was not found.Try signing up`,
                status:404,
            }),
        });
        return;
    }

    if(!(req.user && await bcrypt.compare(req.password , req.user.password))){
        res.status(401)
        .json({
            ...ResponseFunction({
                status:401,
                message:`Password passed was not correct`,
            }),
        });
        return;
    }
    res.status(200)
    .cookie('auth' , `${create_token(req.user._id ,`auth` , `${req.jwtkey}`)}` , { signed: true , sameSite: true , httpOnly : true , secure:true , maxAge: 1000 * 60 * 24 * 30 })
    .json({
        ...ResponseFunction({
            message:`User with email ${req.email} has been logged in`,
            status:200,
        }),
    });
    
}));