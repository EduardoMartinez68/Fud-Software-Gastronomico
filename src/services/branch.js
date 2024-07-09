const database = require('../database');
const addDatabase = require('../router/addDatabase');
const rolFree=0
async function delete_branch_company(idBranch) {
    try {
        var queryText = 'DELETE FROM "Company".branches WHERE id = $1';
        var values = [idBranch];
        await database.query(queryText, values); // Delete branch
        return true;
    } catch (error) {
        console.error('Error to delete branch:', error);
        return false;
    }
}

async function get_branch(req) {
    const { idBranch } = req.params;
    var queryText = 'SELECT * FROM "Company".branches WHERE id= $1';
    var values = [idBranch];
    const result = await database.query(queryText, values);
    const data = result.rows;
    return data;
}

async function search_all_branch(id_company) {
    var queryText = `
        SELECT branches.*, country.name AS country_name
        FROM "Company".branches
        INNER JOIN "Fud".country ON branches.id_country = country.id
        WHERE branches.id_companies = $1`;

    var values = [id_company];
    const result = await database.query(queryText, values);

    return result.rows;
}

async function get_data_branch_view_manager(id_branch) {
    var queryText = 'SELECT * FROM "Company".branches WHERE id= $1';
    var values = [id_branch];
    const result = await database.query(queryText, values);
    const data = result.rows;
    return data;
}

async function get_data_branch(id_branch) {
    var queryText = 'SELECT * FROM "Company".branches WHERE id= $1';
    var values = [id_branch];
    const result = await database.query(queryText, values);
    const data = result.rows;
    return data;
}


async function get_id_branch(id_company){
    var queryText = 'SELECT * FROM "Company".branches Where id_companies= $1';
    var values = [parseInt(req.user.id)];
    const result = await database.query(queryText, values);
    const branches = result.rows;
    if(branches.length>1){

    }else{

    }
}

async function get_pack_branch(id_branch){
    try {
        const queryText = `
            SELECT pack_database
            FROM "Company".branches
            WHERE id = $1
        `;
        const { rows } = await database.query(queryText, [id_branch]);
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

async function get_all_box_of_the_branch_with_his_id(id_branch){
    //we will search all the box that exist in the branch
    var queryText = `
        SELECT b.*, br.id_companies
        FROM "Branch".boxes b
        JOIN "Company".branches br ON b.id_branches = br.id
        WHERE b.id_branches = $1;
    `;

    //var queryText = `SELECT * from "Branch".boxes WHERE id_branches = $1`
    var values = [id_branch];
    const result = await database.query(queryText, values);
    return result.rows;
}


module.exports = {
    delete_branch_company,
    get_branch,
    search_all_branch,
    get_data_branch_view_manager,
    get_data_branch,
    get_id_branch,
    get_pack_branch,
    get_all_box_of_the_branch_with_his_id
};