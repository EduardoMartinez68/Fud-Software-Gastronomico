const database = require('../database');
const addDatabase = require('../router/addDatabase');
const rolFree=0

async function search_employees(idCompany) {
    // We search for the company's employees with additional information from other tables.
    const queryText = `
            SELECT e.id, e.id_companies, e.id_users, e.id_roles_employees, e.id_departments_employees, e.id_branches, e.num_int, e.num_ext, e.city, e.street, e.phone, e.cell_phone,
                   u.*, r.*, d.*, b.*, c.*
            FROM "Company".employees e
            LEFT JOIN "Fud".users u ON e.id_users = u.id
            LEFT JOIN "Employee".roles_employees r ON e.id_roles_employees = r.id
            LEFT JOIN "Employee".departments_employees d ON e.id_departments_employees = d.id
            LEFT JOIN "Company".branches b ON e.id_branches = b.id
            LEFT JOIN "Fud".country c ON e.id_country = c.id
            WHERE e.id_companies = $1
        `;

    var values = [idCompany];
    const result = await database.query(queryText, values);

    return result.rows;
}

async function search_employees_branch(idBranch) {
    // We search for the company's employees with additional information from other tables.
    const queryText = `
        SELECT e.id AS id_employee, e.id_companies, e.id_users, e.id_roles_employees, e.id_departments_employees, e.id_branches, e.num_int, e.num_ext, e.city, e.street, e.phone, e.cell_phone,
               u.*, r.*, d.*, b.*, c.*
        FROM "Company".employees e
        LEFT JOIN "Fud".users u ON e.id_users = u.id
        LEFT JOIN "Employee".roles_employees r ON e.id_roles_employees = r.id
        LEFT JOIN "Employee".departments_employees d ON e.id_departments_employees = d.id
        LEFT JOIN "Company".branches b ON e.id_branches = b.id
        LEFT JOIN "Fud".country c ON e.id_country = c.id
        WHERE e.id_branches = $1
    `;


    var values = [idBranch];
    const result = await database.query(queryText, values);

    return result.rows;
}

async function search_employee(idEmployee) {
    // search the employee of the company with information about other table
    const queryText = `
        SELECT e.id, e.id_companies, e.id_users, e.id_roles_employees, e.id_departments_employees, e.id_branches, e.num_int, e.num_ext, e.id_country,e.city, e.street, e.phone, e.cell_phone,
               u.*, r.*, d.*, c.*
        FROM "Company".employees e
        LEFT JOIN "Fud".users u ON e.id_users = u.id
        LEFT JOIN "Employee".roles_employees r ON e.id_roles_employees = r.id
        LEFT JOIN "Employee".departments_employees d ON e.id_departments_employees = d.id
        LEFT JOIN "Fud".country c ON e.id_country = c.id
        WHERE e.id_users = $1
    `;
    var values = [idEmployee];
    const result = await database.query(queryText, values);

    return result.rows;
}

async function delete_employee(idUser) {
    try {
        var queryText = 'DELETE FROM "Company".Employees WHERE id_users = $1';
        var values = [idUser];
        await database.query(queryText, values); // Delete employee
        return true;
    } catch (error) {
        console.error('Error al eliminar en la base de datos:', error);
        return false;
    }
}

async function search_employee_departments(idCompany) {
    //we will search the company of the user 
    var queryText = 'SELECT * FROM "Employee".departments_employees WHERE id_companies= $1';
    var values = [idCompany];
    const result = await database.query(queryText, values);

    return result.rows;
}

async function get_country() {
    const resultCountry = await database.query('SELECT * FROM "Fud".country');
    return resultCountry.rows;
}

async function get_type_employees(idCompany) {
    var queryText = 'SELECT * FROM "Employee".roles_employees WHERE id_companies= $1';
    var values = [idCompany];
    const result = await database.query(queryText, values);
    const data = result.rows;
    return data;
}


module.exports = {
    search_employees,
    search_employees_branch,
    search_employee,
    delete_employee,
    search_employee_departments,
    get_country,
    get_type_employees
};