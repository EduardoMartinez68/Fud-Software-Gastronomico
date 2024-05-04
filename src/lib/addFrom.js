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

const printer=require('../lib/printer');

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
                done(null,false,req.flash('success','La empresa fue añadida con éxito ❤️'));
            }
            else{
                done(null,false,req.flash('message','La empresa no se pudo agregar a la base de datos 😰'));
            }
        }
        else{
            done(null,false,req.flash('message','Este nombre ya existe 😅'));
        }
    }
    else{
        done(null,false,req.flash('message','Debes completar toda la información requerida 👉👈'));
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

//edit company 
router.post('/fud/:id_company/edit-company', async (req, res) => {
    const {id_company}=req.params;
    const newCompany=get_new_company(req);
    if (await update.update_company(newCompany,id_company)){
        req.flash('success','La compañía fue actualizada con exito 💗')
        res.redirect('/fud/'+id_company+'/options');
    }else{
        req.flash('message','La compañía no fue actualizada 🥺')
        res.redirect('/fud/'+id_company+'/edit-company');
    }
});


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
            done(null,false,req.flash('success','El departamento fue agregado con éxito! 😊'));
        }
        else{
            done(null,false,req.flash('message','No se pudo agregar a la base de datos 😰'));
        }
    }
    else{
        done(null,false,req.flash('message','Este departamento ya existe 😅'));
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
            done(null,false,req.flash('success','El departamento fue agregado con éxito! 😄'));
        }
        else{
            done(null,false,req.flash('message','El departamento no fue agregado 😰'));
        }
    }
    else{
        done(null,false,req.flash('message','Este departamento ya existe en tu empresa 👉👈'));
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
    done(null,false,req.flash('success','El departamento fue agregado con éxito! 😄'));
}));

//add supplies
router.post('/fud/:id/add-company-supplies',async (req,res)=>{
    const {id}=req.params;
    const newSupplies=get_supplies_or_product_company(req,true);
    if(await addDatabase.add_supplies_company(newSupplies)){
        req.flash('success','El insumo fue actualizado con éxito! 👍')
    }
    else{
        req.flash('message','El insumo no fue actualizado con éxito 👉👈')
    }
    
    res.redirect('/fud/'+id+'/company-supplies');
});

router.post('/fud/:id/add-company-products',async (req,res)=>{
    const {id}=req.params;
    const newSupplies=get_supplies_or_product_company(req,false);
    if(await addDatabase.add_supplies_company(newSupplies)){
        req.flash('success','El producto fue actualizado con éxito 👍')
    }
    else{
        req.flash('message','El producto no fue actualizado 😅')
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
router.post('/fud/:id_company/add-company-combo',async (req,res)=>{
    const {id_company}=req.params;
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
            req.flash('success','El combo fue agregado con éxito ❤️')
        }
        else{
            req.flash('message','El combo no fue agregado con éxito 😳')
        }

        res.redirect('/fud/'+id_company+'/combos');
    }
});

function create_a_new_combo(req){
    const {barcode,name,description,barcodeProducts}=req.body;
    const {id_company}=req.params;

    const supplies=parse_barcode_products(barcodeProducts)
    console.log(supplies)
    var path_image=create_a_new_image(req);
    const combo={
        id_company: id_company,
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
        var idProduct = parseFloat(values[0]);
        var amount = parseFloat(values[1]);
        var foodWaste = parseFloat(values[2].trim());
        var unity = values[3].trim();
        unity=unity.replace("]", "");
        // Check if the values are valid before adding them to the result
        if (!isNaN(idProduct) && !isNaN(amount) && unity) {
            result.push({ idProduct: idProduct, amount: amount,foodWaste: foodWaste, unity: unity });
        }
    }
    console.log(result)
    return result;
}

//edit combo 
router.post('/fud/:id_company/:id_combo/edit-combo-company',isLoggedIn,async(req,res)=>{
    const {id_company,id_combo}=req.params;
    const {barcodeProducts}=req.body;
    console.log(req.body)
    //we will see if the user add a product or supplies 
    if(barcodeProducts==''){
        req.flash('message','El combo necesita tener un producto o algunos suministros 😅')
        res.redirect('/fud/'+id_company+'/'+id_combo+'/edit-combo-company');
    }
    else{
        
        //get the new combo
        const combo=create_a_new_combo(req)
        //we will see if can add the combo to the database
        if(await update.update_combo(id_combo,combo)){
            //we will delate all the supplies of the combo for to save it later
            await delete_all_supplies_combo(id_combo) //id
            await addDatabase.save_all_supplies_combo_company(id_combo,combo.supplies) //We will save all the supplies again
            req.flash('success','El combo fue actualizado con éxito ❤️')
        }
        else{
            req.flash('message','El combo no fue actualizado con éxito 😳')
        }

        res.redirect('/fud/'+id_company+'/combos');
    }
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
        req.flash('message','Este proveedor ya existe en esta sucursal 😅')
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
        req.flash('message','Este proveedor ya existe en esta sucursal 😅')
    }else{
        await update_provider_to_database(id_provider,provider,req);
    }

    res.redirect('/fud/'+id_company+'/providers');
})

