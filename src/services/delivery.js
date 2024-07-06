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


//-----------------------------------------------------------------delivery uber and rappi-----------------------------------------------------------------
// Función para obtener pedidos de Uber Eats usando el token de acceso del usuario
async function get_order_uber(accessTokeUser) {
    try {
        const response = await axios.get('https://api.uber.com/v1/eats/orders', {
            headers: {
                'Authorization': `Bearer ${accessTokeUser}`,
                'Content-Type': 'application/json'
            }
        });

        const pedidos = response.data;
        return pedidos;
    } catch (error) {
        console.error('Error al obtener los pedidos:', error);
        return null;
    }
}

async function get_token_by_branch_id(id_branch) {
    const queryText = `
        SELECT token_uber, token_rappi
        FROM "Company".branches
        WHERE id = $1
    `;
    const values = [id_branch];

    try {
        const result = await database.query(queryText, values);
        if (result.rows.length > 0) {
            return result.rows[0]; // Devuelve el token_uber si se encuentra
        } else {
            return null; // Retorna null si no se encuentra ningún registro con branchId dado
        }
    } catch (error) {
        console.error('Error al obtener token_uber por ID:', error);
        throw error;
    }
}

//update tokens rappi and uber eat 
async function update_token_rappi_branch(id_branch, token_rappi) {
    var queryText = `
        UPDATE "Company".branches 
        SET 
            token_rappi=$1
        WHERE 
            id=$2
    `;

    const values = [
        token_rappi,
        id_branch
    ];

    try {
        await database.query(queryText, values);
        return true;
    } catch (error) {
        console.error('Error update :', error);
        return false;
    }
}

async function update_token_uber_eat_branch(id_branch, token_uber) {
    var queryText = `
        UPDATE "Company".branches 
        SET 
            token_uber=$1
        WHERE 
            id=$2
    `;

    const values = [
        token_uber,
        id_branch
    ];

    try {
        await database.query(queryText, values);
        return true;
    } catch (error) {
        console.error('Error update :', error);
        return false;
    }
}

// Función para obtener pedidos de Rappi usando el token de acceso del usuario
async function get_order_rappi(accessToken) {
    try {
      const response = await axios.get('https://api.rappi.com/v1/orders', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
  
      const pedidos = response.data;
      return pedidos;
    } catch (error) {
      console.error('Error al obtener los pedidos:', error);
      throw error;
    }
}

module.exports = {
    get_all_order_by_id_branch,
    get_all_order_by_id_employee,
    get_order_by_id,
    update_order_status_by_id,
    get_order_rappi,
    update_token_uber_eat_branch,
    update_token_rappi_branch,
    get_token_by_branch_id,
    get_order_uber
};