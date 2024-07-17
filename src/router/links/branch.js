const express = require('express');
const router = express.Router();
const { isLoggedIn, isNotLoggedIn } = require('../../lib/auth');
const database = require('../../database');
const addDatabase = require('../addDatabase');

/*
*----------------------functions-----------------*/ 
//functions image
const {
    get_path_img,
    delate_image_upload,
    upload_image_to_space,
    delete_image_from_space,
    create_a_new_image,
    delate_image
} = require('../../services/connectionWithDatabaseImage');

//functions supplies
const {
    get_supplies_or_features,
    get_supplies_with_id,
    delate_supplies_company,
    search_company_supplies_or_products_with_id_company,
} = require('../../services/supplies');

//functions supplies
const {
    search_supplies_combo,
    get_all_dish_and_combo
} = require('../../services/combos');


//function suscription 
const {
    validate_subscription,
} = require('../../services/subscription');

//functions employees
const {
    search_employees,
    search_employees_branch,
    search_employee,
    delete_employee,
    search_employee_departments,
    get_country,
    get_type_employees,
    delete_profile_picture,
    delete_user
} = require('../../services/employees');

//functions ad
const {
    get_ad_image,
    delete_ad,
    update_ad
} = require('../../services/ad');

//functions food department
const {
    get_department,
    delate_product_department,
    update_product_department,
    this_department_be
} = require('../../services/foodDepartment');


const rolFree=0
const companyName='links'

async function get_data_branch(req) {
    const { id_branch } = req.params;
    var queryText = 'SELECT * FROM "Company".branches WHERE id= $1';
    var values = [id_branch];
    const result = await database.query(queryText, values);
    const data = result.rows;
    return data;
}

router.get('/:id_company/:id_branch/visit-branch', isLoggedIn, async (req, res) => {
    if(await validate_subscription(req,res)){
        if(req.user.rol_user==rolFree){
            res.redirect('/fud/home')
        }else{
            const branch = await get_data_branch(req)
            res.render('links/branch/home', { branch });
        }
    }
})

router.get('/:id_company/:id_branch/supplies', isLoggedIn, async (req, res) => {
    if(await validate_subscription(req,res)){
        const { id_branch } = req.params;
        const branch = await get_data_branch(req);
        const supplies = await get_supplies_or_features(id_branch, true)
        res.render('links/branch/supplies/supplies', { branch, supplies });
    }
})


router.get('/:id_company/:id_branch/:id_supplies/edit-supplies-branch', isLoggedIn, async (req, res) => {
    if(await validate_subscription(req,res)){
        const { id_company, id_branch, id_supplies } = req.params;
        const supplies = await get_supplies_with_id(id_supplies, true);

        //we will see if the user have a suscription for fud one 
        if (req.user.rol_user==rolFree){
            const branch = await get_data_branch(req);
            res.render('links/branch/supplies/editSupplies', { supplies, branch });    
        }    
        else{
            const branchFree = await get_data_branch(req);
            res.render('links/branch/supplies/editSupplies', { supplies, branchFree });            
        }  
    }
})

router.get('/:id_company/:id_branch/:id/delete-supplies-free', isLoggedIn, async (req, res) => {
    const { id, id_company,id_branch } = req.params;
    const pathOmg = await get_path_img('Kitchen', 'products_and_supplies', id)

    if (await delate_supplies_company(id, pathOmg)) {
        req.flash('success', 'El suministro fueron eliminado con éxito 😁')
    }
    else {
        req.flash('message', 'Los suministros NO fueron eliminado 👉👈')
    }

    res.redirect('/fud/' + id_company +'/'+ id_branch + '/supplies-free');
})

router.get('/:id_company/:id_branch/recharge-supplies', isLoggedIn, async (req, res) => {
    if(await validate_subscription(req,res)){
        const { id_company, id_branch } = req.params;
        const company = await check_company_other(req);

        if (company.length > 0) {
            await update_supplies_branch(req, res, true)
        }
        res.redirect('/fud/' + id_company + '/' + id_branch + '/supplies');
    }
})

async function update_supplies_branch(req, res, type) {
    const { id_company, id_branch } = req.params;
    var suppliesNotSaved = ''

    //we will geting all the supplies of the company 
    const supplies = await search_company_supplies_or_products_with_id_company(id_company, type);

    //we will to read all the supplies and we going to watch if the supplies is in the branch
    for (var i = 0; i < supplies.length; i++) {
        const idSupplies = supplies[i].id; //get id of the array 
        if (!await this_supplies_exist(id_branch,idSupplies)) {
            //if the supplies not exist in this branch, we going to add the database
            //we will watching if the product was add with success, if not was add, save in the note
            if (!await addDatabase.add_product_and_suppiles_features(id_branch, idSupplies)) {
                suppliesNotSaved += supplies[i].name + '\n';
            }
        }
    }

    //we will seeing if all the products was add 
    const text = type ? 'supplies' : 'products';
    if (suppliesNotSaved == '') {
        req.flash('success', `Todo el ${text} fue actualizado con éxito! 😄`)
    } else {
        req.flash('message', `⚠️ El ${text} no fue actualizado con éxito! ⚠️\n` + suppliesNotSaved)
    }
}

async function this_supplies_exist(idBranc,idSupplies) {
    var queryText = 'SELECT * FROM "Inventory".product_and_suppiles_features WHERE id_products_and_supplies = $1 and id_branches=$2';
    var values = [idSupplies,idBranc];
    const result = await database.query(queryText, values);
    const data = result.rows;
    return data.length > 0;
}

