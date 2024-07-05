const database = require('../database');
const addDatabase = require('../router/addDatabase');
const rolFree=0

async function get_all_ad(idBranch, type) {
    var queryText = `
        SELECT 
            ROW_NUMBER() OVER() - 1 AS index,
            ad.id,
            ad.id_branches,
            ad.img,
            ad.type,
            ad.description,
            br.id_companies
        FROM 
            "Branch"."Ad" AS ad
        JOIN 
            "Company".branches AS br
        ON 
            ad.id_branches = br.id
        WHERE 
            ad.id_branches = $1
        AND 
            ad.type = $2;
    `;
    var values = [idBranch, type];
    const result = await database.query(queryText, values);
    return result.rows;
}

async function get_ad_image(adId) {
    var queryText = `
        SELECT 
            img
        FROM 
            "Branch"."Ad"
        WHERE 
            id = $1;
    `;
    var values = [adId];
    const result = await database.query(queryText, values);
    return result.rows[0]?.img; // Devuelve solo la imagen si existe
}

async function delete_ad(id) {
    try {
        const queryText = `
            DELETE FROM "Branch"."Ad"
            WHERE id = $1
        `;
        const values = [id];
        await database.query(queryText, values);
        return true;
    } catch (error) {
        console.error("Error to delete ad:", error);
        return false;
    }
}

async function update_ad(adId, newImg) {
    try {
        var queryText = `
            UPDATE 
                "Branch"."Ad"
            SET 
                img = $1
            WHERE 
                id = $2;
        `;
        var values = [newImg, adId];
        await database.query(queryText, values);
        return true;
    } catch (error) {
        console.log('No was update the database ad ' + error)
        return false;
    }
}



module.exports = {
    get_all_ad,
    get_ad_image,
    delete_ad,
    update_ad
};