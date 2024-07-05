const database = require('../../database');
const addDatabase = require('../../router/addDatabase');
const rolFree=0

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


module.exports = {
    get_supplies_or_features,
    get_supplies_with_id,
};