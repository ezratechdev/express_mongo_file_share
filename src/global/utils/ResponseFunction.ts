
interface data{
    status:number,
    message:string,
}


export default function ResponseFunction(input:data){
    return {
        ...input.status && { status : input.status},
        ...input.message && { message : input.message },
    }
}