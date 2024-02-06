const express=require('express');
const router=express.Router();

const database=require('../database');
const addDatabase=require('../router/addDatabase');
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
//
async function this_company_is_of_this_user(req,res){
    //get the id of the company
    const {id_company}=req.params;
    const company=await check_company_user(id_company,req); //search all the company of the user 

    //we will see if exist this company in the list of the user
    if(company.length>0){
        return company;
    }else{
        //if not exist we will to show a invasion message 
        req.flash('message','⚠️This company not is your⚠️');
        res.redirect('/fud/home');
    }
}

async function check_company_user(id_company,req){
    //we going to search all the company of the user with this id 
    var queryText = 'SELECT * FROM "User".companies WHERE id= $1 and id_users= $2';
    var values = [id_company,parseInt(req.user.id)];
    const result = await database.query(queryText, values);
    const company=result.rows;
    return company;
}



///links of the web
router.get('/identify',isNotLoggedIn,(req,res)=>{
    res.render(companyName+'/web/identify'); //this web is for return your user
})

router.get('/terms-and-conditions',(req,res)=>{
    res.render(companyName+'/web/terms_conditions');
})

router.get('/prices',(req,res)=>{
    res.render(companyName+'/web/prices');
})

router.get('/prices-chraracter',(req,res)=>{
    res.render(companyName+'/web/prices');
})

router.get('/main',isNotLoggedIn,(req,res)=>{
    res.render(companyName+'/web/main'); //this web is for return your user
})

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

//-----------------------------------------------------------------dish
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

//-------------------------------------------------------------------company
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

