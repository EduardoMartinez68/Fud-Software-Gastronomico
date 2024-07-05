const database = require('../database');
const addDatabase = require('../router/addDatabase');
const rolFree=0

async function get_sales_company(idCompany, start, end) {
    try {
        const query = `
            SELECT sh.*, dc.*, u.first_name AS employee_first_name, u.second_name AS employee_second_name, 
                   u.last_name AS employee_last_name, c.email AS customer_email, b.name_branch
            FROM "Box".sales_history sh
            LEFT JOIN "Kitchen".dishes_and_combos dc ON sh.id_dishes_and_combos = dc.id
            LEFT JOIN "Company".employees e ON sh.id_employees = e.id
            LEFT JOIN "Fud".users u ON e.id_users = u.id
            LEFT JOIN "Company".branches b ON sh.id_branches = b.id
            LEFT JOIN "Company".customers c ON sh.id_customers = c.id
            WHERE sh.id_companies = $1
            LIMIT $2 OFFSET $3
        `;
        const values = [idCompany, end - start, start];
        const result = await database.query(query, values);

        return result.rows;
    } catch (error) {
        console.error("Error al obtener datos de ventas get_sales_company:", error);
        return [];
    }
}

async function get_movements_company(idCompany, start, end) {
    try {
        const query = `
            SELECT sh.*, u.first_name AS employee_first_name, u.second_name AS employee_second_name, 
                   u.last_name AS employee_last_name, b.name_branch
            FROM "Box".movement_history sh
            LEFT JOIN "Company".employees e ON sh.id_employees = e.id
            LEFT JOIN "Fud".users u ON e.id_users = u.id
            LEFT JOIN "Company".branches b ON sh.id_branches = b.id
            WHERE sh.id_branches = $1
            LIMIT $2 OFFSET $3
        `;
        const values = [idCompany, end - start, start];
        const result = await database.query(query, values);

        return result.rows;
    } catch (error) {
        console.error("Error al obtener datos de movimientos:", error);
        throw error;
    }
}

//-----------------------------------------------------------this function is for get all the sale of today (day,month,reay)
function get_sales_data(data) {
    const salesData = {};
    data.forEach(item => {
        const saleDay = new Date(item.sale_day).toLocaleDateString();
        if (!salesData[saleDay]) {
            salesData[saleDay] = 0;
        }
        salesData[saleDay] += item.total;
    });

    return salesData;
}

async function get_sales_company_for_day(idCompany) {
    try {
        const query = `
            SELECT sh.*, dc.*, u.first_name AS employee_first_name, u.second_name AS employee_second_name, 
                   u.last_name AS employee_last_name, c.email AS customer_email, b.name_branch,
                   EXTRACT(HOUR FROM sh.sale_day) AS sale_hour
            FROM "Box".sales_history sh
            LEFT JOIN "Kitchen".dishes_and_combos dc ON sh.id_dishes_and_combos = dc.id
            LEFT JOIN "Company".employees e ON sh.id_employees = e.id
            LEFT JOIN "Fud".users u ON e.id_users = u.id
            LEFT JOIN "Company".branches b ON sh.id_branches = b.id
            LEFT JOIN "Company".customers c ON sh.id_customers = c.id
            WHERE sh.id_companies = $1
            AND DATE(sh.sale_day) = current_date
        `;
        const values = [idCompany];
        const result = await database.query(query, values);

        return result.rows;
    } catch (error) {
        console.error("Error al obtener datos de ventas get_sales_company_for_day:", error);
        throw error;
    }
}

function get_sales_data_day(data) {
    const salesData = {};
    data.forEach(item => {
        const saleHour = new Date(item.sale_day).getHours(); // Obtener solo la hora de la venta
        if (!salesData[saleHour]) {
            salesData[saleHour] = 0;
        }
        salesData[saleHour] += item.total;
    });

    return salesData;
}

