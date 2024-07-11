const database = require('../database');
const addDatabase = require('../router/addDatabase');
const rolFree=0

async function get_all_invoice_with_the_id_of_the_branch(id_branch) {
    const queryText = `
    SELECT 
        f."Invoice Number", 
        f.id_companies, 
        f.id_branches, 
        f.id_employees, 
        f.id_customers, 
        f.id_commanders, 
        f.name_customer, 
        f.email_customer, 
        f.address, 
        f.transition_type, 
        f.payment_reference, 
        f.creation_date, 
        f.payment_date, 
        f.type_of_documentation, 
        f.status, 
        f.paid, 
        b.name_branch AS branch_name
    FROM 
        "Branch".facture f
    JOIN 
        "Company".branches b ON b.id = f.id_branches
    WHERE 
        f.id_branches = $1;
    `;
    var values = [id_branch];
    const result = await database.query(queryText, values);

    return result.rows;
}

module.exports = {
    get_all_invoice_with_the_id_of_the_branch,
};