//----------------------------------------------------------------products 
router.get('/:id_company/:id_branch/products', isLoggedIn, async (req, res) => {
    if(await validate_subscription(req,res)){
        const { id_branch } = req.params;
        const branch = await get_data_branch(req);
        const supplies = await get_supplies_or_features(id_branch, false)
        res.render('links/branch/supplies/products', { branch, supplies });
    }
})

router.get('/:id_company/:id_branch/recharge-products', isLoggedIn, async (req, res) => {
    if(await validate_subscription(req,res)){
        const { id_company, id_branch } = req.params;
        const company = await check_company_other(req);

        if (company.length > 0) {
            await update_supplies_branch(req, res, false)
        }
        res.redirect('/fud/' + id_company + '/' + id_branch + '/products');
    }
})

router.get('/:id_company/:id_branch/:id_supplies/edit-products-branch', isLoggedIn, async (req, res) => {
    if(await validate_subscription(req,res)){
        const { id_company, id_branch, id_supplies } = req.params;
        const supplies = await get_supplies_with_id(id_supplies, false);
        const branch = await get_data_branch(req);
        res.render('links/branch/supplies/editSupplies', { supplies, branch });
    }
})

router.get('/:id_company/:id_branch/:id_supplies/:existence/update-products-branch', isLoggedIn, async (req, res) => {
    if(await validate_subscription(req,res)){
        const { id_company, id_branch, id_supplies, existence } = req.params;
        if (await update_inventory_supplies_branch(id_supplies, existence)) {
            req.flash('success', 'El producto fue actualizado con éxito ⭐')
        } else {
            req.flash('message', 'Este producto no fue actualizado 😅')
        }
        res.redirect('/fud/' + id_company + '/' + id_branch + '/products');
    }
})

router.get('/:id_company/:id_branch/:id_supplies/:existence/update-supplies-branch', isLoggedIn, async (req, res) => {
    if(await validate_subscription(req,res)){
        const { id_company, id_branch, id_supplies, existence } = req.params;
        if (await update_inventory_supplies_branch(id_supplies, existence)) {
            req.flash('success', 'Los suministros fueron actualizados con éxito ⭐')
        } else {
            req.flash('message', 'Los suministros no fueron actualizados 😅')
        }

        if(req.user.rol_user == rolFree){
            res.redirect('/fud/' + id_company + '/' + id_branch + '/supplies-free');
        }else{
            res.redirect('/fud/' + id_company + '/' + id_branch + '/supplies');
        }
    }
})

async function update_inventory_supplies_branch(idSupplies, newExistence) {
    var queryText = `
        UPDATE "Inventory".product_and_suppiles_features 
        SET existence = $1
        WHERE id = $2;
    `;
    var values = [newExistence, idSupplies];
    try {
        await database.query(queryText, values);
        return true;
    } catch (error) {
        console.error("Error al actualizar el inventario de suministros en la sucursal:", error);
        return false;
    }
}
//----------------------------------------------------------------combos
router.get('/:id_company/:id_branch/combos', isLoggedIn, async (req, res) => {
    if(await validate_subscription(req,res)){
        const { id_company, id_branch } = req.params;
        const branch = await get_data_branch(req);
        const combos = await get_combo_features(id_branch);
        res.render('links/branch/combo/combos', { branch, combos });
    }
})

async function get_combo_features(idBranche) {
    var queryText = `
    SELECT 
        f.*,
        d.img,
        d.barcode,
        d.name,
        d.description,
        pc_cat.name as category_name,
        pd_dept.name as department_name
    FROM 
        "Inventory".dish_and_combo_features f
    INNER JOIN 
        "Kitchen".dishes_and_combos d ON f.id_dishes_and_combos = d.id
    LEFT JOIN
        "Kitchen".product_category pc_cat ON d.id_product_category = pc_cat.id
    LEFT JOIN
        "Kitchen".product_department pd_dept ON d.id_product_department = pd_dept.id
    WHERE 
        f.id_branches = $1
    `;
    var values = [idBranche];
    const result = await database.query(queryText, values);
    const data = result.rows;
    return data;
}

router.get('/:id_company/:id_branch/combo-refresh', isLoggedIn, async (req, res) => {
    if(await validate_subscription(req,res)){
        const { id_company, id_branch } = req.params;
        await update_combo_branch(req, res);
        res.redirect('/fud/' + id_company + '/' + id_branch + '/combos');
    }
})

async function update_combo_branch(req, res) {
    const { id_company, id_branch } = req.params;
    var comboNotSaved = ''

    //we will geting all the combos of the company 
    const combos = await get_all_combos_company(id_company);

    //we will reading all the combo of the company for after add to the branch
    await Promise.all(combos.map(async combo => {
        //get the data combo in the branch
        const comboData = create_combo_data_branch(combo, id_branch);

        // save the combo in the branch
        if (!await add_combo_branch(comboData)){
            // if the combo not was add with succes, we save the name of the combo
            comboNotSaved += combo.name + '\n';
        }
    }));

    //we will seeing if all the products was add 
    if (comboNotSaved == '') {
        req.flash('success', `Todos los combos fueron actualizados con éxito! 😄`)
    } else {
        req.flash('message', `⚠️ Estos combos no han sido actualizados! ⚠️\n` + comboNotSaved)
    }
}

