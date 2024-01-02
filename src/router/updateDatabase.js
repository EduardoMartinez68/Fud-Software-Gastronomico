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

module.exports={
    update_company,
    get_query_edit_supplies_company,
    update_combo
};