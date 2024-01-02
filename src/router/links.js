const express=require('express');
const router=express.Router();

const database=require('../database');
const databaseM=require('../mongodb');
const {isLoggedIn,isNotLoggedIn}=require('../lib/auth');

//const delateDatabase=require('delateDatabase');

//delate image
const fs = require('fs');
const path = require('path');

async function delate_image(id){
    var image=await get_image(id);
    var pathImage=path.join(__dirname, '../public/img/uploads', image);
    console.log(pathImage);
    fs.unlink(pathImage, (error) => {
        if (error) {
          console.error('Error to delate image:', error);
        } else {
          console.log('Image delate success');
        }
      });
}

//this is a function for get the path of the image of a table
async function get_path_img(schema, table, id) {
    var queryText = `SELECT * FROM "${schema}".${table} WHERE id=$1`;
    var values = [id];
    
    try {
        const result = await database.query(queryText, values);
        return result.rows[0].img;
    } catch (error) {
        console.error('Error to search the path img:', error.message);
        throw error;
    }
}

//this function is for delate the image of the tabla of the file img/uploads
async function delate_image_upload(pathImg){
    var pathImage=path.join(__dirname, '../public/img/uploads', pathImg);
    console.log(pathImage);
    fs.unlink(pathImage, (error) => {
        if (error) {
          console.error('Error to delate image:', error);
        } else {
          console.log('Image delate success');
        }
      });
}

async function get_image(id){
    var queryText = 'SELECT * FROM "User".companies Where  id= $1';
    var values = [id];
    const result = await database.query(queryText, values);
    return result.rows[0].path_logo;
}

async function get_data(req){
    const {id}=req.params;
    var id_user=parseInt(req.user.id);

    var queryText = 'SELECT * FROM products_dish_supplies Where id_companies=$1';
    var values = [id];
    const result = await database.query(queryText, values);
    return result.rows[0];
}

async function get_country(){
    const resultCountry = await database.query('SELECT * FROM "Fud".country');
    return resultCountry.rows;
}

async function check_company(req){
    const {id}=req.params;
    var queryText = 'SELECT * FROM "User".companies WHERE id= $1 and id_users= $2';
    var values = [id,parseInt(req.user.id)];
    const result = await database.query(queryText, values);
    const company=result.rows;
    return company;
}

async function check_company_other(req){
    const {id_company}=req.params;
    var queryText = 'SELECT * FROM "User".companies WHERE id= $1 and id_users= $2';
    var values = [id_company,parseInt(req.user.id)];
    const result = await database.query(queryText, values);
    const company=result.rows;
    return company;
}

async function get_data_company(req,nameTable){
    const {id}=req.params;
    var queryText = 'SELECT * FROM "Company".'+nameTable+' WHERE id_companies= $1';
    var values = [id];
    const result = await database.query(queryText, values);
    const data=result.rows;
    return data;
}

const companyName='links'

///links of the web
router.get('/identify',isNotLoggedIn,(req,res)=>{
    res.render(companyName+'/web/identify'); //this web is for return your user
})

router.get('/terms-and-conditions',(req,res)=>{
    res.render(companyName+'/web/terms_conditions');
})

router.get('/:id/dish',isLoggedIn,async (req,res)=>{
    const company=await check_company(req); //req.company.rows; //
    const saucers=await get_data(req);
    console.log(req)
    res.render(companyName+'/store/dish',{company,saucers});
});

router.get('/:id/add-dish',isLoggedIn,async (req,res)=>{
    //we need get all the Department and Category of the company
    const company=await check_company(req);
    const departments=await get_data_company(req,'product_department');
    const categories=await get_data_company(req,'product_category');
    res.render(companyName+'/manager/dish/addDish',{company,departments,categories});
});

//----------------------------------------------------------------category
async function get_category(req){
    const {id}=req.params;
    var queryText = 'SELECT * FROM "Kitchen".product_category WHERE id_companies= $1';
    var values = [id];
    const result = await database.query(queryText, values);
    const data=result.rows;
    return data;
}

async function delate_product_category(id){
    var queryText = 'DELETE FROM "Kitchen".product_category WHERE id = $1';
    var values = [id];

    try {
        await database.query(queryText, values);
        return true;
    } catch (error) {
        console.error('Error al eliminar el registro en la base de datos:', error);
        return false;
    }
};

router.get('/:id/food-category',isLoggedIn,async (req,res)=>{
    const company=await check_company(req);
    const categories=await get_category(req);
    res.render(companyName+'/manager/areas/category',{company,categories})
});

