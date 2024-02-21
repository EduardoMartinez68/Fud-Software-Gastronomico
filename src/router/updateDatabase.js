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
        cell_phone='${company.cell_phone}', email_company='${company.email}', street='${company.street}', num_ext='${company.num_o}', 
        num_int='${company.num_i}', postal_code='${company.postal_code}', cologne='${company.cologne}', city='${company.city}', 
        states='${company.streets}', municipality='${company.municipality}' WHERE id='${company.id}'`;

        return queryText;
    }
    else {
        var queryText = `UPDATE "User".companies SET path_logo= '${company.path_logo}', name='${company.name}', alias='${company.alias}', description='${company.description}', 
        representative='${company.representative}', ceo='${company.ceo}', id_country='${company.id_country}', phone='${company.phone}', 
        cell_phone='${company.cell_phone}', email_company='${company.email}', street='${company.street}', num_ext='${company.num_o}', 
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


async function update_combo(idCombo,combo) {
    var queryText = get_query_edit_combo_company(idCombo,combo);
    try {
        await database.query(queryText);
        return true;
    } catch (error) {
        console.error('Error update :', error);
        return false;
    }
}

function get_query_edit_combo_company(idCombo,combo) {
    if (combo.path_image == "") {
        var queryText = `UPDATE "Kitchen".dishes_and_combos SET name='${combo.name}', barcode='${combo.barcode}', description='${combo.description}', 
        id_product_department='${combo.id_product_department}', id_product_category='${combo.id_product_category}' WHERE id=${idCombo}`;

        return queryText;
    }
    else {
        var queryText = `UPDATE "Kitchen".dishes_and_combos SET img='${combo.path_image}', name='${combo.name}', barcode='${combo.alias}', description='${combo.description}', 
        id_product_department='${combo.id_product_department}', id_product_category='${combo.id_product_category}' WHERE id=${idCombo}`;

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
            email_branch=$12,
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
        name_role=$2,
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



function get_query_edit_combo(dataUser){
    var queryText = `
    UPDATE "Fud".users
    SET 
        photo=$1,
        user_name=$2,
        email=$3,
        first_name=$4,
        second_name=$5,
        last_name=$6,
        rol_user=$7
    WHERE 
        id=$8
    `;

    if(dataUser.image==""){
        queryText = `
        UPDATE "Fud".users
        SET 
            user_name=$1,
            email=$2,
            first_name=$3,
            second_name=$4,
            last_name=$5,
            rol_user=$6
        WHERE 
            id=$7
    `;
    }

    return queryText;
}


async function update_user(idUser,dataUser){
    var queryText = get_query_edit_combo(dataUser)
    
    //create the array
    var values = Object.values(dataUser);

    //we will see if exist a new image for the perfil photo
    if(dataUser.image==""){
        //we will delete the data of the image 
        values.splice(0, 1);
    }

    //we will add the id of the user for update the data
    values.push(idUser)

    //update the user data in the database
    try {
        await database.query(queryText, values);
        return true;
    } catch (error) {
        console.error('Error updating user:', error);
        return false;
    }
}

async function update_employee(idEmployee,dataEmployee){
    queryText = `
    UPDATE "Company".employees
    SET 
        id_roles_employees=$1,
        id_departments_employees=$2,
        id_branches=$3,
        id_country=$4,
        city=$5,
        street=$6,
        num_int=$7,
        num_ext=$8,
        phone=$9,
        cell_phone=$10
    WHERE 
        id_users=$11
`;

    //create the array and save the id of the employee that we will editing
    var values = Object.values(dataEmployee);
    values.push(idEmployee)
    
    //update the employee data in the database
    try {
        await database.query(queryText, values);
        return true;
    } catch (error) {
        console.error('Error updating employee:', error);
        return false;
    }
}

async function update_provider_company(idProvider,dataProvider){
    const queryText = `
    UPDATE "Branch".providers
    SET 
        id_branches=$1, name=$2, representative=$3, email=$4, website=$5, rfc=$6, curp=$7, phone=$8, cell_phone=$9, credit_limit=$10, credit_days=$11, category=$12, comment=$13, type=$14, business_name=$15, business_representative=$16, business_curp=$17, business_rfc=$18, business_phone=$19, business_cell_phone=$20, business_address=$21, business_postal_code=$22
    WHERE 
        id=$23
    `;

    //create the array of the new data provider
    var values = Object.values(dataProvider);
    values.push(idProvider) //add the id provider

    //update the provider data in the database
    try {
        await database.query(queryText, values);
        return true;
    } catch (error) {
        console.error('Error updating provider:', error);
        return false;
    }
}

async function update_supplies_branch(supplies){
    const queryText = `
    UPDATE "Inventory".product_and_suppiles_features
    SET 
        purchase_amount=$1,
        purchase_unity=$2,
        purchase_price=$3,
        currency_purchase=$4,
        sale_amount=$5,
        sale_unity=$6,
        sale_price=$7,
        currency_sale=$8,
        max_inventary=$9,
        minimum_inventory=$10,
        unit_inventory=$11,
        existence=$12
    WHERE 
        id=$13
    `;
    
    console.log(supplies)
    //create the array of the new data supplies
    var values = Object.values(supplies);

    //update the provider data in the database
    try {
        await database.query(queryText, values);
        return true;
    } catch (error) {
        console.error('Error updating provider:', error);
        return false;
    }
}

async function update_combo_branch(combo){
    const queryText = `
    UPDATE "Inventory".dish_and_combo_features
    SET 
        favorites=$1,
        price_1=$2,
        revenue_1=$3,
        price_2=$4,
        revenue_2=$5,
        price_3=$6,
        revenue_3=$7,
        sat_key=$8
    WHERE 
        id=$9
    `;
    
    //create the array of the new data combo
    var values = Object.values(combo);

    //update the provider data in the database
    try {
        await database.query(queryText, values);
        return true;
    } catch (error) {
        console.error('Error updating provider:', error);
        return false;
    }
}


module.exports = {
    update_company,
    get_query_edit_supplies_company,
    update_combo,
    update_branch,
    update_customer,
    update_role_employee,
    update_user,
    update_employee,
    update_provider_company,
    update_supplies_branch,
    update_combo_branch
};