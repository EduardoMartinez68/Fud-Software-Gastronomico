const express = require('express');
const router = express.Router();
const { isLoggedIn, isNotLoggedIn } = require('../../lib/auth');

/*
*----------------------functions-----------------*/
//functions image
const {
    get_path_img,
    delate_image_upload,
    upload_image_to_space,
    delete_image_from_space,
    create_a_new_image,
    delate_image
} = require('../../services/connectionWithDatabaseImage');

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
    delate_combo_company
} = require('../../services/combos');

//functions branch
const {
    get_data_tabla_with_id_company,
    get_pack_database,
    check_company_other
} = require('../../services/company');

//functions supplies
const {
    get_country
} = require('../../services/employees');


const {
    get_category,
    delate_product_category
} = require('../../services/foodCategory');
const {
    get_department,
} = require('../../services/foodDepartment');

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


//------------------------------------employees
router.get('/:id_company/:id_branch/employees-free', isLoggedIn, async (req, res) => {
    const { id_company, id_branch } = req.params;
    const branchFree = await get_data_branch(req);
    if (branchFree != null) {
        res.render('links/free/employee/employee', { branchFree });
    } else {
        res.render('links/store/branchLost');
    }
});


//------------------------------------supplies
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


//------------------------------------combo
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
    const branchFree = await get_data_branch(id_branch);
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
            req.flash('message','Ya alcanzaste el limite maximo para tu base de datos actual. Debes actualizar tu sucursal a la siguiente version 😅')
            res.redirect('/fud/'+id+'/'+id_branch+'/combos-free');
        }
    } else {
        res.render('links/store/branchLost');
    }
});

function the_user_can_add_most_combo(combos,packCombo){
    return combos<=packCombo
}

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


//------------------------------------branch
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


//------------------------------------report
router.get('/report', isLoggedIn, (req, res) => {
    res.render("links/manager/reports/report");
})

router.get('/report-sales', isLoggedIn, (req, res) => {
    res.render("links/manager/reports/sales");
})
//------------------------------------food departament and category 
router.get('/:id/food-category', isLoggedIn, async (req, res) => {
    const company = await check_company(req);
    const { id } = req.params;
    const categories = await get_category(id);
    res.render(companyName + '/manager/areas/category', { company, categories })
});

router.get('/:id_company/:idBranch/food-area-free', isLoggedIn, async (req, res) => {
    const { id_company , idBranch} = req.params;
    const categories = await get_category(id_company);
    const branchFree = await get_branch(req);
    res.render('links/manager/areas/category', { branchFree, categories })
});

router.get('/:id_company/:id_branch/:id/:name/:description/edit-food-category-free', isLoggedIn, async (req, res) => {
    const company = await check_company_other(req);
    const { id_company, id_branch, id, name, description } = req.params;

    //we will watch if the user have this company
    if (company.length > 0) {
        //we going to see if we can delate the department 
        if (await update_product_category(id, name, description)) {
            req.flash('success', 'La categoria fue actualizada con éxito 😄')
        }
        else {
            req.flash('message', 'La categoria NO fue actualizada con éxito 😳')
        }

        res.redirect(`/fud/${id_company}/${id_branch}/food-area-free`);
    }
    else {
        req.flash('message', 'No tienes los permisos para esto 😳')
        res.redirect('/fud/home');
    }
});

router.get('/:id_company/:id_branch/:id/delete-food-category', isLoggedIn, async (req, res) => {
    const company = await check_company_other(req);
    const { id, id_company, id_branch} = req.params;

    //we will watch if the user have this company
    if (company.length > 0) {
        //we going to see if we can delate the department 
        if (await delate_product_category(id)) {
            req.flash('success', 'La categoria fue eliminada con éxito 😄')
        }
        else {
            req.flash('message', 'La categoria NO fue eliminada con éxito 😳')
        }

        res.redirect(`/fud/${id_company}/${id_branch}/food-area-free`);
    }
    else {
        req.flash('message', 'No tienes los permisos para esto 😳')
        res.redirect('/fud/home');
    }

});


module.exports = router;
