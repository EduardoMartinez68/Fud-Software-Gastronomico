const express = require('express');
const router = express.Router();
const { isLoggedIn, isNotLoggedIn } = require('../../lib/auth');

//functions image
const {
    get_path_img,
    delate_image_upload,
    upload_image_to_space,
    delete_image_from_space,
    create_a_new_image,
    delate_image
} = require('../../services/connectionWithDatabaseImage');

//functions employees
const {
    search_employees,
    search_employees_branch,
    search_employee,
    delete_employee,
    search_employee_departments,
    get_country,
    get_type_employees
} = require('../../services/employees');

//functions branch
const {
    delete_branch_company,
    get_branch,
    search_all_branch
} = require('../../services/branch');

//functions supplies
const {
    get_supplies_or_features,
    get_supplies_with_id,
    update_supplies_company,
    get_new_data_supplies_company,
    delate_supplies_company,
    this_is_a_supplies_or_a_products,
    search_company_supplies_or_products_with_company,
    search_company_supplies_or_products_with_id_company,
    search_company_supplies_or_products,
    update_product_category
} = require('../../services/supplies');

//functions food department
const {
    get_department,
    delate_product_department,
    update_product_department,
    this_department_be
} = require('../../services/foodDepartment');

//functions food category
const {
    get_category,
    delate_product_category,
} = require('../../services/foodCategory');



//functions combos
const {
    get_all_combos,
    search_combo,
    search_supplies_combo,
    delate_combo_company,
    delete_all_supplies_combo
} = require('../../services/combos');

//functions providers
const {
    search_providers,
    search_all_providers,
    search_providers_for_name,
    search_all_providers_for_name,
    search_provider,
    delete_provider
} = require('../../services/providers');


//functions sales and move
const {
    get_sales_company,
    get_movements_company,
    get_sales_data,
    get_sales_company_for_day,
    get_sales_data_day,
    get_sales_company_for_month,
    get_sales_company_for_year,
    get_movements_company_positive,
    calculate_sale_increase,
    get_total_company,
    get_total_month_old,
    get_total_month,
    get_total_year_old,
    get_total_year,
    get_total_unity_company,
    get_total_day_old,
    get_total_sales_company,
    get_data_distribute_company_year,
    get_data_distribute_company_month,
    get_data_distribute_company_day,
    get_data_distribute_company,
    get_sales_total_by_combo_month,
    get_sales_total_by_combo_year,
    get_sales_total_by_combo_today,
    get_sales_total_by_combo,
    get_sale_branch_year,
    get_sale_branch_month,
    get_sale_branch_today,
    get_sale_branch,
    get_movements_company_negative,
    get_branchIds_by_company
} = require('../../services/sales_and_move');

//functions sales and move
const {
    check_company,
    check_company_other,
} = require('../../services/company');


const rolFree=0
//-------------------------------------------------------------------company
router.get('/:id/company-home', isLoggedIn, async (req, res) => {
    req.company = await search_the_company_of_the_user(req);

    if (the_user_have_this_company(req.company)) {
        const company = req.company.rows;
        res.render('links/manager/company/homeCompany', { company });
    }
    else {
        res.redirect('/fud/home');
    }
});

router.get('/add-company', isLoggedIn, async (req, res) => {
    const country = await get_country();
    res.render('links/manager/company/addCompanys', { country });
});

router.get('/:id/edit-company', isLoggedIn, async (req, res) => {
    const country = await get_country();
    const company = await check_company(req);
    if (company.length > 0) {
        res.render('links/manager/company/editCompany', { company, country });
    }
    else {
        res.redirect('/fud/home');
    }
});

router.get('/:id_company/delete-company', isLoggedIn, async (req, res) => {
    const { id_company } = req.params;
    await delate_image(id_company);
    if(await delete_my_company(id_company,req)){
        req.flash('success', 'Tu compañía fueron eliminada con éxito 👍')
    }else{
        req.flash('message', 'La empresa no fueron borrada correctamente 👉👈')
    }
    res.redirect('/fud/home');
})

//-------------------------------------------------------------employees
router.get('/:id_company/:id_user/employees', isLoggedIn, async (req, res) => {
    const company = await this_company_is_of_this_user(req, res);
    if (company != null) {
        const { id_company, id_user } = req.params;
        const employees = await search_employees(id_company);
        const employee_user = await search_employee(id_user);
        res.render('links/manager/employee/employee', { company, employees, employee_user });
    }
})

router.get('/:id/employees', isLoggedIn, async (req, res) => {
    const company = await check_company(req);
    if (company.length > 0) {
        const { id } = req.params;
        const employees = await search_employees(id);
        res.render('links/manager/employee/employee', { company, employees });
    }
    else {
        res.redirect('/fud/home');
    }
})

