const express = require('express');
const router = express.Router();
const database = require('../database');
const addDatabase = require('../router/addDatabase');
const databaseM = require('../mongodb');
const { isLoggedIn, isNotLoggedIn } = require('../lib/auth');
const helpers=require('../lib/helpers.js');

//const delateDatabase=require('delateDatabase'); sigup
const nodemailer = require('nodemailer'); //this is for send emails 
const crypto = require('crypto');

const sendEmail = require('../lib/sendEmail.js'); //this is for send emails 

//stripe 
const {APP_PASSWORD_STRIPE} = process.env;
const stripe = require('stripe')(APP_PASSWORD_STRIPE);

//PDF
const puppeteer = require('puppeteer');

/////
const rolFree=0

//////////////////////
const {
    get_data_company_with_id,
} = require('../services/company');

//packs 
async function get_data(req) {
    const { id } = req.params;
    var id_user = parseInt(req.user.id);

    var queryText = 'SELECT * FROM products_dish_supplies Where id_companies=$1';
    var values = [id];
    const result = await database.query(queryText, values);
    return result.rows[0];
}

async function get_country() {
    const resultCountry = await database.query('SELECT * FROM "Fud".country');
    return resultCountry.rows;
}

const companyName = 'links'

//-------------------------------------------------------------------web-------------------------------------------
router.get('/identify', isNotLoggedIn, (req, res) => {
    res.render(companyName + '/web/identify'); //this web is for return your user
})

router.get('/terms-and-conditions', (req, res) => {
    res.render(companyName + '/web/terms_conditions');
})

router.get('/prices', (req, res) => {
    res.render(companyName + '/web/prices');
})

router.get('/prices2', (req, res) => {
    res.render(companyName + '/web/prices2');
})

router.get('/prices-chraracter', (req, res) => {
    res.render(companyName + '/web/prices');
})

router.get('/main', isNotLoggedIn, (req, res) => {
    res.render(companyName + '/web/main'); //this web is for return your user
})

router.get('/partners', isNotLoggedIn, async (req, res) => {
    res.render(companyName + '/web/partners')
});

router.get('/our-company', isNotLoggedIn, async (req, res) => {
    res.render(companyName + '/web/aboutUs')
});

router.get('/download', isNotLoggedIn, async (req, res) => {
    res.render(companyName + '/web/download')
});

router.get('/terms_conditions', async (req, res) => {
    res.render(companyName + '/web/terms_conditions')
});

router.get('/privacy', async (req, res) => {
    res.render(companyName + '/web/privacy')
});

router.get('/contact-us', isNotLoggedIn, async (req, res) => {
    res.render(companyName + '/web/contactUs')
});

router.get('/store', isLoggedIn, (req, res) => {
    res.render(companyName + '/store/store');
})

router.get('/cart', isLoggedIn, (req, res) => {
    res.render(companyName + '/store/cart');
})

router.get('/sales-history', isLoggedIn, (req, res) => {
    res.render(companyName + '/store/salesHistory');
})

router.get('/reservation', isLoggedIn, (req, res) => {
    res.render(companyName + '/store/reservation');
})

router.get('/other', isLoggedIn, (req, res) => {
    res.render(companyName + '/store/other');
})

router.get('/login-web', (req, res) => {
    res.render(companyName + '/web/loginAd');
})

router.get('/recipes', isLoggedIn, (req, res) => {
    res.render(companyName + '/store/recipes');
})

router.get('/:id_company/login', isNotLoggedIn, async (req, res) => {
    const {id_company}=req.params;
    const company = await get_data_company_with_id(id_company);
    res.render('links/branch/login',{company}); //this web is for return your user
})

router.get('/:id_company/:id_branch/login', isNotLoggedIn, async (req, res) => {
    const {id_company}=req.params;
    const digitalMenu={}
    const dataLoginBranch=await get_data_company_with_id(id_company);
    res.render('links/branch/login',{digitalMenu,dataLoginBranch}); //this web is for return your user
})



//------------------------------------------------------emails and restart password
router.post('/send_email_contact', isNotLoggedIn, (req, res) => {
    const {name,email,phone,msg_subject,message} = req.body;
    const emailMessage='Name: '+name+'<br>'+'email: '+email+'<br>'+'phone: '+phone+'<br>'+'message: '+message;
    sendEmail.send_email('eduardoa4848@Outlook.es',msg_subject,emailMessage);
    res.redirect('/fud/send-email');
})

router.get('/send-email', isNotLoggedIn, (req, res) => {
    res.render(companyName + '/web/sendEmail');
})

router.get('/restart-password', isNotLoggedIn, async (req, res) => {
    res.render(companyName + '/web/restartPasswordEmail')
});