async function get_sales_company_for_month(idCompany) {
    try {
        const query = `
            SELECT sh.*, dc.*, u.first_name AS employee_first_name, u.second_name AS employee_second_name, 
                   u.last_name AS employee_last_name, c.email AS customer_email, b.name_branch
            FROM "Box".sales_history sh
            LEFT JOIN "Kitchen".dishes_and_combos dc ON sh.id_dishes_and_combos = dc.id
            LEFT JOIN "Company".employees e ON sh.id_employees = e.id
            LEFT JOIN "Fud".users u ON e.id_users = u.id
            LEFT JOIN "Company".branches b ON sh.id_branches = b.id
            LEFT JOIN "Company".customers c ON sh.id_customers = c.id
            WHERE sh.id_companies = $1
            AND EXTRACT(MONTH FROM sh.sale_day) = EXTRACT(MONTH FROM CURRENT_DATE)
            AND EXTRACT(YEAR FROM sh.sale_day) = EXTRACT(YEAR FROM CURRENT_DATE)
        `;
        const values = [idCompany];
        const result = await database.query(query, values);

        return result.rows;
    } catch (error) {
        console.error("Error al obtener datos de ventas get_sales_company_for_month:", error);
        throw error;
    }
}

async function get_sales_company_for_year(idCompany) {
    try {
        const query = `
            SELECT sh.*, dc.*, u.first_name AS employee_first_name, u.second_name AS employee_second_name, 
                   u.last_name AS employee_last_name, c.email AS customer_email, b.name_branch
            FROM "Box".sales_history sh
            LEFT JOIN "Kitchen".dishes_and_combos dc ON sh.id_dishes_and_combos = dc.id
            LEFT JOIN "Company".employees e ON sh.id_employees = e.id
            LEFT JOIN "Fud".users u ON e.id_users = u.id
            LEFT JOIN "Company".branches b ON sh.id_branches = b.id
            LEFT JOIN "Company".customers c ON sh.id_customers = c.id
            WHERE sh.id_companies = $1
            AND EXTRACT(YEAR FROM sh.sale_day) = EXTRACT(YEAR FROM CURRENT_DATE)
        `;
        const values = [idCompany];
        const result = await database.query(query, values);

        return result.rows;
    } catch (error) {
        console.error("Error al obtener datos de ventas get_sales_company_for_year:", error);
        throw error;
    }
}
//-----------------------------------------------------------this function is for get all the moving of branches (day)
async function get_branchIds_by_company(idCompany) {
    try {
        const query = `
            SELECT id
            FROM "Company".branches
            WHERE id_companies = $1;
        `;
        const values = [idCompany];
        const result = await database.query(query, values);
        return result.rows.map(row => row.id);
    } catch (error) {
        console.error("Error al obtener los IDs de sucursales:", error);
        throw error;
    }
}

async function get_movements_company_negative(branches) {
    var total = 0;
    for (var i = 0; i < branches.length; i++) {
        total += await get_negative_moves_by_branch(branches[i]);
    }
    return total;
}

async function get_negative_moves_by_branch(idBranch) {
    try {
        const query = `
            SELECT COALESCE(SUM(move), 0) AS total_negative_moves
            FROM "Box".movement_history
            WHERE id_branches IN (
                SELECT id
                FROM "Company".branches
                WHERE id = $1
            )
            AND date_move::date = CURRENT_DATE
            AND move < 0;
        `;
        const values = [idBranch];
        const result = await database.query(query, values);
        return result.rows[0].total_negative_moves;
    } catch (error) {
        console.error("Error al obtener los movimientos en negativo:", error);
        throw error;
    }
}

//-----------------------------------------------------------this function is for get all the sale of the combo (day,month,reay,all)
async function get_sale_branch(branches) {
    const dataSales = []
    for (var i = 0; i < branches.length; i++) {
        const data = await get_sales_total_by_branch(branches[i]);
        dataSales.push([data.name_branch, data.total_sales])
    }

    return dataSales;
}

async function get_sales_total_by_branch(idBranch) {
    try {
        const query = `
            SELECT b.name_branch, COALESCE(SUM(s.total), 0) AS total_sales
            FROM "Company".branches AS b
            LEFT JOIN "Box".sales_history AS s ON s.id_branches = b.id
            WHERE b.id = $1
            GROUP BY b.name_branch;
        `;
        const values = [idBranch];
        const result = await database.query(query, values);
        return result.rows[0] || { name_branch: null, total_sales: 0 };
    } catch (error) {
        console.error("Error al obtener la suma total de ventas por sucursal:", error);
        throw error;
    }
}

