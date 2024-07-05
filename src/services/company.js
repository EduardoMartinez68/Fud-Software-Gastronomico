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