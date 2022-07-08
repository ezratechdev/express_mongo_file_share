import { Router } from "express";
import eah from "express-async-handler";
import multer from 'multer';
import fs from 'fs';
import path from "path";
import ResponseFunction from "../global/utils/ResponseFunction";
import { file_model } from "../schema/file";
import { check_user } from "../global/middlewares/check_user";
import { jwt_key } from "../global/middlewares/jwt_key";
import mongoose from "mongoose";
import shortid from "shortid";
import { check_auth } from "../global/middlewares/check_auth";

// files share
// share without login -- no pass , unlocked files
// short code for all files like uuid

// constants
const name_gen = () => {
    const literal = () => {
        // returns num between 1 and 20
        return Math.floor(0 + (Math.random() * 26));
    }
    const alphabet = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
    return (`${literal()}${alphabet[(literal())].toLowerCase()}${literal()}${alphabet[(literal())]}${literal()}${alphabet[(literal())]}${literal()}${alphabet[(literal())]}${literal()}${alphabet[(literal())]}${literal()}${alphabet[(literal())]}${literal()}${alphabet[(literal())]}${literal()}${alphabet[(literal())]}`);;
}
const upload_dir = `${__dirname}/../uploads`;
const storage = multer.diskStorage({
    destination:( req , file , cb) =>{
        if(!fs.existsSync(upload_dir)){
            fs.mkdirSync(upload_dir);
        }
        cb( null , upload_dir);
    },
    filename: ( req , file , cb) =>{
        cb(null , `${name_gen()}${path.extname(file.originalname)}`);
    },
});


const upload = multer({ 
    storage,
    limits:{
        fileSize: 1024 * 1024 * 100 // limit size of 100mb
    },
    fileFilter:( req , file , cb) =>{
        // for now allow all files
        cb( null , true);
    },
});


// constants
export const file_router = Router();

// download file
file_router.get('/' , [jwt_key , check_auth] , eah (async ( req:any , res:any) =>{
    if(!req.user){
        res
        .status(404)
        .json({
            ...ResponseFunction({
                status:200,
                message:`User was not found`,
            }),
        });
        return;
    }
    // 
    const get_user_files = await file_model.find({ owner : req.user._id}).select('-owner -path -_id');
    if(get_user_files.length == 0){
        res
        .status(200)
        .json({
            ...ResponseFunction({
                status:200,
                message:`User files fetched`,
            }),
            files:[],
        });
        return;
    }
    res
        .status(200)
        .json({
            ...ResponseFunction({
                status:200,
                message:`User files fetched`,
            }),
            files:get_user_files,
        });
}));
file_router.get('/download/:id' , [ jwt_key , check_user] , eah( async ( req:any , res:any) =>{
    // id is the short id of a file
    if(!req.params.id){
        res.status(404)
        .json({
            ...ResponseFunction({
                status:404,
                message:`File id was not passed`,
            }),
        });
        return;
    }
    const { id }:any = req.params;
    // this is the short id
    const get_file = await file_model.findOne({ short_id : id.trim() })

    if(!get_file){
        res
        .status(404)
        .json({
            ...ResponseFunction({
                message:`File was not found`,
                status:404
            }),
        });
        return;
    }

    // check if file has an owner
    if (((get_file.owner && req.user) && (get_file.owner.toString() == req.user._id))) {
        get_file.download++;
        await get_file.save();
        res.download(get_file.path, get_file.name);
    } else if(!get_file.locked){
        get_file.download++;
        await get_file.save();
        res.download(get_file.path, get_file.name);
    }else{
        res
        .status(401)
        .json({
            ...ResponseFunction({
                message:`File is locked.Unable to download`,
                status:404,
            }),
        });
    }
}));

// post file

file_router.post('/' , [ upload.single('file') , jwt_key , check_user] , eah ( async ( req:any , res:any) =>{
    if(!req.file) {
        res
        .status(404)
        .json({
            ...ResponseFunction({
                status:404,
                message:'File was not passed',
            }),
        });
        return;
    }
    const short_id = shortid.generate();
    const save_file = await file_model.create({
        name:req.file.originalname,
        path:req.file.path,
        owner:req.user ? new mongoose.Types.ObjectId(req.user._id) : undefined,
        short_id,
        locked: req.user ? true : false ,
    });
    if(!save_file){
        res.status(500)
        .json({
            ...ResponseFunction({
                status:500,
                message:`Unable to save file.Try again later`,
            }),
        });
        return;
    }
    res.status(200)
    .json({
        ...ResponseFunction({
            message:`File has been saved with an id of${short_id}`,
            status:200,
        }),
    });
}));



