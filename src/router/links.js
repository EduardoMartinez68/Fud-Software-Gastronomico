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
//packs 
async function get_pack_database(id_company){
    try {
        const queryText = `
            SELECT pack_database
            FROM "User".companies
            WHERE id = $1
        `;
        const { rows } = await database.query(queryText, [id_company]);
        if (rows.length > 0) {
            return rows[0].pack_database;
        } else {
            return null; 
        }
    } catch (error) {
        console.error('Error al obtener pack_database:', error);
        return 0;
    }
}

async function get_pack_branch(id_branch){
    try {
        const queryText = `
            SELECT pack_database
            FROM "Company".branches
            WHERE id = $1
        `;
        const { rows } = await database.query(queryText, [id_branch]);
        if (rows.length > 0) {
            return rows[0].pack_database;
        } else {
            return null; 
        }
    } catch (error) {
        console.error('Error al obtener pack_database:', error);
        return 0;
    }
}

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

async function check_company(req) {
    const { id } = req.params;
    var queryText = 'SELECT * FROM "User".companies WHERE id= $1 and id_users= $2';
    var values = [id, parseInt(req.user.id)];
    const result = await database.query(queryText, values);
    const company = result.rows;
    return company;
}

async function check_company_other(req) {
    const { id_company } = req.params;
    var queryText = 'SELECT * FROM "User".companies WHERE id= $1 and id_users= $2';
    var values = [id_company, parseInt(req.user.id)];
    const result = await database.query(queryText, values);
    const company = result.rows;
    return company;
}

async function get_data_company(req, nameTable) {
    const { id } = req.params;
    var queryText = 'SELECT * FROM "Company".' + nameTable + ' WHERE id_companies= $1';
    var values = [id];
    const result = await database.query(queryText, values);
    const data = result.rows;
    return data;
}

const companyName = 'links'

//
async function this_company_is_of_this_user(req, res) {
    //get the id of the company
    const { id_company } = req.params;
    const company = await check_company_user(id_company, req); //search all the company of the user 
    console.log(id_company)
    //we will see if exist this company in the list of the user
    if (company.length > 0) {
        return company;
    } else {
        //if not exist we will to show a invasion message 
        req.flash('message', '⚠️Esta empresa no es tuya⚠️');
        res.redirect('/fud/home');
    }
}

async function check_company_user(id_company, req) {
    //we going to search all the company of the user with this id 
    var queryText = 'SELECT * FROM "User".companies WHERE id= $1 and id_users= $2';
    var values = [id_company, parseInt(req.user.id)];
    const result = await database.query(queryText, values);
    const company = result.rows;
    return company;
}

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

// function for create a new token for restart password validate_subscription get_type_employees
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

///-----------------------------------------------------------------links of the store
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

//-----------------------------------------------------------------login
router.get('/:id_company/login', isNotLoggedIn, async (req, res) => {
    const {id_company}=req.params;
    const company = await get_data_company_with_id(id_company);
    res.render('links/branch/login',{company}); //this web is for return your user
})

//-----------------------------------------------------------------home
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


async function get_free_company(id_user){
    var queryText = 'SELECT id FROM "User".companies WHERE id_users = $1';
    var values = [id_user];
    const result = await database.query(queryText, values);
    const companyId = result.rows[0].id;
    return companyId;
}

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

//update tokens rappi and uber eat 
async function update_token_rappi_branch(id_branch, token_rappi) {
    var queryText = `
        UPDATE "Company".branches 
        SET 
            token_rappi=$1
        WHERE 
            id=$2
    `;

    const values = [
        token_rappi,
        id_branch
    ];

    try {
        await database.query(queryText, values);
        return true;
    } catch (error) {
        console.error('Error update :', error);
        return false;
    }
}

async function update_token_uber_eat_branch(id_branch, token_uber) {
    var queryText = `
        UPDATE "Company".branches 
        SET 
            token_uber=$1
        WHERE 
            id=$2
    `;

    const values = [
        token_uber,
        id_branch
    ];

    try {
        await database.query(queryText, values);
        return true;
    } catch (error) {
        console.error('Error update :', error);
        return false;
    }
}

//-----------------------------------------------------------------delivery-----------------------------------------------------------------

router.get('/:id_company/:id_branch/delivery', isLoggedIn, async (req, res) => {
    try {
        const { id_company, id_branch } = req.params;
        // Here you get the user's access token from where you have it stored
        const accessToken = await get_token_by_branch_id(id_branch);

        // Call the function to get the orders using the access token
        const orderUber = [{id:0,created_at:'12/12/12',status:'activate'}]//await get_order_uber(accessToken.token_uber);
        const orderRappi= [{id:0,created_at:'12/12/12',status:'activate'}]//await get_order_rappi(accessToken.token_rappi);

        // Render the 'orders' view and pass the orders as data
        res.render("links/branch/delivery/delivery", { orderUber, orderRappi});
    } catch (error) {
        console.error('Error al obtener los pedidos:', error);
        res.render('error', { message: 'Error al obtener los pedidos' }); // Handle the error according to your application
    }
});

/////-----rappi--------//////////
/*REPORTE DE PEDIDOS DE USUARIO*/
const axios = require('axios');
const {UBER_APPLICATION_ID,UBER_CLIENT_SECRET,UBER_SIGNING_KEY,RAPPI_CLIENT_ID,RAPPI_CLIENT_SECRET,RAPPI_REDIRECT_URI} = process.env;


