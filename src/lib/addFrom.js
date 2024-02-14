const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy; 

const database=require('../database');
const helpers=require('../lib/helpers.js');
const addDatabase=require('../router/addDatabase');
const update=require('../router/updateDatabase');


const express=require('express');
const router=express.Router();
const {isLoggedIn,isNotLoggedIn}=require('../lib/auth');


const fs = require('fs');
const path = require('path');
async function delete_image_upload(pathImg){
    var pathImage=path.join(__dirname, '../public/img/uploads', pathImg);
    fs.unlink(pathImage, (error) => {
        if (error) {
          console.error('Error to delate image:', error);
        } else {
          console.log('Image delate success');
        }
      });
}

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
                done(null,false,req.flash('success','the company was add with success ❤️'));
            }
            else{
                done(null,false,req.flash('message','Could not add to database 😰'));
            }
        }
        else{
            done(null,false,req.flash('message','This name already exists 😅'));
        }
    }
    else{
        done(null,false,req.flash('message','You must fill in all the required information 👉👈'));
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
            done(null,false,req.flash('success','the department was add with success! 😊'));
        }
        else{
            done(null,false,req.flash('message','Could not add to database 😰'));
        }
    }
    else{
        done(null,false,req.flash('message','This department already exists 😅'));
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
            done(null,false,req.flash('success','the department was add with success! 😄'));
        }
        else{
            done(null,false,req.flash('message','Could not add to database 😰'));
        }
    }
    else{
        done(null,false,req.flash('message','This department already exists 👉👈'));
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
    done(null,false,req.flash('success','the department was add with success! 😄'));
}));

//add supplies
router.post('/fud/:id/add-company-supplies',async (req,res)=>{
    const {id}=req.params;
    const newSupplies=get_supplies_or_product_company(req,true);
    if(await addDatabase.add_supplies_company(newSupplies)){
        req.flash('success','the supplies was add with success! 👍')
    }
    else{
        req.flash('message','the supplies not was add with success 👉👈')
    }
    
    res.redirect('/fud/'+id+'/company-supplies');
});

