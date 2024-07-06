const express = require('express');
const router = express.Router();
const { isLoggedIn, isNotLoggedIn } = require('../../lib/auth');

/*
*----------------------functions-----------------*/
//functions supplies
const {
    get_supplies_or_features,
    get_supplies_with_id,
    update_supplies_company,
    get_new_data_supplies_company,
    delate_supplies_company,
    this_is_a_supplies_or_a_products,
    search_company_supplies_or_products_with_company,
    search_company_supplies_or_products_with_id_company,
    search_company_supplies_or_products,
    update_product_category
} = require('../../services/supplies');

//functions branch
const {
    get_data_branch,
    get_branch
} = require('../../services/branch');

//functions branch
const {
    get_combo_features,
    search_supplies_combo,
    search_combo,
} = require('../../services/combos');

//functions branch
const {
    get_data_tabla_with_id_company
} = require('../../services/company');

//functions supplies
const {
    get_country
} = require('../../services/employees');

/*
*----------------------router-----------------*/
router.get('/:id_user/:id_company/:id_branch/my-store', isLoggedIn, async (req, res) => {
    const { id_company, id_branch } = req.params;
    const branchFree = await get_data_branch(req);
    const employee = await get_data_employee(req);
    if (branchFree != null) {
        res.render('links/restaurant/home', { branchFree , employee});
    } else {
        res.render('links/store/branchLost');
    }
});

router.get('/:id_company/:id_branch/employees-free', isLoggedIn, async (req, res) => {
    const { id_company, id_branch } = req.params;
    const branchFree = await get_data_branch(req);
    if (branchFree != null) {
        res.render('links/free/employee/employee', { branchFree });
    } else {
        res.render('links/store/branchLost');
    }
});

router.get('/:id/:id_branch/supplies-free', isLoggedIn, async (req, res) => {
    const {id_branch } = req.params;
    const branchFree = await get_data_branch(id_branch);
    if (branchFree != null) {
        //const supplies_products = await search_company_supplies_or_products(req, true);
        const supplies = await get_supplies_or_features(id_branch, true)
        res.render('links/free/supplies/supplies', { branchFree, supplies});
    } else {
        res.render('links/store/branchLost');
    }
});

router.get('/:id/:id_branch/combos-free', isLoggedIn, async (req, res) => {
    const {id_branch } = req.params;
    const branchFree = await get_data_branch(id_branch);
    if (branchFree != null) {
        //const supplies_products = await search_company_supplies_or_products(req, true);
        const combos = await get_combo_features(id_branch);
        res.render('links/free/combo/combo', { branchFree, combos});
    } else {
        res.render('links/store/branchLost');
    }
});

router.get('/:id_company/:id_branch/:id_dishes_and_combos/edit-data-combo-free', isLoggedIn, async (req, res) => {
    const { id_dishes_and_combos, id_branch,id_company } = req.params;

    const branchFree = await get_data_branch(id_branch);
    const dataForm = [{
        id_company: branchFree[0].id_companies,
        id_branch: branchFree[0].id,
        id_combo: id_dishes_and_combos
    }]
    console.log(dataForm)
    const departments = await get_data_tabla_with_id_company(id_company, "Kitchen", "product_department");
    const category = await get_data_tabla_with_id_company(id_company, "Kitchen", "product_category");

    const supplies = await search_company_supplies_or_products_with_company(id_company, true);
    const products = await search_company_supplies_or_products_with_company(id_company, false);
    const suppliesCombo = await search_supplies_combo(id_dishes_and_combos);
    const combo = await search_combo(id_company, id_dishes_and_combos);


    res.render('links/manager/combo/editCombo', { branchFree, dataForm, departments, category, supplies, products, combo, suppliesCombo });
})

router.get('/:id/:id_branch/add-combos-free', isLoggedIn, async (req, res) => {
    const {id_branch } = req.params;
    const branchFree = await get_data_branch(req);
    if (branchFree != null) {
        const { id } = req.params;
        const packCombo=await get_pack_database(id);
        const combos = await get_combo_features(id_branch);
        if(the_user_can_add_most_combo(combos.length,packCombo)){
            const departments = await get_department(id);
            const category = await get_category(id);
            const supplies = await search_company_supplies_or_products(req, true);
            const products = await search_company_supplies_or_products(req, false);
            const suppliesCombo = []
            res.render('links/free/combo/addCombo', { branchFree,departments,category,supplies,products,suppliesCombo});
        }
        else{
            res.redirect('fud/'+id+'/'+id_branch+'/combos-free');
            req.flash('message','Ya alcanzaste el limite maximo para tu base de datos actual. Debes actualizar tu sucursal a la siguiente version 😅')
        }
    } else {
        res.render('links/store/branchLost');
    }
});

router.get('/:id_company/:id_branch/:id/delete-combo-free', isLoggedIn, async (req, res) => {
    const { id, id_company, id_branch} = req.params;
    const pathImg = await get_path_img('Kitchen', 'dishes_and_combos', id) //get the image in our database 

    //we will see if can delete the combo of the database 
    if (await delate_combo_company(id, pathImg)) {
        req.flash('success', 'El combo fue eliminado con éxito 😄')
    }
    else {
        req.flash('message', 'El combo NO fue eliminado con éxito 😳')
    }

    res.redirect(`/fud/${id_company}/${id_branch}/combos-free`);
})

router.get('/:idBranch/:idCompany/edit-branch-free', isLoggedIn, async (req, res) => {
    const country = await get_country();
    const branchFree = await get_branch(req);
    res.render("links/manager/branches/editBranchesFree", { branchFree, country });
})

router.get('/:id/Dashboard', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const sales_history = await databaseM.mongodb('history_sale', id, parseInt(req.user.id));
    res.render('links/manager/reports/dashboard', sales_history);
});

router.get('/report', isLoggedIn, (req, res) => {
    res.render("links/manager/reports/report");
})

/*reports*/
router.get('/report-sales', isLoggedIn, (req, res) => {
    res.render("links/manager/reports/sales");
})

module.exports = router;