router.post('/restart-password', isNotLoggedIn, async (req, res) => {
    var {email}=req.body; //get the email of the user 
    //delete the space in empty of the form for avoid a error in the login
    email = email.trim();

    const idUser=await get_id_user_for_email(email); //search the id of the user

    //we will watching if exist a user with this email 
    if(idUser){
        const token = await create_token(); // create a token

        //we going to save the token in the database 
        if(await save_token_database(idUser,token)){
            //if we can save the token in the database, send the token for email 
            await sendEmail.email_to_recover_password(email,token)//await restart_password_send_token(email,token);
            //await sendEmail.email_to_recover_password('eduardoa4848@Outlook.es',token)//await restart_password_send_token(email,token);
            req.flash('success', 'Se envio un token a tu correo electronico usalo para restablecer tu password 👁️');
            res.redirect('/fud/confirm-restart-password');
        }else{
            //if we no can save the token in the database, show a message of error 
            req.flash('message', 'No pudimos enviar el token a tu cuenta, intente de nuevo 👉👈');
            res.redirect('/fud/restart-password');
        }
    }else{
        req.flash('message', 'No existe un usuario con este correo 🤨');
        res.redirect('/fud/restart-password');
    }

});

router.get('/confirm-restart-password', isNotLoggedIn, async (req, res) => {
    res.render(companyName + '/web/restartPassword')
});

router.post('/confirm-restart-password', isNotLoggedIn, async (req, res) => {
    //get the data of the form 
    var {password1,password2,token}=req.body;

    //delete the space in empty of the form for avoid a error in the login
    password1 = password1.trim();
    password2 = password2.trim();
    token = token.trim();

    //we will getting the id of the user with the token 
    const idUser=await get_id_user_for_token(token);
    
    //we will watching if this token have a user assigned
    if(idUser){
        //we will watching if the password is equals 
        if(compare_password(password1,password2)){
            //we will encrypting the password
            const newPassword=await helpers.encryptPassword(password1);

            //we will updating the new password in the database 
            if(await update_password_user(idUser,newPassword)){
                await delete_token(token); //delete the token used for the user 
                //if the password was update with success, redirect to user to the web of login
                req.flash('success', 'Tu contraseña fue actualizada con exito ❤️');
                res.redirect('/fud/login');
            }else{
                //if not can update the password show a message of error
                req.flash('message', 'La contraseñas no pudo actualizarse intentelo de nuevo 😰');
                res.redirect('/fud/confirm-restart-password');
            }
        }else{
            req.flash('message', 'La contraseñas no coinsiden 🤨');
            res.redirect('/fud/confirm-restart-password');
        }
    }else{
        //if the token not have a user assigned show a message of error
        req.flash('message', 'Este Token no se encuentra en la base de datos o ya caduco 👁️');
        res.redirect('/fud/confirm-restart-password');
    }
});


async function get_id_user_for_email(email){
    try{
        var queryText = 'SELECT * FROM "Fud".users WHERE email = $1';
        var values = [email];
        const result = await database.query(queryText, values);
        const data = result.rows;
        return data[0].id;
    }catch(error){
        return null;
    }
}

async function save_token_database(idUser,token){
    try{
        // get the date and hours current
        const now = new Date();

        // calculate token expiration date and time (5 minutes in the future)
        const expiryTime = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes in milliseconds

        // Query to insert the token into the reset_tokens table
        const queryText = `
            INSERT INTO "Fud".tokens (user_id, token, created_at, expiry_time)
            VALUES ($1, $2, $3, $4)
        `;
        const values = [idUser, token, now, expiryTime];

        // save the the token
        await database.query(queryText, values);
        return true;
    }catch(error){
        console.log('error to save the token '+error)
        return false;
    }
}

async function get_id_user_for_token(token){
    try {
        var queryText = 'SELECT * FROM "Fud".tokens WHERE token = $1';
        var values = [token];
        const result = await database.query(queryText, values);
        const data = result.rows;
        return data[0].user_id;
    } catch (error) {
        console.error('Error to delete the token of the database:', error);
        return false;
    }
}

async function update_password_user(idUser, newPassword) {
    try {
        const queryText = `
            UPDATE "Fud".users
            SET password = $1
            WHERE id = $2
        `;
        const values = [newPassword, idUser];
        await database.query(queryText, values);

        return true;
    } catch (error) {
        console.error('Error when update the new password:', error);
        return false;
    }
}

async function delete_token(token) {
    try {
        const queryText = `
            DELETE FROM "Fud".tokens
            WHERE token = $1
        `;
        const values = [token];
        await database.query(queryText, values);
    } catch (error) {
        console.error('Error to delete the token of the database:', error);
    }
}

function compare_password(P1,P2){
    if (P1==''){
        return false;
    }

    return P1==P2;
}

