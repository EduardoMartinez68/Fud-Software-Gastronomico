const bcrypt=require('bcryptjs');
const helpers={};
//this code is for encrypt the user password 
helpers.encryptPassword=async (password)=>{
    const salt=await bcrypt.genSalt(10); //send
    const hash=await bcrypt.hash(password,salt); //final password
    return hash;
};

//this function is for the login 
helpers.matchPassword=async (password,savedPassword)=>{
    try{
        return await bcrypt.compare(password,savedPassword);
    }catch(e){
        console.log(e);
    }
};

module.exports=helpers;