import { Schema , model } from "mongoose";


const user_schema = new Schema({
    email:{
        type:String,
        required:[true , 'User email was not passed'],
    },
    password:{
        type:String,
        required:[true , 'User password was not passed'],
    },
} , { timestamps: true});


export const user_model = model('User' , user_schema);