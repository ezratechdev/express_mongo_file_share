export const jwt_key = (req:any , _:any , next:any) =>{
    req.jwtkey = `very_secret_jwt_key`;
    next();
}