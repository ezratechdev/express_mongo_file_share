import { verify_token } from "./jwt";

import { user_model } from "../../schema/user";
export const check_user = async (req:any , res:any , next:any) =>{
    if(!req.signedCookies['auth']){
        req.user = undefined;
    }else{
        // get token and check token
        req.token_data = verify_token(req.signedCookies.auth ,req.jwtkey);
        const data:any = verify_token(req.signedCookies.auth ,req.jwtkey);
        // get user
        if(data.operation != 'auth'){
            req.user = undefined;
            return;
        }
        const find_user = await user_model.findById(data.id);
        if(!find_user){
            req.user = undefined;
            return;
        }
        req.user = find_user;
        next();
    }
};