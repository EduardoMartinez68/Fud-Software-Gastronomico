//require
const express=require('express');
//const router=express.Router();
const database=require('../database');
const addDatabase={}

//add user
/*
router.post('/addUser',async (req,res)=>{
    const {Name,userName,email,password,confirmPassword,birthday,acceptTerms} = req.body;
    
    //we will watch if the user on the terms and conditions
    if(acceptTerms==undefined){
        //errorMessage('Terms and Conditions','You must accept the terms and conditions to continue');
        console.log('You must accept the terms and conditions to continue');
        res.send('You must accept the terms and conditions to continue');
    }
    else{
        //we will watch if the passwords are equal
        if (compare_password(password,confirmPassword)){
            if (birthday==''){
                res.send('You need to add your date of birth');
            }
            else{
                //create a new user 
                const newUser={
                    user_name: userName,
                    name: Name,
                    email:email,
                    password:password,
                    birthday:birthday
                };
                add_user(newUser);
                res.send('add user');
            }   
        }
        else{
            //console.log('Double check your passwords');
            //errorMessage('wrong password','Double check your passwords');
            console.log('Double check your passwords');
            res.send('Double check your passwords');   
        }
    }
});*/

function compare_password(P1,P2){
    if (P1==''){
        return false;
    }

    return P1==P2;
}

async function add_user(user){
    var queryText = 'INSERT INTO users (user_name, name, email,password,birthday) VALUES ($1, $2, $3,$4,$5)';
    var values = [user.user_name,user.name,user.email,user.password,user.birthday] 
    await database.query(queryText,values);
}

async function add_company(company){
    var queryText = 'INSERT INTO companies (id_user, path_logo, name,alias,description,representative,ceo,id_country,'
        +'phone,cell_phone,email,street,num_ext,num_int,postal_code,cologne,city,states,municipality)'
        +'VALUES ($1, $2, $3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)';

    var values = [company.id_user,company.path_logo,company.name,company.alias,company.description,company.representative,company.ceo,
                company.id_country,company.phone,company.cell_phone,company.email,company.street,company.num_o,company.num_i,company.postal_code,
                company.cologne,company.city,company.street,company.municipality] 
    try{
        await database.query(queryText, values);
        return true;
    } catch (error) {
        console.error('Error al insertar en la base de datos:', error);
        return false;
    }
}

addDatabase.add_company=async (company)=>{
    var queryText = 'INSERT INTO companys (id_user, path_logo, name,alias,description,representative,ceo,id_country,'
        +'phone,cell_phone,email,street,num_ext,num_int,postal_code,cologne,city,states)'
        +'VALUES ($1, $2, $3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)';

    var values = [company.id_user,company.logo,company.name,company.alias,company.description,company.representative,company.ceo,
                company.id_country,company.phone,company.cell_phone,company.email,company.street,company.num_o,company.num_i,company.postal_code,
                company.cologne,company.city,company.streets] 
    try{
        await database.query(queryText, values);
        return true;
    } catch (error) {
        console.error('Error al insertar en la base de datos:', error);
        return false;
    }
};


//add company
/*
router.get('/',async (req,res)=>{
    const users=await database.query('SELECT * FROM users');
    console.log(users);
    res.send('list');
});*/


module.exports={
    add_company
};