const database = require('../database');
const addDatabase = require('../router/addDatabase');
const rolFree=0

async function get_data_employee(req) {
    const id_user = req.user.id;
    var queryText = 'SELECT * FROM "Company"."employees" WHERE id_users= $1';
    var values = [id_user];
    const result = await database.query(queryText, values);
    const data = result.rows;
    return data;
}

async function this_employee_works_here(req, res) {
    const { id_user } = req.params;

    //first we will watching if the id of the user is equal to the id of the account.
    if (id_user == req.user.id) {
        //we will watching if the employee data is of the user and work in this company 
        if (await this_data_employee_is_user(req)) {
            return true;
        }
    }
    req.flash('message', '⚠️ ¡Estás intentando acceder a una cuenta que no te pertenece! ⚠️')
    res.render('links/store/branchLost')
    //res.redirect('/fud/home');
}

async function this_data_employee_is_user(req) {
    const employee = await get_data_employee(req);
    const data = employee[0]
    const id_user_employee = data.id_users
    const id_company_employee = data.id_companies
    const id_branch_employee = data.id_branches
    const id_employee_employee = data.id
    const id_role_employee = data.id_roles_employees

    const { id_company, id_branch, id_employee, id_role } = req.params;

    return (id_user_employee == req.user.id) && (id_company_employee == id_company) && (id_branch_employee == id_branch) && (id_employee_employee == id_employee) && (id_role_employee == id_role)
}

async function get_all_dish_and_combo(idCompany, idBranch) {
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
        WHERE i.id_branches = $1
    `;
    var values = [idBranch];
    const result = await database.query(queryText, values);
    return result.rows;
}

async function get_all_additions(dishAndCombo){
    var additional=[]
    for(var i = 0; i < dishAndCombo.length; i++){
        try{
            var queryText = `
                SELECT id, id_dishes_and_combos, id_products_and_supplies FROM "Kitchen".table_supplies_combo 
                WHERE id_dishes_and_combos = $1 and additional=true
            `;
            var values = [dishAndCombo[i].id_dishes_and_combos];
            const result = await database.query(queryText, values);
            if(result.rows.length>0){
                additional.push(result.rows)
            }
        }catch (error) {
            // Manejo de errores
            console.error('Error al actualizar leer los addition de los combos:', error);
        }
    }

    return additional;
}

async function get_all_data_combo_most_sold(id_branch) {
    const mostSold = await get_all_combo_most_sold(id_branch);
    var dataComboSold = []
    for (let i = 0; i < mostSold.length; i++) {
        const combo = mostSold[i];
        const data = await get_dish_and_combo_with_id(combo.id_dishes_and_combos);
        dataComboSold.push(data);
    }

    return dataComboSold;
}

async function get_data_recent_combos(id_company) {
    const newCombo = await get_recent_combos(id_company);
    var dataCombo = []
    for (let i = 0; i < newCombo.length; i++) {
        const combo = newCombo[i];
        const data = await get_dish_and_combo_with_id(combo.id);
        dataCombo.push(data);
    }

    return dataCombo;
}

async function get_recent_combos(id_company) {
    try {
        const queryText = `
            SELECT *
            FROM "Kitchen".dishes_and_combos
            WHERE id_companies = $1
            ORDER BY id DESC
            LIMIT 10;
        `;
        const values = [id_company];
        const result = await database.query(queryText, values);
        return result.rows;
    } catch (error) {
        console.error("Error occurred while fetching recent combos:", error);
        throw error;
    }
}

async function get_all_combo_most_sold(idNranch) {
    try {
        const queryText = `
            SELECT id_dishes_and_combos, SUM(amount) AS total_sold
            FROM "Box".sales_history
            WHERE id_branches = $1
            GROUP BY id_dishes_and_combos
            ORDER BY total_sold DESC
            LIMIT 10;
        `;
        const values = [idNranch];
        const result = await database.query(queryText, values);
        return result.rows;
    } catch (error) {
        console.error("Error occurred while fetching top 10 products:", error);
        throw error;
    }
}

async function get_dish_and_combo_with_id(idCombo) {
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
        WHERE d.id = $1
    `;
    var values = [idCombo];
    const result = await database.query(queryText, values);
    return result.rows[0];
}


module.exports = {
    this_employee_works_here,
    this_data_employee_is_user,
    get_all_dish_and_combo,
    get_all_additions,
    get_all_data_combo_most_sold,
    get_data_recent_combos,
    get_recent_combos,
    get_all_combo_most_sold,
    get_dish_and_combo_with_id
};