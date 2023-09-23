require('dotenv').config();
/*
const {NOTES_APP_MONGODB_HOST,NOTES_APP_MONGODB_DATABASE}=process.env;
const MongoClient = require('mongodb').MongoClient;
const url = NOTES_APP_MONGODB_HOST;
const dbName = NOTES_APP_MONGODB_DATABASE;

async function mongodb(board, id_c, id_u) {
    try {
        
        //we will to connect to the database
        const client = await MongoClient.connect('mongodb://localhost:27017/fud');
  
        const db = client.db(dbName);

        //we will to connect to the board
        const collection = db.collection(board);

        //we will to search the data the the user need
        const query = { id_company: id_c, id_user: id_u };
        const documents = await collection.find(query).toArray();
        client.close();//close the database
        console.log('mongodb is connected');
        return documents;
    } catch (err) {
        console.error('Error al conectar a la base de datos o al consultar datos: ', err);
        return [];
    }
}
*/

async function mongodb(board, id_c, id_u) {
    try {
      var list=[
        {
          "_id": "5f49c4dca2a7a1a19f11a23c",
          "id_branch": 1,
          "id_employees": 30,
          "id_customer": 1,
          "id_combo": 1,
          "product_price": 30,
          "amount": 2,
          "sells_for": 30,
          "discount": 0,
          "total": 30,
          "payment_method": "card",
          "sale_date": "2023-09-16 14:30:00",
          "sale_time": "14:30:00",
          "status": "sale"
        },
        {
          "_id": "5f49c4dca2a7a1a19f11a23c",
          "id_branch": 1,
          "id_employees": 30,
          "id_customer": 1,
          "id_combo": 1,
          "product_price": 30,
          "amount": 2,
          "sells_for": 30,
          "discount": 0,
          "total": 30,
          "payment_method": "card",
          "sale_date": "2023-09-16 14:30:00",
          "sale_time": "14:30:00",
          "status": "sale"
        }
      ]
      return list;
    } catch (err) {
        console.error('Error al conectar a la base de datos o al consultar datos: ', err);
        return [];
    }
}


module.exports = {
    mongodb
};