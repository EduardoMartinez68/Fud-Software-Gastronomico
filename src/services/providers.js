const database = require('../database');
const addDatabase = require('../router/addDatabase');
const rolFree=0

async function search_providers(idBranch) {
    //we will search the company of the user 
    //var queryText = 'SELECT * FROM "Branch".providers WHERE id_branches= $1';
    const queryText = `
    SELECT p.*, b.id_companies
    FROM "Branch".providers p
    JOIN "Company".branches b ON b.id = p.id_branches
    WHERE p.id_branches = $1;
  `;
    var values = [idBranch];
    const result = await database.query(queryText, values);

    return result.rows;
}

async function search_all_providers(id_company) {
    const allBranch = await search_all_branch_company(id_company);
    const providers = []

    //we will to read all the branch of the company for get his providers 
    for (var i = 0; i < allBranch.length; i++) {
        const branchId = allBranch[i].id //get the id of the branch that we are reading 
        const providersBranch = await search_providers(branchId) //search all providers in this branch

        //we will see if this branch have providers, if the branch have provider we will saving his providers in the array <providers>
        if (providersBranch.length > 0) {
            providers.push(providersBranch) //add all the providers of the branch
        }
    }

    return providers;
}

async function search_providers_for_name(idBranch, name_provider) {
    //we will search the company of the user 
    //var queryText = 'SELECT * FROM "Branch".providers WHERE id_branches= $1';
    const queryText = `
    SELECT p.*, b.id_companies
    FROM "Branch".providers p
    JOIN "Company".branches b ON b.id = p.id_branches
    WHERE p.id_branches = $1 and p.name = $2;
  `;
    var values = [idBranch, name_provider];
    const result = await database.query(queryText, values);

    return result.rows;
}

async function search_all_providers_for_name(id_company, name_provider) {
    const allBranch = await search_all_branch_company(id_company);
    const providers = []

    //we will to read all the branch of the company for get his providers 
    for (var i = 0; i < allBranch.length; i++) {
        const branchId = allBranch[i].id //get the id of the branch that we are reading 
        const providersBranch = await search_providers_for_name(branchId, name_provider) //search all providers in this branch

        //we will see if this branch have providers, if the branch have provider we will saving his providers in the array <providers>
        if (providersBranch.length > 0) {
            providers.push(providersBranch) //add all the providers of the branch
        }
    }

    return providers;
}

async function search_provider(idProvider) {
    const queryText = `
    SELECT p.*, b.id_companies
    FROM "Branch".providers p
    JOIN "Company".branches b ON b.id = p.id_branches
    WHERE p.id = $1;
  `;
    var values = [idProvider];
    const result = await database.query(queryText, values);

    return result.rows;
}

async function delete_provider(idProvider) {
    try {
        var queryText = 'DELETE FROM "Branch".providers WHERE id = $1';
        var values = [idProvider];
        await database.query(queryText, values); // Delete provider
        return true;
    } catch (error) {
        console.error('Error al eliminar en la base de datos:', error);
        return false;
    }
}

module.exports = {
    search_providers,
    search_all_providers,
    search_providers_for_name,
    search_all_providers_for_name,
    search_provider,
    delete_provider
};