function create_combo_data_branch(combo, id_branch) {
    const comboData = {
        idCompany: combo.id_companies,
        idBranch: id_branch,
        idDishesAndCombos: combo.id,
        price_1: 0,
        amount: 0,
        product_cost: 0,
        revenue_1: 0,
        purchase_unit: 'Pza'
    };
    return comboData;
}

async function add_combo_branch(comboData) {
    //we will watching if this combo exist in this branch 
    if (!await this_combo_exist_branch(comboData.idBranch,comboData.idDishesAndCombos)) {
        //if the combo not exist in the branch so we will add this new combo to the database 
        return await addDatabase.add_combo_branch(comboData);
    }

    return true;
}

async function get_all_combos_company(idCompany) {
    //we will search the company of the user 
    var queryText = 'SELECT * FROM "Kitchen".dishes_and_combos WHERE id_companies= $1';
    var values = [idCompany];
    const result = await database.query(queryText, values);

    return result.rows;
}

async function this_combo_exist_branch(idBranch,idCombo) {
    //we will search the combo in this branch 
    var queryText = 'SELECT * FROM "Inventory".dish_and_combo_features WHERE id_dishes_and_combos= $1 and id_branches=$2';
    var values = [idCombo,idBranch];
    const result = await database.query(queryText, values);

    return result.rows.length > 0;
}

router.get('/:id_company/:id_branch/:id_combo_features/edit-combo-branch', isLoggedIn, async (req, res) => {
    if(await validate_subscription(req,res)){
        const { id_combo_features, id_branch } = req.params;
        const comboFeactures = await get_data_combo_factures(id_combo_features);
        const suppliesCombo = await get_all_price_supplies_branch(comboFeactures[0].id_dishes_and_combos, id_branch)

        //we will see if the user have a suscription free
        if(req.user.rol_user==rolFree){
            const branchFree = await get_data_branch(req);
            res.render('links/branch/combo/editCombo', { comboFeactures, suppliesCombo, branchFree });           
        }else{
            const branch = await get_data_branch(req);
            res.render('links/branch/combo/editCombo', { comboFeactures, suppliesCombo, branch });
        }
    }
})

router.get('/:id_company/:id_branch/:id_combo_features/edit-combo-free', isLoggedIn, async (req, res) => {
    //if(await validate_subscription(req,res)){
        const { id_combo_features, id_branch } = req.params;
        const comboFeactures = await get_data_combo_factures(id_combo_features);
        const suppliesCombo = await get_all_price_supplies_branch(comboFeactures[0].id_dishes_and_combos, id_branch)
        const branch = await get_data_branch(req);
        res.render('links/branch/combo/editCombo', { comboFeactures, suppliesCombo, branch });
    //}
})

async function get_all_price_supplies_branch(idCombo, idBranch) {
    try {
        // Consulta para obtener los suministros de un combo específico
        const comboQuery1 = `
            SELECT tsc.id_products_and_supplies, tsc.amount, tsc.unity, psf.currency_sale
            FROM "Kitchen".table_supplies_combo tsc
            INNER JOIN "Inventory".product_and_suppiles_features psf
            ON tsc.id_products_and_supplies = psf.id_products_and_supplies
            WHERE tsc.id_dishes_and_combos = $1 ORDER BY id_products_and_supplies DESC
        `;

        const comboQuery2 = `SELECT tsc.id_products_and_supplies, tsc.amount, tsc.unity, psf.currency_sale, psf.additional
        FROM "Kitchen".table_supplies_combo tsc
        INNER JOIN (
            SELECT DISTINCT ON (id_products_and_supplies) id_products_and_supplies, currency_sale
            FROM "Inventory".product_and_suppiles_features
            ORDER BY id_products_and_supplies
        ) psf
        ON tsc.id_products_and_supplies = psf.id_products_and_supplies
        WHERE tsc.id_dishes_and_combos = $1
        ORDER BY tsc.id_products_and_supplies DESC
        `;
        const comboQuery=`SELECT tsc.id_products_and_supplies, tsc.amount, tsc.unity, tsc.additional, psf.currency_sale
        FROM "Kitchen".table_supplies_combo tsc
        INNER JOIN (
            SELECT DISTINCT ON (id_products_and_supplies) id_products_and_supplies, currency_sale
            FROM "Inventory".product_and_suppiles_features
            ORDER BY id_products_and_supplies
        ) psf
        ON tsc.id_products_and_supplies = psf.id_products_and_supplies
        WHERE tsc.id_dishes_and_combos = $1
        ORDER BY tsc.id_products_and_supplies DESC
        `;
        const comboValues = [idCombo];
        const comboResult = await database.query(comboQuery, comboValues)

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
                img: '',
                product_name: '',
                product_barcode: '',
                description: '',
                id_products_and_supplies: supplyId,
                amount: row.amount,
                unity: row.unity,
                sale_price: supplyPrice,
                currency: row.currency_sale,
                additional: row.additional
            });
        });

        //agregamos los datos del combo 
        const suppliesCombo = await search_supplies_combo(idCombo);
        for (var i = 0; i < suppliesCombo.length; i++) {
            suppliesInfo[i].img = suppliesCombo[i].img;
            suppliesInfo[i].product_name = suppliesCombo[i].product_name;
            suppliesInfo[i].product_barcode = suppliesCombo[i].product_barcode;
            suppliesInfo[i].description = suppliesCombo[i].description;
        }

        return suppliesInfo;
    } catch (error) {
        console.error("Error en la consulta:", error);
        throw error;
    }
}