async function search_company_supplies_or_products_with_id_company(id_company,supplies){
    //we will search the company of the user 
    var queryText = 'SELECT * FROM "Kitchen".products_and_supplies WHERE id_companies= $1 and supplies= $2';
    var values = [id_company,supplies];
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
async function search_all_branch_company(idCompany){
    //we will search the company of the user 
    var queryText = 'SELECT * FROM "Company".branches WHERE id_companies= $1';
    var values = [idCompany];
    const result = await database.query(queryText, values);
    
    return result.rows;
}

async function search_providers(idBranch){
    //we will search the company of the user 
    //var queryText = 'SELECT * FROM "Branch".providers WHERE id_branches= $1';
    const queryText = `
    SELECT p.*, b.id_companies
    FROM "Branch".providers p
    JOIN "Company".branches b ON b.id = p.id_branches
    WHERE p.id_branches = $1;
  `;
    var values = [idBranch];
    const result = await database.query(queryText, values);
    
    return result.rows;
}

async function search_all_providers(id_company){
    const allBranch=await search_all_branch_company(id_company);
    const providers=[]

    //we will to read all the branch of the company for get his providers 
    for(var i=0;i<allBranch.length;i++){
        const branchId=allBranch[i].id //get the id of the branch that we are reading 
        const providersBranch=await search_providers(branchId) //search all providers in this branch

        //we will see if this branch have providers, if the branch have provider we will saving his providers in the array <providers>
        if(providersBranch.length>0){
            providers.push(providersBranch) //add all the providers of the branch
        }
    }

    return providers;
}

router.get('/:id_company/providers',isLoggedIn,async(req,res)=>{
    //we will see if the company is of the user 
    const company=await this_company_is_of_this_user(req,res)
    if(company!=null){
        //if this company is of the user, we will to search all the providers of tha company
        const {id_company}=req.params;
        const providers=await search_all_providers(id_company);
        
        //if the company not have providers render other view
        if(providers.length==0){
            res.render('links/manager/providers/providers',{company});
        }
        else{
            res.render('links/manager/providers/providers',{company,providers});
        }
    }
})

router.get('/:id_company/:name_provider/search-provider',isLoggedIn,async(req,res)=>{
    //we will see if the company is of the user 
    const company=await this_company_is_of_this_user(req,res)
    if(company!=null){
        //if this company is of the user, we will to search all the providers of tha company
        const {id_company,name_provider}=req.params;
        const providers=await search_all_providers_for_name(id_company,name_provider);
        //if the company not have providers render other view
        if(providers.length==0){
            res.render('links/manager/providers/providers',{company});
        }
        else{
            res.render('links/manager/providers/providers',{company,providers});
        }
    }
})

async function search_providers_for_name(idBranch,name_provider){
    //we will search the company of the user 
    //var queryText = 'SELECT * FROM "Branch".providers WHERE id_branches= $1';
    const queryText = `
    SELECT p.*, b.id_companies
    FROM "Branch".providers p
    JOIN "Company".branches b ON b.id = p.id_branches
    WHERE p.id_branches = $1 and p.name = $2;
  `;
    var values = [idBranch,name_provider];
    const result = await database.query(queryText, values);
    
    return result.rows;
}

async function search_all_providers_for_name(id_company,name_provider){
    const allBranch=await search_all_branch_company(id_company);
    const providers=[]

    //we will to read all the branch of the company for get his providers 
    for(var i=0;i<allBranch.length;i++){
        const branchId=allBranch[i].id //get the id of the branch that we are reading 
        const providersBranch=await search_providers_for_name(branchId,name_provider) //search all providers in this branch

        //we will see if this branch have providers, if the branch have provider we will saving his providers in the array <providers>
        if(providersBranch.length>0){
            providers.push(providersBranch) //add all the providers of the branch
        }
    }

    return providers;
}


router.get('/:id_company/add-providers',isLoggedIn,async(req,res)=>{
    const company=await this_company_is_of_this_user(req,res);
    if (company!=null){
        const {id_company}=req.params;
        const branches=await search_all_branch(id_company)
        res.render('links/manager/providers/addProviders',{company,branches});
    }
})

router.get('/:id_provider/edit-providers',isLoggedIn,async(req,res)=>{
    //if this company is of the user, we will to search the provider of tha company
    const {id_provider}=req.params;
    const provider=await search_provider(id_provider);
    res.render('links/manager/providers/editProviders',{provider});
})

router.get('/:id_company/:id_provider/edit-provider',isLoggedIn,async(req,res)=>{
    //we will see if the company is of the user 
    const company=await this_company_is_of_this_user(req,res)
    if(company!=null){
        //if this company is of the user, we will to search the provider of tha company
        const {id_provider}=req.params;
        const provider=await search_provider(id_provider);
        res.render('links/manager/providers/editProviders',{provider,company});
    }
})

async function search_provider(idProvider){
    const queryText = `
    SELECT p.*, b.id_companies
    FROM "Branch".providers p
    JOIN "Company".branches b ON b.id = p.id_branches
    WHERE p.id = $1;
  `;
    var values = [idProvider];
    const result = await database.query(queryText, values);

    return result.rows;
}

router.get('/:id_company/:id_provider/delete-provider',isLoggedIn,async(req,res)=>{
    //we will see if the company is of the user 
    const company=await this_company_is_of_this_user(req,res)
    if(company!=null){
        const {id_provider,id_company}=req.params;
        if(await delete_provider(id_provider)){
            req.flash('success','the combo was delate with success')
        }
        else{
            req.flash('message','the provider not was delate')
        }

        res.redirect('/fud/'+id_company+'/providers');
    }
})

async function delete_provider(idProvider){
    try {
        var queryText = 'DELETE FROM "Branch".providers WHERE id = $1';
        var values = [idProvider];
        await database.query(queryText, values); // Delete provider
        return true;
    } catch (error) {
        console.error('Error al eliminar en la base de datos:', error);
        return false;
    }
}
//----------------------------------------------------------------customers
async function searc_all_customers(idCompany){
    //we will search the company of the user 
    var queryText = 'SELECT * FROM "Company".customers WHERE id_companies= $1';
    var values = [idCompany];
    const result = await database.query(queryText, values);
    
    return result.rows;
}

async function searc_customers(idCustomer){
    //we will search the company of the user 
    var queryText = 'SELECT * FROM "Company".customers WHERE id= $1';
    var values = [idCustomer];
    const result = await database.query(queryText, values);
    
    return result.rows;
}


router.get('/:id/customers-company',isLoggedIn,async(req,res)=>{
    const {id}=req.params;
    const customers=await searc_all_customers(id)
    const country=await get_country()
    const company=[{id}]
    res.render("links/manager/customers/customers",{company,customers,country});
})

router.get('/:id/add-customer',isLoggedIn,async(req,res)=>{
    const {id}=req.params;
    const company=[{id}]
    const country=await get_country()
    res.render("links/manager/customers/addCustomer",{company,country});
})

router.get('/:id/:idCustomer/delete-customer',isLoggedIn,async(req,res)=>{
    const {idCustomer,id}=req.params;
    const company=await check_company(req);
    if(company.length>0){
        if(await delete_customer(idCustomer)){
            req.flash('success','the customer was delate with success')
        }else{
            req.flash('message','the customer not was delate')
        }
    }
    else{
        res.redirect('/fud/home');
    }

    res.redirect("/fud/"+id+'/customers-company');
})

async function delete_customer(idCustomer) {
    try {
        var queryText = 'DELETE FROM "Company".customers WHERE id = $1';
        var values = [idCustomer];
        await database.query(queryText, values); // Delete combo
        return true;
    } catch (error) {
        console.error('Error al eliminar en la base de datos:', error);
        return false;
    }
}

router.get('/:idCustomer/edit-customer',isLoggedIn,async(req,res)=>{
    const {idCustomer}=req.params;
    const country=await get_country()
    const customer=await searc_customers(idCustomer)
    res.render("links/manager/customers/editCustomer",{customer,country});
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

router.get('/:idBranch/:idCompany/edit-branch',isLoggedIn,async(req,res)=>{
    const country=await get_country();
    const branch=await get_branch(req);
    res.render("links/manager/branches/editBranches",{branch,country});
})


async function get_branch(req){
    const {idBranch}=req.params;
    var queryText = 'SELECT * FROM "Company".branches WHERE id= $1';
    var values = [idBranch];
    const result = await database.query(queryText, values);
    const data=result.rows;
    return data;
}

router.get('/:idBranch/:idCompany/delete-branch',isLoggedIn,async(req,res)=>{
    //we will see if this company is of the user 
    if(this_company_is_of_this_user(req,res)!=null){
        //get the data that the link have 
        const {idBranch,idCompany}=req.params;
        if(delete_branch_company(idBranch)){
            req.flash('success','the branch was delate with success');
        }
        else{
            req.flash('message','the branch not was delate');
        }

        res.redirect('/fud/'+idCompany+'/branches');
    }
})

async function delete_branch_company(idBranch) {
    try {
        var queryText = 'DELETE FROM "Company".branches WHERE id = $1';
        var values = [idBranch];
        await database.query(queryText, values); // Delete branch
        return true;
    } catch (error) {
        console.error('Error to delete branch:', error);
        return false;
    }
}

//-------------------------------------------------------------type user 
router.get('/:id/type-user',isLoggedIn,async(req,res)=>{
    const company=await check_company(req);
    if(company.length>0){
        const {id}=req.params;
        const typeEmployees=await get_type_employees(id)
        res.render('links/manager/role_type_employees/typeEmployees',{company,typeEmployees});
    }
    else{
        res.redirect('/fud/home');
    }
})

async function get_type_employees(idCompany){
    var queryText = 'SELECT * FROM "Employee".roles_employees WHERE id_companies= $1';
    var values = [idCompany];
    const result = await database.query(queryText, values);
    const data=result.rows;
    return data;
}

router.get('/:id/:idTypeEmployee/delete-role-user',isLoggedIn,async(req,res)=>{
    const company=await check_company(req);
    if(company.length>0){
        const {id,idTypeEmployee}=req.params;
        if(await delete_type_employee(idTypeEmployee)){
            req.flash('success','the role was delate with success')
        }else{
            req.flash('message','the role not was delate')
        }
        res.redirect('/fud/'+id+'/type-user');
    }
    else{
        res.redirect('/fud/home');
    }
})

async function delete_type_employee(idTypeEmployee) {
    try {
        var queryText = 'DELETE FROM "Employee".roles_employees WHERE id = $1';
        var values = [idTypeEmployee];
        await database.query(queryText, values); // Delete combo
        return true;
    } catch (error) {
        console.error('Error al eliminar en la base de datos:', error);
        return false;
    }
}

router.get('/:id/:idRoleEmployee/edit-role-user',isLoggedIn,async(req,res)=>{
    const company=await check_company(req);
    if(company.length>0){
        const {idRoleEmployee}=req.params;
        const roleEmployee=await get_data_tole_employees(idRoleEmployee)
        res.render('links/manager/role_type_employees/editRoleEmployee',{roleEmployee});
    }
    else{
        res.redirect('/fud/home');
    }
})

async function get_data_tole_employees(idRoleEmployee){
    var queryText = 'SELECT * FROM "Employee".roles_employees WHERE id= $1';
    var values = [idRoleEmployee];
    const result = await database.query(queryText, values);
    const data=result.rows;
    return data;
}
//-------------------------------------------------------------department user 
router.get('/:id/employee-department',isLoggedIn,async(req,res)=>{
    const company=await check_company(req);
    if(company.length>0){
        const {id}=req.params;
        const departments=await search_employee_departments(id);
        res.render('links/manager/role_type_employees/departmentEmployees',{company,departments});
    }
    else{
        res.redirect('/fud/home');
    }
})

async function search_employee_departments(idCompany){
    //we will search the company of the user 
    var queryText = 'SELECT * FROM "Employee".departments_employees WHERE id_companies= $1';
    var values = [idCompany];
    const result = await database.query(queryText, values);
    
    return result.rows;
}

router.get('/:id/:idDepartament/delete_departament',isLoggedIn,async(req,res)=>{
    const company=await check_company(req);
    const {id,idDepartament}=req.params;

    if(company.length>0){
        if(await delete_departament_employee(idDepartament)){
            req.flash('success','the department was delete with success')
        }
        else{
            req.flash('message','the department not was delete')
        }
    }
    else{
        res.redirect('/fud/home');
    }

    res.redirect('/fud/'+id+'/employee-department');
})

async function delete_departament_employee(idDepartament) {
    try {
        var queryText = 'DELETE FROM "Employee".departments_employees WHERE id = $1';
        var values = [idDepartament];
        await database.query(queryText, values); // Delete combo
        return true;
    } catch (error) {
        console.error('Error al eliminar en la base de datos:', error);
        return false;
    }
}

router.get('/:id/:idDepartament/:name/:description/edit-department-employee',isLoggedIn,async(req,res)=>{
    const company=await check_company(req);
    const {id}=req.params;

    if(company.length>0){
        const {idDepartament,name,description}=req.params;
        if(await update_department_employe(idDepartament,name,description)){
            req.flash('success','the department was update with success')
        }
        else{
            req.flash('message','the department not was update')
        }
    }
    else{
        res.redirect('/fud/home');
    }

    res.redirect('/fud/'+id+'/employee-department');
})

async function update_department_employe(idDepartament,name,description){
    try{
        var queryText = `UPDATE "Employee".departments_employees SET name_departaments = $1, description = $2 WHERE id = $3`;
        var values = [name, description,idDepartament];
        await database.query(queryText, values); // update supplies
        return true;
    }catch (error) {
        console.log(error)
        return false;
    }
}
//-------------------------------------------------------------employees 
router.get('/:id/employees',isLoggedIn,async(req,res)=>{
    const company=await check_company(req);
    if(company.length>0){
        const {id}=req.params;
        const employees=await search_employees(id);
        res.render('links/manager/employee/employee',{company,employees});
    }
    else{
        res.redirect('/fud/home');
    }
})

async function search_employees(idCompany){
        // Buscamos los empleados de la empresa con información adicional de otras tablas
        const queryText = `
            SELECT e.id, e.id_companies, e.id_users, e.id_roles_employees, e.id_departments_employees, e.id_branches, e.num_int, e.num_ext, e.city, e.street, e.phone, e.cell_phone,
                   u.*, r.*, d.*, b.*, c.*
            FROM "Company".employees e
            LEFT JOIN "Fud".users u ON e.id_users = u.id
            LEFT JOIN "Employee".roles_employees r ON e.id_roles_employees = r.id
            LEFT JOIN "Employee".departments_employees d ON e.id_departments_employees = d.id
            LEFT JOIN "Company".branches b ON e.id_branches = b.id
            LEFT JOIN "Fud".country c ON e.id_country = c.id
            WHERE e.id_companies = $1
        `;

        var values = [idCompany];
        const result = await database.query(queryText, values);

        return result.rows;
}


router.get('/:id/add-employee',isLoggedIn,async(req,res)=>{
    const company=await check_company(req);
    if(company.length>0){
        const {id}=req.params;
        const departments=await search_employee_departments(id);
        const country=await get_country()
        const roles=await get_type_employees(id)
        const branches=await search_all_branch(id)

        res.render('links/manager/employee/addEmployee',{company,roles,departments,country,branches});
    }
    else{
        res.redirect('/fud/home');
    }
})

//edit employee
router.get('/:id/:idEmployee/edit-employees',isLoggedIn,async(req,res)=>{
    const company=await check_company(req);
    if(company.length>0){
        const {idEmployee,id}=req.params;
        const employee=await search_employee(idEmployee);
        const departments=await search_employee_departments(id);
        const country=await get_country()
        const roles=await get_type_employees(id)
        const branches=await search_all_branch(id)
        console.log(employee)
        res.render('links/manager/employee/editEmployee',{employee,departments,country,roles,branches});
    }
    else{
        res.redirect('/fud/home');
    }
})

async function search_employee(idEmployee){
    // search the employee of the company with information about other table
    const queryText = `
        SELECT e.id, e.id_companies, e.id_users, e.id_roles_employees, e.id_departments_employees, e.id_branches, e.num_int, e.num_ext, e.id_country,e.city, e.street, e.phone, e.cell_phone,
               u.*, r.*, d.*, c.*
        FROM "Company".employees e
        LEFT JOIN "Fud".users u ON e.id_users = u.id
        LEFT JOIN "Employee".roles_employees r ON e.id_roles_employees = r.id
        LEFT JOIN "Employee".departments_employees d ON e.id_departments_employees = d.id
        LEFT JOIN "Fud".country c ON e.id_country = c.id
        WHERE e.id_users = $1
    `;
    var values = [idEmployee];
    const result = await database.query(queryText, values);

    return result.rows;
}

//delete employees
router.get('/:id_company/:idUser/delete-employee',isLoggedIn,async(req,res)=>{
    if (await this_company_is_of_this_user(req,res)){
        const {id_company}=req.params;
        const {idUser}=req.params;
        //first delete the image for not save trash in the our server
        await delete_profile_picture(idUser);

        //we going to delete the employee 
        if(await delete_employee(idUser)){
            //if the user is not deleted it doesn't really matter
            await delete_user(idUser);
            req.flash('success','the employee was delete');
        }
        else{
            req.flash('message','the employee not was delete');
        }

        res.redirect('/fud/'+id_company+'/employees');
    }
})

async function delete_profile_picture(idUser){
    //we will see if the user have a profile picture
    const pathImg=await get_profile_picture(idUser);
    //if esxit a image, we going to delete 
    if(pathImg!=null){
        delate_image_upload(pathImg)
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

async function delete_employee(idUser){
    try {
        var queryText = 'DELETE FROM "Company".Employees WHERE id_users = $1';
        var values = [idUser];
        await database.query(queryText, values); // Delete employee
        return true;
    } catch (error) {
        console.error('Error al eliminar en la base de datos:', error);
        return false;
    }
}

async function delete_user(idUser){
    try {
        var queryText = 'DELETE FROM "Fud".users WHERE id = $1';
        var values = [idUser];
        await database.query(queryText, values); // Delete employee
        return true;
    } catch (error) {
        console.error('Error al eliminar en la base de datos:', error);
        return false;
    }
}

//search employee
router.get('/:id_company/:id_user/employees',isLoggedIn,async(req,res)=>{
    const company=await this_company_is_of_this_user(req,res);
    if (company!=null){
        const {id_company,id_user}=req.params;
        const employees=await search_employees(id_company);
        const employee_user=await search_employee(id_user);
        console.log(company)
        res.render('links/manager/employee/employee',{company,employees,employee_user});
    }
})

//-----------------------------------------------------------visit branch

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

//-----------------------------------------------------------manager (visit branch)
async function get_data_branch(req){
    const {id_branch}=req.params;
    var queryText = 'SELECT * FROM "Company".branches WHERE id= $1';
    var values = [id_branch];
    const result = await database.query(queryText, values);
    const data=result.rows;
    return data;
}

router.get('/:id_company/:id_branch/visit-branch',isLoggedIn,async(req,res)=>{
    const branch=await get_data_branch(req)
    res.render('links/branch/home',{branch});
})


router.get('/:id_company/:id_branch/supplies',isLoggedIn,async(req,res)=>{
    const {id_branch}=req.params;
    const branch=await get_data_branch(req);
    const supplies_products=await get_supplies_features(id_branch)
    res.render('links/branch/supplies/supplies',{branch,supplies_products});
})

async function get_supplies_features(id_branch){
    var queryText = 'SELECT * FROM "Inventory".product_and_suppiles_features WHERE id_branches = $1';
    var values = [id_branch];
    const result = await database.query(queryText, values);
    const data=result.rows;
    return data;
}

router.get('/:id_company/:id_branch/recharge',isLoggedIn,async(req,res)=>{
    const {id_company,id_branch}=req.params;
    const company=await check_company_other(req);
    
    if(company.length>0){
        await update_supplies_branch(req,res)
    }
    res.redirect('/fud/'+id_company+'/'+id_branch+'/supplies');
})

async function update_supplies_branch(req,res){
    const {id_company,id_branch}=req.params;
    const suppliesNotSaved=''
    
    //we will geting all the supplies of the company 
    const supplies=await search_company_supplies_or_products_with_id_company(id_company,false);

    //we will to read all the supplies and we going to watch if the supplies is in the branch
    for(var i=0;i<supplies.length;i++){
        const idSupplies=supplies[i].id; //get id of the array 
        if(!await this_supplies_exist(idSupplies)){
            //if the supplies not exist in this branch, we going to add the database
            //we will watching if the product was add with success, if not was add, save in the note
            if(!await addDatabase.add_product_and_suppiles_features(id_branch,idSupplies)){
                suppliesNotSaved+=supplies[i].name+'\n';
            }
        }
    }

    //we will seeing if all the products was add 
    if(suppliesNotSaved==''){
        req.flash('success','All the supplies was update with success! 😄')
    }else{
        req.flash('message','⚠️ These products have not been updated! ⚠️\n'+suppliesNotSaved)
    }
}

async function this_supplies_exist(idSupplies){
    var queryText = 'SELECT * FROM "Inventory".product_and_suppiles_features WHERE id_products_and_supplies = $1';
    var values = [idSupplies];
    const result = await database.query(queryText, values);
    const data=result.rows;
    return data.length>0;
}

//-------------------------------------------------------------home
router.get('/home',isLoggedIn,async(req,res)=>{
    await home_render(req,res)
});

async function home_render(req,res){
    //CEO
    if(req.user.rol_user==0){
        await home_company(req,res)
    }
    else if(req.user.rol_user==1){ //Manager
        await home_employees(req,res)
    }
    else{
        await home_employees(req,res)
    }
}

async function home_employees(req,res){
    //we will search the company and branch where the user works
    const employee=await get_data_employee(req);
    const data=employee[0]
    const id_user=data.id_users
    const id_company=data.id_companies
    const id_branch=data.id_branches
    const id_employee=data.id
    const id_role=data.id_roles_employees
    
    const url = `/fud/${id_user}/${id_company}/${id_branch}/${id_employee}/${id_role}/store-home`;
    res.redirect(url)
}

async function get_data_employee(req){
    const id_user=req.user.id;
    var queryText = 'SELECT * FROM "Company"."employees" WHERE id_users= $1';
    var values = [id_user];
    const result = await database.query(queryText, values);
    const data=result.rows;
    return data;
}

async function home_company(req,res){
    var queryText = 'SELECT * FROM "User".companies Where id_users= $1';
    var values = [parseInt(req.user.id)];
    const result = await database.query(queryText, values);
    const companies=result.rows;
    res.render('links/manager/home',{companies});
}



router.get('/:id_user/:id_company/:id_branch/:id_employee/:id_role/store-home', isLoggedIn, async (req, res) => {
    if(await this_employee_works_here(req,res)){
        const {id_company,id_branch}=req.params;
        const dishAndCombo=await get_all_dish_and_combo(id_company,id_branch);
        res.render('links/store/home/home',{dishAndCombo});
    }
});

async function this_employee_works_here(req,res){
    const {id_user}=req.params;

    //first we will watching if the id of the user is equal to the id of the account.
    if (id_user==req.user.id){
        //we will watching if the employee data is of the user and work in this company 
        if(await this_data_employee_is_user(req)){
            return true;
        }
    }
    req.flash('message','⚠️ You are trying to access an account that does not belong to you! ⚠️')
    res.redirect('/fud/home');
}

async function this_data_employee_is_user(req){
    const employee=await get_data_employee(req);
    const data=employee[0]
    const id_user_employee=data.id_users
    const id_company_employee=data.id_companies
    const id_branch_employee=data.id_branches
    const id_employee_employee=data.id
    const id_role_employee=data.id_roles_employees

    const {id_company,id_branch,id_employee,id_role}=req.params;

    return (id_user_employee==req.user.id) && (id_company_employee==id_company) && (id_branch_employee==id_branch) && (id_employee_employee==id_employee) && (id_role_employee==id_role)
}

async function get_all_dish_and_combo(idCompany,idBranch){
    var queryText = `
        SELECT 
            i.*,
            d.barcode,
            d.name,
            d.description,
            d.img,
            d.id_product_department,
            d.id_product_category
        FROM "Inventory".dish_and_combo_features i
        INNER JOIN "Kitchen".dishes_and_combos d ON i.id_dishes_and_combos = d.id
        WHERE i.id_companies = $1 AND i.id_branches = $2
    `;
    var values = [idCompany,idBranch];
    const result = await database.query(queryText, values);
    const companies=result.rows;
}




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