async function update_provider_to_database(id_provider,provider,req){
    if(await update.update_provider_company(id_provider,provider)){
        req.flash('success','El proveedor fue actualizado con éxito 😁')
    }
    else{
        req.flash('message','El proveedor no fue actualizado con éxito 👉👈')
    }
}


//add branches
router.post('/fud/:id_company/add-new-branch',isLoggedIn,async(req,res)=>{
    const {id_company}=req.params;
    const {idSubscription}=req.body;

    //we will watching if this subscription exist in my database 
    if(await this_subscription_exist(idSubscription)){
        //if this subscription was used, show a message of error 
        req.flash('message','Esta suscripción ya fue utilizada 😮');
    }else{
        const newBranch=create_new_branch(req);
        const idBranch=await addDatabase.add_branch(newBranch); //get the ID branch that save in the database
        //console.log(idBranch)
        if(idBranch!=false){
            await save_the_id_branch_with_the_id_subscription(idSubscription,idBranch);
            req.flash('success','La sucursal fue actualizada con exito ❤️')
        }
        else{
            req.flash('message','La sucursal no fue agregada 👉👈')
        }
    }

    res.redirect('/fud/'+id_company+'/branches');
})

async function save_the_id_branch_with_the_id_subscription(idSubscription,idBranch){
    try {
        //this function is for save the branch with the subscription 
        const queryText = 'UPDATE "User".subscription SET id_branches = $1 WHERE id = $2';
        const values = [idBranch, idSubscription];
        await database.query(queryText, values); //update the status
        return true;
      } catch (error) {
        console.error('Error to update subscription branch:', error);
        return false;
      }
}

async function this_subscription_exist(idSubscription){
    try {
        //we going to know if this subscription is save in the database 
        const queryText = 'SELECT * FROM "User".subscription WHERE id = $1';
        const values = [idSubscription];
        const result = await database.query(queryText, values);
        return result.rows[0].id_branches!=null;
    } catch (error) {
        console.error('Error for know if exist the subscription:', error);
        return false;
    }
}

router.post('/fud/:id_branch/:id_company/edit-branch',isLoggedIn,async(req,res)=>{
    const {id_company,id_branch}=req.params;
    //we will watching if this subscription exist in my database 
    const {idSubscription}=req.body;
    if(!await this_subscription_exist_with_my_branch(idSubscription,id_branch)){
        //if this subscription was used, show a message of error 
        req.flash('message','Esta suscripción ya fue utilizada 😮');
    }
    else{
        //we will watching if can update the subscription
        if(await update.update_subscription_branch(idSubscription,id_branch)){
            const newBranch=create_new_branch(req);
            if(await update.update_branch(id_branch,newBranch)){
                req.flash('success','La sucursal fue actualizada con exito 😊')
            }
            else{
                req.flash('message','La sucursal no fue actualizada 😰')
            }
        }else{
            req.flash('message','Ocurrio un error con el servidor, vuelve a intentarlo 👉👈')
        }
    }
    res.redirect('/fud/'+id_company+'/branches');
})