router.get('/:id/add-category',isLoggedIn,async (req,res)=>{
    const company=await check_company(req);
    const saucers=await get_data(req);
    res.render(companyName+'/store/dish',{company,saucers});
});

router.get('/:id_company/:id/delate-food-category',isLoggedIn,async (req,res)=>{
    const company=await check_company_other(req);
    const {id,id_company}=req.params;

    //we will watch if the user have this company
    if(company.length>0){
        //we going to see if we can delate the department 
        if(await delate_product_category(id)){
            res.redirect('/fud/'+id_company+'/food-category');
        }
        else{
            res.redirect('/fud/home');
        }
    }
    else{
        res.redirect('/fud/home');
    }
});

router.get('/:id_company/:id/delate-food-category',isLoggedIn,async (req,res)=>{
    const company=await check_company_other(req);
    const {id,id_company}=req.params;

    //we will watch if the user have this company
    if(company.length>0){
        //we going to see if we can delate the department 
        if(await delate_product_category(id)){
            res.redirect('/fud/'+id_company+'/food-category');
        }
        else{
            res.redirect('/fud/home');
        }
    }
    else{
        res.redirect('/fud/home');
    }

});

router.get('/:id_company/:id/:name/:description/edit-food-category',isLoggedIn,async (req,res)=>{
    const company=await check_company_other(req);
    const {id_company,id,name,description}=req.params;

    //we will watch if the user have this company
    if(company.length>0){
        //we going to see if we can delate the department 
        if(await update_product_category(id,name,description)){
            res.redirect('/fud/'+id_company+'/food-category');
        }
        else{
            res.redirect('/fud/home');
        }
    }
    else{
        res.redirect('/fud/home');
    }

});

async function update_product_category(id, name, description) {
    var values = [name, description, id];
    var queryText = 'UPDATE "Kitchen".product_category SET name = $1, description = $2 WHERE id = $3';

    try {
        await database.query(queryText, values);
        return true;
    } catch (error) {
        console.error('Error al actualizar el registro en la base de datos:', error);
        return false;
    }
}

//----------------------------------------------------------------department
async function get_department(req){
    const {id}=req.params;
    var queryText = 'SELECT * FROM "Kitchen".product_department WHERE id_companies= $1';
    var values = [id];
    const result = await database.query(queryText, values);
    const data=result.rows;
    return data;
}

async function delate_product_department(id){
    var queryText = 'DELETE FROM "Kitchen".product_department WHERE id = $1';
    var values = [id];

    try {
        await database.query(queryText, values);
        return true;
    } catch (error) {
        console.error('Error al eliminar el registro en la base de datos:', error);
        return false;
    }
};

router.get('/:id/add-department',isLoggedIn,async (req,res)=>{
    const company=await check_company(req);
    const saucers=await get_data(req);
    res.render(companyName+'/store/dish',{company,saucers});
});

router.get('/:id/food-department',isLoggedIn,async (req,res)=>{
    const company=await check_company(req);
    const departments=await get_department(req);
    res.render(companyName+'/manager/areas/department',{company,departments})
});

router.get('/:id_company/:id/delate-food-department',isLoggedIn,async (req,res)=>{
    const company=await check_company_other(req);
    const {id,id_company}=req.params;

    //we will watch if the user have this company
    if(company.length>0){
        //we going to see if we can delate the department 
        if(await delate_product_department(id)){
            res.redirect('/fud/'+id_company+'/food-department');
        }
        else{
            res.redirect('/fud/home');
        }
    }
    else{
        res.redirect('/fud/home');
    }

});

router.get('/:id_company/:id/:name/:description/edit-food-department',isLoggedIn,async (req,res)=>{
    const company=await check_company_other(req);
    const {id_company,id,name,description}=req.params;

    //we will watch if the user have this company
    if(company.length>0){
        //we going to see if we can delate the department 
        if(await update_product_department(id,name,description)){
            res.redirect('/fud/'+id_company+'/food-department');
        }
        else{
            res.redirect('/fud/home');
        }
    }
    else{
        res.redirect('/fud/home');
    }

});

async function update_product_department(id, name, description) {
    var values = [name, description, id];
    var queryText = 'UPDATE "Kitchen".product_department SET name = $1, description = $2 WHERE id = $3';

    try {
        await database.query(queryText, values);
        return true;
    } catch (error) {
        console.error('Error al actualizar el registro en la base de datos:', error);
        return false;
    }
}



async function this_department_be(){
    return true;
}
///links of the store
router.get('/store',isLoggedIn,(req,res)=>{
    res.render(companyName+'/store/store');
})

router.get('/cart',isLoggedIn,(req,res)=>{
    res.render(companyName+'/store/cart');
})

