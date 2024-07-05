const database = require('../database');
const addDatabase = require('../router/addDatabase');
const rolFree=0

async function get_category(id_company) {
    var queryText = 'SELECT * FROM "Kitchen".product_category WHERE id_companies= $1';
    var values = [id_company];
    const result = await database.query(queryText, values);
    const data = result.rows;
    return data;
}

async function delate_product_category(id) {
    var queryText = 'DELETE FROM "Kitchen".product_category WHERE id = $1';
    var values = [id];

    try {
        await database.query(queryText, values);
        return true;
    } catch (error) {
        console.error('Error al eliminar el registro en la base de datos:', error);
        return false;
    }
};
module.exports = {
    get_category,
    delate_product_category,
};
