const express = require('express');
const router = express.Router();
const { isLoggedIn, isNotLoggedIn } = require('../../lib/auth');


//delete employees
router.get('/:id_company/:idUser/delete-employee', isLoggedIn, async (req, res) => {
    if (await this_company_is_of_this_user(req, res)) {
        const { id_company } = req.params;
        const { idUser } = req.params;
        //first delete the image for not save trash in the our server
        await delete_profile_picture(idUser);

        //we going to delete the employee 
        if (await delete_employee(idUser)) {
            //if the user is not deleted it doesn't really matter
            await delete_user(idUser);
            req.flash('success', 'El empleado fue eliminado 👍');
        }
        else {
            req.flash('message', 'El empleado no fue eliminado 👉👈');
        }

        res.redirect('/fud/' + id_company + '/employees');
    }
})

async function delete_profile_picture(idUser) {
    //we will see if the user have a profile picture
    const pathImg = await get_profile_picture(idUser);
    //if esxit a image, we going to delete 
    if (pathImg != null) {
        delate_image_upload(pathImg)
    }
}

async function get_profile_picture(idUser) {
    //we will search the user that the manager would like delete
    var queryText = 'SELECT photo FROM "Fud".users WHERE id= $1';
    var values = [idUser];
    const result = await database.query(queryText, values);
    if (result.rows.length > 0 && 'photo' in result.rows[0]) {
        return result.rows[0].photo;
    } else {
        return null;
    }
}

async function delete_user(idUser) {
    try {
        var queryText = 'DELETE FROM "Fud".users WHERE id = $1';
        var values = [idUser];
        await database.query(queryText, values); // Delete employee
        return true;
    } catch (error) {
        console.error('Error al eliminar en la base de datos:', error);
        return false;
    }
}


module.exports = router;