async function this_subscription_exist_with_my_branch(idSubscription,id_branch){
    try {
        //we going to know if this subscription is save in the database 
        const queryText = 'SELECT * FROM "User".subscription WHERE id = $1';
        const values = [idSubscription];
        const result = await database.query(queryText, values);
        //we will watching if exist most data save the ID 
        if(result.rows.length > 1 ){
            return true;
        }else{
            return result.rows[0].id_branches==null || result.rows[0].id_branches==id_branch;
        }

    } catch (error) {
        console.error('Error for know if exist the subscription:', error);
        return false;
    }
}

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
    await update_employee(req,res);
    res.redirect('/fud/'+id_company+'/employees');
})

async function update_employee(req,res){
    const {id_company,id_employee,id_user}=req.params;
    const {email,username}=req.body
    const newDataUser=new_data_user(req)
    const newDataEmployee=new_data_employee(req)
    console.log(id_user)
    //we will see if exist a new perfil photo 
    if(newDataUser.image!=""){
        //get the old direction of the imagen 
        const path_photo=await get_profile_picture(id_user)
        //we will watching if the user haved a photo for delete
        if(path_photo!=null){
            await delete_image_upload(path_photo);
        }
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
}

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
    const combo=create_new_combo_branch(req,id_combo);
    if(await update.update_combo_branch(combo)){
        req.flash('success','The combo was update with success 😄');
    }else{
        req.flash('message','The combo not was update 😳');
    }

    res.redirect('/fud/'+id_company+'/'+id_branch+'/combos');
})

function create_new_combo_branch(req,id_combo){
    const {price1, revenue1, price2, revenue2, price3, revenue3, satKey}=req.body;
    const favorites= (req.body.favorites == 'on')
    combo={
        favorites, 
        price1:string_to_float(price1), 
        revenue1:string_to_float(revenue1),
        price2:string_to_float(price2), 
        revenue2:string_to_float(revenue2),
        price3:string_to_float(price3), 
        revenue3:string_to_float(revenue3), 
        satKey,
        id_combo:id_combo
    }
    return combo;
}

router.post('/fud/:id_user/:id_company/:id_branch/:id_employee/edit-employees',isLoggedIn,async(req,res)=>{
    const {id_company,id_branch}=req.params;
    await update_employee(req,res);
    res.redirect('/fud/'+id_company+'/'+id_branch+'/employees-branch');
})

router.post('/fud/:id_company/:id_branch/add-employees',isLoggedIn,async(req,res)=>{
    const {id_company,id_branch}=req.params;
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

    res.redirect('/fud/'+id_company+'/'+id_branch+'/employees-branch');
})


router.post('/fud/:id_company/:id_branch/add-box',isLoggedIn,async(req,res)=>{
    const {id_company,id_branch}=req.params;
    const {number,ipPrinter,ipBox}=req.body;

    //we will watching if this number of box exist in the branch 
    if(await this_box_exist_in_this_branch(id_branch,number)){
        req.flash('message','this box exist in the branch 👉👈')
    }else{
        //we will watching if can add the box to the database
        if(await addDatabase.add_box(id_branch,number,ipPrinter,ipBox)){
            req.flash('success','the box was add with supplies 🥳')
        }else{
            req.flash('message','the box not was add 😳')
        }
    }

    res.redirect('/fud/'+id_company+'/'+id_branch+'/box');
})

async function this_box_exist_in_this_branch(idBranch,numer){
    //we will search all the box that exist in the branch
    var queryText = 'SELECT * FROM "Branch".boxes WHERE id_branches= $1 and num_box=$2';
    var values = [idBranch,numer];
    const result = await database.query(queryText, values);
    return result.rows.length>0;
}

