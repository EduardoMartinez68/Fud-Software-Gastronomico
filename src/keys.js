const pg = require('pg');
const pgPool = new pg.Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'empresa',
    password: 'bobesponja48',
    port: 5432,
});
module.exports = pgPool;