router.get('/:id/add-employee', isLoggedIn, async (req, res) => {
    const company = await check_company(req);
    if (company.length > 0) {
        const { id } = req.params;
        const departments = await search_employee_departments(id);
        const country = await get_country()
        const roles = await get_type_employees(id)
        const branches = await search_all_branch(id)

        res.render('links/manager/employee/addEmployee', { company, roles, departments, country, branches });
    }
    else {
        res.redirect('/fud/home');
    }
})

router.get('/:id/:idEmployee/edit-employees', isLoggedIn, async (req, res) => {
    const company = await check_company(req);
    if (company.length > 0) {
        const { idEmployee, id } = req.params;
        const employee = await search_employee(idEmployee);
        const departments = await search_employee_departments(id);
        const country = await get_country()
        const roles = await get_type_employees(id)
        const branches = await search_all_branch(id)

        //we will see if the suscription is for a branch free
        if(req.user.rol_user==rolFree){
            const branchFree = await get_data_branch(req);
            res.render('links/manager/employee/editEmployee', { employee, departments, country, roles, branchFree, company });          
        }else{
            const branch = await get_data_branch(req);
            res.render('links/manager/employee/editEmployee', { employee, departments, country, roles, branches, company });
        }
    }
    else {
        res.redirect('/fud/home');
    }
})


router.get('/:id_company/:idUser/delete-employee', isLoggedIn, async (req, res) => {
    if (await this_company_is_of_this_user(req, res)) {
        const { id_company } = req.params;
        const { idUser } = req.params;
        //first delete the image for not save trash in the our server
        await delete_profile_picture(idUser);

        //we going to delete the employee 
        if (await delete_employee(idUser)) {
            //if the user is not deleted it doesn't really matter
            await delete_user(idUser);
            req.flash('success', 'El empleado fue eliminado 👍');
        }
        else {
            req.flash('message', 'El empleado no fue eliminado 👉👈');
        }

        res.redirect('/fud/' + id_company + '/employees');
    }
})

async function delete_profile_picture(idUser) {
    //we will see if the user have a profile picture
    const pathImg = await get_profile_picture(idUser);
    //if esxit a image, we going to delete 
    if (pathImg != null) {
        delate_image_upload(pathImg)
    }
}