router.post('/fud/:id_company/:id_branch/ad-offer',isLoggedIn,async(req,res)=>{
    const {id_company,id_branch}=req.params;
    //we will to create the ad and save the image in the server
    const newAd=create_ad(req,id_branch,'offer'); 

    //we will watching if can save the ad in the database
    if(await addDatabase.add_ad(newAd)){
        req.flash('success','El anuncio fue agregado con exito 🥳')
    }else{
        req.flash('message','El anuncio no fue agregado 👉👈')
    }

    res.redirect('/fud/'+id_company+'/'+id_branch+'/ad');
})

router.post('/fud/:id_company/:id_branch/ad-new',isLoggedIn,async(req,res)=>{
    const {id_company,id_branch}=req.params;
    //we will to create the ad and save the image in the server
    const newAd=create_ad(req,id_branch,'new'); 

    //we will watching if can save the ad in the database
    if(await addDatabase.add_ad(newAd)){
        req.flash('success','El anuncio fue agregado con exito 🥳')
    }else{
        req.flash('message','El anuncio no fue agregado 👉👈')
    }

    res.redirect('/fud/'+id_company+'/'+id_branch+'/ad');
})

router.post('/fud/:id_company/:id_branch/ad-comboAd',isLoggedIn,async(req,res)=>{
    const {id_company,id_branch}=req.params;

    //we will to create the ad and save the image in the server
    const newAd=create_ad(req,id_branch,'combo'); 
    
    //we will watching if can save the ad in the database
    if(await addDatabase.add_ad(newAd)){
        req.flash('success','El anuncio fue agregado con exito 🥳')
    }else{
        req.flash('message','El anuncio no fue agregado 👉👈')
    }

    res.redirect('/fud/'+id_company+'/'+id_branch+'/ad');
})

router.post('/fud/:id_company/:id_branch/ad-specialAd',isLoggedIn,async(req,res)=>{
    const {id_company,id_branch}=req.params;

    //we will to create the ad and save the image in the server
    const newAd=create_ad(req,id_branch,'special'); 

    //we will watching if can save the ad in the database
    if(await addDatabase.add_ad(newAd)){
        req.flash('success','El anuncio fue agregado con exito 🥳')
    }else{
        req.flash('message','El anuncio no fue agregado 👉👈')
    }

    res.redirect('/fud/'+id_company+'/'+id_branch+'/ad');
})


function create_ad(req,id_branch,type){
    const image=create_a_new_image(req);
    const {name}=req.body; //get the name of the image 

    //we will watching if the user is creating an ad of combo or spacial
    if(name){
        const ad={
            id_branch,
            image,
            name:name,
            type
        }
    
        return ad;        
    }

    //else if the user not is creating an ad of combo or spacial, return the body norm 
    const ad={
        id_branch,
        image,
        name:'',
        type,
    }

    return ad;
}


router.post('/fud/:id_company/:id_branch/add-schedule',isLoggedIn,async(req,res)=>{
    const {id_company,id_branch}=req.params;
    //we will create the new schedule 
    const schedule=create_schedule(req,id_branch);

    //add the new schedule to the database
    if(await addDatabase.add_schedule(schedule)){
        req.flash('success','El horario fue agregado con exito 🥳');
    }else{
        req.flash('message','Ups! El horario no fue agregado 👉👈');
    }

    res.redirect('/fud/'+id_company+'/'+id_branch+'/schedules');
})

