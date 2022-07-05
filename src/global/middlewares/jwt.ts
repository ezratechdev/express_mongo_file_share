import jwt from "jsonwebtoken";
function isTokenExpired(token:string) {
    const payloadBase64 = token.split('.')[1];
    const decodedJson = Buffer.from(payloadBase64, 'base64').toString();
    const decoded = JSON.parse(decodedJson)
    const exp = decoded.exp;
    const expired = (Date.now() >= exp * 1000)
    return expired
}

// jwt checker
export const verify_token = (token:string , secKey:string) =>{
    try{
        if(!(token && secKey)) throw new Error(`${(token) ? undefined : "token not passed"}`)
        if(isTokenExpired(token)) throw new Error(`Token has expired`);
        else return jwt.verify(token , `${secKey}`);
    } catch(error){
        console.log(error);
        throw new Error(`Faced an error while authenicating.Contact suppport`);
    }
}


export const create_token = ( id : string , operation:string , secKey:string) =>{
    return jwt.sign({ id , operation } , `${secKey}` , { expiresIn : '30d'});
}