async function get_sale_branch_today(branches) {
    const dataSales = []
    for (var i = 0; i < branches.length; i++) {
        const data = await get_sales_total_by_branch_today(branches[i]);
        dataSales.push([data.name_branch, data.total_sales])
    }

    return dataSales;
}

async function get_sales_total_by_branch_today(idBranch) {
    try {
        const query = `
            SELECT b.name_branch, COALESCE(SUM(sh.total), 0) AS total_sales
            FROM "Company".branches AS b
            LEFT JOIN "Box".sales_history AS sh ON sh.id_branches = b.id
            WHERE b.id = $1
            AND sh.sale_day >= CURRENT_DATE AND sh.sale_day < CURRENT_DATE + INTERVAL '1 day'
            GROUP BY b.name_branch;
        `;
        const values = [idBranch];
        const result = await database.query(query, values);
        return result.rows[0] || { name_branch: null, total_sales: 0 };
    } catch (error) {
        console.error("Error al obtener la suma total de ventas por sucursal:", error);
        throw error;
    }
}

async function get_sale_branch_month(branches) {
    const dataSales = []
    for (var i = 0; i < branches.length; i++) {
        const data = await get_sales_total_by_branch_this_month(branches[i]);
        dataSales.push([data.name_branch, data.total_sales])
    }

    return dataSales;
}

async function get_sales_total_by_branch_this_month(idBranch) {
    try {
        const query = `
            SELECT b.name_branch, COALESCE(SUM(sh.total), 0) AS total_sales
            FROM "Company".branches AS b
            LEFT JOIN "Box".sales_history AS sh ON sh.id_branches = b.id
            WHERE b.id = $1
            AND EXTRACT(MONTH FROM sh.sale_day) = EXTRACT(MONTH FROM CURRENT_DATE)
            AND EXTRACT(YEAR FROM sh.sale_day) = EXTRACT(YEAR FROM CURRENT_DATE)
            GROUP BY b.name_branch;
        `;
        const values = [idBranch];
        const result = await database.query(query, values);
        return result.rows[0] || { name_branch: null, total_sales: 0 };
    } catch (error) {
        console.error("Error al obtener la suma total de ventas por sucursal:", error);
        throw error;
    }
}

async function get_sale_branch_year(branches) {
    const dataSales = []
    for (var i = 0; i < branches.length; i++) {
        const data = await get_sales_total_by_branch_this_year(branches[i]);
        dataSales.push([data.name_branch, data.total_sales])
    }

    return dataSales;
}

async function get_sales_total_by_branch_this_year(idBranch) {
    try {
        const query = `
            SELECT b.name_branch, COALESCE(SUM(sh.total), 0) AS total_sales
            FROM "Company".branches AS b
            LEFT JOIN "Box".sales_history AS sh ON sh.id_branches = b.id
            WHERE b.id = $1
            AND EXTRACT(YEAR FROM sh.sale_day) = EXTRACT(YEAR FROM CURRENT_DATE)
            GROUP BY b.name_branch;
        `;
        const values = [idBranch];
        const result = await database.query(query, values);
        return result.rows[0] || { name_branch: null, total_sales: 0 };
    } catch (error) {
        console.error("Error al obtener la suma total de ventas por sucursal:", error);
        throw error;
    }
}

//-----------------------------------------------------------this function is for get all sale that we get with the combos (day,month,reay,all)
async function get_sales_total_by_combo(idCompany) {
    try {
        const query = `
            WITH productos AS (
                SELECT id, name
                FROM "Kitchen".dishes_and_combos
                WHERE id_companies = $1
            )
            SELECT p.id, p.name, COALESCE(SUM(s.total), 0) AS total_sales
            FROM productos p
            LEFT JOIN "Box".sales_history s ON p.id = s.id_dishes_and_combos
            GROUP BY p.id, p.name;
        `;
        const values = [idCompany];
        const result = await database.query(query, values);
        return result.rows || [];
    } catch (error) {
        console.error("Error al obtener la suma total de ventas por empresa:", error);
        throw error;
    }
}