router.post('/fud/:id/add-company-products',async (req,res)=>{
    const {id}=req.params;
    const newSupplies=get_supplies_or_product_company(req,false);
    if(await addDatabase.add_supplies_company(newSupplies)){
        req.flash('success','the product was add with success 👍')
    }
    else{
        req.flash('message','the product not was add with success 😅')
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
    const {barcodeProducts}=req.body;

    //we will see if the user add a product or supplies 
    if(barcodeProducts==''){
        req.flash('message','the combo need have a product or some supplies 😅')
        res.redirect('/fud/'+id+'/add-combos');
    }
    else{
        //get the new combo
        const combo=create_a_new_combo(req)

        //we will see if can add the combo to the database
        if(await addDatabase.add_combo_company(combo)){
            req.flash('success','the combo was add with success ❤️')
        }
        else{
            req.flash('message','the combo not was add 😳')
        }

        res.redirect('/fud/'+id+'/combos');
    }
});

function create_a_new_combo(req){
    const {barcode,name,description,barcodeProducts}=req.body;
    const {id}=req.params;

    const supplies=parse_barcode_products(barcodeProducts)
    var path_image=create_a_new_image(req);
    const combo={
        id_company: id,
        path_image,
        barcode,
        name,
        description,
        id_product_department:req.body.department,
        id_product_category:req.body.category,
        supplies
    }

    return combo;
}

function parse_barcode_products(barcodeProducts) {
    // Remove leading and trailing brackets if present
    barcodeProducts = barcodeProducts.trim().replace(/^\[|\]$/g, '');

    // Split the string by '],[' to get each object
    var objects = barcodeProducts.split('],[');

    // Create an array to store the resulting objects
    var result = [];

    // Iterate over the objects and build an array for each one
    for (var i = 0; i < objects.length; i++) {
        // Remove leading and trailing brackets for each object
        var objectData = objects[i].replace(/^\[|\]$/g, '');

        // Split the values of the object by ',' and convert them as needed
        var values = objectData.split(',');
        var idProduct = parseInt(values[0]);
        var amount = parseInt(values[1]);
        var unity = values[2].trim();
        unity=unity.replace("]", "");
        // Check if the values are valid before adding them to the result
        if (!isNaN(idProduct) && !isNaN(amount) && unity) {
            result.push({ idProduct: idProduct, amount: amount, unity: unity });
        }
    }
    console.log(result)
    return result;
}

//edit combo 
router.post('/fud/:id_company/:id/edit-combo-company',isLoggedIn,async(req,res)=>{
    const {id_company,id}=req.params;
    const {barcodeProducts}=req.body;

    //we will see if the user add a product or supplies 
    if(barcodeProducts==''){
        req.flash('message','the combo need have a product or some supplies 😅')
        res.redirect('/fud/'+id_company+'/'+id+'/edit-combo-company');
    }
    else{
        //get the new combo
        const combo=create_a_new_combo(req)

        //we will see if can add the combo to the database
        if(await update.update_combo(combo)){
            //we will delate all the supplies of the combo for to save it later
            await delete_all_supplies_combo(id)
            await addDatabase.save_all_supplies_combo_company(id,combo.supplies) //We will save all the supplies again
            req.flash('success','the combo was update with success ❤️')
        }
        else{
            req.flash('message','the combo not was add 😳')
        }
    }

    res.redirect('/fud/'+id_company+'/combos');
})

async function delete_all_supplies_combo(id) {
    try {
        var queryText = 'DELETE FROM "Kitchen".table_supplies_combo WHERE id_dishes_and_combos = $1';
        var values = [id];
        await database.query(queryText, values); // Delete combo
        return true;
    } catch (error) {
        console.error('Error al eliminar en la base de datos:', error);
        return false;
    }
}

//add providers
async function this_provider_exists(provider){
    //we will search the department employees of the user 
    var queryText = `SELECT * FROM "Branch".providers WHERE id_branches = $1 AND name = $2`;
    var values = [provider.branch,provider.name];
    const result = await database.query(queryText, values);
    return result.rows.length>1;
}

async function add_provider_to_database(provider,req){
    if(await addDatabase.add_provider_company(provider)){
        req.flash('success','the provider was add with supplies 😄')
    }
    else{
        req.flash('message','the provider not was add 😰')
    }
}

router.post('/fud/:id_company/add-providers',isLoggedIn,async(req,res)=>{
    const {id_company}=req.params;
    const provider=create_new_provider(req);
    if(await this_provider_exists(provider)){
        req.flash('message','This provider already exists in this branch 😅')
    }else{
        await add_provider_to_database(provider,req);
    }
    res.redirect('/fud/'+id_company+'/providers');
})

function create_new_provider(req){
    const {branch,name,representative,rfc,curp,phone,cell_phone,email,website,creditLimit,dayCredit,comment,category,type,businessName,businessRfc,businessCurp,businessRepresentative,businessPhone,businessCell_phone,postalCode,address}=req.body;
    const provider={
        branch:parseInt(branch),
        name,
        representative,
        email,
        website,
        rfc,
        curp,
        phone,
        cell_phone,
        creditLimit:convertCreditLimit(creditLimit),
        dayCredit:convertDayCredit(dayCredit),
        category,
        comment,
        type,
        businessName,
        businessRepresentative,
        businessRfc,
        businessCurp,
        businessPhone,
        businessCell_phone,
        address,
        postalCode,
    }
    return provider
}

function convertDayCredit(valorString) {
    // Intentar convertir la cadena a un número de punto flotante
    var numeroFloat = parseInt(valorString);
  
    // Verificar si el resultado es NaN y devolver 0 en ese caso
    if (isNaN(numeroFloat)) {
      return 0;
    }
  
    // Retornar el número de punto flotante convertido
    return numeroFloat;
  }

function convertCreditLimit(valorString) {
    // Intentar convertir la cadena a un número de punto flotante
    var numeroFloat = parseFloat(valorString);
  
    // Verificar si el resultado es NaN y devolver 0 en ese caso
    if (isNaN(numeroFloat)) {
      return 0;
    }
  
    // Retornar el número de punto flotante convertido
    return numeroFloat;
  }

router.post('/fud/:id_company/:id_branch/:id_provider/edit-providers',isLoggedIn,async(req,res)=>{
    const {id_company,id_provider,id_branch}=req.params;
    const provider=create_new_provider(req);
    //we will changing the id branch for knkow
    provider.branch=id_branch;
    if(await this_provider_exists(id_provider)){
        req.flash('message','This provider already exists in this branch 😅')
    }else{
        await update_provider_to_database(id_provider,provider,req);
    }

    res.redirect('/fud/'+id_company+'/providers');
})

async function update_provider_to_database(id_provider,provider,req){
    if(await update.update_provider_company(id_provider,provider)){
        req.flash('success','the provider was update with supplies 😁')
    }
    else{
        req.flash('message','the provider not was update 👉👈')
    }
}


//add branches
router.post('/fud/:id_company/add-new-branch',isLoggedIn,async(req,res)=>{
    const {id_company}=req.params;
    const newBranch=create_new_branch(req);
    if(await addDatabase.add_branch(newBranch)){
        req.flash('success','the branch was add with supplies ❤️')
    }
    else{
        req.flash('message','the branch not was add 👉👈')
    }
    res.redirect('/fud/'+id_company+'/branches');
})

router.post('/fud/:id_branch/:id_company/edit-branch',isLoggedIn,async(req,res)=>{
    const {id_company,id_branch}=req.params;
    const newBranch=create_new_branch(req);
    if(await update.update_branch(id_branch,newBranch)){
        req.flash('success','the branch was upload with supplies 😊')
    }
    else{
        req.flash('message','the branch not was upload 😰')
    }
    res.redirect('/fud/'+id_company+'/branches');
})

function create_new_branch(req){
    const {id_company}=req.params;
    const {name,alias,representative,phone,cell_phone,email,municipality,city,cologne,street,num_o,num_i,postal_code}=req.body;
    const newBranch={
        id_company:id_company,
        name,
        alias,
        representative,
        phone,
        cell_phone,
        email,
        country:req.body.country,
        municipality,
        city,
        cologne,
        street,
        num_o,
        num_i,
        postal_code
    }

    return newBranch;
}
//customer
router.post('/fud/:id_company/addCustomer',isLoggedIn,async(req,res)=>{
    const {id_company}=req.params;
    const newCustomer=create_new_customer(req);
    if(await addDatabase.add_customer(newCustomer)){
        req.flash('success','the customer was add with supplies')
    }
    else{
        req.flash('message','the customer not was add')
    }
    res.redirect('/fud/'+id_company+'/customers-company');
})

router.post('/fud/:id_company/:id_customer/editCustomer',isLoggedIn,async(req,res)=>{
    const {id_company,id_customer}=req.params;
    const newCustomer=create_new_customer(req);
    if(await update.update_customer(id_customer,newCustomer)){
        req.flash('success','the customer was upload with supplies ❤️')
    }
    else{
        req.flash('message','the customer not was upload 😰')
    }
    res.redirect('/fud/'+id_company+'/customers-company');
})

function create_new_customer(req){
    const {id_company}=req.params;
    const {firstName,secondName,lastName,cellPhone,phone,email,states,city,street,num_o,num_i,postal_code,birthday}=req.body
    const newCustomer={
        id_company,
        firstName,
        secondName,
        lastName,
        country:req.body.country,
        states,
        city,
        street,
        num_o,
        num_i,
        postal_code,
        email,
        phone,
        cellPhone,
        points:0,
        birthday
    }
    return newCustomer
}

//add role employee
router.post('/fud/:id_company/add-department-employees',isLoggedIn,async(req,res)=>{
    const {id_company}=req.params;
    const department=create_department_employee(req)
    if(await addDatabase.add_department_employees(department)){
        req.flash('success','the department was add with supplies 👍')
    }
    else{
        req.flash('message','the department not was add 😰')
    }
    res.redirect('/fud/'+id_company+'/employee-department');
})

function create_department_employee(req){
    const {id_company}=req.params;
    const {name,description}=req.body
    departament={
        id_company,
        name,
        description
    }
    return departament
}

//add type user
router.post('/fud/:id_company/add-type-employees',isLoggedIn,async(req,res)=>{
    const {id_company}=req.params;
    const {name}=req.body
    if(await this_type_employee_exist(id_company,name)){
        req.flash('message','the type employee not was add because this name already exists 😅')
    }
    else{
        const typeEmployees=create_type_employee(id_company,req)
        if(await addDatabase.add_type_employees(typeEmployees)){
            req.flash('success','the type employee was add with supplies 😄')
        }
        else{
            req.flash('message','the type employee not was add 😰')
        }
    }
    res.redirect('/fud/'+id_company+'/type-user');
})

async function this_type_employee_exist(idCompany,name){
    //we will search the department employees of the user 
    var queryText = `SELECT * FROM "Employee".roles_employees WHERE id_companies = $1 AND name_role = $2`;
    var values = [idCompany,name];
    const result = await database.query(queryText, values);
    return result.rows.length>0;
}

function create_type_employee(id_company,req){
    const {name,salary,discount,comissions}=req.body
    const currency=req.body.currency
    const typeSalary=req.body.typeSalary
    newTypeEmployee=[
        id_company,
        name,
        get_value_text(salary),
        currency,
        typeSalary,
        get_value_text(comissions),
        get_value_text(discount),

        watch_permission(req.body.addBox),
        watch_permission(req.body.editBox),
        watch_permission(req.body.deleteBox),
        watch_permission(req.body.createReservation),
        watch_permission(req.body.viewReservation),
        watch_permission(req.body.viewReports),

        watch_permission(req.body.addCustomer),
        watch_permission(req.body.editCustomer),
        watch_permission(req.body.deleteCustomer),
        watch_permission(req.body.cancelDebt),
        watch_permission(req.body.offerLoan),
        watch_permission(req.body.getFertilizer),
        watch_permission(req.body.viewCustomerCredits),
        watch_permission(req.body.sendEmail),

        watch_permission(req.body.addEmployee),
        watch_permission(req.body.editEmployee),
        watch_permission(req.body.deleteEmployee),
        watch_permission(req.body.createSchedule),
        watch_permission(req.body.assignSchedule),
        watch_permission(req.body.viewSchedule),
        watch_permission(req.body.createTypeUser),
        watch_permission(req.body.createEmployeeDepartment),
        watch_permission(req.body.viewSaleHistory),
        watch_permission(req.body.deleteSaleHistory),
        watch_permission(req.body.viewMovementHistory),
        watch_permission(req.body.deleteMovementHistory),

        watch_permission(req.body.viewSupplies),
        watch_permission(req.body.addSupplies),
        watch_permission(req.body.editSupplies),
        watch_permission(req.body.deleteSupplies),
        watch_permission(req.body.viewProducts),
        watch_permission(req.body.editProducts),
        watch_permission(req.body.deleteProducts),
        watch_permission(req.body.viewCombo),
        watch_permission(req.body.addCombo),
        watch_permission(req.body.editCombo),
        watch_permission(req.body.deleteCombo),
        watch_permission(req.body.viewFoodDepartament),
        watch_permission(req.body.addFoodDepartament),
        watch_permission(req.body.editFoodDepartament),
        watch_permission(req.body.deleteFoodDepartament),
        watch_permission(req.body.viewFoodCategory),
        watch_permission(req.body.addFoodCategory),
        watch_permission(req.body.editFoodCategory),
        watch_permission(req.body.deleteFoodCategory),
        watch_permission(req.body.wasteReport),
        watch_permission(req.body.addProvider),
        watch_permission(req.body.editProvider),
        watch_permission(req.body.deleteProvider),
        watch_permission(req.body.viewProvider),

        watch_permission(req.body.sell),
        watch_permission(req.body.applyDiscount),
        watch_permission(req.body.applyReturns),
        watch_permission(req.body.addOffers),
        watch_permission(req.body.editOffers),
        watch_permission(req.body.delateOffers),
        watch_permission(req.body.changeCoins),

        watch_permission(req.body.modifyHardware),
        watch_permission(req.body.modifyHardwareKitchen),
        watch_permission(req.body.givePermissions)
    ]
    return newTypeEmployee
}

function get_value_text(text){
    return isNaN(parseFloat(text)) ? 0 : parseFloat(text);
}

function watch_permission(permission){
    return permission == 'on' 
}

router.post('/fud/:id_company/:id_role/edit-role-employees',isLoggedIn,async(req,res)=>{
    //get the data of the form for that we know if this name exist in the company
    const {id_company,id_role}=req.params;
    const {name}=req.body

    //get the new data role of the employee and update the old role
    const typeEmployees=create_type_employee(id_company,req)
    if(await update.update_role_employee(id_role,typeEmployees)){
        req.flash('success','the role employee was update with supplies 😄')
    }
    else{
        req.flash('message','the role employee not was update 😅')
    }
    //refresh the web with the new role update
    res.redirect('/fud/'+id_company+'/type-user');
})

//add employees
router.post('/fud/:id_company/add-employees',isLoggedIn,async(req,res)=>{
    const {id_company}=req.params;
    const {email,username,password1,password2}=req.body
    //we will see if the email that the user would like to add exist 
    if(await this_email_exists(email)){
        req.flash('message','the employee not was add because this username already exists')
    }
    else{
        //we will see if the username that the user would like to add exist 
        if(await this_username_exists(username)){
            req.flash('message','the employee not was add because this username already exists 😅')
        }
        else{
            //we will watching if the password is correct 
            if(compare_password(password1,password2)){
                //we will to create a new user for next save in the database
                const user=await create_new_user(req)
                const idUser=await addDatabase.add_user(user,1) //add the new user and get the id of the employee
                
                //we will see if the user was add with success
                if(idUser!=null){
                    //we will to create the new employee and add to the database
                    const employee=create_new_employee(idUser,id_company,req)
                    if(await addDatabase.add_new_employees(employee)){
                        req.flash('success','the employee was add with supplies 🥳')
                    }
                    else{
                        /*
                        if the data of the employee not was add but the new user yes was create, we going to make the message of warning
                        for that the manager can edit the employee data in the screen of employees
                        */
                        await delete_user(idUser)
                        req.flash('message','the employee data not was add. Please you can edit the data and update the data 😅')
                    }
                }
                else{
                    req.flash('message','the employee not was add 😳')
                }
            }else{
                req.flash('message','the password was incorrect 😳')
            }
        }
    }
    res.redirect('/fud/'+id_company+'/employees');
})

async function delete_user(id){
    try {
        // Script para eliminar el usuario de la base de datos
        var queryText = 'DELETE FROM "Fud".users WHERE id=$1';
        var values = [id];
        const result = await database.query(queryText, values);
        return true;
    } catch(error) {
        console.log("delete user: " + error);
        return false;
    }
}


function compare_password(P1,P2){
    if (P1==''){
        return false;
    }

    return P1==P2;
}

async function this_email_exists(email){
    //we going to search this email in the list of the database
    var queryText = 'SELECT * FROM "Fud".users Where email = $1';
    var values = [email];
    var companies=await database.query(queryText, values);
    return companies.rows.length>0;
}

async function this_username_exists(username){
    //we going to search this email in the list of the database
    var queryText = 'SELECT * FROM "Fud".users Where user_name = $1';
    var values = [username];
    var companies=await database.query(queryText, values);
    return companies.rows.length>0;
}

async function create_new_user(req){
    const {user_name,email,first_name,second_name,last_name,password1}=req.body;
    const image=create_a_new_image(req)
    const new_user={
        image,
        user_name,
        first_name,
        second_name,
        last_name,
        email,
        password:password1
    }
    new_user.password=await helpers.encryptPassword(password1); //create a password encrypt
    return new_user;
}

function create_new_employee(id_user,id_company,req){
    const {phone,cell_phone,city,street,num_ext,num_int}=req.body;
    const id_role_employee=req.body.role_employee;
    const id_departament_employee=req.body.departament_employee;
    const id_branch=req.body.branch;
    const id_country=req.body.country;

    const new_employee={
        id_company,
        id_user,
        id_role_employee,
        id_departament_employee,
        id_branch,
        id_country,
        city,
        street,
        num_int,
        num_ext,
        phone,
        cell_phone
    }

    return new_employee;
}

router.post('/fud/:id_user/:id_company/:id_employee/edit-employees',isLoggedIn,async(req,res)=>{
    const {id_company,id_employee,id_user}=req.params;
    const {email,username}=req.body
    const newDataUser=new_data_user(req)
    const newDataEmployee=new_data_employee(req)

    //we will see if exist a new perfil photo 
    if(newDataUser.image!=""){
        //get the old direction of the imagen 
        const path_photo=await get_profile_picture(id_user)
        await delete_image_upload(path_photo)
    }

    if(await update.update_user(id_user,newDataUser)){
        if(await update.update_employee(id_user,newDataEmployee)){
            req.flash('success','the employee was update 🥳')
        }
        else{
            req.flash('message','the employee data not was update 😅')
        }
    }
    else{
        req.flash('message','the user data not was update 😅')
    }

    res.redirect('/fud/'+id_company+'/employees');
})

async function get_profile_picture(idUser){
    //we will search the user that the manager would like delete
    var queryText = 'SELECT photo FROM "Fud".users WHERE id= $1';
    var values = [idUser];
    const result = await database.query(queryText, values);
    if (result.rows.length > 0 && 'photo' in result.rows[0]) {
        return result.rows[0].photo;
    } else {
        return null;
    }
}

function new_data_user(req){
    const {user_name,email,first_name,second_name,last_name}=req.body;
    const image=create_a_new_image(req)
    const new_user={
        image,
        user_name,
        email,
        first_name,
        second_name,
        last_name,
        rol_user:1
    }

    return new_user;
}

function new_data_employee(req){
    const {phone,cell_phone,city,street,num_ext,num_int}=req.body;
    const id_role_employee=req.body.role_employee;
    const id_departament_employee=req.body.departament_employee;
    const id_branch=req.body.branch;
    const id_country=req.body.country;

    const new_employee={
        id_role_employee,
        id_departament_employee,
        id_branch,
        id_country,
        city,
        street,
        num_int,
        num_ext,
        phone,
        cell_phone
    }

    return new_employee;
}
//---------------------------------------------------------------------------------------------------------BRANCHES---------------------------------------------------------------
//edit supplies branch 
router.post('/fud/:id_company/:id_branch/:id_supplies/update-supplies-branch',isLoggedIn,async(req,res)=>{
    const {id_company,id_branch,id_supplies}=req.params;

    //we will creating the new supplies and we will saving the id of the supplies
    const supplies=create_supplies_branch(req,id_supplies);

    //we will watching if the supplies can update 
    if(await update.update_supplies_branch(supplies)){
        req.flash('success','the supplies was update with success 👍');
    }
    else{
        req.flash('message','the supplies not was update 👉👈');
    }

    res.redirect(`/fud/${id_company}/${id_branch}/supplies`);
})

function create_supplies_branch(req,id_supplies){
    const {purchase_amount, purchase_price, sale_amount, sale_price, max_inventory, minimum_inventory, existence}=req.body;
    const supplies = {
        purchase_amount:string_to_float(purchase_amount),
        purchase_unity: req.body.purchase_unity,
        purchase_price: string_to_float(purchase_price),
        currency_purchase:req.body.currency_purchase, 
        sale_amount: string_to_float(sale_amount),
        sale_unity: req.body.sale_unity,
        sale_price: string_to_float(sale_price),
        currency_sale:req.body.currency_sale,
        max_inventory: string_to_float(max_inventory),
        minimum_inventory: string_to_float(minimum_inventory),
        unit_inventory: req.body.unit_inventory,
        existence: string_to_float(existence),
        id_supplies:id_supplies,
    };

    return supplies;
}

function string_to_float(str) {
    let floatValue = parseFloat(str);
    return isNaN(floatValue) ? 0 : floatValue;
}

//add provider 
router.post('/fud/:id_company/:id_branch/add-providers',isLoggedIn,async(req,res)=>{
    const {id_company,id_branch}=req.params;
    const provider=create_new_provider(req);
    if(await this_provider_exists(provider)){
        req.flash('message','This provider already exists in this branch 😅')
    }else{
        await add_provider_to_database(provider,req);
    }
    res.redirect('/fud/'+id_company+'/'+id_branch+'/providers');
})
//edit products branch 
router.post('/fud/:id_company/:id_branch/:id_supplies/update-products-branch',isLoggedIn,async(req,res)=>{
    const {id_company,id_branch,id_supplies}=req.params;

    //we will creating the new product and we will saving the id of the supplies
    const product=create_supplies_branch(req,id_supplies);

    //we will watching if the product can update 
    if(await update.update_supplies_branch(product)){
        req.flash('success','the product was update with success 👍');
    }
    else{
        req.flash('message','the product not was update 👉👈');
    }

    res.redirect(`/fud/${id_company}/${id_branch}/product`);
})


router.post('/fud/:id_company/:id_branch/:id_provider/edit-providers-branch',isLoggedIn,async(req,res)=>{
    const {id_company,id_provider,id_branch}=req.params;
    const provider=create_new_provider(req);
    //we will changing the id branch for knkow
    provider.branch=id_branch;
    if(await this_provider_exists(provider)){
        req.flash('message','This provider already exists in this branch 😅')
    }else{
        await update_provider_to_database(id_provider,provider,req);
    }

    res.redirect('/fud/'+id_company+'/'+id_branch+'/providers');
})

router.post('/fud/:id_company/:id_branch/:id_combo/update-combo-branch',isLoggedIn,async(req,res)=>{
    const {id_company,id_combo,id_branch}=req.params;
    const provider=create_new_combo_branch(req);
    res.redirect('/fud/'+id_company+'/'+id_branch+'/combos');
})

function create_new_combo_branch(req){
    const {purchase_amount, purchase_price, sale_amount, sale_price, max_inventory, minimum_inventory, existence}=req.body;
}


module.exports=router;