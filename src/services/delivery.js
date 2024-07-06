const database = require('../database');
const addDatabase = require('../router/addDatabase');

async function get_all_order_by_id_branch(idBranches) {
    const queryText = `
        SELECT
            o.id AS order_id,
            o.id_branches AS order_branch_id,
            o.id_commanders,
            o.id_employees AS order_employee_id,
            o.phone AS order_phone,
            o.address AS order_address,
            o.comment AS order_comment,
            o.status AS order_status,
            o.name_customer AS customer_name,
            o.cellphone AS customer_cellphone,
            c.id AS commander_id,
            c.id_employees AS commander_employee_id,
            c.id_customers AS commander_customer_id,
            c.order_details AS commander_order_details,
            c.total AS commander_total,
            c.money_received AS commander_money_received,
            c.change AS commander_change,
            c.status AS commander_status,
            c.comentary AS commander_comment,
            c.commander_date AS commander_date
        FROM
            "Branch".order o
        LEFT JOIN
            "Branch".commanders c ON c.id = o.id_commanders
        WHERE
            o.id_branches = $1
    `;
    const values = [idBranches];

    try {
        const result = await database.query(queryText, values);
        return result.rows; // Devuelve todas las filas que coinciden con idBranches
    } catch (error) {
        console.error('Error al obtener órdenes y comandantes:', error);
        throw error;
    }
}

async function get_all_order_by_id_employee(idEmployee) {
    const queryText = `
        SELECT
            o.id AS order_id,
            o.id_branches AS order_branch_id,
            o.id_commanders,
            o.id_employees AS order_employee_id,
            o.phone AS order_phone,
            o.address AS order_address,
            o.comment AS order_comment,
            o.status AS order_status,
            o.name_customer AS customer_name,
            o.cellphone AS customer_cellphone,
            c.id AS commander_id,
            c.id_employees AS commander_employee_id,
            c.id_customers AS commander_customer_id,
            c.order_details AS commander_order_details,
            c.total AS commander_total,
            c.money_received AS commander_money_received,
            c.change AS commander_change,
            c.status AS commander_status,
            c.comentary AS commander_comment,
            c.commander_date AS commander_date
        FROM
            "Branch".order o
        LEFT JOIN
            "Branch".commanders c ON c.id = o.id_commanders
        WHERE
            o.id_employees = $1
    `;
    const values = [idEmployee];

    try {
        const result = await database.query(queryText, values);
        return result.rows; // Devuelve todas las filas que coinciden con idEmployee
    } catch (error) {
        console.error('Error al obtener órdenes y comandantes:', error);
        throw error;
    }
}

async function get_order_by_id(order_id) {
    const queryText = `
        SELECT
            o.id AS order_id,
            o.id_branches AS order_branch_id,
            o.id_commanders,
            o.id_employees AS order_employee_id,
            o.phone AS order_phone,
            o.address AS order_address,
            o.comment AS order_comment,
            o.status AS order_status,
            o.name_customer AS customer_name,
            o.cellphone AS customer_cellphone,
            c.id AS commander_id,
            c.id_employees AS commander_employee_id,
            c.id_customers AS commander_customer_id,
            c.order_details AS commander_order_details,
            c.total AS commander_total,
            c.money_received AS commander_money_received,
            c.change AS commander_change,
            c.status AS commander_status,
            c.comentary AS commander_comment,
            c.commander_date AS commander_date
        FROM
            "Branch".order o
        LEFT JOIN
            "Branch".commanders c ON c.id = o.id_commanders
        WHERE
            o.id = $1
    `;
    const values = [order_id];

    try {
        const result = await database.query(queryText, values);
        return result.rows[0]; // Devuelve la fila que coincide con order_id
    } catch (error) {
        console.error('Error al obtener la orden y el comandante:', error);
        throw error;
    }
}

async function update_order_status_by_id(orderId, newStatus) {
    const queryText = `
        UPDATE "Branch".order
        SET
            status = $2
        WHERE
            id = $1
    `;
    const values = [orderId, newStatus];

    try {
        const result = await database.query(queryText, values);
        return result.rowCount; // Devuelve el número de filas actualizadas (debería ser 1)
    } catch (error) {
        console.error('Error al actualizar el estado de la orden:', error);
        throw error;
    }
}


module.exports = {
    get_all_order_by_id_branch,
    get_all_order_by_id_employee,
    get_order_by_id,
    update_order_status_by_id
};