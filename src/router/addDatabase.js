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
    var queryText = 'INSERT INTO Fud.users (user_name, name, email,password,birthday) VALUES ($1, $2, $3,$4,$5)';
    var values = [user.user_name,user.name,user.email,user.password,user.birthday] 
    await database.query(queryText,values);
}

async function add_company(company){
    var queryText = 'INSERT INTO "User".companies (id_users, path_logo, name,alias,description,representative,ceo,id_country,'
        +'phone,cell_phone,email,address,num_ext,num_int,postal_code,cologne,city,states,municipality)'
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

async function add_product_department(department){
    var queryText = 'INSERT INTO "Kitchen".product_department (id_companies, name, description)'
        +'VALUES ($1, $2, $3)';

    var values = [department.id_company,department.name,department.description] 
    try{
        await database.query(queryText, values);
        return true;
    } catch (error) {
        console.error('Error al insertar en la base de datos:', error);
        return false;
    }
};

async function add_product_category(department){
    var queryText = 'INSERT INTO "Kitchen".product_category (id_companies, name, description)'
        +'VALUES ($1, $2, $3)';

    var values = [department.id_company,department.name,department.description] 
    try{
        await database.query(queryText, values);
        return true;
    } catch (error) {
        console.error('Error al insertar en la base de datos:', error);
        return false;
    }
};

//////////////////////////////supplies 
async function add_supplies_company(supplies){
    if(await this_supplies_exists(supplies.id_company,supplies.barcode)){
        return false;
    }
    else{
        return await save_supplies_company(supplies)
    }
}

async function save_supplies_company(supplies){
    var queryText = 'INSERT INTO "Kitchen".products_and_supplies (id_companies, img, barcode, name, description, supplies, use_inventory)'
        +'VALUES ($1, $2, $3, $4, $5, $6, $7)';

    var values = [supplies.id_company,supplies.img,supplies.barcode,supplies.name,supplies.description,supplies.this_is_a_supplies,supplies.use_inventory] 

    try{
        await database.query(queryText, values);
        return true;
    } catch (error) {
        console.error('Error al insertar en la base de datos:', error);
        return false;
    }
}

async function search_supplies_company(id_company,barcode){
    //we will search the company of the user 
    var queryText = 'SELECT * FROM "Kitchen".products_and_supplies WHERE id_companies= $1 and barcode= $2';
    var values = [id_company,barcode];
    const result = await database.query(queryText, values);
    return result.rows;
}

async function this_supplies_exists(id_company,barcode){
    //we will search the company of the user 
    const supplies=await search_supplies_company(id_company,barcode);
    return supplies.length>0;
}

//////////////////////combos
async function add_combo_company(combo){
    if(await this_combo_exists(combo.id_company,combo.barcode)){
        return false;
    }
    else{
        //we save the new combo
        const idCombo=await save_combo_company(combo)
        if(idCombo!=null){
            //we going to save all the supplies and products of the combo
            return await save_all_supplies_combo_company(idCombo,combo.supplies)
        }

        return false;
    }
}

async function save_combo_company(combo) {
    var queryText = 'INSERT INTO "Kitchen".dishes_and_combos (id_companies, img, barcode, name, description) VALUES ($1, $2, $3, $4, $5) RETURNING id';

    var values = [combo.id_company, combo.path_image, combo.barcode, combo.name, combo.description];

    try {
        const result = await database.query(queryText, values);

        if (result.rowCount > 0) {
            const insertedId = result.rows[0].id;
            return insertedId;
        } else {
            console.error('No se insertaron filas en la base de datos.');
            return null;
        }
    } catch (error) {
        console.error('Error al insertar en la base de datos:', error);
        return null;
    }
}


async function save_all_supplies_combo_company(id_combo,supplies){
    try{
        //create a loop for get all the supplies and products of the combo
        for(var i=0;i<supplies.length;i++){
            //get the data of the supplies
            var data=supplies[i]
            await save_supplies_combo_company(id_combo,data); //save the data
        }

        return true;
    } catch (error) {
        console.error('Error al insertar en la base de datos combo:', error);
        return false;
    }
}

async function save_supplies_combo_company(id_dishes_and_combos,supplies){
    var queryText = 'INSERT INTO "Kitchen".table_supplies_combo (id_dishes_and_combos, id_products_and_supplies, amount, unity)'
        +'VALUES ($1, $2, $3, $4)';

    var values = [id_dishes_and_combos,supplies.idProduct,supplies.amount,get_unity(supplies.unity)] 

    try{
        await database.query(queryText, values);
        return true;
    } catch (error) {
        console.error('Error al insertar en la base de datos:', error);
        return false;
    }
}

function get_unity(unity){

    if(unity=='pza' || unity=='pza]'){
        return 0
    }
    if(unity=='kg' || unity=='kg]'){
        return 1
    }
    if(unity=='g' || unity=='g]'){
        return 2
    }
    if(unity=='l' || unity=='l]'){
        return 1
    }
    if(unity=='ml' || unity=='ml]'){
        return 2
    }
    return 3
}

async function search_component_company(id_company,barcode,schema,nameTable){
    //we will search the company of the user 
    var queryText = `SELECT * FROM "${schema}".${nameTable} WHERE id_companies = $1 AND barcode = $2`;
    var values = [id_company,barcode];
    const result = await database.query(queryText, values);
    return result.rows;
}

async function this_combo_exists(id_company,barcode){
    //we will search the company of the user 
    const supplies=await search_component_company(id_company,barcode,'Kitchen','dishes_and_combos');
    return calculate_components(supplies)
}

function calculate_components(data){
    return data.length>0;
}


//////////////////////branch
async function add_branch(branch){
    if(await this_branch_exists(branch.id_company,branch.name)){
        return false;
    }
    else{
        return await save_branch(branch)
    }
}

async function save_branch(branch){
    var queryText = 'INSERT INTO "Company".branches (id_companies,name_branch,alias,representative,phone,cell_phone,email,id_country,municipality,city,cologne,address,num_ext,num_int,postal_code)'
        +'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)';
    var values = Object.values(branch);
    console.log(values)
    try{
        await database.query(queryText, values);
        return true;
    } catch (error) {
        console.error('Error al insertar en la base de datos:', error);
        return false;
    }
}


async function this_branch_exists(id_company,name){
    //we will search the company of the user 
    var queryText = `SELECT * FROM "Company".branches WHERE id_companies = $1 AND name_branch = $2`;
    var values = [id_company,name];
    const result = await database.query(queryText, values);
    return result.rows.length>0;
}

//////////////////////customer
async function this_customer_exists(id_company,email){
    //we will search the company of the user 
    var queryText = `SELECT * FROM "Company".customers WHERE id_companies = $1 AND email = $2`;
    var values = [id_company,email];
    const result = await database.query(queryText, values);
    return result.rows.length>0;
}

async function save_customer(customer){
    var queryText = 'INSERT INTO "Company".customers(id_companies, first_name, second_name, last_name, id_country, states, city, street, num_ext, num_int, postal_code, email, phone, cell_phone, points, birthday)'
    +'VALUES ( $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)';
    var values = Object.values(customer);
    try{
        await database.query(queryText, values);
        return true;
    } catch (error) {
        console.error('Error al insertar en la base de datos customer:', error);
        return false;
    }
}


async function add_customer(customer){
    if(await this_customer_exists(customer.id_company,customer.email)){
        return false;
    }
    else{
        return await save_customer(customer)
    }
}
//department employees
async function this_department_employees_exists(department){
    //we will search the department employees of the user 
    var queryText = `SELECT * FROM "Employee".departments_employees WHERE id_companies = $1 AND name = $2`;
    var values = [department.id_company,department.name];
    const result = await database.query(queryText, values);
    return result.rows.length>0;
}

async function save_department_employees(department){
    var queryText = 'INSERT INTO "Employee".departments_employees(id_companies, name, description)'
    +'VALUES ( $1, $2, $3)';
    var values = Object.values(department);
    try{
        await database.query(queryText, values);
        return true;
    } catch (error) {
        console.error('Error al insertar en la base de datos customer:', error);
        return false;
    }
}


async function add_department_employees(department){
    if(await this_department_employees_exists(department)){
        return false;
    }
    else{
        return await save_department_employees(department)
    }
}
//////////////////////////////////////////////////
async function add_department(name,description){
    var queryText = 'INSERT INTO "Kitchen".product_department (id_company, name, description)'
        +'VALUES ($1, $2, $3)';

    var values = [name,description] 
    try{
        await database.query(queryText, values);
        return true;
    } catch (error) {
        console.error('Error al insertar en la base de datos:', error);
        return false;
    }
}

module.exports={
    add_company,
    add_product_department,
    add_product_category,
    add_branch,
    add_supplies_company,
    add_combo_company,
    save_all_supplies_combo_company,
    add_customer,
    add_department_employees
};