async function get_data_combo_factures(idComboFacture) {
    const queryText = `
        SELECT 
            f.id,
            f.id_companies,
            f.id_branches,
            f.id_dishes_and_combos,
            f.price_1,
            f.revenue_1,
            f.price_2,
            f.revenue_2,
            f.price_3,
            f.revenue_3,
            f.favorites,
            f.sat_key,
            f.purchase_unit,
            f.existence,
            f.amount,
            f.product_cost,
            f.id_providers,
            d.name AS dish_name,
            d.description AS dish_description,
            d.img AS dish_img,
            d.barcode AS dish_barcode,
            d.id_product_department AS dish_product_department,
            d.id_product_category AS dish_product_category
        FROM 
            "Inventory".dish_and_combo_features f
        INNER JOIN 
            "Kitchen".dishes_and_combos d ON f.id_dishes_and_combos = d.id
        WHERE 
            f.id = $1
    `;

    const result = await database.query(queryText, [idComboFacture]);
    return result.rows;
}

router.get('/:id_company/:id_branch/providers', isLoggedIn, async (req, res) => {
    if(await validate_subscription(req,res)){
        const { id_company, id_branch } = req.params;
        const providers = await search_providers(id_branch);
        const branch = await get_data_branch(req);
        res.render('links/branch/providers/providers', { providers, branch });
    }
})

router.get('/:id_company/:id_branch/add-providers', isLoggedIn, async (req, res) => {
    if(await validate_subscription(req,res)){
        const { id_company } = req.params;
        const branch = await get_data_branch(req)
        res.render('links/branch/providers/addProviders', { branch });
    }
})

router.get('/:id_company/:id_branch/:id_provider/edit-provider', isLoggedIn, async (req, res) => {
    if(await validate_subscription(req,res)){
        const { id_provider } = req.params;
        const provider = await search_provider(id_provider);
        const branch = await get_data_branch(req);
        res.render('links/manager/providers/editProviders', { provider, branch });
    }
})

router.get('/:id_company/:id_branch/food-department', isLoggedIn, async (req, res) => {
    if(await validate_subscription(req,res)){
        const { id_company } = req.params;
        const departments = await get_department(id_company);
        const branch = await get_data_branch(req);
        res.render('links/branch/areas/department', { departments, branch });
    }
})

router.get('/:id_company/:id_branch/food-category', isLoggedIn, async (req, res) => {
    if(await validate_subscription(req,res)){
        const { id_company } = req.params;
        const categories = await get_category(id_company);
        const branch = await get_data_branch(req);
        res.render('links/branch/areas/category', { categories, branch });
    }
})

router.get('/:id_company/:id_branch/roles-department', isLoggedIn, async (req, res) => {
    if(await validate_subscription(req,res)){
        const { id_company } = req.params;
        const departments = await search_employee_departments(id_company);
        const branch = await get_data_branch(req);
        res.render('links/branch/role_type_employees/departmentEmployees', { departments, branch });
    }
})

router.get('/:id_company/:id_branch/type-employees', isLoggedIn, async (req, res) => {
    if(await validate_subscription(req,res)){
        const { id_company } = req.params;
        const typeEmployees = await get_type_employees(id_company);
        const branch = await get_data_branch(req);
        res.render('links/branch/role_type_employees/typeEmployees', { typeEmployees, branch });
    }
})

router.get('/:id_company/:id_branch/type-employees-free', isLoggedIn, async (req, res) => {
    const { id_company } = req.params;
    const typeEmployees = await get_type_employees(id_company)
    const branchFree=await get_data_branch(req);
    res.render('links/manager/role_type_employees/typeEmployees', { branchFree, typeEmployees });
})


router.get('/:id_company/:id_branch/:id_role_employee/edit-role-user', isLoggedIn, async (req, res) => {
    if(await validate_subscription(req,res)){
        const { id_role_employee } = req.params;
        const roleEmployee = await get_data_tole_employees(id_role_employee);
        const branch = await get_data_branch(req);
        res.render('links/branch/role_type_employees/editRoleEmployee', { roleEmployee, branch });
    }
})

router.get('/:id_company/:id_branch/customer', isLoggedIn, async (req, res) => {
    if(await validate_subscription(req,res)){
        const { id_company } = req.params;
        const branch = await get_data_branch(req);
        const customers = await searc_all_customers(id_company)
        res.render('links/branch/customers/customers', { customers, branch });
    }
})

//----------------------------------------------------------------employees
router.get('/:id_company/:id_branch/employees-branch', isLoggedIn, async (req, res) => {
    if(await validate_subscription(req,res)){
        const { id_branch, id_company } = req.params;
        const employees = await search_employees_branch(id_branch);

        //we will see if the suscription is for a branch free
        if(req.user.rol_user==rolFree){
            const branchFree = await get_data_branch(req);
            res.render('links/branch/employees/employee', { employees, branchFree });           
        }else{
            const branch = await get_data_branch(req);
            res.render('links/branch/employees/employee', { employees, branch });
        }
    }
})

router.get('/:id_company/:id_branch/:id_user/employees', isLoggedIn, async (req, res) => {
    if(await validate_subscription(req,res)){
        const { id_company, id_user } = req.params;
        const employees = await search_employees(id_company);
        const employee_user = await search_employee(id_user);

        const branch = await get_data_branch(req);
        res.render('links/branch/employees/employee', { employees, branch, employee_user });
    }
})