function create_schedule(req,id_branch){
    const { name_schedule, tolerance, color, ms, mf, ts, tf, ws, wf, ths, thf, fs, ff, sas, saf, sus, suf } = req.body;

    // Función para obtener el tiempo en formato adecuado
    function get_time_form(value1,value2) {
        return (value1 !== undefined && value1 !== null && value1 !== '') && (value2 !== undefined && value2 !== null && value2 !== '') ? value1 : '00:00';
    }

    // Crear el objeto schedule con las variables ajustadas
    const schedule = {
        id_branch,
        name_schedule: name_schedule,
        tolerance: tolerance,
        color: color,
        monda:is_valid_value(ms,mf),
        tuesday:is_valid_value(ts,tf),
        wedsney:is_valid_value(ws,wf),
        thuesday:is_valid_value(ths,thf),
        friday:is_valid_value(fs,ff),
        saturday:is_valid_value(sas,saf),
        sunday:is_valid_value(sus,suf),
        ms: get_time_form(ms,mf),
        mf: get_time_form(mf,ms),
        ts: get_time_form(ts,tf),
        tf: get_time_form(tf,ts),
        ws: get_time_form(ws,wf),
        wf: get_time_form(wf,ws),
        ths: get_time_form(ths,thf),
        thf: get_time_form(thf,ths),
        fs: get_time_form(fs,ff),
        ff: get_time_form(ff,fs),
        sas: get_time_form(sas,saf),
        saf: get_time_form(saf,sas),
        sus: get_time_form(sus,suf),
        suf: get_time_form(suf,sus)
    };

    return schedule;
}

function is_valid_value(value1, value2) {
    return (value1 ?? '') !== '' && (value2 ?? '') !== '';
}

router.post('/fud/:id_company/:id_branch/:id_schedule/edit-schedule',isLoggedIn,async(req,res)=>{
    const {id_company,id_branch,id_schedule}=req.params;
    //we will create the new schedule 
    const schedule=create_schedule(req,id_branch);

    //add the new schedule to the database
    if(await update_schedule_by_id(schedule,id_schedule)){
        req.flash('success','El horario fue actualizado con exito 🥳');
    }else{
        req.flash('message','Ups! El horario no fue actualizado 👉👈');
    }
    
    res.redirect('/fud/'+id_company+'/'+id_branch+'/schedules');
})

async function update_schedule_by_id(schedule, id) {
    try {
        const queryText = 'UPDATE "Employee".schedules SET id_branches = $1, name = $2, tolerance_time = $3, color = $4, monday = $5, tuesday = $6, wednesday = $7, thursday = $8, friday = $9, saturday = $10, sunday = $11, ms = $12, mf = $13, ts = $14, tf = $15, ws = $16, wf = $17, ths = $18, thf = $19, fs = $20, ff = $21, sas = $22, saf = $23, sus = $24, suf = $25 WHERE id = $26';
        var values = Object.values(schedule);
        values.push(id);
        await database.query(queryText, values);
        return true;
    } catch (error) {
        console.error('Error updating schedule:', error);
        return false;
    }
}

//------------------------------------------------------------------------------------------------cart
router.post('/fud/client',isLoggedIn,async(req,res)=>{
    try {
        //get the data of the server
        const email = req.body;
        var queryText = 'SELECT * FROM "Company".customers WHERE id_companies= $1 and email= $2';
        var values = [email[1],email[0]];
        const result = await database.query(queryText, values);
        console.log(result.rows[0])
        if(result.rows.length>0){
            const idCustomer=result.rows[0].id;
            const firstName=result.rows[0].first_name;
            const secondName=result.rows[0].second_name;
            const lastName=result.rows[0].last_name;
            const email=result.rows[0].email;
            res.status(200).json({ idCustomer,firstName,secondName,lastName,email});
        }else{
            res.status(200).json({ idCustomer: null});
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Hubo un error al procesar la solicitud' });
    }
})


router.post('/fud/:id_customer/car-post',isLoggedIn,async(req,res)=>{
    var commander=''
    var text=''
    try {
        //get the data of the server
        const combos = req.body;
        
        //we will seeing if can create all the combo of the car
        text=await watch_if_can_create_all_the_combo(combos);

        //if can buy this combos, we going to add this buy to the database 
        if(text=='success'){
            const {id_customer}=req.params;
            const id_employee=await get_id_employee(req.user.id);
            const day=new Date();

            //we will to save the data for create the commander
            var commanderDish=[]
            var idBranch=0;

            //we will read all the combos and save in the database 
            for(const combo of combos){
                const dataComboFeatures = await get_data_combo_features(combo.id); //get the data of the combo
                idBranch=dataComboFeatures.id_branches; //change the id branch for save the commander
                const dataComandera=create_data_commander(combo)
                commanderDish.push(dataComandera);

                //save the buy in the database 
                await addDatabase.add_buy_history(dataComboFeatures.id_companies, dataComboFeatures.id_branches, id_employee, id_customer, dataComboFeatures.id_dishes_and_combos,combo.price,combo.amount,combo.total,day);
            }

            //save the comander
            commander=create_commander(idBranch,id_employee,id_customer,commanderDish,combos[0].totalCar,combos[0].moneyReceived,combos[0].exchange,combos[0].comment,day)
    
            await addDatabase.add_commanders(commander);
        }

        //send an answer to the customer
        //res.status(200).json({ message: text});
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Hubo un error al procesar la solicitud' });
    }

    try{
        await printer.print_ticket(commander); //this is for print the ticket 
        res.status(200).json({ message: text});
    }catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'No podemos imprimir el ticket' });

    }
})

