//require
//const router=express.Router();
const database = require('../database');
const addDatabase = {}

async function update_company(company) {
    console.log(company);
    var queryText = get_query_edit_company(company);

    try {
        await database.query(queryText);
        return true;
    } catch (error) {
        console.error('Error update :', error);
        return false;
    }
}

function get_query_edit_company(company) {
    if (company.path_logo == "") {
        var queryText = `UPDATE "User".companies SET name='${company.name}', alias='${company.alias}', description='${company.description}', 
        representative='${company.representative}', ceo='${company.ceo}', id_country='${company.id_country}', phone='${company.phone}', 
        cell_phone='${company.cell_phone}', email='${company.email}', street='${company.street}', num_ext='${company.num_o}', 
        num_int='${company.num_i}', postal_code='${company.postal_code}', cologne='${company.cologne}', city='${company.city}', 
        states='${company.streets}', municipality='${company.municipality}' WHERE id='${company.id}'`;

        return queryText;
    }
    else {
        var queryText = `UPDATE "User".companies SET path_logo= '${company.path_logo}', name='${company.name}', alias='${company.alias}', description='${company.description}', 
        representative='${company.representative}', ceo='${company.ceo}', id_country='${company.id_country}', phone='${company.phone}', 
        cell_phone='${company.cell_phone}', email='${company.email}', street='${company.street}', num_ext='${company.num_o}', 
        num_int='${company.num_i}', postal_code='${company.postal_code}', cologne='${company.cologne}', city='${company.city}', 
        states='${company.streets}', municipality='${company.municipality}' WHERE id='${company.id}'`;

        return queryText;
    }
}

function get_query_edit_supplies_company(supplies) {
    //this code is for load a new image 
    var queryText = `UPDATE "Kitchen".products_and_supplies SET barcode= '${supplies.barcode}', name='${supplies.name}', description='${supplies.description}', 
    use_inventory='${supplies.use_inventory}'`;

    return queryText;
}


async function update_combo(combo) {
    var queryText = get_query_edit_combo(combo);

    try {
        await database.query(queryText);
        return true;
    } catch (error) {
        console.error('Error update :', error);
        return false;
    }
}

function get_query_edit_combo(combo) {
    if (combo.path_image == "") {
        var queryText = `UPDATE "Kitchen".dishes_and_combos SET name='${combo.name}', barcode='${combo.barcode}', description='${combo.description}', 
        id_product_department='${combo.id_product_department}', id_product_category='${combo.id_product_category}'`;

        return queryText;
    }
    else {
        var queryText = `UPDATE "Kitchen".dishes_and_combos SET img='${combo.path_image}', name='${combo.name}', barcode='${combo.alias}', description='${combo.description}', 
        id_product_department='${combo.id_product_department}', id_product_category='${combo.id_product_category}'`;

        return queryText;
    }
}

async function update_branch(id_branch, branch) {
    var queryText = `
        UPDATE "Company".branches 
        SET 
            name_branch=$1,
            alias=$2,
            representative=$3,
            id_country=$4,
            municipality=$5,
            city=$6,
            cologne=$7,
            address=$8,
            num_ext=$9,
            num_int=$10,
            postal_code=$11,
            email=$12,
            cell_phone=$13,
            phone=$14
        WHERE 
            id=$15
    `;

    const values = [
        branch.name,
        branch.alias,
        branch.representative,
        branch.country,
        branch.municipality,
        branch.city,
        branch.cologne,
        branch.street,
        branch.num_o,
        branch.num_i,
        branch.postal_code,
        branch.email,
        branch.cell_phone,
        branch.phone,
        id_branch
    ];

    console.log(queryText); // Solo para depuración, muestra la consulta SQL en la consola
    try {
        await database.query(queryText, values);
        return true;
    } catch (error) {
        console.error('Error update :', error);
        return false;
    }
}

async function update_customer(customerId, newCustomer) {
    var queryText = `
        UPDATE "Company".customers
        SET 
            first_name=$1,
            second_name=$2,
            last_name=$3,
            id_country=$4,
            states=$5,
            city=$6,
            street=$7,
            num_ext=$8,
            num_int=$9,
            postal_code=$10,
            email=$11,
            phone=$12,
            cell_phone=$13,
            points=$14,
            birthday=$15
        WHERE 
            id=$16
    `;

    const values = [
        newCustomer.firstName,
        newCustomer.secondName,
        newCustomer.lastName,
        newCustomer.country,
        newCustomer.states,
        newCustomer.city,
        newCustomer.street,
        newCustomer.num_o,
        newCustomer.num_i,
        newCustomer.postal_code,
        newCustomer.email,
        newCustomer.phone,
        newCustomer.cellPhone,
        newCustomer.points,
        newCustomer.birthday,
        customerId
    ];

    try {
        await database.query(queryText, values);
        return true;
    } catch (error) {
        console.error('Error updating customer:', error);
        return false;
    }
}

async function update_role_employee(idRoleEmployee, newRole){
    var queryText = `
    UPDATE "Employee".roles_employees
    SET 
        id_companies=$1,
        name=$2,
        salary=$3,
        currency=$4,
        type_of_salary=$5,
        commissions=$6,
        discount_for_product=$7,
        add_box=$8,
        edit_box=$9,
        delete_box=$10,
        create_reservation=$11,
        view_reservation=$12,
        view_reports=$13,
        add_customer=$14,
        edit_customer=$15,
        delete_customer=$16,
        cancel_debt=$17,
        offer_loan=$18,
        get_fertilizer=$19,
        view_customer_credits=$20,
        send_email=$21,
        add_employee=$22,
        edit_employee=$23,
        delete_employee=$24,
        create_schedule=$25,
        assign_schedule=$26,
        view_schedule=$27,
        create_type_user=$28,
        create_employee_department=$29,
        view_sale_history=$30,
        delete_sale_history=$31,
        view_movement_history=$32,
        delete_movement_history=$33,
        view_supplies=$34,
        add_supplies=$35,
        edit_supplies=$36,
        delete_supplies=$37,
        view_products=$38,
        edit_products=$39,
        delete_products=$40,
        view_combo=$41,
        add_combo=$42,
        edit_combo=$43,
        delete_combo=$44,
        view_food_departament=$45,
        add_food_departament=$46,
        edit_food_departament=$47,
        delete_food_departament=$48,
        view_food_category=$49,
        add_food_category=$50,
        edit_food_category=$51,
        delete_food_category=$52,
        waste_report=$53,
        add_provider=$54,
        edit_provider=$55,
        delete_provider=$56,
        view_provider=$57,
        sell=$58,
        apply_discount=$59,
        apply_returns=$60,
        add_offers=$61,
        edit_offers=$62,
        delete_offers=$63,
        change_coins=$64,
        modify_hardware=$65,
        modify_hardware_kitchen=$66,
        give_permissions=$67
        WHERE 
            id=$68
    `;

    var values = Object.values(newRole);
    values.push(idRoleEmployee);

    try {
        await database.query(queryText, values);
        return true;
    } catch (error) {
        console.error('Error updating role_employee:', error);
        return false;
    }
}

module.exports = {
    update_company,
    get_query_edit_supplies_company,
    update_combo,
    update_branch,
    update_customer,
    update_role_employee
};