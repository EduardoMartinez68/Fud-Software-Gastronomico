//require
const express=require('express');
//const router=express.Router();
const database=require('../database');

async function delate_product_department(id){
    var queryText = 'DELETE FROM product_department WHERE id = $1';
    var values = [id];

    try {
        await database.query(queryText, values);
        return true;
    } catch (error) {
        console.error('Error al eliminar el registro en la base de datos:', error);
        return false;
    }
};


module.exports={
    delate_product_department
};