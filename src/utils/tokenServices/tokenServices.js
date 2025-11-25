import jwt from "jsonwebtoken";



const creation=({payLoad,secretKey="zain",options={expiresIn:"7d"}})=>{
    return jwt.sign(payLoad,secretKey,options)
};


const verification=({
    token,
    secretKey="zain"
})=>{
    return jwt.verify(token,secretKey)
}






export{
    creation,
    verification
}