// unlock file 
// make private file public

file_router.patch('/unlock/:id' , [ jwt_key , check_user] , eah (async ( req:any , res) =>{
    if(!req.params.id){
        res.status(404)
        .json({
            ...ResponseFunction({
                status:404,
                message:`File id was not passed`,
            }),
        });
        return;
    }
    const { id } = req.params;
    if(!req.user){
        res
        .status(401)
        .json({
            ...ResponseFunction({
                message:`You are not logged in thus cannot unlock this file`,
                status:401,
            }),
        });
        return;
    }
    // get file and see if it is public
    const get_file = await file_model.findOne({ short_id : id });
    if(!get_file){
        res.status(404)
        .json({
            ...ResponseFunction({
                status:404,
                message:`File was not found`,
            }),
        });
        return;
    }

    if(!get_file.locked){
        res.status(200)
        .json({
            ...ResponseFunction({
                status:200,
                message:`This file is already public`,
            }),
        });
        return;
    }

    if(!(get_file.owner?.toString() == req.user._id)){
        res.status(401)
        .json({
            ...ResponseFunction({
                status:401,
                message:`You are not permitted to unlock this file`,
            }),
        });
    }else{
        get_file.locked = false,
        await get_file.save();
        res.status(200)
        .json({
            ...ResponseFunction({
                message:`File has been made public`,
                status:200,
            })
        })
    }
}));


// making files private
file_router.patch('/lock/:id' , [ jwt_key , check_user] , eah (async ( req:any , res) =>{
    if(!req.params.id){
        res.status(404)
        .json({
            ...ResponseFunction({
                status:404,
                message:`File id was not passed`,
            }),
        });
        return;
    }
    const { id } = req.params;
    if(!req.user){
        res
        .status(401)
        .json({
            ...ResponseFunction({
                message:`You are not logged in thus cannot unlock this file`,
                status:401,
            }),
        });
        return;
    }
    // get file and see if it is public
    const get_file = await file_model.findOne({ short_id : id });
    if(!get_file){
        res.status(404)
        .json({
            ...ResponseFunction({
                status:404,
                message:`File was not found`,
            }),
        });
        return;
    }

    if(get_file.locked){
        res.status(200)
        .json({
            ...ResponseFunction({
                status:200,
                message:`This file is already locked`,
            }),
        });
        return;
    }

    if(!(get_file.owner?.toString() == req.user._id)){
        res.status(401)
        .json({
            ...ResponseFunction({
                status:401,
                message:`You are not permitted to lock this file`,
            }),
        });
    }else{
        get_file.locked = true,
        await get_file.save();
        res.status(200)
        .json({
            ...ResponseFunction({
                message:`File has been made private`,
                status:200,
            })
        })
    }
}));

// delete file
file_router.delete('/:id' , [ jwt_key , check_user ] , eah ( async ( req:any , res) =>{
    if(!req.params.id){
        res.status(404)
        .json({
            ...ResponseFunction({
                message:`File id was not passed`,
                status:404,
            }),
        });
        return;
    }

    const { id } = req.params;

    const get_file = await file_model.findOne({ short_id : id.trim()});
    if(!get_file){
        res.status(404)
        .json({
            ...ResponseFunction({
                status:404,
                message:`File was not found`,
            }),
        });
        return;
    }
    if(!((get_file.owner && req.user) && (get_file.owner.toString() == req.user._id))){
        // user cannot delete this file
        res.status(401)
        .json({
            ...ResponseFunction({
                status:401,
                message:`You cannot delete this file as you are not authorized or it is a public file.\nIf you wish to have it deleted and you uploaded the file as a public file kindly contact project manager`,
            }),
        });
        return;
    }
    // delete file from file system
    try{
        if(fs.existsSync(get_file.path)){
            fs.unlinkSync(get_file.path);
            const deleted_file = await file_model.findByIdAndDelete(get_file._id);
            if(!deleted_file){
                res.status(500)
                .json({
                    ...ResponseFunction({
                        status:500,
                        message:`File has been deleted but not fully.`
                    }),
                });
                return;
            }
            res.status(200)
            .json({
                ...ResponseFunction({
                    status:200,
                    message:`File has been deleted successfully`,
                })
            })
        }else{
            res.status(404)
            .json({
                ...ResponseFunction({
                    status:404,
                    message:`File not found.Has file been deleted?`,
                })
            })
        }
    } catch(error){
        res.status(500)
        .json({
            ...ResponseFunction({
                message:`Unable to delete file.Try again later`,
                status:500,
            })
        })
    }
}));