router.get('/sales-history',isLoggedIn,(req,res)=>{
    res.render(companyName+'/store/salesHistory');
})

router.get('/reservation',isLoggedIn,(req,res)=>{
    res.render(companyName+'/store/reservation');
})

router.get('/other',isLoggedIn,(req,res)=>{
    res.render(companyName+'/store/other');
})

router.get('/recipes',isLoggedIn,(req,res)=>{
    res.render(companyName+'/store/recipes');
})


///links of the manager
router.get('/:id_company/:id/add-employee',isLoggedIn,(req,res)=>{
    res.render(companyName+'/manager/employee/addEmployee');
})

router.get('/:id_company/:id/add-schedules',isLoggedIn,(req,res)=>{
    res.render(companyName+'/manager/employee/addSchedules');
})

router.get('/:id_company/:id/employee-schedules',isLoggedIn,(req,res)=>{
    res.render('links/manager/employee/employeeSchedules');
})

//-------------------------------------------------------------------company
router.get('/home',isLoggedIn,async(req,res)=>{
    await home_render(req,res)
});


async function home_render(req,res){
    //CEO
    if(req.user.rol_user==0){
        await home_company(req,res)
    }
    else if(req.user.rol_user==1){ //Manager
        await home_company(req,res)
    }
    else{
        await home_employees(req,res)
    }
}

async function home_employees(req,res){
    res.redirect('/fud/store-home')
}

async function home_company(req,res){
    var queryText = 'SELECT * FROM "User".companies Where id_users= $1';
    var values = [parseInt(req.user.id)];
    const result = await database.query(queryText, values);
    const companies=result.rows;
    res.render('links/manager/home',{companies});
}


router.get('/add-company',isLoggedIn,async(req,res)=>{
    const country=await get_country();
    res.render('links/manager/company/addCompanys',{country});
});

router.get('/:id/edit-company',isLoggedIn,async(req,res)=>{
    const country=await get_country();
    const company=await check_company(req);
    if(company.length>0){
        res.render('links/manager/company/editCompany',{company,country});
    }
    else{
        res.redirect('/fud/home');
    }
});

router.get('/:id/delate-company',isLoggedIn,async(req,res)=>{
    const {id}=req.params;
    await delate_image(id);
    var queryText = 'DELETE FROM "User".companies WHERE id= $1 and id_users= $2';
    var values = [id,parseInt(req.user.id)];
    const result = await database.query(queryText, values);
    res.redirect('/fud/home');
})

router.get('/:id/company-home',isLoggedIn,async(req,res)=>{
    req.company=await search_the_company_of_the_user(req);

    if(the_user_have_this_company(req.company)){
        const company=req.company.rows;
        res.render('links/manager/company/homeCompany',{company});
    }
    else{
        res.redirect('/fud/home');
    }
});

function the_user_have_this_company(company){
    return company.rows.length>0;
}

async function search_the_company_of_the_user(req){
    //we will search the company of the user 
    const {id}=req.params;
    var queryText = 'SELECT * FROM "User".companies WHERE id= $1 and id_users= $2';
    var values = [id,parseInt(req.user.id)];
    const result = await database.query(queryText, values);
    
    return result;
}

//----------------------------------------------------------------supplies and products 
router.get('/:id/company-supplies',isLoggedIn,async(req,res)=>{
    const company=await check_company(req);
    const supplies_products=await search_company_supplies_or_products(req,true);
    if(company.length>0){
        res.render('links/manager/supplies_and_products/supplies',{supplies_products,company});
    }
    else{
        res.redirect('/fud/home');
    }
});

router.get('/:id/company-products',isLoggedIn,async(req,res)=>{
    const company=await check_company(req);
    const supplies_products=await search_company_supplies_or_products(req,false);
    if(company.length>0){
        res.render('links/manager/supplies_and_products/products',{supplies_products,company});
    }
    else{
        res.redirect('/fud/home');
    }
});


async function search_company_supplies_or_products(req,supplies){
    //we will search the company of the user 
    const {id}=req.params;
    var queryText = 'SELECT * FROM "Kitchen".products_and_supplies WHERE id_companies= $1 and supplies= $2';
    var values = [id,supplies];
    const result = await database.query(queryText, values);
    
    return result.rows;
}

async function search_company_supplies_or_products_with_company(id_company,supplies){
    //we will search the company of the user 
    var queryText = 'SELECT * FROM "Kitchen".products_and_supplies WHERE id_companies= $1 and supplies= $2';
    var values = [id_company,supplies];
    const result = await database.query(queryText, values);
    
    return result.rows;
}