router.get('/:id_company/:id_branch/:id_employee/edit-employees', isLoggedIn, async (req, res) => {
    if(await validate_subscription(req,res)){
        const { id_company, id_branch, id_employee } = req.params;
        const employee = await search_employee(id_employee);
        const departments = await search_employee_departments(id_company);
        const country = await get_country();
        const roles = await get_type_employees(id_company);
        
        //we will see if the suscription is fud one 
        if(req.user.rol_user == rolFree){
            const branchFree = await get_data_branch(req);
            const branches = branchFree;
            res.render('links/branch/employees/editEmployee', { employee, branchFree, departments, country, roles, branches });      
        }else{
            const branch = await get_data_branch(req);
            const branches = branch;
            res.render('links/branch/employees/editEmployee', { employee, branch, departments, country, roles, branches });
        }
    }
})

router.get('/:id_company/:id_branch/:id_user/delete-employee', isLoggedIn, async (req, res) => {
    const { id_company,id_branch,id_user } = req.params;
    //first delete the image for not save trash in the our server
    await delete_profile_picture(id_user);

    //we going to delete the employee 
    if (await delete_employee(id_user)) {
        //if the user is not deleted it doesn't really matter
        await delete_user(id_user);
        req.flash('success', 'El empleado fue eliminado 👍');
    }
    else {
        req.flash('message', 'El empleado no fue eliminado 👉👈');
    }

    res.redirect('/fud/' + id_company +'/'+id_branch+'/employees-branch');
})

async function search_employee_branch(idBranch) {
    var queryText = 'SELECT * FROM "Company".employees WHERE id_branches = $1';
    var values = [idBranch];
    const result = await database.query(queryText, values);
    return result.rows;
}

router.get('/:id_company/:id_branch/add-employee', isLoggedIn, async (req, res) => {
    if(await validate_subscription(req,res)){
        const { id_company } = req.params;
        const departments = await search_employee_departments(id_company);
        const country = await get_country()
        const roles = await get_type_employees(id_company)

        //we will see if the suscription is for fud one
        if(req.user.rol_user==rolFree){
            const branchFree = await get_data_branch(req);
            const branches = branchFree;
            res.render(companyName + '/branch/employees/addEmployee', { departments, country, roles, branches, branchFree });          
        }else{
            const branch = await get_data_branch(req);
            const branches = branch;
            res.render(companyName + '/branch/employees/addEmployee', { departments, country, roles, branches, branch });
        }
    }
})

router.get('/:id_company/:id_branch/:number_page/sales', isLoggedIn, async (req, res) => {
    if(await validate_subscription(req,res)){
        const { id_company,id_branch,number_page } = req.params;

        //we will convert the page number for that tha database can get all the data 
        let  pageNumber =parseInt(number_page)
        pageNumber = pageNumber <= 0 ? 1 : pageNumber; //this is for limite the search of the sale 

        //calculate the new data of the sale
        const salesStart=(pageNumber -1)*100;
        const salesEnd=pageNumber *100;

        //create the data sale for create the button in the web 
        const newNumberPage=pageNumber +1;
        const oldNumberPage=pageNumber -1;

        const dataSales=[{id_company,id_branch,oldNumberPage,newNumberPage,pageNumber}]

        const sales = await get_sales_branch(id_branch,salesStart,salesEnd);
        if(req.user.rol_user==rolFree){
            const branchFree = await get_data_branch(req);
            res.render('links/manager/sales/sales', { branchFree, sales ,dataSales});
        }else{
            const branch = await get_data_branch(req);
            res.render('links/manager/sales/sales', { branch, sales ,dataSales});
        }
    }
})

async function get_sales_branch(idBranch, start, end) {
    try {
        const query = `
            SELECT sh.*, dc.*, u.first_name AS employee_first_name, u.second_name AS employee_second_name, 
                   u.last_name AS employee_last_name, c.email AS customer_email, b.name_branch
            FROM "Box".sales_history sh
            LEFT JOIN "Kitchen".dishes_and_combos dc ON sh.id_dishes_and_combos = dc.id
            LEFT JOIN "Company".employees e ON sh.id_employees = e.id
            LEFT JOIN "Fud".users u ON e.id_users = u.id
            LEFT JOIN "Company".branches b ON sh.id_branches = b.id
            LEFT JOIN "Company".customers c ON sh.id_customers = c.id
            WHERE sh.id_branches = $1
            LIMIT $2 OFFSET $3
        `;
        const values = [idBranch, end - start, start];
        const result = await database.query(query, values);

        return result.rows;
    } catch (error) {
        console.error("Error al obtener datos de ventas:", error);
        throw error;
    }
}

router.get('/:id_company/:id_branch/:number_page/movements', isLoggedIn, async (req, res) => {
    if(await validate_subscription(req,res)){
        const { id_company, id_branch, number_page } = req.params;
        //we will convert the page number for that tha database can get all the data 
        let  pageNumber =parseInt(number_page)// convert the number_page to integer
        pageNumber = pageNumber <= 0 ? 1 : pageNumber; //this is for limite the search of the sale 

        const movementsStart = (pageNumber - 1) * 100;
        const movementsEnd = pageNumber * 100;

        //create the data sale for create the button in the web 
        const newNumberPage=pageNumber +1;
        const oldNumberPage=pageNumber -1;

        const dataMovent=[{id_company,id_branch,oldNumberPage,newNumberPage,pageNumber}]
        const movements = await get_movement_history_with_id_branch(id_branch,movementsStart,movementsEnd);
        if(req.user.rol_user==rolFree){
            const branchFree = await get_data_branch(req);
            res.render('links/manager/movements/movements', { branchFree, movements , dataMovent});
        }else{
            const branch = await get_data_branch(req);
            res.render('links/manager/movements/movements', { branch, movements , dataMovent});
        }
    }
})

