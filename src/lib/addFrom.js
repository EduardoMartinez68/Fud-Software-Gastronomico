const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy; 

const database=require('../database');
const helpers=require('../lib/helpers.js');
const addDatabase=require('../router/addDatabase');
const update=require('../router/updateDatabase');


const express=require('express');
const router=express.Router();
const {isLoggedIn,isNotLoggedIn}=require('../lib/auth');

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
    var queryText = 'SELECT * FROM "User".companies Where name = $1 and id_users= $2';
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
    var queryText = 'SELECT * FROM "Kitchen".product_department Where id_companies = $1 and name= $2';
    var values = [id,name];
    var companies=await database.query(queryText, values);
    return companies.rows.length>0;
}

//add category
passport.use('local.add_category', new LocalStrategy({
    usernameField: 'name',
    passwordField: 'name',
    passReqToCallback: true
}, async (req ,name, password, done) => {
    console.log(req.body);
    if(!await this_category_exists(req,name)){
        const newDepartment=get_new_category(req);
        if(await addDatabase.add_product_category(newDepartment)){
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

function get_new_category(req){
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

async function this_category_exists(req,name){
    //get the id of the company
    const {id}=req.params;
    
    //we going to search this department in the list of the database
    var queryText = 'SELECT * FROM "Kitchen".product_department Where id_companies = $1 and name= $2';
    var values = [id,name];
    var companies=await database.query(queryText, values);
    return companies.rows.length>0;
}

//add supplies 
passport.use('local.add_supplies', new LocalStrategy({
    usernameField: 'name',
    passwordField: 'name',
    passReqToCallback: true
}, async (req ,name, password, done) => {
    var path_image=create_a_new_image(req);
    console.log(req.body);
    done(null,false,req.flash('success','the department was add with success'));
}));

//add branch
passport.use('local.add_branch', new LocalStrategy({
    usernameField: 'name',
    passwordField: 'name',
    passReqToCallback: true
}, async (req ,name, password, done) => {

    if(!await this_branch_exists(req,name)){
        const newBranch=get_new_branch(req);
        if(await addDatabase.add_branch(newBranch)){
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

function get_new_branch(req){
    //get the data of the new branch
    const {name,description} = req.body;
    const {id}=req.params;

    //add the branch
    const branch={
        id_company:id,
        name:name,
        description:description
    }  

    return branch;
}

async function this_branch_exists(req,name){
    //get the id of the company
    const {id}=req.params;
    
    //we going to search this department in the list of the database
    var queryText = 'SELECT * FROM "Company".branches Where id_companies = $1 and name_branch= $2';
    var values = [id,name];
    var companies=await database.query(queryText, values);
    return companies.rows.length>0;
}

//add supplies
router.post('/fud/:id/add-company-supplies',async (req,res)=>{
    const {id}=req.params;
    const newSupplies=get_supplies_or_product_company(req,true);
    if(await addDatabase.add_supplies_company(newSupplies)){
        req.flash('success','the supplies was add with success')
    }
    else{
        req.flash('message','the supplies not was add with success')
    }
    
    res.redirect('/fud/'+id+'/company-supplies');
});

router.post('/fud/:id/add-company-products',async (req,res)=>{
    const {id}=req.params;
    const newSupplies=get_supplies_or_product_company(req,false);
    if(await addDatabase.add_supplies_company(newSupplies)){
        req.flash('success','the product was add with success')
    }
    else{
        req.flash('message','the product not was add with success')
    }
    
    res.redirect('/fud/'+id+'/company-products');
});

function get_supplies_or_product_company(req,this_is_a_supplies){
    const {id}=req.params;
    const use_inventory= (req.body.inventory == 'on')
    const {barcode,name,description}=req.body
    const img=create_a_new_image(req)

    const supplies={
        id_company:id,
        img,
        barcode,
        name,
        description,
        use_inventory,
        this_is_a_supplies:this_is_a_supplies
    }

    return supplies;
}

//add combo
router.post('/fud/:id/add-company-combo',async (req,res)=>{
    const {id}=req.params;
    res.send(req.body);
    //res.redirect('/fud/'+id+'/combos');
});
module.exports=router;