async function this_is_a_supplies_or_a_products(id){
    //we will search the company of the user 
    var queryText = 'SELECT * FROM "Kitchen".products_and_supplies WHERE id= $1';
    const result = await database.query(queryText, [id]);
    
    return result.rows[0].supplies;
}

router.get('/:id_company/:id/delate-supplies-company',isLoggedIn,async(req,res)=>{
    const {id,id_company}=req.params;
    const pathOmg=await get_path_img('Kitchen','products_and_supplies',id)
    const thisIsASupplies=await this_is_a_supplies_or_a_products(id)

    if(await delate_supplies_company(id,pathOmg)){
        req.flash('success','the object was delate with success')
    }
    else{
        req.flash('message','the object not was delate')
    }

    if(thisIsASupplies){
        res.redirect('/fud/'+id_company+'/company-supplies');
    }
    else{
        res.redirect('/fud/'+id_company+'/company-products');
    }
})

async function delate_supplies_company(id,pathOmg){
    try{
        var queryText = 'DELETE FROM "Kitchen".products_and_supplies WHERE id=$1';
        var values = [id];
        await database.query(queryText, values); //delate supplies
        await delate_image_upload(pathOmg); //delate img
        return true;
    }catch (error) {
        return false;
    }
}

router.get('/:id_company/:id/:barcode/:name/:description/:useInventory/company-supplies',isLoggedIn,async(req,res)=>{
    const {id_company,id}=req.params;
    const newSupplies=get_new_data_supplies_company(req)
    const thisIsASupplies=await this_is_a_supplies_or_a_products(id)

    if(await update_supplies_company(newSupplies)){
        req.flash('success','the object was upload with success')
    }
    else{
        req.flash('message','the object not was upload with success')
    }

    if(thisIsASupplies){
        res.redirect('/fud/'+id_company+'/company-supplies');
    }
    else{
        res.redirect('/fud/'+id_company+'/company-products');
    }
});

function get_new_data_supplies_company(req){
    const {id,id_company,barcode,name,description,useInventory}=req.params;
    const newSupplies={
        id,
        id_company,
        barcode,
        name,
        description,
        use_inventory: (useInventory=='true')
    }
    return newSupplies;
}

async function update_supplies_company(newSupplies){
    try{
        var queryText = `UPDATE "Kitchen".products_and_supplies SET barcode = $1, name = $2, description = $3, 
        use_inventory = $4 WHERE id = $5`;
        var values = [newSupplies.barcode, newSupplies.name, newSupplies.description, newSupplies.use_inventory, newSupplies.id];
        await database.query(queryText, values); // update supplies
        return true;
    }catch (error) {
        console.log(error)
        return false;
    }
}

//----------------------------------------------------------------
async function get_data_tabla_with_id_company(id_company,schema,table){
    var queryText = `SELECT * FROM "${schema}".${table} WHERE id_companies= $1`;
    var values = [id_company];
    const result = await database.query(queryText, values);
    const data=result.rows;
    return data;
}

//----------------------------------------------------------------combos
router.get('/:id/combos',isLoggedIn,async(req,res)=>{
    const company=await check_company(req);
    if(company.length>0){
        const combos=await get_all_combos(req)
        res.render('links/manager/combo/combos',{company,combos});
    }
    else{
        res.redirect('/fud/home');
    }
})

async function get_all_combos(req){
    //we will search the company of the user 
    const {id}=req.params;
    var queryText = 'SELECT * FROM "Kitchen".dishes_and_combos WHERE id_companies= $1';
    var values = [id];
    const result = await database.query(queryText, values);
    
    return result.rows;
}

router.get('/:id/add-combos',isLoggedIn,async(req,res)=>{
    const company=await check_company(req);
    if(company.length>0){
        const departments=await get_department(req);
        const category=await get_category(req);
        const supplies=await search_company_supplies_or_products(req,true);
        const products=await search_company_supplies_or_products(req,false);
        const suppliesCombo=[]
        res.render('links/manager/combo/addCombo',{company,departments,category,supplies,products,suppliesCombo});
    }
    else{
        res.redirect('/fud/home');
    }
})


router.get('/:id_company/:id/edit-combo-company',isLoggedIn,async(req,res)=>{
    const {id,id_company}=req.params;
    const company=[{
            id:id_company,
            id_combo: id
        }]
    const departments=await get_data_tabla_with_id_company(id_company,"Kitchen","product_department");
    console.log(departments)
    const category=await get_data_tabla_with_id_company(id_company,"Kitchen","product_category");

    const supplies=await search_company_supplies_or_products_with_company(id_company,true);
    const products=await search_company_supplies_or_products_with_company(id_company,false);
    const suppliesCombo=await search_supplies_combo(req);
    const combo=await search_combo(req)
    res.render('links/manager/combo/editCombo',{company,departments,category,supplies,products,combo,suppliesCombo});
})