async function get_movement_history_with_id_branch(idBranch, start, end) {
    try {
        const query = `
            SELECT 
                mh.*, 
                u.first_name AS employee_first_name, 
                u.second_name AS employee_second_name, 
                u.last_name AS employee_last_name, 
                b.name_branch
            FROM 
                "Box".movement_history mh
            LEFT JOIN 
                "Company".employees e ON mh.id_employees = e.id
            LEFT JOIN 
                "Fud".users u ON e.id_users = u.id
            LEFT JOIN 
                "Company".branches b ON mh.id_branches = b.id
            WHERE 
                mh.id_branches = $1
            LIMIT $2 OFFSET $3;
        `;
        const values = [idBranch, end - start, start];
        const result = await database.query(query, values);

        return result.rows;
    } catch (error) {
        console.error("Error al obtener datos de movimiento:", error);
        throw error;
    }
}

router.get('/:id_company/:id_branch/box', isLoggedIn, async (req, res) => {
    if(await validate_subscription(req,res)){
        const { id_branch, id_company } = req.params;
        const boxes = await get_box_branch(id_branch);
        //we will see if the user use fud one 
        const branch = await get_data_branch(req);
        const branchFree=branch
        if (req.user.rol_user==rolFree){
            res.render('links/branch/box/box', { branchFree, boxes });
        }else{
            res.render('links/branch/box/box', { branch, boxes });
        }
    }
})

async function get_box_branch(idBranch) {
    //we will search all the box that exist in the branc

    var queryText = `
        SELECT b.*, br.id_companies
        FROM "Branch".boxes b
        JOIN "Company".branches br ON b.id_branches = br.id
        WHERE b.id_branches = $1;
    `;

    //var queryText = `SELECT * from "Branch".boxes WHERE id_branches = $1`
    var values = [idBranch];
    const result = await database.query(queryText, values);
    return result.rows;
}

router.get('/:id_company/:id_branch/:id_box/:new_number/:new_ipPrinter/edit-box', isLoggedIn, async (req, res) => {
    if(await validate_subscription(req,res)){
        const { id_branch, id_company, id_box, new_number, new_ipPrinter } = req.params;

        //we will watching if caned update the box
        if (await update_box_branch(id_box, new_number, new_ipPrinter)) {
            req.flash('success', 'La caja fue actualizada con suministros 🤩')
        } else {
            req.flash('messagge', 'La caja no fue actualizada 😰')
        }

        res.redirect('/fud/' + id_company + '/' + id_branch + '/box');
    }
})

async function update_box_branch(id, num_box, ip_printer) {
    try {
        const queryText = `
            UPDATE "Branch".boxes
            SET num_box = $1, ip_printer = $2
            WHERE id = $3
        `;
        const values = [num_box, ip_printer, id];
        const result = await database.query(queryText, values);
        console.log(result)
        return true;
    } catch (error) {
        console.error("Error to update the data of the box:", error);
        return false;
    }
}

router.get('/:id_company/:id_branch/:id_box/delete-box', isLoggedIn, async (req, res) => {
    if(await validate_subscription(req,res)){
        const { id_branch, id_company, id_box } = req.params;
        //we will watching if caned delete the box
        if (await delete_box_branch(parseInt(id_box))) {
            req.flash('success', 'La caja fue eliminada con exito 👍')
        } else {
            req.flash('messagge', 'La caja no fue eliminada 👁️')
        }

        res.redirect('/fud/' + id_company + '/' + id_branch + '/box');
    }
})

async function delete_box_branch(id) {
    try {
        const queryText = `
            DELETE FROM "Branch".boxes
            WHERE id = $1
        `;
        const values = [id];
        await database.query(queryText, values);
        return true;
    } catch (error) {
        console.error("Error al eliminar la caja:", error);
        return false;
    }
}

//----------------------------------------------------------------ad
router.get('/:id_company/:id_branch/ad', isLoggedIn, async (req, res) => {
    //if(await validate_subscription(req,res)){
        const { id_branch } = req.params;

        //we going to get all the type of ad in the branch
        const offerAd = await get_all_ad(id_branch, 'offer');
        const newAd = await get_all_ad(id_branch, 'new');
        const combosAd = await get_all_ad(id_branch, 'combo');
        const specialsAd = await get_all_ad(id_branch, 'special');
        
        if(req.user.rol_user==rolFree){
            const branchFree = await get_data_branch(req);
            res.render('links/branch/ad/ad', { branchFree, offerAd, newAd, combosAd, specialsAd });
        }else{
            const branch = await get_data_branch(req);
            res.render('links/branch/ad/ad', { branch, offerAd, newAd, combosAd, specialsAd });   
        }
    //}
})

async function get_all_ad(idBranch, type) {
    var queryText = `
        SELECT 
            ROW_NUMBER() OVER() - 1 AS index,
            ad.id,
            ad.id_branches,
            ad.img,
            ad.type,
            ad.description,
            br.id_companies
        FROM 
            "Branch"."Ad" AS ad
        JOIN 
            "Company".branches AS br
        ON 
            ad.id_branches = br.id
        WHERE 
            ad.id_branches = $1
        AND 
            ad.type = $2;
    `;
    var values = [idBranch, type];
    const result = await database.query(queryText, values);
    return result.rows;
}