async function get_sales_total_by_combo_today(idCompany) {
    try {
        const query = `
            WITH productos AS (
                SELECT id, name
                FROM "Kitchen".dishes_and_combos
                WHERE id_companies = $1
            )
            SELECT p.id, p.name, COALESCE(SUM(s.total), 0) AS total_sales
            FROM productos p
            LEFT JOIN "Box".sales_history s ON p.id = s.id_dishes_and_combos
            WHERE DATE(s.sale_day) = CURRENT_DATE
            GROUP BY p.id, p.name;
        `;
        const values = [idCompany];
        const result = await database.query(query, values);
        return result.rows || [];
    } catch (error) {
        console.error("Error al obtener la suma total de ventas por empresa:", error);
        throw error;
    }
}

async function get_sales_total_by_combo_year(idCompany) {
    try {
        const query = `
            WITH productos AS (
                SELECT id, name
                FROM "Kitchen".dishes_and_combos
                WHERE id_companies = $1
            )
            SELECT p.id, p.name, COALESCE(SUM(s.total), 0) AS total_sales
            FROM productos p
            LEFT JOIN "Box".sales_history s ON p.id = s.id_dishes_and_combos
            WHERE EXTRACT(YEAR FROM s.sale_day) = EXTRACT(YEAR FROM CURRENT_DATE)
            GROUP BY p.id, p.name;
        `;
        const values = [idCompany];
        const result = await database.query(query, values);
        return result.rows || [];
    } catch (error) {
        console.error("Error al obtener la suma total de ventas por empresa:", error);
        throw error;
    }
}

async function get_sales_total_by_combo_month(idCompany) {
    try {
        const query = `
            WITH productos AS (
                SELECT id, name
                FROM "Kitchen".dishes_and_combos
                WHERE id_companies = $1
            )
            SELECT p.id, p.name, COALESCE(SUM(s.total), 0) AS total_sales
            FROM productos p
            LEFT JOIN "Box".sales_history s ON p.id = s.id_dishes_and_combos
            WHERE EXTRACT(MONTH FROM s.sale_day) = EXTRACT(MONTH FROM CURRENT_DATE)
              AND EXTRACT(YEAR FROM s.sale_day) = EXTRACT(YEAR FROM CURRENT_DATE)
            GROUP BY p.id, p.name;
        `;
        const values = [idCompany];
        const result = await database.query(query, values);
        return result.rows || [];
    } catch (error) {
        console.error("Error al obtener la suma total de ventas por empresa:", error);
        throw error;
    }
}


//---------------------------------------------------------this function is for get the combo most sale (day,month,reay,all)
//for know which products is most sale. This not means that that combos be the that most money generate in the business 
async function get_data_distribute_company(id_company) {
    // This function is for converting the string returned by the Python script into an array for web reading 
    var distribute = await get_data_report_distribute(id_company);

    // Convert distribute to string if it's not already
    if (typeof distribute !== 'string') {
        distribute = String(distribute);
    }

    distribute = distribute.slice(1, -3); // Delete the [ ] from the corners
    const matches = distribute.match(/\[.*?\]/g);

    // Check if matches is not null
    if (matches) {
        // Iterate over the sets of brackets found
        const arrayData = matches.map(match => {
            // Remove the brackets and quotes and split by comma
            return match.slice(1, -1).split(", ");
        });

        return arrayData;
    } else {
        // If no matches were found, return an empty array
        return [];
    }
}

async function get_data_report_distribute(id_company) {
    try {
        const query = `
            SELECT sh.*, dc.*, u.first_name AS employee_first_name, u.second_name AS employee_second_name, 
                    u.last_name AS employee_last_name, c.email AS customer_email, b.name_branch
            FROM "Box".sales_history sh
            LEFT JOIN "Kitchen".dishes_and_combos dc ON sh.id_dishes_and_combos = dc.id
            LEFT JOIN "Company".employees e ON sh.id_employees = e.id
            LEFT JOIN "Fud".users u ON e.id_users = u.id
            LEFT JOIN "Company".branches b ON sh.id_branches = b.id
            LEFT JOIN "Company".customers c ON sh.id_customers = c.id
            WHERE sh.id_companies = $1
        `;
        const res = await database.query(query, [id_company]);
        const rows = res.rows;

        let names = [];
        for (let i = 0; i < rows.length; i++) {
            const amount = rows[i].cant;
            for (let j = 0; j < amount; j++) {
                names.push(rows[i].name);
            }
        }

        const combos = Array.from(new Set(names));
        const answer = combos.map(combo => [combo, names.filter(name => name === combo).length]);

        return answer;
    } catch (err) {
        console.error('Error fetching data from database:', err);
        return [];
    } 
}

