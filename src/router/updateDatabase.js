//require
//const router=express.Router();
const database=require('../database');
const addDatabase={}

async function update_company(company){
    console.log(company);
    var queryText = get_query_edit_company(company);

    try{
        await database.query(queryText);
        return true;
    } catch (error) {
        console.error('Error update :', error);
        return false;
    }
}

function get_query_edit_company(company){
    if (company.path_logo==""){
        var queryText=`UPDATE "User".companies SET name='${company.name}', alias='${company.alias}', description='${company.description}', 
        representative='${company.representative}', ceo='${company.ceo}', id_country='${company.id_country}', phone='${company.phone}', 
        cell_phone='${company.cell_phone}', email='${company.email}', street='${company.street}', num_ext='${company.num_o}', 
        num_int='${company.num_i}', postal_code='${company.postal_code}', cologne='${company.cologne}', city='${company.city}', 
        states='${company.streets}', municipality='${company.municipality}' WHERE id='${company.id}'`;
        
        return queryText;
    }
    else{
        var queryText = `UPDATE "User".companies SET path_logo= '${company.path_logo}', name='${company.name}', alias='${company.alias}', description='${company.description}', 
        representative='${company.representative}', ceo='${company.ceo}', id_country='${company.id_country}', phone='${company.phone}', 
        cell_phone='${company.cell_phone}', email='${company.email}', street='${company.street}', num_ext='${company.num_o}', 
        num_int='${company.num_i}', postal_code='${company.postal_code}', cologne='${company.cologne}', city='${company.city}', 
        states='${company.streets}', municipality='${company.municipality}' WHERE id='${company.id}'`;
        
        return queryText;
    }
}

function get_query_edit_supplies_company(supplies){
    //this code is for load a new image 
    var queryText = `UPDATE "Kitchen".products_and_supplies SET barcode= '${supplies.barcode}', name='${supplies.name}', description='${supplies.description}', 
    use_inventory='${supplies.use_inventory}'`;
    
    return queryText;
}


async function update_combo(combo){
    var queryText = get_query_edit_combo(combo);

    try{
        await database.query(queryText);
        return true;
    } catch (error) {
        console.error('Error update :', error);
        return false;
    }
}

function get_query_edit_combo(combo){
    if (combo.path_image==""){
        var queryText=`UPDATE "Kitchen".dishes_and_combos SET name='${combo.name}', barcode='${combo.barcode}', description='${combo.description}', 
        id_product_department='${combo.id_product_department}', id_product_category='${combo.id_product_category}'`;
        
        return queryText;
    }
    else{
        var queryText=`UPDATE "Kitchen".dishes_and_combos SET img='${combo.path_image}', name='${combo.name}', barcode='${combo.alias}', description='${combo.description}', 
        id_product_department='${combo.id_product_department}', id_product_category='${combo.id_product_category}'`;
        
        return queryText;
    }
}

async function update_branch(id_branch,branch){
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
        newCustomer.firstName,      // Assuming firstName corresponds to first_name
        newCustomer.secondName,     // Assuming secondName corresponds to second_name
        newCustomer.lastName,       // Assuming lastName corresponds to last_name
        newCustomer.country,        // Assuming country corresponds to id_country
        newCustomer.states,
        newCustomer.city,
        newCustomer.street,
        newCustomer.num_o,          // Assuming num_o corresponds to num_ext
        newCustomer.num_i,          // Assuming num_i corresponds to num_int
        newCustomer.postal_code,
        newCustomer.email,
        newCustomer.phone,
        newCustomer.cellPhone,
        newCustomer.points,
        newCustomer.birthday,
        customerId
    ];

    console.log(queryText); // For debugging purposes, logs the SQL query to the console

    try {
        await database.query(queryText, values);
        return true;
    } catch (error) {
        console.error('Error updating customer:', error);
        return false;
    }
}



module.exports={
    update_company,
    get_query_edit_supplies_company,
    update_combo,
    update_branch,
    update_customer
};