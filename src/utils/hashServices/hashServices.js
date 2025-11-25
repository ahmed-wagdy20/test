import bcrypt from "bcryptjs";

const hashing = async ({ plainText , salt = 12 }) => {
    return await bcrypt.hash(plainText, salt)
};


const comparing=async({plainText,hashedText})=>{
    return await bcrypt.compare(plainText,hashedText)
}





export{
    hashing,
    comparing
}