router.get('/:id_company/:id_branch/:id_ad/delete-ad', isLoggedIn, async (req, res) => {
    if(await validate_subscription(req,res)){
        const { id_branch, id_company, id_ad } = req.params;
        //we will geting the path of tha image for delete 
        const pathImg = await get_ad_image(id_ad);
        await delate_image_upload(pathImg);

        //if we can delete or not the ad, show a message
        if (await delete_ad(id_ad)) {
            req.flash('success', 'El anuncio fue eliminado con exito 👍')
        } else {
            req.flash('messagge', 'El anuncio no se pudo eliminar 🗑️')
        }

        res.redirect('/fud/' + id_company + '/' + id_branch + '/ad');
    }
})

router.post('/:id_company/:id_branch/:id_ad/update-ad-offer', isLoggedIn, async (req, res) => {
    if(await validate_subscription(req,res)){
        const { id_company, id_branch, id_ad } = req.params;
        if (req.file != undefined) {
            //if can delete the old image, we will creating the new ad
            const pathImg = await get_ad_image(id_ad);
            await delate_image_upload(pathImg);
            const image = await create_a_new_image(req);

            if (await update_ad(id_ad, image)) {
                req.flash('success', 'El anuncio fue actualizado 😉')
            } else {
                req.flash('message', 'El anuncio no pudo ser actualizado 👉👈')
            }
        }

        res.redirect('/fud/' + id_company + '/' + id_branch + '/ad');
    }
})

//----------------------------------------------------------------schelude marketplace
router.get('/:id_comopany/:id_branch/schedules', isLoggedIn, async (req, res) => {
    if(await validate_subscription(req,res)){
        const { id_company, id_branch, id_ad } = req.params;
        const branch = await get_data_branch(req);
        const schedules = await get_schedule_branch(id_branch);
        res.render("links/manager/employee/scheduleHome", { branch, schedules });
    }
    //res.render("links/manager/employee/schedule");
})

async function get_schedule_branch(idBranch) {
    var queryText = 'SELECT s.*, b.id_companies FROM "Employee".schedules s JOIN "Company".branches b ON s.id_branches = b.id WHERE s.id_branches = $1';
    var values = [idBranch];
    const result = await database.query(queryText, values);
    return result.rows;
}

router.get('/:id_company/:id_branch/add-schedule', isLoggedIn, async (req, res) => {
    if(await validate_subscription(req,res)){
        const branch = await get_data_branch(req);
        res.render(companyName + '/manager/employee/addSchedules', { branch });
    }
})

router.get('/:id_company/:id_branch/employee-schedules', isLoggedIn, async (req, res) => {
    if(await validate_subscription(req,res)){
        res.render('links/manager/employee/employeeSchedules');
    }
})

router.get('/:id_company/:id_branch/:id_schedule/delete-schedule', isLoggedIn, async (req, res) => {
    if(await validate_subscription(req,res)){
        const { id_company, id_branch, id_schedule } = req.params;
        if (await delete_schedule(id_schedule)) {
            req.flash('success', 'El horario fue eliminado con exito 😉')
        } else {
            req.flash('message', 'El horario no pudo ser eliminado 😅')
        }
        res.redirect('/fud/' + id_company + '/' + id_branch + '/schedules');
    }
})

async function delete_schedule(idSchedule) {
    try {
        const queryText = 'DELETE FROM "Employee".schedules WHERE id = $1';
        const values = [idSchedule];
        await database.query(queryText, values);
        return true;
    } catch (error) {
        console.error('Error deleting schedule:', error);
        return false;
    }
}

router.get('/:id_company/:id_branch/:id_schedule/edit-schedule', isLoggedIn, async (req, res) => {
    if(await validate_subscription(req,res)){
        const { id_company, id_branch, id_schedule } = req.params;
        const branch = await get_data_branch(req);
        const schedule = await get_data_schedule(id_schedule);
        res.render(companyName + '/manager/employee/editSchedule', { branch, schedule });
    }
})

async function get_data_schedule(idSchedule) {
    var queryText = 'SELECT s.*, b.id_companies FROM "Employee".schedules s JOIN "Company".branches b ON s.id_branches = b.id WHERE s.id = $1';
    var values = [idSchedule];
    const result = await database.query(queryText, values);
    return result.rows;
}


router.get('/:id_company/:id_branch/schedules-employees', isLoggedIn, async (req, res) => {
    if(await validate_subscription(req,res)){
        const { id_company, id_branch } = req.params;
        const branch = await get_data_branch(req);
        const schedules = await get_schedule_branch(id_branch);
        //we will watching if exist a schedule
        if (schedules.length > 0) {
            const employees = await search_employees_branch(id_branch);
            await create_new_schedule_of_the_week(id_branch, employees, schedules[0].id); //create the new schedule of the week 
            const schedulesEmployees = await get_schedule_employees(id_branch);
            console.log(schedulesEmployees)
            res.render("links/manager/employee/scheduleEmployees", { branch, schedules, employees, schedulesEmployees });
        } else {
            //if not exist a schedule, the user go to tha web of schedule for add a schedule
            req.flash('message', 'Primero necesitas agregar un horario 👁️')
            res.redirect('/fud/' + id_company + '/' + id_branch + '/add-schedule');
        }
    }
})