async function get_data_distribute_company_day(id_company) {
    // This function is for converting the string returned by the Python script into an array for web reading 
    var distribute = await get_data_report_distribute_day(id_company);

    // Convert distribute to string if it's not already
    if (typeof distribute !== 'string') {
        distribute = String(distribute);
    }

    distribute = distribute.slice(1, -3); // Delete the [ ] from the corners
    const matches = distribute.match(/\[.*?\]/g);

    // Check if matches is not null
    if (matches) {
        // Iterate over the sets of brackets found
        const arrayData = matches.map(match => {
            // Remove the brackets and quotes and split by comma
            return match.slice(1, -1).split(", ");
        });

        return arrayData;
    } else {
        // If no matches were found, return an empty array
        return [];
    }
}

async function get_data_report_distribute_day(id_company) {
    try {
        const query = `
        SELECT sh.*, dc.*, u.first_name AS employee_first_name, u.second_name AS employee_second_name, 
               u.last_name AS employee_last_name, c.email AS customer_email, b.name_branch
        FROM "Box".sales_history sh
        LEFT JOIN "Kitchen".dishes_and_combos dc ON sh.id_dishes_and_combos = dc.id
        LEFT JOIN "Company".employees e ON sh.id_employees = e.id
        LEFT JOIN "Fud".users u ON e.id_users = u.id
        LEFT JOIN "Company".branches b ON sh.id_branches = b.id
        LEFT JOIN "Company".customers c ON sh.id_customers = c.id
        WHERE sh.id_companies = $1
        AND DATE(sh.sale_day) = $2
        `;
        const res = await database.query(query, [id_company]);
        const rows = res.rows;

        let names = [];
        for (let i = 0; i < rows.length; i++) {
            const amount = rows[i].cant;
            for (let j = 0; j < amount; j++) {
                names.push(rows[i].name);
            }
        }

        const combos = Array.from(new Set(names));
        const answer = combos.map(combo => [combo, names.filter(name => name === combo).length]);

        return answer;
    } catch (err) {
        console.error('Error fetching data from database:', err);
        return [];
    } 
}

async function get_data_distribute_company_month(id_company) {
    // This function is for converting the string returned by the Python script into an array for web reading 
    var distribute = await get_data_report_distribute_month(id_company);

    // Convert distribute to string if it's not already
    if (typeof distribute !== 'string') {
        distribute = String(distribute);
    }

    distribute = distribute.slice(1, -3); // Delete the [ ] from the corners
    const matches = distribute.match(/\[.*?\]/g);

    // Check if matches is not null
    if (matches) {
        // Iterate over the sets of brackets found
        const arrayData = matches.map(match => {
            // Remove the brackets and quotes and split by comma
            return match.slice(1, -1).split(", ");
        });

        return arrayData;
    } else {
        // If no matches were found, return an empty array
        return [];
    }
}

async function get_data_report_distribute_month(id_company) {
    try {
        const query = `
            SELECT sh.*, dc.*, u.first_name AS employee_first_name, u.second_name AS employee_second_name, 
                   u.last_name AS employee_last_name, c.email AS customer_email, b.name_branch
            FROM "Box".sales_history sh
            LEFT JOIN "Kitchen".dishes_and_combos dc ON sh.id_dishes_and_combos = dc.id
            LEFT JOIN "Company".employees e ON sh.id_employees = e.id
            LEFT JOIN "Fud".users u ON e.id_users = u.id
            LEFT JOIN "Company".branches b ON sh.id_branches = b.id
            LEFT JOIN "Company".customers c ON sh.id_customers = c.id
            WHERE sh.id_companies = $1
            AND EXTRACT(MONTH FROM sh.sale_day) = EXTRACT(MONTH FROM CURRENT_DATE)
            AND EXTRACT(YEAR FROM sh.sale_day) = EXTRACT(YEAR FROM CURRENT_DATE)
        `;
        const res = await database.query(query, [id_company]);
        const rows = res.rows;

        let names = [];
        for (let i = 0; i < rows.length; i++) {
            const amount = rows[i].cant;
            for (let j = 0; j < amount; j++) {
                names.push(rows[i].name);
            }
        }

        const combos = Array.from(new Set(names));
        const answer = combos.map(combo => [combo, names.filter(name => name === combo).length]);

        return answer;
    } catch (err) {
        console.error('Error fetching data from database:', err);
        return [];
    } 
}

