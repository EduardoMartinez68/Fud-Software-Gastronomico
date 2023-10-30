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

async function get_image(id){
    var queryText = 'SELECT * FROM companies Where  id= $1';
    var values = [id];
    const result = await database.query(queryText, values);
    return result.rows[0].path_logo;
}

async function get_data(req){
    const {id}=req.params;
    var id_user=parseInt(req.user.id);

    var queryText = 'SELECT * FROM products_dish_supplies Where id_company=$1';
    var values = [id];
    const result = await database.query(queryText, values);
    return result.rows[0];
}

async function check_company(req){
    const {id}=req.params;
    var queryText = 'SELECT * FROM companies WHERE id= $1 and id_user= $2';
    var values = [id,parseInt(req.user.id)];
    const result = await database.query(queryText, values);
    const company=result.rows;
    return company;
}

async function check_company_other(req){
    const {id_company}=req.params;
    var queryText = 'SELECT * FROM companies WHERE id= $1 and id_user= $2';
    var values = [id_company,parseInt(req.user.id)];
    const result = await database.query(queryText, values);
    const company=result.rows;
    return company;
}

async function get_department(req){
    const {id}=req.params;
    var queryText = 'SELECT * FROM product_department WHERE id_company= $1';
    var values = [id];
    const result = await database.query(queryText, values);
    const data=result.rows;
    return data;
}

async function get_category(req){
    const {id}=req.params;
    var queryText = 'SELECT * FROM product_category WHERE id_company= $1';
    var values = [id];
    const result = await database.query(queryText, values);
    const data=result.rows;
    return data;
}

async function get_data_company(req,nameTable){
    const {id}=req.params;
    var queryText = 'SELECT * FROM '+nameTable+' WHERE id_company= $1';
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
    const departments=await get_data_company(req,'product_department');
    const categories=await get_data_company(req,'product_category');
    res.render(companyName+'/manager/dish/addDish',{departments,categories});
});

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

async function delate_product_department(id){
    var queryText = 'DELETE FROM product_department WHERE id = $1';
    var values = [id];

    try {
        await database.query(queryText, values);
        return true;
    } catch (error) {
        console.error('Error al eliminar el registro en la base de datos:', error);
        return false;
    }
};

async function update_product_department(id, name, description) {
    var values = [name, description, id];
    var queryText = 'UPDATE product_department SET name = $1, description = $2 WHERE id = $3';

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
router.get('/add-employee',isLoggedIn,(req,res)=>{
    res.render(companyName+'/manager/employee/addEmployee');
})

router.get('/add-schedules',isLoggedIn,(req,res)=>{
    res.render(companyName+'/manager/employee/addSchedules');
})

router.get('/employee-schedules',isLoggedIn,(req,res)=>{
    res.render('links/manager/employee/employeeSchedules');
})


router.get('/home',isLoggedIn,async(req,res)=>{
    var queryText = 'SELECT * FROM companies Where id_user= $1';
    var values = [parseInt(req.user.id)];
    const result = await database.query(queryText, values);
    const companies=result.rows;
    res.render('links/manager/home',{companies});
});

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
    var queryText = 'DELETE FROM companies WHERE id= $1 and id_user= $2';
    var values = [id,parseInt(req.user.id)];
    const result = await database.query(queryText, values);
    res.redirect('/fud/home');
})

async function get_country(){
    const resultCountry = await database.query('SELECT * FROM country');
    return resultCountry.rows;
}

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
    var queryText = 'SELECT * FROM companies WHERE id= $1 and id_user= $2';
    var values = [id,parseInt(req.user.id)];
    const result = await database.query(queryText, values);
    
    return result;
}

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

router.get('/add-providers',isLoggedIn,(req,res)=>{
    res.render("links/manager/providers/addProviders");
})

router.get('/edit-providers',isLoggedIn,(req,res)=>{
    res.render("links/manager/providers/editProviders");
})

router.get('/providers',(req,res)=>{
    res.render("links/manager/providers/providers");
})

/*reports*/
router.get('/report-global',isLoggedIn,(req,res)=>{
    res.render("links/manager/reports/global");
})

router.get('/report-sales',isLoggedIn,(req,res)=>{
    res.render("links/manager/reports/sales");
})

module.exports=router;