// function for create a new token for restart password
function create_token() {
    return new Promise((resolve, reject) => {
        crypto.randomBytes(10, (err, buf) => {
            if (err) {
                reject(err);
            } else {
                resolve(buf.toString('hex'));
            }
        });
    });
}

async function restart_password_send_token(email,token) {
    const toEmail = email;//'fud-technology@hotmail.com' //email
    const subjectEmail = 'Restablecimiento de Password';
    const message = `
        <html>
        <head>
            <style>
                /* Estilos CSS para el correo electrónico */
                body {
                    font-family: Arial, sans-serif;
                    color: #333;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    border: 1px solid #ccc;
                    border-radius: 10px;
                    background-color: #f9f9f9;
                }
                .header {
                    background-color: #FF002A;
                    color: #fff;
                    text-align: center;
                    padding: 10px;
                    border-radius: 10px 10px 0 0;
                }
                .content {
                    padding: 20px 0;
                }
                .footer {
                    text-align: center;
                    color: #777;
                    font-size: 14px;
                }
                .token-box {
                    border: 2px solid #FF002A;
                    border-radius: 5px;
                    padding: 10px;
                    text-align: center;
                    margin: 0 auto; /* Centrar el cuadro */
                    max-width: 400px; /* Establecer el ancho máximo */
                }
                .token{
                    font-size: 25px;
                }
            </style>
            <link rel='stylesheet' href='https://cdn-uicons.flaticon.com/2.2.0/uicons-solid-rounded/css/uicons-solid-rounded.css'>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Restablecimiento de contraseña</h1>
                </div>
                <div class="content">
                    <p>Hola!! 👋, Somos el equipo de <i class="fi fi-sr-hat-chef"></i> Füd</p>
                    <p>¿Has solicitado restablecer tu contraseña? Utiliza el siguiente token para completar el proceso:</p>
                    <div class="token-box">
                        <strong class="token">${token}</strong>
                    </div>
                    <div><p>Si no has solicitado este restablecimiento, puedes ignorar este correo.</p></div>
                    <p>Saludos, Equipo de Soporte y mucha suerte!! 😉❤️</p>
                </div>
                <div class="footer">
                    <p>Este es un mensaje automático, por favor no responda a este correo.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    //we will watching can sen a token to the email of the user 
    return await sendEmail.send_email(toEmail, subjectEmail, message);
}

//-----------------------------------------------------------------home login 
router.get('/home', isLoggedIn, async (req, res) => {
    await home_render(req, res)
});

async function home_render(req, res) {
    if(req.user.rol_user == rolFree){  //Free
        await home_free(req, res)
    }
    else if (req.user.rol_user == 0) { //CEO
        await home_company(req, res)
    }
    else if (req.user.rol_user == 1) { //Manager
        await home_manager(req, res)
    }
    else{ //Employee
        await home_employees(req, res)
    }
}

async function get_data_branch_view_manager(id_branch) {
    var queryText = 'SELECT * FROM "Company".branches WHERE id= $1';
    var values = [id_branch];
    const result = await database.query(queryText, values);
    const data = result.rows;
    return data;
}

async function home_manager(req,res){
    const employee=await get_data_employee(req)
    const idBranch=employee[0].id_branches;
    const branch = await get_data_branch_view_manager(idBranch)
    res.render('links/branch/home', { branch });
}

async function home_employees(req, res) {
    //we will search the company and branch where the user works
    const employee = await get_data_employee(req);
    const data = employee[0]
    const id_user = data.id_users
    const id_company = data.id_companies
    const id_branch = data.id_branches
    const id_employee = data.id
    const id_role = data.id_roles_employees

    const url = `/fud/${id_user}/${id_company}/${id_branch}/${id_employee}/${id_role}/store-home`;
    res.redirect(url)
}

async function home_company(req, res) {
    var queryText = 'SELECT * FROM "User".companies Where id_users= $1';
    var values = [parseInt(req.user.id)];
    const result = await database.query(queryText, values);
    const companies = result.rows;
    res.render('links/manager/home', { companies });
}









//----------------------------------------------------FUD ONE----------------------------------------------------//
//functions employees
const {
    get_data_employee
} = require('../services/employees');


async function home_free(req, res) {
    const employee = await get_data_employee(req);
    const data = employee[0]
    const id_user = data.id_users
    const id_company = data.id_companies
    const id_branch = data.id_branches
    const id_employee = data.id
    const id_role = data.id_roles_employees

    const link = `/fud/${id_user}/${id_company}/${id_branch}/${id_employee}/${id_role}/store-home`;
    res.redirect(link);
}

async function the_user_can_add_most_combo(comboLength,packCombo){
    const limits = {
        1: 300,
        2: 600,
        3: 1500
    };

    const limit = limits[packCombo] || 25; // if packCombo no is in the limit en, we will use 25 how value

    return comboLength < limit;
}


module.exports = router;