async function get_data_distribute_company_year(id_company) {
    // This function is for converting the string returned by the Python script into an array for web reading 
    var distribute = await get_data_report_distribute_month(id_company);

    // Convert distribute to string if it's not already
    if (typeof distribute !== 'string') {
        distribute = String(distribute);
    }

    distribute = distribute.slice(1, -3); // Delete the [ ] from the corners
    const matches = distribute.match(/\[.*?\]/g);

    // Check if matches is not null
    if (matches) {
        // Iterate over the sets of brackets found
        const arrayData = matches.map(match => {
            // Remove the brackets and quotes and split by comma
            return match.slice(1, -1).split(", ");
        });

        return arrayData;
    } else {
        // If no matches were found, return an empty array
        return [];
    }
}

async function get_data_report_distribute_year(id_company) {
    //this function is for read a script of python for calculate the distribute of the bussiner 
    return new Promise((resolve, reject) => {
        //we going to call the script python, send the id company
        const pythonPath = 'src/dataScine/sales/salesYear.py';
        const arg = [id_company];
        const pythonProcess = spawn('python', [pythonPath, ...arg]);

        let outputData = ''; //this is for save the output 

        //get the result of the script 
        pythonProcess.stdout.on('data', (data) => {
            outputData += data.toString();
        });


        //we will watching if exist a error in the script 
        pythonProcess.stderr.on('data', (data) => {
            //Handle standard output errors
            console.error('Error en la salida estándar del proceso de Python:', data.toString());
            reject(new Error(data.toString()));
        });

        pythonProcess.on('close', (code) => {
            if (code === 0) {
                resolve(outputData);
            } else {
                // Python process terminated with error code
                reject(new Error(`El proceso de Python terminó con un código de error: ${code}`));
            }
        });
    });
}

//-----------------------------------------------------------this function is for get all the sale of today (all)
async function get_total_sales_company(idCompany) {
    try {
        const query = `
            SELECT COALESCE(SUM(total), 0) AS total_sales
            FROM "Box".sales_history
            WHERE id_companies = $1
            AND DATE_TRUNC('day', sale_day) = CURRENT_DATE;
        `;
        const values = [idCompany];
        const result = await database.query(query, values);

        return result.rows[0].total_sales;
    } catch (error) {
        console.error("Error al obtener datos de ventas get_total_sales_company:", error);
        return 0;
    }
}

async function get_total_day_old(idCompany) {
    try {
        const query = `
            SELECT COALESCE(SUM(total), 0) AS total_sales
            FROM "Box".sales_history
            WHERE id_companies = $1
            AND DATE_TRUNC('day', sale_day) = CURRENT_DATE-1;
        `;
        const values = [idCompany];
        const result = await database.query(query, values);

        return result.rows[0].total_sales;
    } catch (error) {
        console.error("Error al obtener datos de ventas del dia pasado:", error);
        return 0;
    }
}

async function get_total_unity_company(idCompany) {
    try {
        const query = `
            SELECT COALESCE(SUM(amount), 0) AS total_items_sold
            FROM "Box".sales_history
            WHERE id_companies = $1
            AND DATE_TRUNC('day', sale_day) = CURRENT_DATE;
        `;
        const values = [idCompany];
        const result = await database.query(query, values);

        return result.rows[0].total_items_sold;
    } catch (error) {
        console.error("Error al obtener datos de ventas get_total_unity_company:", error);
        return 0;
    }
}

async function get_total_year(idCompany) {
    try {
        const query = `
            SELECT COALESCE(SUM(total), 0) AS total_sales
            FROM "Box".sales_history
            WHERE id_companies = $1
            AND EXTRACT(YEAR FROM sale_day) = EXTRACT(YEAR FROM CURRENT_DATE)
        `;
        const values = [idCompany];
        const result = await database.query(query, values);
        return result.rows[0].total_sales;
    } catch (error) {
        console.error("Error al obtener la suma de ventas get_total_year:", error);
        return 0;
    }
}