async function get_schedule_employees(idBranch) {
    // get the day
    var today = new Date();

    // get the first day of the week (monday)
    var dateStart = new Date(today);
    dateStart.setDate(dateStart.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));

    // get the finish day of the week (Sunday)
    var dateFinish = new Date(today);
    dateFinish.setDate(dateFinish.getDate() - today.getDay() + 7);

    var queryText = `
    SELECT hs.id AS id_history_schedule, hs.id_branches, hs.id_employees, hs.id_schedules, hs.date_start, hs.date_finish, s.*
    FROM "Employee".history_schedules hs
    JOIN "Employee".schedules s ON hs.id_schedules = s.id
    WHERE hs.id_branches = $1 
    AND hs.date_start >= $2 
    AND hs.date_finish <= $3`;

    var values = [idBranch, dateStart, dateFinish];
    const result = await database.query(queryText, values);
    return result.rows;
}

async function create_new_schedule_of_the_week(idBranch, employees, idSchedule) {
    // get the day
    var today = new Date();

    // get the first day of the week (monday)
    var dateStart = new Date(today);
    dateStart.setDate(dateStart.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));

    // get the finish day of the week (Sunday)
    var dateFinish = new Date(today);
    dateFinish.setDate(dateFinish.getDate() - today.getDay() + 7);

    for (var i = 0; i < employees.length; i++) {
        const idEmployee = employees[i].id_employee;
        if (!await this_schedule_exist(idEmployee, dateStart, dateFinish)) {
            await add_schedule(idEmployee, idBranch, idSchedule, dateStart, dateFinish);
        }
    }
}

async function this_schedule_exist(idEmployee, dateStart, dateFinish) {
    var queryText = `SELECT * FROM "Employee".history_schedules 
                     WHERE id_employees = $1 
                     AND date_start >= $2 
                     AND date_finish <= $3`;

    var values = [idEmployee, dateStart, dateFinish];

    const result = await database.query(queryText, values);
    console.log(result.rows.length > 0);
    return result.rows.length > 0;
}

async function add_schedule(idEmployee, idBranch, idSchedule, dateStart, dateFinish) {
    try {
        var queryText = `INSERT INTO "Employee".history_schedules (id_employees, id_branches,id_schedules, date_start, date_finish)
                         VALUES ($1, $2, $3, $4,$5)
                         RETURNING *`;

        var values = [idEmployee, idBranch, idSchedule, dateStart, dateFinish];
        const result = await database.query(queryText, values);
        return true;
    } catch (error) {
        console.error('Error al insertar el nuevo dato:', error);
        throw error;
        return false;
    }
}


router.get('/:id_company/:id_branch/:idScheduleEmployee/:idSchedule/edit-schedules-employees', isLoggedIn, async (req, res) => {
    if(await validate_subscription(req,res)){
        const { id_company, id_branch, idScheduleEmployee, idSchedule } = req.params;
        if (await update_history_schedule(idScheduleEmployee, idSchedule)) {
            req.flash('success', 'El horario fue actualizado con exito 😉')
        } else {
            req.flash('message', 'El horario no pudo ser actualizado 😮')
        }

        res.redirect('/fud/' + id_company + '/' + id_branch + '/schedules-employees');
    }
})

async function update_history_schedule(id, id_schedules) {
    try {
        // Construye la consulta SQL para actualizar la tabla history_schedules
        const queryText = `
            UPDATE "Employee".history_schedules
            SET id_schedules = $1
            WHERE id = $2;
        `;

        // Valores para la consulta SQL
        const values = [id_schedules, id];

        // Ejecuta la consulta en la base de datos
        await database.query(queryText, values);

        // Si llegamos hasta aquí, la actualización fue exitosa
        console.log(`Se actualizó el registro con id ${id}.`);

        // Puedes devolver algún mensaje si lo deseas
        return true;
    } catch (error) {
        // Manejo de errores
        console.error('Error al actualizar el registro:', error);
        throw error; // Opcional: lanza el error para que sea manejado externamente
    }
}

//----------------------------------------------------------------food department
router.get('/:id_company/:id_branch/add-department-free', isLoggedIn, async (req, res) => {
    const company = await check_company(req);
    const saucers = await get_data(req);
    res.render('links/store/dish', { company, saucers });
});

//
router.get('/:id_company/:id_branch/marketplace', isLoggedIn,async (req, res) => {
    const {id_branch}=req.body
    const branchFree = await get_data_branch(req);
    res.render('links/branch/marketplace/marketplace',{branchFree}); //this web is for return your user
})

/*store online*/
router.get('/myrestaurant/:id_company/:id_branch', async (req, res) => {
    const { id_company, id_branch } = req.params;
    const branchFree = await get_data_branch(req);
    if (branchFree != null) {
        const digitalMenu=[{menu:''}]
        //we get all the combo of the branch 
        const dishAndCombo = await get_all_dish_and_combo(id_company, id_branch);
        const newAd = await get_all_ad(id_branch, 'new');
        /*
        const newCombos = await get_data_recent_combos(id_company);
        const mostSold = await get_all_data_combo_most_sold(id_branch);

        //we going to get all the type of ad in the branch
        const offerAd = await get_all_ad(id_branch, 'offer');
        const newAd = await get_all_ad(id_branch, 'new');
        const combosAd = await get_all_ad(id_branch, 'combo');
        const specialsAd = await get_all_ad(id_branch, 'special');

        res.render('links/store/home/digitalMenu', { branchFree ,digitalMenu,dishAndCombo,newCombos,mostSold,offerAd,newAd,combosAd,specialsAd});
        */
        res.render('links/store/home/digitalMenu', { branchFree ,digitalMenu,dishAndCombo,newAd});
    } else {
        res.render('links/store/branchLost');
    }
});



module.exports = router;