async function get_profile_picture(idUser) {
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

async function delete_user(idUser) {
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

//-------------------------------------------------------------type user 
router.get('/:id/type-user', isLoggedIn, async (req, res) => {
    const company = await check_company(req);
    if (company.length > 0) {
        const { id } = req.params;
        const typeEmployees = await get_type_employees(id)
        res.render('links/manager/role_type_employees/typeEmployees', { company, typeEmployees });
    }
    else {
        res.redirect('/fud/home');
    }
})

router.get('/:id/:idTypeEmployee/delete-role-user', isLoggedIn, async (req, res) => {
    const company = await check_company(req);
    if (company.length > 0) {
        const { id, idTypeEmployee } = req.params;
        if (await delete_type_employee(idTypeEmployee)) {
            req.flash('success', 'El rol fue eliminado con éxito 🗑️')
        } else {
            req.flash('message', 'El rol no fue eliminado con éxito 😮')
        }
        res.redirect('/fud/' + id + '/type-user');
    }
    else {
        res.redirect('/fud/home');
    }
})


router.get('/:id/:idRoleEmployee/edit-role-user', isLoggedIn, async (req, res) => {
    const company = await check_company(req);
    if (company.length > 0) {
        const { idRoleEmployee } = req.params;
        const roleEmployee = await get_data_tole_employees(idRoleEmployee)
        res.render('links/manager/role_type_employees/editRoleEmployee', { roleEmployee });
    }
    else {
        res.redirect('/fud/home');
    }
})

//-------------------------------------------------------------department user get_country
router.get('/:id/employee-department', isLoggedIn, async (req, res) => {
    const company = await check_company(req);
    if (company.length > 0) {
        const { id } = req.params;
        const departments = await search_employee_departments(id);
        res.render('links/manager/role_type_employees/departmentEmployees', { company, departments });
    }
    else {
        res.redirect('/fud/home');
    }
})

router.get('/:id/:idDepartament/delete_departament', isLoggedIn, async (req, res) => {
    const company = await check_company(req);
    const { id, idDepartament } = req.params;

    if (company.length > 0) {
        if (await delete_departament_employee(idDepartament)) {
            req.flash('success', '"El departamento fue eliminado con éxito 😊')
        }
        else {
            req.flash('message', 'El departamento no fue eliminado 😮')
        }
    }
    else {
        res.redirect('/fud/home');
    }

    res.redirect('/fud/' + id + '/employee-department');
})

router.get('/:id/:idDepartament/:name/:description/edit-department-employee', isLoggedIn, async (req, res) => {
    const company = await check_company(req);
    const { id } = req.params;

    if (company.length > 0) {
        const { idDepartament, name, description } = req.params;
        if (await update_department_employe(idDepartament, name, description)) {
            req.flash('success', 'El departamento fue actualizado con éxito 🚀')
        }
        else {
            req.flash('message', 'El departamento no fue actualizado 😅')
        }
    }
    else {
        res.redirect('/fud/home');
    }

    res.redirect('/fud/' + id + '/employee-department');
})

//----------------------------------------------------------------supplies and products 
router.get('/:id/company-supplies', isLoggedIn, async (req, res) => {
    const company = await check_company(req);
    const supplies_products = await search_company_supplies_or_products(req, true);
    if (company.length > 0) {
        res.render('links/manager/supplies_and_products/supplies', { supplies_products, company });
    }
    else {
        res.redirect('/fud/home');
    }
});

router.get('/:id/company-products', isLoggedIn, async (req, res) => {
    const company = await check_company(req);
    const supplies_products = await search_company_supplies_or_products(req, false);
    if (company.length > 0) {
        res.render('links/manager/supplies_and_products/products', { supplies_products, company });
    }
    else {
        res.redirect('/fud/home');
    }
});

router.get('/:id_company/:id/delate-supplies-company', isLoggedIn, async (req, res) => {
    const { id, id_company } = req.params;
    const pathOmg = await get_path_img('Kitchen', 'products_and_supplies', id)
    const thisIsASupplies = await this_is_a_supplies_or_a_products(id)

    if (await delate_supplies_company(id, pathOmg)) {
        req.flash('success', 'Los suministros fueron actualizados con éxito 😁')
    }
    else {
        req.flash('message', 'Los suministros NO fueron actualizados 👉👈')
    }

    if (thisIsASupplies) {
        res.redirect('/fud/' + id_company + '/company-supplies');
    }
    else {
        res.redirect('/fud/' + id_company + '/company-products');
    }
})

router.get('/:id_company/:id/:barcode/:name/:description/:useInventory/company-supplies', isLoggedIn, async (req, res) => {
    const { id_company, id } = req.params;
    const newSupplies = get_new_data_supplies_company(req)
    const thisIsASupplies = await this_is_a_supplies_or_a_products(id)

    if (await update_supplies_company(newSupplies)) {
        req.flash('success', 'El suministro fueron actualizados con éxito 😁')
    }
    else {
        req.flash('message', 'El suministro NO fueron actualizados 👉👈')
    }

    if (thisIsASupplies) {
        res.redirect('/fud/' + id_company + '/company-supplies');
    }
    else {
        res.redirect('/fud/' + id_company + '/company-products');
    }
});

//-----------------------------------------------------------------dish
router.get('/:id/dish', isLoggedIn, async (req, res) => {
    const company = await check_company(req); //req.company.rows; //
    const saucers = await get_data(req);
    res.render('links/store/dish', { company, saucers });
});

router.get('/:id/add-dish', isLoggedIn, async (req, res) => {
    //we need get all the Department and Category of the company
    const company = await check_company(req);
    const departments = await get_data_company(req, 'product_department');
    const categories = await get_data_company(req, 'product_category');
    res.render('links/manager/dish/addDish', { company, departments, categories });
});

//----------------------------------------------------------------combos
router.get('/:id/combos', isLoggedIn, async (req, res) => {
    const company = await check_company(req);
    if (company.length > 0) {
        const combos = await get_all_combos(req)
        res.render('links/manager/combo/combos', { company, combos });
    }
    else {
        res.redirect('/fud/home');
    }
})

router.get('/:id/add-combos', isLoggedIn, async (req, res) => {
    const company = await check_company(req);
    if (company.length > 0) {
        const { id } = req.params;
        const departments = await get_department(id);
        const category = await get_category(id);
        const supplies = await search_company_supplies_or_products(req, true);
        const products = await search_company_supplies_or_products(req, false);
        const suppliesCombo = []
        res.render('links/manager/combo/addCombo', { company, departments, category, supplies, products, suppliesCombo });
    }
    else {
        res.redirect('/fud/home');
    }
})

router.get('/:id_company/:id_dishes_and_combos/edit-combo-company', isLoggedIn, async (req, res) => {
    const { id_dishes_and_combos, id_company } = req.params;
    const company = [{
        id: id_company,
        id_combo: id_dishes_and_combos
    }]
    const departments = await get_data_tabla_with_id_company(id_company, "Kitchen", "product_department");
    const category = await get_data_tabla_with_id_company(id_company, "Kitchen", "product_category");

    const supplies = await search_company_supplies_or_products_with_company(id_company, true);
    const products = await search_company_supplies_or_products_with_company(id_company, false);
    const suppliesCombo = await search_supplies_combo(id_dishes_and_combos);
    const combo = await search_combo(id_company, id_dishes_and_combos);
    res.render('links/manager/combo/editCombo', { company, departments, category, supplies, products, combo, suppliesCombo });
})

router.get('/:id_company/:id/delate-combo-company', isLoggedIn, async (req, res) => {
    const { id, id_company } = req.params;
    const pathImg = await get_path_img('Kitchen', 'dishes_and_combos', id)
    if (await delate_combo_company(id, pathImg)) {
        req.flash('success', 'El combo fue eliminado con éxito 😄')
    }
    else {
        req.flash('message', 'El combo NO fue eliminado con éxito 😳')
    }

    res.redirect('/fud/' + id_company + '/combos');
})

//----------------------------------------------------------------food department
router.get('/:id/add-department', isLoggedIn, async (req, res) => {
    const company = await check_company(req);
    const saucers = await get_data(req);
    res.render(companyName + '/store/dish', { company, saucers });
});

router.get('/:id/food-department', isLoggedIn, async (req, res) => {
    const company = await check_company(req);
    const { id } = req.params;
    const departments = await get_department(id);
    res.render('links/manager/areas/department', { company, departments })
});

router.get('/:id_company/:id/delate-food-department', isLoggedIn, async (req, res) => {
    const company = await check_company_other(req);
    const { id, id_company } = req.params;

    //we will watch if the user have this company
    if (company.length > 0) {
        //we going to see if we can delate the department 
        if (await delate_product_department(id)) {
            //we will see if the user have a suscription of fud one 
            if(req.user.rol_user==rolFree){
                res.redirect('/fud/home');
            }else{
                res.redirect('/fud/' + id_company + '/food-department');
            }
        }
        else {
            res.redirect('/fud/home');
        }
    }
    else {
        res.redirect('/fud/home');
    }

});

router.get('/:id_company/:id/:name/:description/edit-food-department', isLoggedIn, async (req, res) => {
    const company = await check_company_other(req);
    const { id_company, id, name, description } = req.params;

    //we will watch if the user have this company
    if (company.length > 0) {
        //we going to see if we can delate the department 
        if (await update_product_department(id, name, description)) {
            //we will see if the user have a suscription of fud one 
            if(req.user.rol_user==rolFree){
                res.redirect('/fud/home');
            }else{
                res.redirect('/fud/' + id_company + '/food-department');
            }
        }
        else {
            res.redirect('/fud/home');
        }
    }
    else {
        res.redirect('/fud/home');
    }
});

//----------------------------------------------------------------food category
router.get('/:id/food-category', isLoggedIn, async (req, res) => {
    const company = await check_company(req);
    const { id } = req.params;
    const categories = await get_category(id);
    res.render(companyName + '/manager/areas/category', { company, categories })
});

router.get('/:id/add-category', isLoggedIn, async (req, res) => {
    const company = await check_company(req);
    const saucers = await get_data(req);
    res.render(companyName + '/store/dish', { company, saucers });
});

router.get('/:id_company/:id/delete-food-category', isLoggedIn, async (req, res) => {
    const company = await check_company_other(req);
    const { id, id_company } = req.params;

    //we will watch if the user have this company
    if (company.length > 0) {
        //we going to see if we can delate the department 
        if (await delate_product_category(id)) {
            res.redirect('/fud/' + id_company + '/food-category');
        }
        else {
            res.redirect('/fud/home');
        }
    }
    else {
        res.redirect('/fud/home');
    }
});

router.get('/:id_company/:id/delete-food-category', isLoggedIn, async (req, res) => {
    const company = await check_company_other(req);
    const { id, id_company } = req.params;

    //we will watch if the user have this company
    if (company.length > 0) {
        //we going to see if we can delate the department 
        if (await delate_product_category(id)) {
            res.redirect('/fud/' + id_company + '/food-category');
        }
        else {
            res.redirect('/fud/home');
        }
    }
    else {
        res.redirect('/fud/home');
    }

});

router.get('/:id_company/:id/:name/:description/edit-food-category', isLoggedIn, async (req, res) => {
    const company = await check_company_other(req);
    const { id_company, id, name, description } = req.params;

    //we will watch if the user have this company
    if (company.length > 0) {
        //we going to see if we can delete the department 
        if (await update_product_category(id, name, description)) {
            //we will see if exist the user is use fud one 
            res.redirect('/fud/' + id_company + '/food-category');
        }
        else {
            res.redirect('/fud/home');
        }
    }
    else {
        res.redirect('/fud/home');
    }
});

//-------------------------------------------------------------sales 
router.get('/:id_company/sales', isLoggedIn, async (req, res) => {
    const company = await this_company_is_of_this_user(req, res);
    if (company != null) {
        const { id_company, id_user } = req.params;
        const sales = await get_sales_company(id_company);
        res.render('links/manager/sales/sales', { company, sales });
    }
})

router.get('/:id_company/:number_page/sales-company', isLoggedIn, async (req, res) => {
    const company = await this_company_is_of_this_user(req, res);
    if (company != null) {
        const { id_company,number_page} = req.params;

        //we will convert the page number for that tha database can get all the data 
        let  pageNumber =parseInt(number_page)
        pageNumber = pageNumber <= 0 ? 1 : pageNumber; //this is for limite the search of the sale 

        //calculate the new data of the sale
        const salesStart=(pageNumber -1)*100;
        const salesEnd=pageNumber *100;

        //create the data sale for create the button in the web 
        const newNumberPage=pageNumber +1;
        const oldNumberPage=pageNumber -1;

        const dataSales=[{id_company,oldNumberPage,newNumberPage,pageNumber}]

        //get the sale and render the web
        const sales = await get_sales_company(id_company, salesStart,salesEnd);
        res.render('links/manager/sales/sales', { company, sales,  dataSales});
    }
})

//-------------------------------------------------------------move
router.get('/:id_company/movements', isLoggedIn, async (req, res) => {
    const company = await this_company_is_of_this_user(req, res);
    if (company != null) {
        const { id_company,number_page } = req.params;
        //we will convert the page number for that tha database can get all the data 
        let  pageNumber =parseInt(number_page)// convert the number_page to integer
        pageNumber = pageNumber <= 0 ? 1 : pageNumber; //this is for limite the search of the sale 

        const movementsStart = (pageNumber - 1) * 100;
        const movementsEnd = pageNumber * 100;

        //create the data sale for create the button in the web 
        const newNumberPage=pageNumber +1;
        const oldNumberPage=pageNumber -1;

        const dataMovent=[{id_company,oldNumberPage,newNumberPage,pageNumber}]
        const movements = await get_movements_company(id_company,movementsStart,movementsEnd);
        res.render('links/manager/movements/movements', { company, movements , dataMovent});
    }
})

//-------------------------------------------------------------reports 
router.get('/:id_company/reports2', isLoggedIn, (req, res) => {
    res.render("links/manager/reports/report");
})

router.get('/:id_company/reports3', isLoggedIn, async (req, res) => {
    const { id_company } = req.params;
    const data = await get_sales_company(id_company); //get data of the database
    const salesData = get_sales_data(data); //convert this data for that char.js can read

    // convert the data in a format for Chart.js
    const chartLabels = Object.keys(salesData);
    const days = [];
    const months = [];
    const years = [];

    chartLabels.forEach(dateString => {
        const parts = dateString.split('/'); // Split date string into parts
        const day = parseInt(parts[0]); // get the day 
        const month = parseInt(parts[1]); // get the month
        const year = parseInt(parts[2]); // get the year

        //save the data in his array
        days.push(day);
        months.push(month);
        years.push(year);
    });

    //this is for convert the data of sale to object 
    const chartData = Object.values(salesData);

    res.render("links/manager/reports/sales", { days: days, months: months, years: years, chartData: JSON.stringify(chartData) });
})

async function create_PDF_page(url,name) {
    // Launch the browser and open a new blank page
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(url); // URL of the page that we would like convert to PDF
    // Set screen size
    await page.setViewport({width: 1080, height: 1024});

    // Type into search box
    await page.type('.devsite-search-field', 'automate beyond recorder')

    // Wait and click on first result
    const searchResultSelector = '.devsite-result-item-link';
    await page.waitForSelector(searchResultSelector);
    await page.click(searchResultSelector);



    await page.pdf({ path: name, format: 'A4',printBackground: true }); // PDF name and format

    await browser.close();
    console.log('PDF generado correctamente');
}

router.get('/:id_company/reports', isLoggedIn, async (req, res) => {
    const { id_company } = req.params;
    const company = await this_company_is_of_this_user(req, res);
    if (company != null) {
        //--------------------------------------------------------------this is data all--------------------------------------
        //-----------graph of sales
        const data = await get_sales_company(id_company); //get data of the database
        const salesData = get_sales_data(data); //convert this data for that char.js can read

        //convert the data in a format for Chart.js
        const chartLabels = Object.keys(salesData);
        const days = [];
        const months = [];
        const years = [];

        chartLabels.forEach(dateString => {
            const parts = dateString.split('/'); // Split date string into parts
            const day = parseInt(parts[0]); // get the day 
            const month = parseInt(parts[1]); // get the month
            const year = parseInt(parts[2]); // get the year

            //save the data in his array
            days.push(day);
            months.push(month);
            years.push(year);
        });

        //this is for convert the data of sale to object 
        const chartData = Object.values(salesData);

        //this is for get the total of the sale of today
        const total = await get_total_sales_company(id_company);
        const unity = await get_total_unity_company(id_company);

        const totalYear = await get_total_year(id_company);
        const totalMonth = await get_total_month(id_company);
        const totalCompany = await get_total_company(id_company);

        const branches = await get_branchIds_by_company(id_company);


        const moveNegative = await get_movements_company_negative(branches);
        const movePositive = await get_movements_company_positive(branches)

        //this is for tha table of the sales of the branch 
        const dataSalesBranches = await get_sale_branch(branches)
        const salesBranchesLabels = []
        const salesBranchesData = []
        dataSalesBranches.forEach(item => {
            salesBranchesLabels.push(item[0]); // add the name of the branch 
            salesBranchesData.push(item[1]); // add the sales of the array 
        });

        //% aument 
        const totalYearOld = await get_total_year_old(id_company);
        const percentageYear = calculate_sale_increase(totalYearOld, totalYear);

        const totalMonthOld = await get_total_month_old(id_company);
        const percentageMonth = calculate_sale_increase(totalMonthOld, totalMonth);

        const totalDayhOld = await get_total_day_old(id_company);
        const percentageDay = calculate_sale_increase(totalDayhOld, total);

        //----graph distribute
        const distribute = await get_data_distribute_company(id_company)
        const distributeLabels = []
        const distributeData = []

        // we will reading all the array and get the elements
        distribute.forEach(item => {
            distributeLabels.push(item[0].replace(/'/g, '')); // add the name of the array 
            distributeData.push(parseFloat(item[1])); // add the numer of the array 
        });

        //graph sale combos
        const salesByCombos = await get_sales_total_by_combo(id_company)
        const salesByCombosLabels = []
        const salesByCombosData = []
        salesByCombos.forEach(sale => {
            salesByCombosLabels.push(sale.name);
            salesByCombosData.push(sale.total_sales);
        });

        totalMovimientos = total + moveNegative + movePositive;



        //--------------------------------------------------------------this is data day--------------------------------------
        //this is for know much profit have we had today
        const dataDay = await get_sales_company_for_day(id_company); //get data of the database
        const salesDataDay = get_sales_data_day(dataDay); //convert this data for that char.js can read (hours)

        const salesDayLabels = Object.keys(salesDataDay);
        const salesDayData = Object.values(salesDataDay);

        //this is for get the sale of the branch today
        const dataSalesBranchesDay = await get_sale_branch_today(branches)
        const salesBranchesLabelsDay = []
        const salesBranchesDataDay = []
        dataSalesBranchesDay.forEach(item => {
            salesBranchesLabelsDay.push(item[0]); // add the name of the branch 
            salesBranchesDataDay.push(item[1]); // add the sales of the array 
        });

        //graph distribute, 
        //for know which products is most sale. This not means that that combos be the that most money generate in the business 
        const comboMostSaleForDay = await get_data_distribute_company_day(id_company)
        const comboMostSaleForDayLabels = []
        const comboMostSaleForDayData = []
        console.log(comboMostSaleForDay)
        // we will reading all the array and get the elements
        comboMostSaleForDay.forEach(item => {
            comboMostSaleForDayLabels.push(item[0].replace(/'/g, '')); // add the name of the array 
            comboMostSaleForDayData.push(parseFloat(item[1])); // add the numer of the array 
        });


        //graph sale combos for day. This is for knwo when much profit does each combo leave me for day
        //this is for know how is distribuite the sale of the business 
        const salesByCombosDay = await get_sales_total_by_combo_today(id_company)
        const salesByCombosLabelsDay = []
        const salesByCombosDataDay = []
        salesByCombosDay.forEach(sale => {
            salesByCombosLabelsDay.push(sale.name);
            salesByCombosDataDay.push(sale.total_sales);
        });

        //--------------------------------------------------------------this is data month--------------------------------------
        //this is for know much profit have we had today
        const dataMonth = await get_sales_company_for_month(id_company); //get data of the database
        const salesDataMonth = get_sales_data(dataMonth); //convert this data for that char.js can read
        const salesMonthLabels = Object.keys(salesDataMonth);
        const salesMonthData = Object.values(salesDataMonth);

        //this is for get the sale of the branch month
        const dataSalesBranchesMonth = await get_sale_branch_month(branches)
        const salesBranchesLabelsMonth = []
        const salesBranchesDataMonth = []
        dataSalesBranchesMonth.forEach(item => {
            salesBranchesLabelsMonth.push(item[0]); // add the name of the branch 
            salesBranchesDataMonth.push(item[1]); // add the sales of the array 
        });

        //graph sale combos for day. This is for knwo when much profit does each combo leave me for month
        //this is for know how is distribuite the sale of the business 
        const salesByCombosMonth = await get_sales_total_by_combo_month(id_company)

        const salesByCombosLabelsMonth = []
        const salesByCombosDataMonth = []
        salesByCombosMonth.forEach(sale => {
            salesByCombosLabelsMonth.push(sale.name);
            salesByCombosDataMonth.push(sale.total_sales);
        });

        //graph distribute, 
        //for know which products is most sale. This not means that that combos be the that most money generate in the business 
        const comboMostSaleForMonth = await get_data_distribute_company_month(id_company)
        const comboMostSaleForMonthLabels = []
        const comboMostSaleForMonthData = []

        // we will reading all the array and get the elements
        comboMostSaleForMonth.forEach(item => {
            comboMostSaleForMonthLabels.push(item[0].replace(/'/g, '')); // add the name of the array 
            comboMostSaleForMonthData.push(parseFloat(item[1])); // add the numer of the array 
        });


        //--------------------------------------------------------------this is data year--------------------------------------
        //this is for know much profit have we had today
        const dataYear = await get_sales_company_for_year(id_company); //get data of the database
        const salesDataYear = get_sales_data(dataYear); //convert this data for that char.js can read
        const salesYearLabels = Object.keys(salesDataYear);
        const salesYearData = Object.values(salesDataYear);

        //this is for get the sale of the branch year
        const dataSalesBranchesYear = await get_sale_branch_year(branches)
        const salesBranchesLabelsYear = []
        const salesBranchesDataYear = []
        dataSalesBranchesYear.forEach(item => {
            salesBranchesLabelsYear.push(item[0]); // add the name of the branch 
            salesBranchesDataYear.push(item[1]); // add the sales of the array 
        });

        //graph sale combos for day. This is for knwo when much profit does each combo leave me for year
        //this is for know how is distribuite the sale of the business 
        const salesByCombosYear = await get_sales_total_by_combo_year(id_company)
        const salesByCombosLabelsYear = []
        const salesByCombosDataYear = []
        salesByCombosYear.forEach(sale => {
            salesByCombosLabelsYear.push(sale.name);
            salesByCombosDataYear.push(sale.total_sales);
        });

        //graph distribute, 
        //for know which products is most sale. This not means that that combos be the that most money generate in the business 
        const comboMostSaleForYear = await get_data_distribute_company_year(id_company)
        const comboMostSaleForYearLabels = []
        const comboMostSaleForYearData = []

        // we will reading all the array and get the elements
        comboMostSaleForYear.forEach(item => {
            comboMostSaleForYearLabels.push(item[0].replace(/'/g, '')); // add the name of the array 
            comboMostSaleForYearData.push(parseFloat(item[1])); // add the numer of the array 
        });

        res.render("links/manager/reports/global", { comboMostSaleForDayLabels, comboMostSaleForDayData, comboMostSaleForMonthLabels, comboMostSaleForMonthData, comboMostSaleForYearLabels, comboMostSaleForYearData, salesByCombosLabelsYear, salesByCombosDataYear, salesByCombosLabelsMonth, salesByCombosDataMonth, salesByCombosLabelsDay, salesByCombosDataDay, salesBranchesLabelsYear, salesBranchesDataYear, salesBranchesLabelsMonth, salesBranchesDataMonth, salesBranchesLabelsDay, salesBranchesDataDay, salesYearLabels, salesYearData, salesMonthLabels, salesMonthData, salesDayLabels, salesDayData, salesByCombosLabels, salesByCombosData: JSON.stringify(salesByCombosData), salesBranchesLabels, salesBranchesData, company, total, percentageDay, unity, totalYear, percentageYear, totalMonth, percentageMonth, totalCompany, moveNegative, movePositive, totalMovimientos, days: days, months: months, years: years, distributeLabels, distributeData: JSON.stringify(distributeData), chartData: JSON.stringify(chartData) });

    }
})

router.post('/create-pdf', async (req, res) => {
    try {
        // Obtiene la URL de la página del cuerpo de la solicitud
        const { url } = req.body;
        console.log('url')
        console.log(url)
        // Lanza una instancia de Puppeteer
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
    
        // Navega a la URL especificada
        await page.goto(url);
    
        // Genera el PDF
        const pdfBuffer = await page.pdf({
          format: 'A4',
          printBackground: true
        });
    
        // Cierra el navegador
        await browser.close();
    
        // Envía el PDF como respuesta
        res.setHeader('Content-Type', 'application/pdf');
        res.send(pdfBuffer);
      } catch (error) {
        console.error('Error al generar el PDF:', error);
        res.status(500).send('Error al generar el PDF');
      }
})

//----------------------------------------------------------------providers
router.get('/:id_company/providers', isLoggedIn, async (req, res) => {
    //we will see if the company is of the user 
    const company = await this_company_is_of_this_user(req, res)
    if (company != null) {
        //if this company is of the user, we will to search all the providers of tha company
        const { id_company } = req.params;
        const providers = await search_all_providers(id_company);

        //if the company not have providers render other view
        if (providers.length == 0) {
            res.render('links/manager/providers/providers', { company });
        }
        else {
            res.render('links/manager/providers/providers', { company, providers });
        }
    }
})

router.get('/:id_company/:name_provider/search-provider', isLoggedIn, async (req, res) => {
    //we will see if the company is of the user 
    const company = await this_company_is_of_this_user(req, res)
    if (company != null) {
        //if this company is of the user, we will to search all the providers of tha company
        const { id_company, name_provider } = req.params;
        const providers = await search_all_providers_for_name(id_company, name_provider);
        //if the company not have providers render other view
        if (providers.length == 0) {
            res.render('links/manager/providers/providers', { company });
        }
        else {
            res.render('links/manager/providers/providers', { company, providers });
        }
    }
})

router.get('/:id_company/add-providers', isLoggedIn, async (req, res) => {
    const company = await this_company_is_of_this_user(req, res);
    if (company != null) {
        const { id_company } = req.params;
        const branches = await search_all_branch(id_company)
        res.render('links/manager/providers/addProviders', { company, branches });
    }
})

router.get('/:id_provider/edit-providers', isLoggedIn, async (req, res) => {
    //if this company is of the user, we will to search the provider of tha company
    const { id_provider } = req.params;
    const provider = await search_provider(id_provider);
    res.render('links/manager/providers/editProviders', { provider });
})

router.get('/:id_company/:id_provider/edit-provider', isLoggedIn, async (req, res) => {
    //we will see if the company is of the user 
    const company = await this_company_is_of_this_user(req, res)
    if (company != null) {
        //if this company is of the user, we will to search the provider of tha company
        const { id_provider } = req.params;
        const provider = await search_provider(id_provider);
        res.render('links/manager/providers/editProviders', { provider, company });
    }
})

router.get('/:id_company/:id_provider/delete-provider', isLoggedIn, async (req, res) => {
    //we will see if the company is of the user 
    const company = await this_company_is_of_this_user(req, res)
    if (company != null) {
        const { id_provider, id_company } = req.params;
        if (await delete_provider(id_provider)) {
            req.flash('success', 'El proveedor fue eliminado con éxito 😉')
        }
        else {
            req.flash('message', 'El proveedor no fue eliminado 😮')
        }

        res.redirect('/fud/' + id_company + '/providers');
    }
})

//----------------------------------------------------------------customers
router.get('/:id/customers-company', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const customers = await searc_all_customers(id)
    const country = await get_country()
    const company = [{ id }]
    res.render("links/manager/customers/customers", { company, customers, country });
})

router.get('/:id/add-customer', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const company = [{ id }]
    const country = await get_country()
    res.render("links/manager/customers/addCustomer", { company, country });
})

router.get('/:id/:idCustomer/delete-customer', isLoggedIn, async (req, res) => {
    const { idCustomer, id } = req.params;
    const company = await check_company(req);
    if (company.length > 0) {
        if (await delete_customer(idCustomer)) {
            req.flash('success', 'El cliente fue eliminado con éxito 😉')
        } else {
            req.flash('message', 'El cliente no fue eliminado 😰')
        }
    }
    else {
        res.redirect('/fud/home');
    }

    res.redirect("/fud/" + id + '/customers-company');
})

router.get('/:id/:idCustomer/edit-customer', isLoggedIn, async (req, res) => {
    const { idCustomer } = req.params;
    const company = await check_company(req);
    const country = await get_country()
    const customer = await searc_customers(idCustomer)
    res.render("links/manager/customers/editCustomer", { customer, country, company });
})


//-------------------------------------------------------------branch
router.get('/:id/branches', isLoggedIn, async (req, res) => {
    const country = await get_country();
    const company = await check_company(req);
    if (company.length > 0) {
        const { id } = req.params;
        const branches = await search_all_branch(id);
        res.render('links/manager/branches/branches', { company, country, branches });
    }
    else {
        res.redirect('/fud/home');
    }
})

router.get('/:id/add-branches', isLoggedIn, async (req, res) => {
    const country = await get_country();
    const company = await check_company(req);
    if (company.length > 0) {
        res.render('links/manager/branches/addBranches', { company, country });
    }
    else {
        res.redirect('/fud/home');
    }
})

router.get('/:idBranch/:idCompany/edit-branch', isLoggedIn, async (req, res) => {
    const country = await get_country();
    const branch = await get_branch(req);
    res.render("links/manager/branches/editBranches", { branch, country });
})

router.get('/:idBranch/:id_company/delete-branch', isLoggedIn, async (req, res) => {
    //we will see if this company is of the user 
    if (await this_company_is_of_this_user(req, res) != null) {
        //get the data that the link have 
        const { idBranch, id_company } = req.params;
        if (delete_branch_company(idBranch)) {
            req.flash('success', 'La sucursal fue eliminada con éxito 👍');
        }
        else {
            req.flash('message', 'La sucursal no fue eliminada 👁️');
        }

        res.redirect('/fud/' + id_company + '/branches');
    }
})


//-----------------------------------------------------------options 
router.get('/:id_company/options', isLoggedIn, async (req, res) => {
    const company = await this_company_is_of_this_user(req, res);
    const country=await get_country()
    if (company != null) {
        res.render('links/manager/options/options', { company,country });
    }
})





module.exports = router;