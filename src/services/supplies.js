const database = require('../database');
const addDatabase = require('../router/addDatabase');
const rolFree=0

//----------------------------------------------------------------supplies and products 
async function search_company_supplies_or_products(req, supplies) {
    //we will search the company of the user 
    const { id } = req.params;
    var queryText = 'SELECT * FROM "Kitchen".products_and_supplies WHERE id_companies= $1 and supplies= $2';
    var values = [id, supplies];
    const result = await database.query(queryText, values);

    return result.rows;
}

async function search_company_supplies_or_products_with_id_company(id_company, supplies) {
    //we will search the company of the user 
    var queryText = 'SELECT * FROM "Kitchen".products_and_supplies WHERE id_companies= $1 and supplies= $2';
    var values = [id_company, supplies];
    const result = await database.query(queryText, values);

    return result.rows;
}

async function search_company_supplies_or_products_with_company(id_company, supplies) {
    //we will search the company of the user 
    var queryText = 'SELECT * FROM "Kitchen".products_and_supplies WHERE id_companies= $1 and supplies= $2';
    var values = [id_company, supplies];
    const result = await database.query(queryText, values);

    return result.rows;
}

async function this_is_a_supplies_or_a_products(id) {
    //we will search the company of the user 
    var queryText = 'SELECT * FROM "Kitchen".products_and_supplies WHERE id= $1';
    const result = await database.query(queryText, [id]);

    return result.rows[0].supplies;
}

async function delate_supplies_company(id, pathOmg) {
    try {
        var queryText = 'DELETE FROM "Kitchen".products_and_supplies WHERE id=$1';
        var values = [id];
        await database.query(queryText, values); //delate supplies
        await delate_image_upload(pathOmg); //delate img
        return true;
    } catch (error) {
        return false;
    }
}

function get_new_data_supplies_company(req) {
    const { id, id_company, barcode, name, description, useInventory } = req.params;
    const newSupplies = {
        id,
        id_company,
        barcode,
        name,
        description,
        use_inventory: (useInventory == 'true')
    }
    return newSupplies;
}

async function update_supplies_company(newSupplies) {
    try {
        var queryText = `UPDATE "Kitchen".products_and_supplies SET barcode = $1, name = $2, description = $3, 
        use_inventory = $4 WHERE id = $5`;
        var values = [newSupplies.barcode, newSupplies.name, newSupplies.description, newSupplies.use_inventory, newSupplies.id];
        await database.query(queryText, values); // update supplies
        return true;
    } catch (error) {
        console.log(error)
        return false;
    }
}

async function get_supplies_or_features(id_branch, type) {
    var queryText = `
        SELECT 
            f.*,
            p.id_companies,
            p.img,
            p.barcode,
            p.name,
            p.description,
            p.use_inventory
        FROM "Inventory".product_and_suppiles_features f
        INNER JOIN "Kitchen".products_and_supplies p ON f.id_products_and_supplies = p.id
        WHERE f.id_branches = $1 and p.supplies =$2
    `;
    var values = [id_branch, type];
    const result = await database.query(queryText, values);
    const data = result.rows;
    return data;
}

async function get_supplies_with_id(id_supplies) {
    var queryText = `
        SELECT 
            f.*,
            p.id_companies,
            p.img,
            p.barcode,
            p.name,
            p.description,
            p.use_inventory
        FROM "Inventory".product_and_suppiles_features f
        INNER JOIN "Kitchen".products_and_supplies p ON f.id_products_and_supplies = p.id
        WHERE f.id = $1
    `;
    var values = [id_supplies];
    const result = await database.query(queryText, values);
    const data = result.rows;
    return data;
}

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

module.exports = {
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
};