//rappi 
const rappiClientId = RAPPI_CLIENT_ID;
const rappiClientSecret = RAPPI_CLIENT_SECRET;
const rappiRedirectUri = RAPPI_REDIRECT_URI;
var https = require("https");

// Ruta para redirigir a la página de autorización de Rappi
router.get('/auth/rappi', (req, res) => {
    const authorizationUrl = `https://api.rappi.com/oauth/authorize?client_id=${rappiClientId}&response_type=code&redirect_uri=${rappiRedirectUri}&scope=orders.read`;
    res.redirect(authorizationUrl);
});

// Ruta de redirección de callback
router.get('/callback/rappi', async (req, res) => {
    const authorizationCode = req.query.code;

    //get the data of the branch
    const employee = await get_data_employee(req);
    const data = employee[0]
    const id_company = data.id_companies;
    const id_branch = data.id_branches;

    //we will see if can get a new token 
    if (!authorizationCode) {
        req.flash('message', 'La sucursal no fue conectada 😰 errro: Código de autorización no recibido');
    }

    try {
      // Intercambia el código de autorización por un token de acceso
      const response = await axios.post('https://api.rappi.com/oauth/token', querystring.stringify({
        client_id: rappiClientId,
        client_secret: rappiClientSecret,
        grant_type: 'authorization_code',
        redirect_uri: deliveryRedirectUri,
        code: authorizationCode
      }), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
  
      const accessToken = response.data.access_token; //get the token 
      await update_token_rappi_branch(id_branch,accessToken); //save the token in the database 
      req.flash('success', 'La sucursal fue conectada con exito a rappi 😊')
    } catch (error) {
      console.error('Error al obtener el token de acceso:', error);
      req.flash('message', 'La sucursal no fue conectada 😰 errro: '+error.message);
    }

    res.redirect('/fud/'+id_company+'/'+id_branch+'/delivery');
});

/////-----uber--------//////////
const uberClientId = UBER_APPLICATION_ID;
const uberClientSecret = UBER_CLIENT_SECRET;
const deliveryRedirectUri = 'http://localhost:4000/fud/callback/ubereat' //'https://fud-tech.cloud/fud/main';
const uberRedirectUrl='http://localhost:4000/fud/callback/ubereat' //'https://fud-tech.cloud/callback/ubereat'
const querystring = require('querystring');

// Ruta para redirigir a la página de autorización de Uber
router.get('/auth/ubereat', (req, res) => {
    const scope = 'eats.orders'; // El scope que quieres solicitar
    const authorizationUrl = `https://login.uber.com/oauth/v2/authorize?client_id=${UBER_APPLICATION_ID}&response_type=code&redirect_uri=${encodeURIComponent(deliveryRedirectUri)}&scope=${scope}`;
    res.redirect(authorizationUrl);
});

// Ruta de redirección de callback
router.get('/callback/ubereat', async (req, res) => {
    const authorizationCode = req.query.code;

    //get the data of the branch
    const employee = await get_data_employee(req);
    const data = employee[0]
    const id_company = data.id_companies;
    const id_branch = data.id_branches;

    if (!authorizationCode) {
        req.flash('message', 'La sucursal no fue conectada 😰 errro: Código de autorización no recibido');
    }

    try {
        const response = await axios.post('https://login.uber.com/oauth/v2/token', querystring.stringify({
            client_id: uberClientId,
            client_secret: uberClientSecret,
            grant_type: 'authorization_code',
            redirect_uri: uberRedirectUrl,
            code: authorizationCode
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const accessToken = response.data.access_token; //get the token 
        await update_token_uber_eat_branch(id_branch,accessToken); //save the token in the database 
        req.flash('success', 'La sucursal fue conectada con exito 😊')
    } catch (error) {
        console.error('Error al obtener el token de acceso:', error.message);
        req.flash('message', 'La sucursal no fue conectada 😰 errro: '+error.message);
    }

    res.redirect('/fud/'+id_company+'/'+id_branch+'/delivery');
});

// Función para obtener pedidos de Uber Eats usando el token de acceso del usuario
async function get_order_uber(accessTokeUser) {
    try {
        const response = await axios.get('https://api.uber.com/v1/eats/orders', {
            headers: {
                'Authorization': `Bearer ${accessTokeUser}`,
                'Content-Type': 'application/json'
            }
        });

        const pedidos = response.data;
        return pedidos;
    } catch (error) {
        console.error('Error al obtener los pedidos:', error);
        return null;
    }
}

//rappi 
router.post('https://rests-integrations-dev.auth0.com/oauth/token', isLoggedIn, async (req, res) => {
    console.log(req.body)
});

var https = require("https");



async function get_token_by_branch_id(id_branch) {
    const queryText = `
        SELECT token_uber, token_rappi
        FROM "Company".branches
        WHERE id = $1
    `;
    const values = [id_branch];

    try {
        const result = await database.query(queryText, values);
        if (result.rows.length > 0) {
            return result.rows[0]; // Devuelve el token_uber si se encuentra
        } else {
            return null; // Retorna null si no se encuentra ningún registro con branchId dado
        }
    } catch (error) {
        console.error('Error al obtener token_uber por ID:', error);
        throw error;
    }
}

// Función para obtener pedidos de Rappi usando el token de acceso del usuario
async function get_order_rappi(accessToken) {
    try {
      const response = await axios.get('https://api.rappi.com/v1/orders', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
  
      const pedidos = response.data;
      return pedidos;
    } catch (error) {
      console.error('Error al obtener los pedidos:', error);
      throw error;
    }
}


router.get('/tables', (req, res) => {
    res.render("links/branch/tables/tables");
});

module.exports = router;