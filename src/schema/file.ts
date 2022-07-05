import mongoose from "mongoose";


const file_schema = new mongoose.Schema({
    name:{
        type:String,
        required:[true , 'Name of file was not passed'],
    },
    path:{
        type:String,
        required:[true , 'Path of file was not passed'],
    },
    owner:{
        type:mongoose.Types.ObjectId,
        default:undefined,
    },
    short_id:{
        type:String,
        required:[true , 'Short id of file was not passed'],
    },
    download:{
        type:Number,
        default:0,
    }
} , { timestamps : true });


export const file_model = mongoose.model('File' , file_schema);