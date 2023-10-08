const express=require('express');
const router=express.Router();

const database=require('../database');
const databaseM=require('../mongodb');
const {isLoggedIn,isNotLoggedIn}=require('../lib/auth');

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
    const company=await check_company(req);
    const saucers=await get_data(req);
    res.render(companyName+'/store/dish',{company,saucers});
})

router.get('/:id/add-dish',isLoggedIn,async (req,res)=>{
    //we need get all the Department and Category of the company
    const departments=await get_data_company(req,'product_department');
    const categories=await get_data_company(req,'product_category');
    res.render(companyName+'/manager/addDish',{departments,categories});
});


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
    res.render(companyName+'/manager/addEmployee');
})

router.get('/add-schedules',isLoggedIn,(req,res)=>{
    res.render(companyName+'/manager/addSchedules');
})

router.get('/employee-schedules',isLoggedIn,(req,res)=>{
    res.render('links/manager/employeeSchedules');
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
    res.render('links/manager/addCompanys',{country});
});


router.get('/:id/edit-company',isLoggedIn,async(req,res)=>{
    const country=await get_country();
    const company=await check_company(req);
    if(company.length>0){
        res.render('links/manager/editCompany',{company,country});
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
    const {id}=req.params;
    var queryText = 'SELECT * FROM companies WHERE id= $1 and id_user= $2';
    var values = [id,parseInt(req.user.id)];
    const result = await database.query(queryText, values);
    const company=result.rows;
    console.log(company);
    if(result.rows.length>0){
        res.render('links/manager/homeCompany',{company});
    }
    else{
        res.redirect('/fud/home');
    }
});

router.get('/:id/Dashboard',isLoggedIn,async(req,res)=>{
    const {id}=req.params;
    const sales_history=await databaseM.mongodb('history_sale',id,parseInt(req.user.id));
    res.render('links/manager/reports/dashboard',sales_history);
});



router.get('/report',isLoggedIn,(req,res)=>{
    res.render("links/manager/report");
})

router.get('/schedule',isLoggedIn,(req,res)=>{
    res.render("links/manager/schedule");
})

router.get('/add-providers',isLoggedIn,(req,res)=>{
    res.render("links/manager/addProviders");
})

router.get('/edit-providers',isLoggedIn,(req,res)=>{
    res.render("links/manager/editProviders");
})

router.get('/providers',(req,res)=>{
    res.render("links/manager/providers");
})

/*reports*/
router.get('/report-global',isLoggedIn,(req,res)=>{
    res.render("links/manager/reports/global");
})

router.get('/report-sales',isLoggedIn,(req,res)=>{
    res.render("links/manager/reports/sales");
})

module.exports=router;