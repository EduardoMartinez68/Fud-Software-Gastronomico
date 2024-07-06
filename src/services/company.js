const database = require('../database');
const addDatabase = require('../router/addDatabase');

async function get_data_tabla_with_id_company(id_company, schema, table) {
    var queryText = `SELECT * FROM "${schema}".${table} WHERE id_companies= $1`;
    var values = [id_company];
    const result = await database.query(queryText, values);
    const data = result.rows;
    return data;
}

function the_user_have_this_company(company) {
    return company.rows.length > 0;
}

async function search_the_company_of_the_user(req) {
    //we will search the company of the user 
    const { id } = req.params;
    var queryText = 'SELECT * FROM "User".companies WHERE id= $1 and id_users= $2';
    var values = [id, parseInt(req.user.id)];
    const result = await database.query(queryText, values);

    return result;
}

async function get_data_company_with_id(id_company) {
    var queryText = 'SELECT * FROM "User".companies WHERE id= $1';
    var values = [id_company];
    const result = await database.query(queryText, values);
    const data = result.rows;
    return data;
}

async function delete_my_company(id_company,req){
    try {
        var queryText = '';
        var values = [];

        //delete role employee
        queryText = 'DELETE FROM "Employee".roles_employees WHERE id_companies= $1';
        values = [id_company];
        await database.query(queryText, values);

        //delete my company
        var queryText = 'DELETE FROM "User".companies WHERE id= $1 and id_users= $2';
        var values = [id_company, parseInt(req.user.id)];
        await database.query(queryText, values);


        return true;
    } catch (error) {
        console.log(error)
        return false;
    }
}

async function get_data_company(req, nameTable) {
    const { id } = req.params;
    var queryText = 'SELECT * FROM "Company".' + nameTable + ' WHERE id_companies= $1';
    var values = [id];
    const result = await database.query(queryText, values);
    const data = result.rows;
    return data;
}

async function check_company_other(req) {
    const { id_company } = req.params;
    var queryText = 'SELECT * FROM "User".companies WHERE id= $1 and id_users= $2';
    var values = [id_company, parseInt(req.user.id)];
    const result = await database.query(queryText, values);
    const company = result.rows;
    return company;
}

async function check_company(req) {
    const { id } = req.params;
    var queryText = 'SELECT * FROM "User".companies WHERE id= $1 and id_users= $2';
    var values = [id, parseInt(req.user.id)];
    const result = await database.query(queryText, values);
    const company = result.rows;
    return company;
}

async function this_company_is_of_this_user(req, res) {
    //get the id of the company
    const { id_company } = req.params;
    const company = await check_company_user(id_company, req); //search all the company of the user 
    console.log(id_company)
    //we will see if exist this company in the list of the user
    if (company.length > 0) {
        return company;
    } else {
        //if not exist we will to show a invasion message 
        req.flash('message', '⚠️Esta empresa no es tuya⚠️');
        res.redirect('/fud/home');
    }
}

async function check_company_user(id_company, req) {
    //we going to search all the company of the user with this id 
    var queryText = 'SELECT * FROM "User".companies WHERE id= $1 and id_users= $2';
    var values = [id_company, parseInt(req.user.id)];
    const result = await database.query(queryText, values);
    const company = result.rows;
    return company;
}

async function get_free_company(id_user){
    var queryText = 'SELECT id FROM "User".companies WHERE id_users = $1';
    var values = [id_user];
    const result = await database.query(queryText, values);
    const companyId = result.rows[0].id;
    return companyId;
}


/*////this is for get the pack database//*/
async function get_pack_database(id_company){
    try {
        const queryText = `
            SELECT pack_database
            FROM "User".companies
            WHERE id = $1
        `;
        const { rows } = await database.query(queryText, [id_company]);
        if (rows.length > 0) {
            return rows[0].pack_database;
        } else {
            return null; 
        }
    } catch (error) {
        console.error('Error al obtener pack_database:', error);
        return 0;
    }
}


module.exports = {
    get_data_tabla_with_id_company,
    the_user_have_this_company,
    search_the_company_of_the_user,
    get_data_company_with_id,
    delete_my_company,
    get_data_company,
    check_company_other,
    check_company,
    get_pack_database,
    this_company_is_of_this_user,
    check_company_user,
    get_free_company
};