function create_data_commander(combo){
    const name=combo.name;
    const price=combo.price;
    const amount=combo.amount;
    const total=combo.total;
    return {name,price,amount,total}
}

function create_commander(id_branch,id_employee,id_customer,commanderDish,total,moneyReceived,change,comment,date){
    const commander={
        id_branch,
        id_employee,
        id_customer: id_customer === 'null' ? null : id_customer,
        commanderDish:JSON.stringify(commanderDish),
        total,
        moneyReceived,
        change,
        status:0,
        comment,
        date
    }
    return commander;
}

async function get_id_employee(idUser) {
    var queryText = 'SELECT id FROM "Company".employees WHERE id_users = $1';
    var values = [idUser];
    try {
        const result = await database.query(queryText, values);
        // Verificar si se obtuvo algún resultado
        if (result.rows.length > 0) {
            // Devolver el ID del empleado
            return result.rows[0].id;
        } else {
            console.error('No se encontró ningún empleado con el ID de usuario proporcionado.');
            return null; // O cualquier otro valor que indique que no se encontró el empleado
        }
    } catch (error) {
        console.error('Error al consultar la base de datos:', error);
        throw error; // Lanzar el error para que sea manejado en otro lugar si es necesario
    }
}

async function watch_if_can_create_all_the_combo(combos) {
    // Iterate through all the combos
    var arrayCombo=await get_all_supplies_of_the_combos(combos)
    var listSupplies=calculate_the_supplies_that_need(arrayCombo);

    //we will to calculate if have the supplies need for create all the combos that the customer would like eat
    const answer=await exist_the_supplies_need_for_creat_all_the_combos(listSupplies);
    if(answer==true){
        //if exist all the supplies, we update the inventory 
        for(const supplies of listSupplies){
            //get the data feature of the supplies and his existence 
            const dataSuppliesFeactures=await get_data_supplies_features(supplies.idBranch,supplies.idSupplies)
            const existence=dataSuppliesFeactures.existence;
            const newAmount=existence-supplies.amount; //calculate the new amount for update in the inventory
            await update_inventory(supplies.idBranch,supplies.idSupplies,newAmount);
        }
    }else{
        return 'not can create the combo becaus not exist enough '+answer;
    }

    // If cannot create the combo, send a message of warning
    return 'success';
}

async function exist_the_supplies_need_for_creat_all_the_combos(listSupplies){
    //we will to calculate if have the supplies need for create all the combos that the customer would like eat
    for(const supplies of listSupplies){
        if(!await exist_supplies_for_create_this_combo(supplies.idBranch,supplies.idSupplies,supplies.amount)){
            //if there are not enough supplies, we will send the supplies that need buy the restaurant 
            return supplies.name;
        }
    }   

    return true;
}

