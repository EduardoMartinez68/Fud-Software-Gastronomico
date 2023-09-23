const database=require('database');
async function search_user(email){
    var queryText = 'SELECT * FROM users WHERE email = $1';
    var values = [email] 
    return await database.query(queryText, values);
}