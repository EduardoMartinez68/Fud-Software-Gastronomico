const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy; 

const database=require('../database');
const helpers=require('../lib/helpers.js');
const addDatabase=require('../router/addDatabase');
const update=require('../router/updateDatabase');

//add company
passport.use('local.add_company', new LocalStrategy({
    usernameField: 'name',
    passwordField: 'alias',
    passReqToCallback: true
}, async (req ,name, password, done) => {
    console.log(req.body);
    if(mandatory_company_data(req)){
        if(!await compare_company_with_name(req,name)){
            const newCompany=get_new_company(req);
            if (await addDatabase.add_company(newCompany)){
                done(null,false,req.flash('success','the company was add with success'));
            }
            else{
                done(null,false,req.flash('message','Could not add to database'));
            }
        }
        else{
            done(null,false,req.flash('message','This name already exists'));
        }
    }
    else{
        done(null,false,req.flash('message','You must fill in all the required information'));
    }
}));

function mandatory_company_data(req){
    //we get the required data
    const {name,alias,email,representative,municipality,city,cologne,street,postal_code} = req.body;

    //We will watch if the mandatory data was filled
    return (name!='' && alias!='' && representative!='' && municipality!='' && city!='' && cologne!='' && street!='' && postal_code!='' && email!='') 
}

async function compare_company_with_name(req,name){
    var queryText = 'SELECT * FROM companies Where name = $1 and id_user= $2';
    var values = [name,parseInt(req.user.id)];
    var user=await database.query(queryText, values);
    return user.rows.length>0
}


function get_new_company(req){
    //we get all the data of the company
    const {image,name,pathImage,alias,tradename,description,representative,phone,cell_phone,email,country,municipality,city,cologne,street,num_o,num_i,postal_code} = req.body;
    var path_image=create_a_new_image(req);

    const company={
        id_user:parseInt(req.user.id),
        path_logo:path_image,
        tradename:tradename,
        name:name,
        alias:alias,
        description:description,
        representative:representative,
        phone:phone,
        cell_phone:cell_phone,
        email:email,
        id_country:parseInt(country),
        municipality:municipality,
        city:city,
        cologne:cologne,
        streets:street,
        num_o:num_o,
        num_i:num_i,
        postal_code:postal_code
    }  

    return company;
}

function create_a_new_image(req){
    if (req.file!=undefined){
        return req.file.filename;
    }

    return '';
}

//add department
passport.use('local.add_department', new LocalStrategy({
    usernameField: 'name',
    passwordField: 'name',
    passReqToCallback: true
}, async (req ,name, password, done) => {
    console.log(req.body);
    if(!await this_department_exists(req,name)){
        const newDepartment=get_new_department(req);
        if(await addDatabase.add_product_department(newDepartment)){
            done(null,false,req.flash('success','the department was add with success'));
        }
        else{
            done(null,false,req.flash('message','Could not add to database'));
        }
    }
    else{
        done(null,false,req.flash('message','This department already exists'));
    }
}));

function get_new_department(req){
    //get the data of the new department
    const {name,description} = req.body;
    const {id}=req.params;

    //add the department
    const department={
        id_company:id,
        name:name,
        description:description
    }  

    return department;

}

async function this_department_exists(req,name){
    //get the id of the company
    const {id}=req.params;
    
    //we going to search this department in the list of the database
    var queryText = 'SELECT * FROM product_department Where id_company = $1 and name= $2';
    var values = [id,name];
    var companies=await database.query(queryText, values);
    return companies.rows.length>0;
}