async function exist_supplies_for_create_this_combo(idBranch,idSupplies,amount){
    try{
        //we going to get the data that need for calculate if we can create the combo
        const dataSuppliesFeactures=await get_data_supplies_features(idBranch,idSupplies)
        const existence=dataSuppliesFeactures.existence;
        const minimumInventory=dataSuppliesFeactures.minimum_inventory;

        //we will calculate if can create the combo
        return (existence-amount>=0);
    }catch(error){
        return false;
    }
}

async function get_data_supplies_features(idBranch,idSupplies){
    const queryText = `
    SELECT 
        existence,
        minimum_inventory
    FROM "Inventory".product_and_suppiles_features
    WHERE id_branches = $1 and id_products_and_supplies=$2
    `;
    
    try {
        const result=await database.query(queryText, [idBranch,idSupplies]);
        return result.rows[0];
    } catch (error) {
        console.error('Error get data combo feactures car:', error);
        return false;
    }  
}

function calculate_the_supplies_that_need(arrayCombo){
    var listSupplies=[] //this list is for save all the supplies for that do not repeat

    //we will to read all the combos of the array 
    for(const combo of arrayCombo){
        //this for read all the supplies of the combo current
        for(const suppliesCombo of combo){
            //we will see if exist this supplies in our list of supplies not repeat 
            var thisSuppliesExistInMyList=false;
            for(const supplies of listSupplies){
                //if the supplies exist in our list, we will increase the amount of supplies we will use
                if(supplies.idSupplies==suppliesCombo.idSupplies){
                    thisSuppliesExistInMyList=true;

                    //we will to calculate the new amount of the supplies 
                    const newAmount=supplies.amount+suppliesCombo.amount;
                    supplies.amount=newAmount;
                    break;
                }
            }

            //if the supplies not exist we will add to the list 
            if(!thisSuppliesExistInMyList){
                listSupplies.push(suppliesCombo);
            }
        }
    }
    return listSupplies;
}

async function get_all_supplies_of_the_combos(combos){
    // Iterate through all the combos
    var arrayCombo=[]
    for (const combo of combos) {
        const amountCombo = combo.amount;
        const dataComboFeatures = await get_data_combo_features(combo.id);
        if (dataComboFeatures != null) {
            //get the supplies that need this combo for his creation
            const supplies = await get_all_supplies_this_combo(dataComboFeatures, amountCombo);
            
            arrayCombo.push(supplies)
        }
    }

    return arrayCombo;
}

async function get_all_supplies_this_combo(dataComboFeatures, amountCombo) {
    // Get the data of the combo to check if the inventory has the supplies to create the combo
    const idCombo = dataComboFeatures.id_dishes_and_combos;
    const idBranch = dataComboFeatures.id_branches;
    const dataSupplies = await get_all_price_supplies_branch(idCombo, idBranch);

    // first Iterate through all the supplies needed for this combo
    var arraySupplies=[] 
    for (const supplies of dataSupplies) {
        const name=supplies.product_name;
        const idSupplies = supplies.id_products_and_supplies;
        const amount = supplies.amount * amountCombo;
        arraySupplies.push({idBranch,name,idSupplies,amount});
    }

    return arraySupplies;
}

