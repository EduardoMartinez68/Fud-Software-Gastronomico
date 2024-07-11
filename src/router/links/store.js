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
//functions branch
const {
    get_data_branch,
    get_all_box_of_the_branch_with_his_id
} = require('../../services/branch');

const {
    get_data_employee
} = require('../../services/employees');

const {
    get_all_ad,
} = require('../../services/ad');

const {
    this_employee_works_here,
    get_all_dish_and_combo,
    get_all_data_combo_most_sold,
    get_data_recent_combos,
} = require('../../services/store');



router.get('/:id_user/:id_company/:id_branch/:id_employee/:id_role/store-home', isLoggedIn, async (req, res) => {
    try {
        if (!(await this_employee_works_here(req, res))) {
            res.render('links/store/branchLost');
            return;
        }

        const { id_company, id_branch } = req.params;
        const branchFree = await get_data_branch(id_branch);
        const dataEmployee = await get_data_employee(req);

        if (!id_branch || !branchFree) {
            res.render('links/store/branchLost');
            return;
        }

        const dishAndCombo = await get_all_dish_and_combo(id_company, id_branch);
        const newCombos = await get_data_recent_combos(id_company);
        const mostSold = await get_all_data_combo_most_sold(id_branch);
        const offerAd = await get_all_ad(id_branch, 'offer');
        const newAd = await get_all_ad(id_branch, 'new');
        const combosAd = await get_all_ad(id_branch, 'combo');
        const specialsAd = await get_all_ad(id_branch, 'special');
        const addition = '{"nombre": "Juan", "edad": 30, "ciudad": "Madrid"}'; // Ejemplo de datos adicionales
        const boxes=await get_all_box_of_the_branch_with_his_id(id_branch)
        const templateData = {
            branchFree,
            dishAndCombo,
            dataEmployee,
            mostSold,
            newCombos,
            offerAd,
            newAd,
            combosAd,
            specialsAd,
            boxes,
            addition: JSON.stringify(addition)
        };
        res.render('links/store/home/home', templateData);
    } catch (error) {
        console.error('Error en la ruta store-home:', error);
        res.render('error'); // Renderizar una página de error adecuada
    }
});

router.get('/store-home', isLoggedIn, async (req, res) => {
    res.render('links/store/home/home');
})


router.get('/create-invoice', isLoggedIn, async (req, res) => {
    res.render('links/store/invoice/createInvoice');
})








module.exports = router;