async function get_total_year_old(idCompany) {
    try {
        const query = `
            SELECT COALESCE(SUM(total), 0) AS total_sales
            FROM "Box".sales_history
            WHERE id_companies = $1
            AND EXTRACT(YEAR FROM sale_day) = EXTRACT(YEAR FROM CURRENT_DATE)-1;
        `;
        const values = [idCompany];
        const result = await database.query(query, values);
        return result.rows[0].total_sales;
    } catch (error) {
        console.error("Error al obtener la suma de ventas get_total_year_old:", error);
        return 0;
    }
}

async function get_total_month(idCompany) {
    try {
        const query = `
            SELECT COALESCE(SUM(total), 0) AS total_sales
            FROM "Box".sales_history
            WHERE id_companies = $1
            AND EXTRACT(MONTH FROM sale_day) = EXTRACT(MONTH FROM CURRENT_DATE)
        `;
        const values = [idCompany];
        const result = await database.query(query, values);
        return result.rows[0].total_sales;
    } catch (error) {
        console.error("Error al obtener la suma de ventas get_total_month:", error);
        return 0;
    }
}

async function get_total_month_old(idCompany) {
    try {
        const query = `
            SELECT COALESCE(SUM(total), 0) AS total_sales
            FROM "Box".sales_history
            WHERE id_companies = $1
            AND EXTRACT(MONTH FROM sale_day) = EXTRACT(MONTH FROM CURRENT_DATE)-1;
        `;
        const values = [idCompany];
        const result = await database.query(query, values);
        return result.rows[0].total_sales;
    } catch (error) {
        console.error("Error al obtener la suma de ventas get_total_month_old:", error);
        return 0;
    }
}

async function get_total_company(idCompany) {
    try {
        const query = `
            SELECT COALESCE(SUM(total), 0) AS total_sales
            FROM "Box".sales_history
            WHERE id_companies = $1
        `;
        const values = [idCompany];
        const result = await database.query(query, values);
        return result.rows[0].total_sales;
    } catch (error) {
        console.error("Error al obtener la suma de ventas get_total_company:", error);
        return 0;
    }
}

function calculate_sale_increase(previousSales, currentSales) {
    if (previousSales == 0) {
        return 100;
    }

    // calculate the aument absolute in the sales
    const salesIncrease = currentSales - previousSales;

    // calculate the % of aument
    const percentageIncrease = (salesIncrease / previousSales) * 100;

    return percentageIncrease;
}

async function get_movements_company_positive(branches) {
    var total = 0;
    for (var i = 0; i < branches.length; i++) {
        total += await get_positive_moves_by_branch(branches[i]);
    }
    return total;
}

async function get_positive_moves_by_branch(idBranch) {
    try {
        const query = `
            SELECT COALESCE(SUM(move), 0) AS total_negative_moves
            FROM "Box".movement_history
            WHERE id_branches IN (
                SELECT id
                FROM "Company".branches
                WHERE id = $1
            )
            AND date_move::date = CURRENT_DATE
            AND move > 0;
        `;
        const values = [idBranch];
        const result = await database.query(query, values);
        return result.rows[0].total_negative_moves;
    } catch (error) {
        console.error("Error al obtener los movimientos en negativo get_positive_moves_by_branch:", error);
        return 0;
    }
}


module.exports = {
    get_sales_company,
    get_movements_company,
    get_sales_data,
    get_sales_company_for_day,
    get_sales_data_day,
    get_sales_company_for_month,
    get_sales_company_for_year,
    get_positive_moves_by_branch,
    get_movements_company_positive,
    calculate_sale_increase,
    get_total_company,
    get_total_month_old,
    get_total_month,
    get_total_year_old,
    get_total_year,
    get_total_unity_company,
    get_total_day_old,
    get_total_sales_company,
    get_data_report_distribute_year,
    get_data_distribute_company_year,
    get_data_report_distribute_month,
    get_data_distribute_company_month,
    get_data_report_distribute_day,
    get_data_distribute_company_day,
    get_data_distribute_company,
    get_sales_total_by_combo_month,
    get_sales_total_by_combo_year,
    get_sales_total_by_combo_today,
    get_sales_total_by_combo,
    get_sale_branch_year,
    get_sale_branch_month,
    get_sale_branch_today,
    get_sale_branch,
    get_movements_company_negative,
    get_branchIds_by_company
};