async function get_all_price_supplies_branch(idCombo, idBranch) {
    try {
        // Consulta para obtener los suministros de un combo específico
        const comboQuery = `
            SELECT tsc.id_products_and_supplies, tsc.amount, tsc.unity, psf.currency_sale
            FROM "Kitchen".table_supplies_combo tsc
            INNER JOIN "Inventory".product_and_suppiles_features psf
            ON tsc.id_products_and_supplies = psf.id_products_and_supplies
            WHERE tsc.id_dishes_and_combos = $1 ORDER BY id_products_and_supplies DESC
        `;
        const comboValues = [idCombo];
        const comboResult = await database.query(comboQuery, comboValues);

        // Consulta para obtener el precio de los suministros en la sucursal específica
        const priceQuery = `
            SELECT psf.id_products_and_supplies, psf.sale_price, psf.sale_unity
            FROM "Inventory".product_and_suppiles_features psf
            WHERE psf.id_branches = $1 ORDER BY id_products_and_supplies DESC
        `;
        const priceValues = [idBranch];
        const priceResult = await database.query(priceQuery, priceValues);

        // Construir un objeto que contenga los suministros y sus precios en la sucursal específica
        const suppliesWithPrice = {};
        priceResult.rows.forEach(row => {
            suppliesWithPrice[row.id_products_and_supplies] = row.sale_price;
        });

        // Agregar los suministros y sus cantidades del combo junto con sus precios
        const suppliesInfo = [];
        comboResult.rows.forEach(row => {
            const supplyId = row.id_products_and_supplies;
            const supplyPrice = suppliesWithPrice[supplyId] || 0; // Precio predeterminado si no se encuentra
            suppliesInfo.push({
                img:'',
                product_name:'',
                product_barcode:'',
                description:'',
                id_products_and_supplies: supplyId,
                amount: row.amount,
                unity: row.unity,
                sale_price: supplyPrice,
                currency: row.currency_sale
            });
        });

        //agregamos los datos del combo 
        const suppliesCombo=await search_supplies_combo(idCombo);
        for(var i=0;i<suppliesCombo.length;i++){
            suppliesInfo[i].img=suppliesCombo[i].img;
            suppliesInfo[i].product_name=suppliesCombo[i].product_name;
            suppliesInfo[i].product_barcode=suppliesCombo[i].product_barcode;
            suppliesInfo[i].description=suppliesCombo[i].description;
        }

        return suppliesInfo;
    } catch (error) {
        console.error("Error en la consulta:", error);
        throw error;
    }
}

async function update_inventory(idBranch,idCombo,newAmount){
    const queryText = `
    UPDATE "Inventory".product_and_suppiles_features
    SET 
        existence=$1
    WHERE 
        id_branches=$2 and id_products_and_supplies=$3
    `;
    
    //create the array of the new data supplies
    var values = [newAmount,idBranch,idCombo];

    //update the provider data in the database
    try {
        await database.query(queryText, values);
        return true;
    } catch (error) {
        console.error('Error updating provider:', error);
        return false;
    }
}


async function get_data_combo_features(idCombo){
    const queryText = `
    SELECT dc.name, df.id_companies, df.id_branches, df.id_dishes_and_combos
    FROM "Kitchen".dishes_and_combos dc
    INNER JOIN "Inventory".dish_and_combo_features df
    ON dc.id = df.id_dishes_and_combos
    WHERE df.id = $1;
    `;
    
    //update the provider data in the database
    try {
        const result=await database.query(queryText, [idCombo]);
        return result.rows[0];
    } catch (error) {
        console.error('Error get data combo feactures car:', error);
        return null;
    }  
}


async function search_supplies_combo(id_dishes_and_combos){
    var queryText = `
        SELECT tsc.*, pas.img AS img, pas.name AS product_name, pas.barcode AS product_barcode
        FROM "Kitchen".table_supplies_combo tsc
        JOIN "Kitchen".products_and_supplies pas ON tsc.id_products_and_supplies = pas.id
        WHERE tsc.id_dishes_and_combos = $1 ORDER BY id_products_and_supplies DESC
    `;
    var values = [id_dishes_and_combos];
    const result = await database.query(queryText, values);
    return result.rows;
}

router.post('/fud/:id_branch/:id_employee/:id_box/move',isLoggedIn,async(req,res)=>{
    try {
        //we will to add the information to the database 
        const move=create_move(req);
        console.log(move)
        const answer=await addDatabase.add_movement_history(move);

        // send an answer to the customer
        res.status(200).json({ message: answer});
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Hubo un error al procesar la solicitud' });
    }
})


function create_move(req){
    //get the data of the server
    const {id_branch,id_employee,id_box}=req.params;
    const data = req.body;
    const cash=data[0]
    const comment=data[1]
    const moveDtae=new Date();

    const move={
        id_branch,
        id_box,
        id_employee,
        cash,
        comment,
        moveDtae
    }

    return move;
}



module.exports=router;