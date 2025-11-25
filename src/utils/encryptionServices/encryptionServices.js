import cryptoJS from "crypto-js";


const encryption=({plainText,secretKey="zaina"})=>{
    return cryptoJS.AES.encrypt(plainText,secretKey).toString()
};


const decryption=({encryptedText,secretKey="zaina"})=>{
    return cryptoJS.AES.decrypt(encryptedText,secretKey).toString(cryptoJS.enc.Utf8)
}


export{
    encryption,
    decryption
}