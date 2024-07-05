const database = require('../database');
const addDatabase = require('../router/addDatabase');
const rolFree=0

async function get_all_combos(req) {
    //we will search the company of the user 
    const { id } = req.params;
    const queryText = `
    SELECT dc.*, pd.name AS department_name, pc.name AS category_name
    FROM "Kitchen".dishes_and_combos dc
    LEFT JOIN "Kitchen".product_department pd ON dc.id_product_department = pd.id
    LEFT JOIN "Kitchen".product_category pc ON dc.id_product_category = pc.id
    WHERE dc.id_companies = $1
`;
    var values = [id];
    const result = await database.query(queryText, values);

    return result.rows;
}

async function search_combo(id_company, id_dishes_and_combos) {
    //we will search the company of the user 
    var queryText = 'SELECT * FROM "Kitchen".dishes_and_combos WHERE id_companies= $1 and id=$2';
    var values = [id_company, id_dishes_and_combos];
    const result = await database.query(queryText, values);

    return result.rows;
}

async function search_supplies_combo(id_dishes_and_combos) {
    var queryText = `
        SELECT tsc.*, pas.img AS img, pas.name AS product_name, pas.barcode AS product_barcode
        FROM "Kitchen".table_supplies_combo tsc
        JOIN "Kitchen".products_and_supplies pas ON tsc.id_products_and_supplies = pas.id
        WHERE tsc.id_dishes_and_combos = $1 ORDER BY id_products_and_supplies DESC
    `;
    var values = [id_dishes_and_combos];
    const result = await database.query(queryText, values);
    return result.rows;
}

async function delate_combo_company(id, pathImg) {
    try {
        var queryText = 'DELETE FROM "Kitchen".dishes_and_combos WHERE id=$1';
        var values = [id];
        await delete_all_supplies_combo(id);
        await delate_image_upload(pathImg); //delate img
        await database.query(queryText, values); //delate combo
        return true;
    } catch (error) {
        return false;
    }
}

async function delete_all_supplies_combo(id) {
    try {
        var queryText = 'DELETE FROM "Kitchen".table_supplies_combo WHERE id_dishes_and_combos = $1';
        var values = [id];
        await database.query(queryText, values); // Delete combo
        return true;
    } catch (error) {
        console.error('Error al eliminar en la base de datos:', error);
        return false;
    }
}


module.exports = {
    get_all_combos,
    search_combo,
    search_supplies_combo,
    delate_combo_company,
    delete_all_supplies_combo
};