async function search_combo(req){
    //we will search the company of the user 
    const {id,id_company}=req.params;
    var queryText = 'SELECT * FROM "Kitchen".dishes_and_combos WHERE id_companies= $1 and id=$2';
    var values = [id_company,id];
    const result = await database.query(queryText, values);
    
    return result.rows; 
}

async function search_supplies_combo(req){
    const { id } = req.params;
    var queryText = `
        SELECT tsc.*, pas.name AS product_name, pas.barcode AS product_barcode
        FROM "Kitchen".table_supplies_combo tsc
        JOIN "Kitchen".products_and_supplies pas ON tsc.id_products_and_supplies = pas.id
        WHERE tsc.id_dishes_and_combos = $1
    `;
    var values = [id];
    const result = await database.query(queryText, values);
    return result.rows;
}


router.get('/:id_company/:id/delate-combo-company',isLoggedIn,async(req,res)=>{
    const {id,id_company}=req.params;
    const pathImg=await get_path_img('Kitchen','dishes_and_combos',id)
    if(await delate_combo_company(id,pathImg)){
        req.flash('success','the combo was delate with success')
    }
    else{
        req.flash('message','the combo not was delate')
    }

    res.redirect('/fud/'+id_company+'/combos');
})

async function delate_combo_company(id,pathImg){
    try{
        var queryText = 'DELETE FROM "Kitchen".dishes_and_combos WHERE id=$1';
        var values = [id];
        await delete_all_supplies_combo(id);
        await delate_image_upload(pathImg); //delate img
        await database.query(queryText, values); //delate combo
        return true;
    }catch (error) {
        return false;
    }
}

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

//----------------------------------------------------------------providers
async function search_providers_company(){
    //we will search the company of the user 
    var queryText = 'SELECT * FROM "Branch".providers WHERE id_branch= $1';
    var values = [id_company,supplies];
    const result = await database.query(queryText, values);
    
    return result.rows;
}

router.get('/:id/providers',isLoggedIn,async(req,res)=>{
    const company=await check_company(req);
    if(company.length>0){
        const providers=await search_providers();
        res.render('links/manager/providers/providers',{company});
    }
    else{
        res.redirect('/fud/home');
    }
})

router.get('/:id/add-providers',isLoggedIn,async(req,res)=>{
    const company=await check_company(req);
    if(company.length>0){
        res.render('links/manager/providers/addProviders',{company});
    }
    else{
        res.redirect('/fud/home');
    }
})

router.get('/:id/edit-providers',isLoggedIn,(req,res)=>{
    res.render("links/manager/providers/editProviders");
})



//----------------------------------------------------------------branches
async function search_all_branch(id_company){
    var queryText = `
        SELECT branches.*, country.name AS country_name
        FROM "Company".branches
        INNER JOIN "Fud".country ON branches.id_country = country.id
        WHERE branches.id_companies = $1`;
    
    var values = [id_company];
    const result = await database.query(queryText, values);

    return result.rows; 
}

router.get('/:id/branches',isLoggedIn,async(req,res)=>{
    const country=await get_country();
    const company=await check_company(req);
    if(company.length>0){
        const {id}=req.params;
        const branches=await search_all_branch(id);
        res.render('links/manager/branches/branches',{company,country,branches});
    }
    else{
        res.redirect('/fud/home');
    }
})

router.get('/:id/add-branches',isLoggedIn,async (req,res)=>{
    const country=await get_country();
    const company=await check_company(req);
    if(company.length>0){
        res.render('links/manager/branches/addBranches',{company,country});
    }
    else{
        res.redirect('/fud/home');
    }
})


router.get('/store-home',isLoggedIn,async (req,res)=>{
    res.render('links/store/home/home');
})



















router.get('/:id/Dashboard',isLoggedIn,async(req,res)=>{
    const {id}=req.params;
    const sales_history=await databaseM.mongodb('history_sale',id,parseInt(req.user.id));
    res.render('links/manager/reports/dashboard',sales_history);
});



router.get('/report',isLoggedIn,(req,res)=>{
    res.render("links/manager/reports/report");
})

router.get('/schedule',isLoggedIn,(req,res)=>{
    res.render("links/manager/employee/schedule");
})

/*reports*/
router.get('/report-global',isLoggedIn,(req,res)=>{
    res.render("links/manager/reports/global");
})

router.get('/report-sales',isLoggedIn,(req,res)=>{
    res.render("links/manager/reports/sales");
})

module.exports=router;