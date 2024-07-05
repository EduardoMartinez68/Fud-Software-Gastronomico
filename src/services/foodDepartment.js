const database = require('../database');
const addDatabase = require('../router/addDatabase');
const rolFree=0

async function get_department(id_company) {
    var queryText = 'SELECT * FROM "Kitchen".product_department WHERE id_companies= $1';
    var values = [id_company];
    const result = await database.query(queryText, values);
    const data = result.rows;
    return data;
}

async function delate_product_department(id) {
    var queryText = 'DELETE FROM "Kitchen".product_department WHERE id = $1';
    var values = [id];

    try {
        await database.query(queryText, values);
        return true;
    } catch (error) {
        console.error('Error al eliminar el registro en la base de datos:', error);
        return false;
    }
};

async function update_product_department(id, name, description) {
    var values = [name, description, id];
    var queryText = 'UPDATE "Kitchen".product_department SET name = $1, description = $2 WHERE id = $3';

    try {
        await database.query(queryText, values);
        return true;
    } catch (error) {
        console.error('Error al actualizar el registro en la base de datos:', error);
        return false;
    }
}

async function this_department_be() {
    return true;
}

module.exports = {
    get_department,
    delate_product_department,
    update_product_department,
    this_department_be
};
