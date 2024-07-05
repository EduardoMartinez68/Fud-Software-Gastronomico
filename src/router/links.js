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

///links of the store
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

//-----------------------------------------------------------------subscription
router.post('/add-app-fud', isLoggedIn, async (req, res) => {
    const {app}=req.body; //get the app that the user buy 
    const {id_company,id_branch}=req.body; //get the data of the branch 

    try {
        // get the price with the ID of the price
        const price = await stripe.prices.retrieve(req.body.price_id);

        if (!price) {
            throw new Error('No se encontró el precio.');
        }

        //we will create the session of checkout with the ID of the price
        const session = await stripe.checkout.sessions.create({
            billing_address_collection: 'auto',
            line_items: [{
                price: req.body.price_id,
                quantity: 1,
            }],
            mode: 'subscription',
            success_url: `https://fud-tech.cloud/fud/{CHECKOUT_SESSION_ID}/buy-app`,
            cancel_url: `https://fud-tech.cloud/fud/prices`,
        });

        //we wait to that the session is complete, that the user do clic in cancel or buy 
        const sessionCompleted = await stripe.checkout.sessions.retrieve(session.id);

        //when the user do clic buy update the suscription 
        if (sessionCompleted.payment_status === 'paid') {
            // get the date current
            const currentDate = new Date();

            // sum 30 days to the date current
            currentDate.setDate(currentDate.getDate() + 30);

            // update the date of the suscription in the database
            if (await update_suscription_of_app_in_branch(id_branch, app, currentDate)) {
                req.flash('success', 'La suscripción fue activada.');
            } else {
                req.flash('message', 'La suscripción no fue activada. Por favor, busca ayuda 🙅‍♂️');
            }
        }
    
        // Redirect the user to the checkout session URL
        res.redirect(303, session.url);
    } catch (error) {
        console.error('Error al crear la suscripción:', error);
        req.flash('message', 'Error al crear la suscripción. Por favor, inténtelo de nuevo más tarde. 🙅‍♂️')
        res.redirect(`https://fud-tech.cloud/fud/${id_company}/${id_branch}/marketplace`);
    }
});

async function update_suscription_of_app_in_branch(id_branch, app, due_date){
    //this is for create the query with the app that the user buy
    queryText = `
    UPDATE "Company".branches
    SET ${app} = $1
    WHERE id = $2
    `;

    const values = [due_date, id_branch];
    try {
        await database.query(queryText, values);
        return true;
    } catch (error) {
        console.error('Error updating app:', error);
        throw error;
    }
}

router.post('/create-suscription-cloude', isLoggedIn, async (req, res) => {
    try {
        // get the price with the ID of the price
        const price = await stripe.prices.retrieve(req.body.price_id);

        if (!price) {
            throw new Error('No se encontró el precio.');
        }

        //we will create the session of checkout with the ID of the price
        const session = await stripe.checkout.sessions.create({
            billing_address_collection: 'auto',
            line_items: [{
                price: req.body.price_id,
                quantity: 1,
            }],
            mode: 'subscription',
            success_url: `https://fud-tech.cloud/fud/{CHECKOUT_SESSION_ID}/welcome-subscription`,
            cancel_url: `https://fud-tech.cloud/fud/prices`,
        });

        res.redirect(303, session.url);
    } catch (error) {
        console.error('Error al crear la suscripción:', error);
        res.status(500).send('Error al crear la suscripción. Por favor, inténtelo de nuevo más tarde.');
    }
});


router.post('/create-suscription-studio', isLoggedIn, async (req, res) => {
    try {
        // get the price with the ID of the price
        const price = await stripe.prices.retrieve(req.body.price_id);

        if (!price) {
            throw new Error('No se encontró el precio.');
        }

        //we will create the session of checkout with the ID of the price
        const session = await stripe.checkout.sessions.create({
            billing_address_collection: 'auto',
            line_items: [{
                price: req.body.price_id,
                quantity: 1,
            }],
            mode: 'subscription',
            success_url: `https://fud-tech.cloud/fud/{CHECKOUT_SESSION_ID}/welcome-studio`,
            cancel_url: `https://fud-tech.cloud/fud/prices`,
        });

        res.redirect(303, session.url);
    } catch (error) {
        console.error('Error al crear la suscripción:', error);
        res.status(500).send('Error al crear la suscripción. Por favor, inténtelo de nuevo más tarde.');
    }
    /*
    try {
      const prices = await stripe.prices.list({
        lookup_keys: [req.body.lookup_key],
        expand: ['data.product'],
      });
  
      if (!prices.data || prices.data.length === 0) {
        throw new Error('No se encontraron precios.');
      }
  
      const session = await stripe.checkout.sessions.create({
        billing_address_collection: 'auto',
        line_items: [
          {
            price: prices.data[0].id,
            // For metered billing, do not pass quantity
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `https://fud-tech.cloud/fud/{CHECKOUT_SESSION_ID}/welcome-studio`,
        cancel_url: `https://fud-tech.cloud/fud/prices`,
      });

      res.redirect(303, session.url);
    } catch (error) {
      console.error('Error al crear la suscripción:', error);
      res.status(500).send('Error al crear la suscripción. Por favor, inténtelo de nuevo más tarde.');
    }
    */
});

router.post('/create-suscription-free', isLoggedIn, async (req, res) => {
    try {
        // get the price with the ID of the price
        const price = await stripe.prices.retrieve(req.body.price_id);

        if (!price) {
            throw new Error('No se encontró el precio.');
        }

        //we will create the session of checkout with the ID of the price
        const session = await stripe.checkout.sessions.create({
            billing_address_collection: 'auto',
            line_items: [{
                price: req.body.price_id,
                quantity: 1,
            }],
            mode: 'subscription',
            success_url: `https://fud-tech.cloud/fud/{CHECKOUT_SESSION_ID}/welcome-free`,
            cancel_url: `https://fud-tech.cloud/fud/prices`,
        });

        res.redirect(303, session.url);
    } catch (error) {
        console.error('Error al crear la suscripción:', error);
        res.status(500).send('Error al crear la suscripción. Por favor, inténtelo de nuevo más tarde.');
    }
});

router.post('/create-suscription-fud-pack', isLoggedIn, async (req, res) => {
    try {
        // get the price with the ID of the price
        const price = await stripe.prices.retrieve(req.body.price_id);

        if (!price) {
            throw new Error('No se encontró el precio.');
        }

        //we will create the session of checkout with the ID of the price
        const session = await stripe.checkout.sessions.create({
            billing_address_collection: 'auto',
            line_items: [{
                price: req.body.price_id,
                quantity: 1,
            }],
            mode: 'subscription',
            success_url: `https://fud-tech.cloud/fud/{CHECKOUT_SESSION_ID}/welcome-subscription`,
            cancel_url: `https://fud-tech.cloud/fud/prices`,
        });

        //we will wachign if exist a buy 
        if(session.url!='https://fud-tech.cloud/fud/prices'){
            const {pack_database,pack_branch}=req.body;
            const idUser=req.user.id;
            const idCompany=await update_database_company_with_the_user_id(idUser,pack_database);
            if (idCompany) {
                if(!await update_pack_branch_with_the_company_id(idCompany,pack_branch)){
                    req.flash('message', 'La sucursal no fue activada. Por favor, busca ayuda 🙅‍♂️')
                }
            }else{
                req.flash('message', 'La base de datos no fue activada. Por favor, busca ayuda 🙅‍♂️')
            }
        }


        res.redirect(303, session.url);
    } catch (error) {
        console.error('Error al crear la suscripción:', error);
        res.status(500).send('Error al crear la suscripción. Por favor, inténtelo de nuevo más tarde.');
    }
});

async function update_database_company_with_the_user_id(idUser, newPackDatabase){
    const queryText = `
        UPDATE "User".companies
        SET pack_database = $1
        WHERE id = (
            SELECT id
            FROM "User".companies
            WHERE id_users = $2
            LIMIT 1
        )
        RETURNING id
    `;
    
    const values = [newPackDatabase, idUser];
    
    try {
        const result = await database.query(queryText, values);
        if (result.rows.length > 0) {
            const companyId = result.rows[0].id;
            console.log('Pack database updated for company ID:', companyId);
            return companyId;
        } else {
            console.log('No company found for the given user ID.');
            return null;
        }
    } catch (error) {
        console.error('Error updating pack database:', error);
        throw error;
    }
}

async function update_pack_branch_with_the_company_id(idCompany, newPackBranch){
    const queryText = `
        UPDATE "Company".branches
        SET pack_branch = $1
        WHERE id = (
            SELECT id
            FROM "Company".branches
            WHERE id_companies = $2
            LIMIT 1
        )
    `;
    
    const values = [newPackBranch, idCompany];
    
    try {
        await database.query(queryText, values);
        return true;
    } catch (error) {
        console.error('Error updating pack branch:', error);
        return false;
    }
}

router.get('/:session_id/buy-app',isLoggedIn,async (req, res) => {
    await create_subscription_app(req,14); //this is for save the subscription in the database with the pack that buy the user 
    res.render('links//web/buyApp'); //this web is for return your user
})

router.get('/:session_id/welcome-free',isLoggedIn,async (req, res) => {
    await create_subscription(req,13); //this is for save the subscription in the database with the pack that buy the user 
    res.render(companyName + '/web/welcomeSuscription'); //this web is for return your user
})

router.get('/:session_id/welcome-subscription',isLoggedIn,async (req, res) => {
    await create_subscription(req,11); //this is for save the subscription in the database with the pack that buy the user 
    res.render(companyName + '/web/welcomeSuscription'); //this web is for return your user
})

router.get('/:session_id/welcome-studio', isLoggedIn, async (req, res) => {
    await create_subscription(req,12); //this is for save the subscription in the database with the pack that buy the user 
    res.render(companyName + '/web/welcomeSuscription'); //this web is for return your user
})

router.get('/subscription', isLoggedIn, async (req, res) => {
    const company = await check_company_other(req);
    const { id_company } = req.params;
    const subscription=await get_subscription_for_id_user(req.user.id); //get all the suscription of the user for his id 
    console.log(subscription)
    res.render(companyName + '/manager/options/subscription', { company , subscription});
});

router.get('/:id_subscription/:nam_branch/link-subscription', isLoggedIn, async (req, res) => {
    const { id_subscription , nam_branch} = req.params;
    const idBranch=await get_id_branch_byt_name(nam_branch);
    await update_subscription(id_subscription,idBranch);
    res.redirect('/fud/subscription');
});


router.get('/:id_subscription/delete-subscription', isLoggedIn, async (req, res) => {
    const { id_subscription } = req.params; //get the id subscription 

    //we will watching if the subscription can delete
    if(await delete_subscription(id_subscription)){
        req.flash('success', 'Suscripcion cancelada. Esperamos tener tu comida de vuelta muy pronto 😢')
    }else{
        //if not can delete the subscription, show a message of error 
        req.flash('message', 'La suscripcion no pudo cancelarse, intentelo de nuevo 👁️')
    }

    res.redirect('/fud/subscription');
});

async function delete_subscription(id_subscription){
    try {
        // Cancelar la suscripción utilizando la API de Stripe
        const canceledSubscription = await stripe.subscriptions.cancel(id_subscription);
        var queryText = 'DELETE FROM "User".subscription WHERE id= $1';
        var values = [id_subscription];
        await database.query(queryText, values);

        return true;
        // Devolver una respuesta de éxito
        //res.status(200).json({ mensaje: 'Suscripción cancelada exitosamente', suscripcion: canceledSubscription });
      } catch (error) {
        console.log(error)
        return false;
        // Manejar errores
        //res.status(500).json({ error: error.message });
      }
}
//-----------------------------------------------------------------login
router.get('/:id_company/login', isNotLoggedIn, async (req, res) => {
    const {id_company}=req.params;
    const company = await get_data_company_with_id(id_company);
    res.render('links/branch/login',{company}); //this web is for return your user
})

async function get_data_company_with_id(id_company) {
    var queryText = 'SELECT * FROM "User".companies WHERE id= $1';
    var values = [id_company];
    const result = await database.query(queryText, values);
    const data = result.rows;
    return data;
}

//-----------------------------------------------------------------dish
router.get('/:id/dish', isLoggedIn, async (req, res) => {
    const company = await check_company(req); //req.company.rows; //
    const saucers = await get_data(req);
    res.render(companyName + '/store/dish', { company, saucers });
});

router.get('/:id/add-dish', isLoggedIn, async (req, res) => {
    //we need get all the Department and Category of the company
    const company = await check_company(req);
    const departments = await get_data_company(req, 'product_department');
    const categories = await get_data_company(req, 'product_category');
    res.render(companyName + '/manager/dish/addDish', { company, departments, categories });
});

//----------------------------------------------------------------category
async function get_category(id_company) {
    var queryText = 'SELECT * FROM "Kitchen".product_category WHERE id_companies= $1';
    var values = [id_company];
    const result = await database.query(queryText, values);
    const data = result.rows;
    return data;
}

async function delate_product_category(id) {
    var queryText = 'DELETE FROM "Kitchen".product_category WHERE id = $1';
    var values = [id];

    try {
        await database.query(queryText, values);
        return true;
    } catch (error) {
        console.error('Error al eliminar el registro en la base de datos:', error);
        return false;
    }
};

router.get('/:id/food-category', isLoggedIn, async (req, res) => {
    const company = await check_company(req);
    const { id } = req.params;
    const categories = await get_category(id);
    res.render(companyName + '/manager/areas/category', { company, categories })
});

router.get('/:id/add-category', isLoggedIn, async (req, res) => {
    const company = await check_company(req);
    const saucers = await get_data(req);
    res.render(companyName + '/store/dish', { company, saucers });
});

router.get('/:id_company/:id/delate-food-category', isLoggedIn, async (req, res) => {
    const company = await check_company_other(req);
    const { id, id_company } = req.params;

    //we will watch if the user have this company
    if (company.length > 0) {
        //we going to see if we can delate the department 
        if (await delate_product_category(id)) {
            res.redirect('/fud/' + id_company + '/food-category');
        }
        else {
            res.redirect('/fud/home');
        }
    }
    else {
        res.redirect('/fud/home');
    }
});

router.get('/:id_company/:id/delate-food-category', isLoggedIn, async (req, res) => {
    const company = await check_company_other(req);
    const { id, id_company } = req.params;

    //we will watch if the user have this company
    if (company.length > 0) {
        //we going to see if we can delate the department 
        if (await delate_product_category(id)) {
            res.redirect('/fud/' + id_company + '/food-category');
        }
        else {
            res.redirect('/fud/home');
        }
    }
    else {
        res.redirect('/fud/home');
    }

});

router.get('/:id_company/:id/:name/:description/edit-food-category', isLoggedIn, async (req, res) => {
    const company = await check_company_other(req);
    const { id_company, id, name, description } = req.params;

    //we will watch if the user have this company
    if (company.length > 0) {
        //we going to see if we can delate the department 
        if (await update_product_category(id, name, description)) {
            res.redirect('/fud/' + id_company + '/food-category');
        }
        else {
            res.redirect('/fud/home');
        }
    }
    else {
        res.redirect('/fud/home');
    }

});

async function update_product_category(id, name, description) {
    var values = [name, description, id];
    var queryText = 'UPDATE "Kitchen".product_category SET name = $1, description = $2 WHERE id = $3';

    try {
        await database.query(queryText, values);
        return true;
    } catch (error) {
        console.error('Error al actualizar el registro en la base de datos:', error);
        return false;
    }
}

//----------------------------------------------------------------department
async function get_department(id_company) {
    var queryText = 'SELECT * FROM "Kitchen".product_department WHERE id_companies= $1';
    var values = [id_company];
    const result = await database.query(queryText, values);
    const data = result.rows;
    return data;
}

async function delate_product_department(id) {
    var queryText = 'DELETE FROM "Kitchen".product_department WHERE id = $1';
    var values = [id];

    try {
        await database.query(queryText, values);
        return true;
    } catch (error) {
        console.error('Error al eliminar el registro en la base de datos:', error);
        return false;
    }
};

router.get('/:id/add-department', isLoggedIn, async (req, res) => {
    const company = await check_company(req);
    const saucers = await get_data(req);
    res.render(companyName + '/store/dish', { company, saucers });
});

router.get('/:id/food-department', isLoggedIn, async (req, res) => {
    const company = await check_company(req);
    const { id } = req.params;
    const departments = await get_department(id);
    res.render(companyName + '/manager/areas/department', { company, departments })
});

router.get('/:id_company/:id/delate-food-department', isLoggedIn, async (req, res) => {
    const company = await check_company_other(req);
    const { id, id_company } = req.params;

    //we will watch if the user have this company
    if (company.length > 0) {
        //we going to see if we can delate the department 
        if (await delate_product_department(id)) {
            res.redirect('/fud/' + id_company + '/food-department');
        }
        else {
            res.redirect('/fud/home');
        }
    }
    else {
        res.redirect('/fud/home');
    }

});

router.get('/:id_company/:id/:name/:description/edit-food-department', isLoggedIn, async (req, res) => {
    const company = await check_company_other(req);
    const { id_company, id, name, description } = req.params;

    //we will watch if the user have this company
    if (company.length > 0) {
        //we going to see if we can delate the department 
        if (await update_product_department(id, name, description)) {
            res.redirect('/fud/' + id_company + '/food-department');
        }
        else {
            res.redirect('/fud/home');
        }
    }
    else {
        res.redirect('/fud/home');
    }

});

async function update_product_department(id, name, description) {
    var values = [name, description, id];
    var queryText = 'UPDATE "Kitchen".product_department SET name = $1, description = $2 WHERE id = $3';

    try {
        await database.query(queryText, values);
        return true;
    } catch (error) {
        console.error('Error al actualizar el registro en la base de datos:', error);
        return false;
    }
}

async function this_department_be() {
    return true;
}

//-------------------------------------------------------------------company
router.get('/add-company', isLoggedIn, async (req, res) => {
    const country = await get_country();
    res.render('links/manager/company/addCompanys', { country });
});

router.get('/:id/edit-company', isLoggedIn, async (req, res) => {
    const country = await get_country();
    const company = await check_company(req);
    if (company.length > 0) {
        res.render('links/manager/company/editCompany', { company, country });
    }
    else {
        res.redirect('/fud/home');
    }
});

router.get('/:id_company/delete-company', isLoggedIn, async (req, res) => {
    const { id_company } = req.params;
    await delate_image(id_company);
    if(await delete_my_company(id_company,req)){
        req.flash('success', 'Tu compañía fueron eliminada con éxito 👍')
    }else{
        req.flash('message', 'La empresa no fueron borrada correctamente 👉👈')
    }
    res.redirect('/fud/home');
})

async function delete_my_company(id_company,req){
    try {
        var queryText = '';
        var values = [];

        //delete role employee
        queryText = 'DELETE FROM "Employee".roles_employees WHERE id_companies= $1';
        values = [id_company];
        await database.query(queryText, values);

        //delete my company
        var queryText = 'DELETE FROM "User".companies WHERE id= $1 and id_users= $2';
        var values = [id_company, parseInt(req.user.id)];
        await database.query(queryText, values);


        return true;
    } catch (error) {
        console.log(error)
        return false;
    }
}

router.get('/:id/company-home', isLoggedIn, async (req, res) => {
    req.company = await search_the_company_of_the_user(req);

    if (the_user_have_this_company(req.company)) {
        const company = req.company.rows;
        res.render('links/manager/company/homeCompany', { company });
    }
    else {
        res.redirect('/fud/home');
    }
});

function the_user_have_this_company(company) {
    return company.rows.length > 0;
}

async function search_the_company_of_the_user(req) {
    //we will search the company of the user 
    const { id } = req.params;
    var queryText = 'SELECT * FROM "User".companies WHERE id= $1 and id_users= $2';
    var values = [id, parseInt(req.user.id)];
    const result = await database.query(queryText, values);

    return result;
}

//----------------------------------------------------------------supplies and products 
router.get('/:id/company-supplies', isLoggedIn, async (req, res) => {
    const company = await check_company(req);
    const supplies_products = await search_company_supplies_or_products(req, true);
    if (company.length > 0) {
        res.render('links/manager/supplies_and_products/supplies', { supplies_products, company });
    }
    else {
        res.redirect('/fud/home');
    }
});

router.get('/:id/company-products', isLoggedIn, async (req, res) => {
    const company = await check_company(req);
    const supplies_products = await search_company_supplies_or_products(req, false);
    if (company.length > 0) {
        res.render('links/manager/supplies_and_products/products', { supplies_products, company });
    }
    else {
        res.redirect('/fud/home');
    }
});


async function search_company_supplies_or_products(req, supplies) {
    //we will search the company of the user 
    const { id } = req.params;
    var queryText = 'SELECT * FROM "Kitchen".products_and_supplies WHERE id_companies= $1 and supplies= $2';
    var values = [id, supplies];
    const result = await database.query(queryText, values);

    return result.rows;
}

async function search_company_supplies_or_products_with_id_company(id_company, supplies) {
    //we will search the company of the user 
    var queryText = 'SELECT * FROM "Kitchen".products_and_supplies WHERE id_companies= $1 and supplies= $2';
    var values = [id_company, supplies];
    const result = await database.query(queryText, values);

    return result.rows;
}

async function search_company_supplies_or_products_with_company(id_company, supplies) {
    //we will search the company of the user 
    var queryText = 'SELECT * FROM "Kitchen".products_and_supplies WHERE id_companies= $1 and supplies= $2';
    var values = [id_company, supplies];
    const result = await database.query(queryText, values);

    return result.rows;
}

async function this_is_a_supplies_or_a_products(id) {
    //we will search the company of the user 
    var queryText = 'SELECT * FROM "Kitchen".products_and_supplies WHERE id= $1';
    const result = await database.query(queryText, [id]);

    return result.rows[0].supplies;
}

router.get('/:id_company/:id/delate-supplies-company', isLoggedIn, async (req, res) => {
    const { id, id_company } = req.params;
    const pathOmg = await get_path_img('Kitchen', 'products_and_supplies', id)
    const thisIsASupplies = await this_is_a_supplies_or_a_products(id)

    if (await delate_supplies_company(id, pathOmg)) {
        req.flash('success', 'Los suministros fueron actualizados con éxito 😁')
    }
    else {
        req.flash('message', 'Los suministros NO fueron actualizados 👉👈')
    }

    if (thisIsASupplies) {
        res.redirect('/fud/' + id_company + '/company-supplies');
    }
    else {
        res.redirect('/fud/' + id_company + '/company-products');
    }
})

async function delate_supplies_company(id, pathOmg) {
    try {
        var queryText = 'DELETE FROM "Kitchen".products_and_supplies WHERE id=$1';
        var values = [id];
        await database.query(queryText, values); //delate supplies
        await delate_image_upload(pathOmg); //delate img
        return true;
    } catch (error) {
        return false;
    }
}

router.get('/:id_company/:id/:barcode/:name/:description/:useInventory/company-supplies', isLoggedIn, async (req, res) => {
    const { id_company, id } = req.params;
    const newSupplies = get_new_data_supplies_company(req)
    const thisIsASupplies = await this_is_a_supplies_or_a_products(id)

    if (await update_supplies_company(newSupplies)) {
        req.flash('success', 'El suministro fueron actualizados con éxito 😁')
    }
    else {
        req.flash('message', 'El suministro NO fueron actualizados 👉👈')
    }

    if (thisIsASupplies) {
        res.redirect('/fud/' + id_company + '/company-supplies');
    }
    else {
        res.redirect('/fud/' + id_company + '/company-products');
    }
});

function get_new_data_supplies_company(req) {
    const { id, id_company, barcode, name, description, useInventory } = req.params;
    const newSupplies = {
        id,
        id_company,
        barcode,
        name,
        description,
        use_inventory: (useInventory == 'true')
    }
    return newSupplies;
}

async function update_supplies_company(newSupplies) {
    try {
        var queryText = `UPDATE "Kitchen".products_and_supplies SET barcode = $1, name = $2, description = $3, 
        use_inventory = $4 WHERE id = $5`;
        var values = [newSupplies.barcode, newSupplies.name, newSupplies.description, newSupplies.use_inventory, newSupplies.id];
        await database.query(queryText, values); // update supplies
        return true;
    } catch (error) {
        console.log(error)
        return false;
    }
}

//---------------------------------------------------------------- search_employee_departments
async function get_data_tabla_with_id_company(id_company, schema, table) {
    var queryText = `SELECT * FROM "${schema}".${table} WHERE id_companies= $1`;
    var values = [id_company];
    const result = await database.query(queryText, values);
    const data = result.rows;
    return data;
}

//----------------------------------------------------------------combos
router.get('/:id/combos', isLoggedIn, async (req, res) => {
    const company = await check_company(req);
    if (company.length > 0) {
        const combos = await get_all_combos(req)
        res.render('links/manager/combo/combos', { company, combos });
    }
    else {
        res.redirect('/fud/home');
    }
})

async function get_all_combos(req) {
    //we will search the company of the user 
    const { id } = req.params;
    const queryText = `
    SELECT dc.*, pd.name AS department_name, pc.name AS category_name
    FROM "Kitchen".dishes_and_combos dc
    LEFT JOIN "Kitchen".product_department pd ON dc.id_product_department = pd.id
    LEFT JOIN "Kitchen".product_category pc ON dc.id_product_category = pc.id
    WHERE dc.id_companies = $1
`;
    var values = [id];
    const result = await database.query(queryText, values);

    return result.rows;
}

router.get('/:id/add-combos', isLoggedIn, async (req, res) => {
    const company = await check_company(req);
    if (company.length > 0) {
        const { id } = req.params;
        const departments = await get_department(id);
        const category = await get_category(id);
        const supplies = await search_company_supplies_or_products(req, true);
        const products = await search_company_supplies_or_products(req, false);
        const suppliesCombo = []
        res.render('links/manager/combo/addCombo', { company, departments, category, supplies, products, suppliesCombo });
    }
    else {
        res.redirect('/fud/home');
    }
})


router.get('/:id_company/:id_dishes_and_combos/edit-combo-company', isLoggedIn, async (req, res) => {
    const { id_dishes_and_combos, id_company } = req.params;
    const company = [{
        id: id_company,
        id_combo: id_dishes_and_combos
    }]
    const departments = await get_data_tabla_with_id_company(id_company, "Kitchen", "product_department");
    const category = await get_data_tabla_with_id_company(id_company, "Kitchen", "product_category");

    const supplies = await search_company_supplies_or_products_with_company(id_company, true);
    const products = await search_company_supplies_or_products_with_company(id_company, false);
    const suppliesCombo = await search_supplies_combo(id_dishes_and_combos);
    const combo = await search_combo(id_company, id_dishes_and_combos);
    res.render('links/manager/combo/editCombo', { company, departments, category, supplies, products, combo, suppliesCombo });
})

async function search_combo(id_company, id_dishes_and_combos) {
    //we will search the company of the user 
    var queryText = 'SELECT * FROM "Kitchen".dishes_and_combos WHERE id_companies= $1 and id=$2';
    var values = [id_company, id_dishes_and_combos];
    const result = await database.query(queryText, values);

    return result.rows;
}

async function search_supplies_combo(id_dishes_and_combos) {
    var queryText = `
        SELECT tsc.*, pas.img AS img, pas.name AS product_name, pas.barcode AS product_barcode
        FROM "Kitchen".table_supplies_combo tsc
        JOIN "Kitchen".products_and_supplies pas ON tsc.id_products_and_supplies = pas.id
        WHERE tsc.id_dishes_and_combos = $1 ORDER BY id_products_and_supplies DESC
    `;
    var values = [id_dishes_and_combos];
    const result = await database.query(queryText, values);
    return result.rows;
}

router.get('/:id_company/:id/delate-combo-company', isLoggedIn, async (req, res) => {
    const { id, id_company } = req.params;
    const pathImg = await get_path_img('Kitchen', 'dishes_and_combos', id)
    if (await delate_combo_company(id, pathImg)) {
        req.flash('success', 'El combo fue eliminado con éxito 😄')
    }
    else {
        req.flash('message', 'El combo NO fue eliminado con éxito 😳')
    }

    res.redirect('/fud/' + id_company + '/combos');
})

async function delate_combo_company(id, pathImg) {
    try {
        var queryText = 'DELETE FROM "Kitchen".dishes_and_combos WHERE id=$1';
        var values = [id];
        await delete_all_supplies_combo(id);
        await delate_image_upload(pathImg); //delate img
        await database.query(queryText, values); //delate combo
        return true;
    } catch (error) {
        return false;
    }
}

async function delete_all_supplies_combo(id) {
    try {
        var queryText = 'DELETE FROM "Kitchen".table_supplies_combo WHERE id_dishes_and_combos = $1';
        var values = [id];
        await database.query(queryText, values); // Delete combo
        return true;
    } catch (error) {
        console.error('Error al eliminar en la base de datos:', error);
        return false;
    }
}

//----------------------------------------------------------------providers
async function search_all_branch_company(idCompany) {
    //we will search the company of the user 
    var queryText = 'SELECT * FROM "Company".branches WHERE id_companies= $1';
    var values = [idCompany];
    const result = await database.query(queryText, values);

    return result.rows;
}

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

router.get('/:id_company/providers', isLoggedIn, async (req, res) => {
    //we will see if the company is of the user 
    const company = await this_company_is_of_this_user(req, res)
    if (company != null) {
        //if this company is of the user, we will to search all the providers of tha company
        const { id_company } = req.params;
        const providers = await search_all_providers(id_company);

        //if the company not have providers render other view
        if (providers.length == 0) {
            res.render('links/manager/providers/providers', { company });
        }
        else {
            res.render('links/manager/providers/providers', { company, providers });
        }
    }
})

router.get('/:id_company/:name_provider/search-provider', isLoggedIn, async (req, res) => {
    //we will see if the company is of the user 
    const company = await this_company_is_of_this_user(req, res)
    if (company != null) {
        //if this company is of the user, we will to search all the providers of tha company
        const { id_company, name_provider } = req.params;
        const providers = await search_all_providers_for_name(id_company, name_provider);
        //if the company not have providers render other view
        if (providers.length == 0) {
            res.render('links/manager/providers/providers', { company });
        }
        else {
            res.render('links/manager/providers/providers', { company, providers });
        }
    }
})

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

router.get('/:id_company/add-providers', isLoggedIn, async (req, res) => {
    const company = await this_company_is_of_this_user(req, res);
    if (company != null) {
        const { id_company } = req.params;
        const branches = await search_all_branch(id_company)
        res.render('links/manager/providers/addProviders', { company, branches });
    }
})

router.get('/:id_provider/edit-providers', isLoggedIn, async (req, res) => {
    //if this company is of the user, we will to search the provider of tha company
    const { id_provider } = req.params;
    const provider = await search_provider(id_provider);
    res.render('links/manager/providers/editProviders', { provider });
})

router.get('/:id_company/:id_provider/edit-provider', isLoggedIn, async (req, res) => {
    //we will see if the company is of the user 
    const company = await this_company_is_of_this_user(req, res)
    if (company != null) {
        //if this company is of the user, we will to search the provider of tha company
        const { id_provider } = req.params;
        const provider = await search_provider(id_provider);
        res.render('links/manager/providers/editProviders', { provider, company });
    }
})

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

router.get('/:id_company/:id_provider/delete-provider', isLoggedIn, async (req, res) => {
    //we will see if the company is of the user 
    const company = await this_company_is_of_this_user(req, res)
    if (company != null) {
        const { id_provider, id_company } = req.params;
        if (await delete_provider(id_provider)) {
            req.flash('success', 'El proveedor fue eliminado con éxito 😉')
        }
        else {
            req.flash('message', 'El proveedor no fue eliminado 😮')
        }

        res.redirect('/fud/' + id_company + '/providers');
    }
})

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
//----------------------------------------------------------------customers
async function searc_all_customers(idCompany) {
    //we will search the company of the user 
    var queryText = 'SELECT * FROM "Company".customers WHERE id_companies= $1';
    var values = [idCompany];
    const result = await database.query(queryText, values);

    return result.rows;
}

async function searc_customers(idCustomer) {
    //we will search the company of the user 
    var queryText = 'SELECT * FROM "Company".customers WHERE id= $1';
    var values = [idCustomer];
    const result = await database.query(queryText, values);

    return result.rows;
}

router.get('/:id/customers-company', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const customers = await searc_all_customers(id)
    const country = await get_country()
    const company = [{ id }]
    res.render("links/manager/customers/customers", { company, customers, country });
})

router.get('/:id/add-customer', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const company = [{ id }]
    const country = await get_country()
    res.render("links/manager/customers/addCustomer", { company, country });
})

router.get('/:id/:idCustomer/delete-customer', isLoggedIn, async (req, res) => {
    const { idCustomer, id } = req.params;
    const company = await check_company(req);
    if (company.length > 0) {
        if (await delete_customer(idCustomer)) {
            req.flash('success', 'El cliente fue eliminado con éxito 😉')
        } else {
            req.flash('message', 'El cliente no fue eliminado 😰')
        }
    }
    else {
        res.redirect('/fud/home');
    }

    res.redirect("/fud/" + id + '/customers-company');
})

async function delete_customer(idCustomer) {
    try {
        var queryText = 'DELETE FROM "Company".customers WHERE id = $1';
        var values = [idCustomer];
        await database.query(queryText, values); // Delete combo
        return true;
    } catch (error) {
        console.error('Error al eliminar en la base de datos:', error);
        return false;
    }
}

router.get('/:id/:idCustomer/edit-customer', isLoggedIn, async (req, res) => {
    const { idCustomer } = req.params;
    const company = await check_company(req);
    const country = await get_country()
    const customer = await searc_customers(idCustomer)
    res.render("links/manager/customers/editCustomer", { customer, country, company });
})

//----------------------------------------------------------------branches
async function search_all_branch(id_company) {
    var queryText = `
        SELECT branches.*, country.name AS country_name
        FROM "Company".branches
        INNER JOIN "Fud".country ON branches.id_country = country.id
        WHERE branches.id_companies = $1`;

    var values = [id_company];
    const result = await database.query(queryText, values);

    return result.rows;
}

router.get('/:id/branches', isLoggedIn, async (req, res) => {
    const country = await get_country();
    const company = await check_company(req);
    if (company.length > 0) {
        const { id } = req.params;
        const branches = await search_all_branch(id);
        res.render('links/manager/branches/branches', { company, country, branches });
    }
    else {
        res.redirect('/fud/home');
    }
})

router.get('/:id/add-branches', isLoggedIn, async (req, res) => {
    const country = await get_country();
    const company = await check_company(req);
    if (company.length > 0) {
        res.render('links/manager/branches/addBranches', { company, country });
    }
    else {
        res.redirect('/fud/home');
    }
})

router.get('/:idBranch/:idCompany/edit-branch', isLoggedIn, async (req, res) => {
    const country = await get_country();
    const branch = await get_branch(req);
    res.render("links/manager/branches/editBranches", { branch, country });
})

async function get_branch(req) {
    const { idBranch } = req.params;
    var queryText = 'SELECT * FROM "Company".branches WHERE id= $1';
    var values = [idBranch];
    const result = await database.query(queryText, values);
    const data = result.rows;
    return data;
}

router.get('/:idBranch/:id_company/delete-branch', isLoggedIn, async (req, res) => {
    //we will see if this company is of the user 
    if (await this_company_is_of_this_user(req, res) != null) {
        //get the data that the link have 
        const { idBranch, id_company } = req.params;
        if (delete_branch_company(idBranch)) {
            req.flash('success', 'La sucursal fue eliminada con éxito 👍');
        }
        else {
            req.flash('message', 'La sucursal no fue eliminada 👁️');
        }

        res.redirect('/fud/' + id_company + '/branches');
    }
})

async function delete_branch_company(idBranch) {
    try {
        var queryText = 'DELETE FROM "Company".branches WHERE id = $1';
        var values = [idBranch];
        await database.query(queryText, values); // Delete branch
        return true;
    } catch (error) {
        console.error('Error to delete branch:', error);
        return false;
    }
}

//-------------------------------------------------------------type user 
router.get('/:id/type-user', isLoggedIn, async (req, res) => {
    const company = await check_company(req);
    if (company.length > 0) {
        const { id } = req.params;
        const typeEmployees = await get_type_employees(id)
        res.render('links/manager/role_type_employees/typeEmployees', { company, typeEmployees });
    }
    else {
        res.redirect('/fud/home');
    }
})

router.get('/:id/:idTypeEmployee/delete-role-user', isLoggedIn, async (req, res) => {
    const company = await check_company(req);
    if (company.length > 0) {
        const { id, idTypeEmployee } = req.params;
        if (await delete_type_employee(idTypeEmployee)) {
            req.flash('success', 'El rol fue eliminado con éxito 🗑️')
        } else {
            req.flash('message', 'El rol no fue eliminado con éxito 😮')
        }
        res.redirect('/fud/' + id + '/type-user');
    }
    else {
        res.redirect('/fud/home');
    }
})

async function delete_type_employee(idTypeEmployee) {
    try {
        var queryText = 'DELETE FROM "Employee".roles_employees WHERE id = $1';
        var values = [idTypeEmployee];
        await database.query(queryText, values); // Delete combo
        return true;
    } catch (error) {
        console.error('Error al eliminar en la base de datos:', error);
        return false;
    }
}

router.get('/:id/:idRoleEmployee/edit-role-user', isLoggedIn, async (req, res) => {
    const company = await check_company(req);
    if (company.length > 0) {
        const { idRoleEmployee } = req.params;
        const roleEmployee = await get_data_tole_employees(idRoleEmployee)
        res.render('links/manager/role_type_employees/editRoleEmployee', { roleEmployee });
    }
    else {
        res.redirect('/fud/home');
    }
})

async function get_data_tole_employees(idRoleEmployee) {
    var queryText = 'SELECT * FROM "Employee".roles_employees WHERE id= $1';
    var values = [idRoleEmployee];
    const result = await database.query(queryText, values);
    const data = result.rows;
    return data;
}
//-------------------------------------------------------------department user get_country
router.get('/:id/employee-department', isLoggedIn, async (req, res) => {
    const company = await check_company(req);
    if (company.length > 0) {
        const { id } = req.params;
        const departments = await search_employee_departments(id);
        res.render('links/manager/role_type_employees/departmentEmployees', { company, departments });
    }
    else {
        res.redirect('/fud/home');
    }
})

router.get('/:id/:idDepartament/delete_departament', isLoggedIn, async (req, res) => {
    const company = await check_company(req);
    const { id, idDepartament } = req.params;

    if (company.length > 0) {
        if (await delete_departament_employee(idDepartament)) {
            req.flash('success', '"El departamento fue eliminado con éxito 😊')
        }
        else {
            req.flash('message', 'El departamento no fue eliminado 😮')
        }
    }
    else {
        res.redirect('/fud/home');
    }

    res.redirect('/fud/' + id + '/employee-department');
})

async function delete_departament_employee(idDepartament) {
    try {
        var queryText = 'DELETE FROM "Employee".departments_employees WHERE id = $1';
        var values = [idDepartament];
        await database.query(queryText, values); // Delete combo
        return true;
    } catch (error) {
        console.error('Error al eliminar en la base de datos:', error);
        return false;
    }
}

router.get('/:id/:idDepartament/:name/:description/edit-department-employee', isLoggedIn, async (req, res) => {
    const company = await check_company(req);
    const { id } = req.params;

    if (company.length > 0) {
        const { idDepartament, name, description } = req.params;
        if (await update_department_employe(idDepartament, name, description)) {
            req.flash('success', 'El departamento fue actualizado con éxito 🚀')
        }
        else {
            req.flash('message', 'El departamento no fue actualizado 😅')
        }
    }
    else {
        res.redirect('/fud/home');
    }

    res.redirect('/fud/' + id + '/employee-department');
})

async function update_department_employe(idDepartament, name, description) {
    try {
        var queryText = `UPDATE "Employee".departments_employees SET name_departaments = $1, description = $2 WHERE id = $3`;
        var values = [name, description, idDepartament];
        await database.query(queryText, values); // update supplies
        return true;
    } catch (error) {
        console.log(error)
        return false;
    }
}
//-------------------------------------------------------------employees 
router.get('/:id/employees', isLoggedIn, async (req, res) => {
    const company = await check_company(req);
    if (company.length > 0) {
        const { id } = req.params;
        const employees = await search_employees(id);
        res.render('links/manager/employee/employee', { company, employees });
    }
    else {
        res.redirect('/fud/home');
    }
})

router.get('/:id/add-employee', isLoggedIn, async (req, res) => {
    const company = await check_company(req);
    if (company.length > 0) {
        const { id } = req.params;
        const departments = await search_employee_departments(id);
        const country = await get_country()
        const roles = await get_type_employees(id)
        const branches = await search_all_branch(id)

        res.render('links/manager/employee/addEmployee', { company, roles, departments, country, branches });
    }
    else {
        res.redirect('/fud/home');
    }
})

//edit employee
router.get('/:id/:idEmployee/edit-employees', isLoggedIn, async (req, res) => {
    const company = await check_company(req);
    if (company.length > 0) {
        const { idEmployee, id } = req.params;
        const employee = await search_employee(idEmployee);
        const departments = await search_employee_departments(id);
        const country = await get_country()
        const roles = await get_type_employees(id)
        const branches = await search_all_branch(id)

        //we will see if the suscription is for a branch free
        if(req.user.rol_user==rolFree){
            const branchFree = await get_data_branch(req);
            res.render('links/manager/employee/editEmployee', { employee, departments, country, roles, branchFree, company });          
        }else{
            const branch = await get_data_branch(req);
            res.render('links/manager/employee/editEmployee', { employee, departments, country, roles, branches, company });
        }
    }
    else {
        res.redirect('/fud/home');
    }
})


//search employee
router.get('/:id_company/:id_user/employees', isLoggedIn, async (req, res) => {
    const company = await this_company_is_of_this_user(req, res);
    if (company != null) {
        const { id_company, id_user } = req.params;
        const employees = await search_employees(id_company);
        const employee_user = await search_employee(id_user);
        res.render('links/manager/employee/employee', { company, employees, employee_user });
    }
})

//-------------------------------------------------------------sales 
router.get('/:id_company/sales', isLoggedIn, async (req, res) => {
    const company = await this_company_is_of_this_user(req, res);
    if (company != null) {
        const { id_company, id_user } = req.params;
        const sales = await get_sales_company(id_company);
        res.render('links/manager/sales/sales', { company, sales });
    }
})

router.get('/:id_company/:number_page/sales-company', isLoggedIn, async (req, res) => {
    const company = await this_company_is_of_this_user(req, res);
    if (company != null) {
        const { id_company,number_page} = req.params;

        //we will convert the page number for that tha database can get all the data 
        let  pageNumber =parseInt(number_page)
        pageNumber = pageNumber <= 0 ? 1 : pageNumber; //this is for limite the search of the sale 

        //calculate the new data of the sale
        const salesStart=(pageNumber -1)*100;
        const salesEnd=pageNumber *100;

        //create the data sale for create the button in the web 
        const newNumberPage=pageNumber +1;
        const oldNumberPage=pageNumber -1;

        const dataSales=[{id_company,oldNumberPage,newNumberPage,pageNumber}]

        //get the sale and render the web
        const sales = await get_sales_company(id_company, salesStart,salesEnd);
        res.render('links/manager/sales/sales', { company, sales,  dataSales});
    }
})

async function get_sales_company(idCompany, start, end) {
    try {
        const query = `
            SELECT sh.*, dc.*, u.first_name AS employee_first_name, u.second_name AS employee_second_name, 
                   u.last_name AS employee_last_name, c.email AS customer_email, b.name_branch
            FROM "Box".sales_history sh
            LEFT JOIN "Kitchen".dishes_and_combos dc ON sh.id_dishes_and_combos = dc.id
            LEFT JOIN "Company".employees e ON sh.id_employees = e.id
            LEFT JOIN "Fud".users u ON e.id_users = u.id
            LEFT JOIN "Company".branches b ON sh.id_branches = b.id
            LEFT JOIN "Company".customers c ON sh.id_customers = c.id
            WHERE sh.id_companies = $1
            LIMIT $2 OFFSET $3
        `;
        const values = [idCompany, end - start, start];
        const result = await database.query(query, values);

        return result.rows;
    } catch (error) {
        console.error("Error al obtener datos de ventas get_sales_company:", error);
        return [];
    }
}

//move
router.get('/:id_company/movements', isLoggedIn, async (req, res) => {
    const company = await this_company_is_of_this_user(req, res);
    if (company != null) {
        const { id_company,number_page } = req.params;
        //we will convert the page number for that tha database can get all the data 
        let  pageNumber =parseInt(number_page)// convert the number_page to integer
        pageNumber = pageNumber <= 0 ? 1 : pageNumber; //this is for limite the search of the sale 

        const movementsStart = (pageNumber - 1) * 100;
        const movementsEnd = pageNumber * 100;

        //create the data sale for create the button in the web 
        const newNumberPage=pageNumber +1;
        const oldNumberPage=pageNumber -1;

        const dataMovent=[{id_company,oldNumberPage,newNumberPage,pageNumber}]
        const movements = await get_movements_company(id_company,movementsStart,movementsEnd);
        res.render('links/manager/movements/movements', { company, movements , dataMovent});
    }
})


async function get_movements_company(idCompany, start, end) {
    try {
        const query = `
            SELECT sh.*, u.first_name AS employee_first_name, u.second_name AS employee_second_name, 
                   u.last_name AS employee_last_name, b.name_branch
            FROM "Box".movement_history sh
            LEFT JOIN "Company".employees e ON sh.id_employees = e.id
            LEFT JOIN "Fud".users u ON e.id_users = u.id
            LEFT JOIN "Company".branches b ON sh.id_branches = b.id
            WHERE sh.id_branches = $1
            LIMIT $2 OFFSET $3
        `;
        const values = [idCompany, end - start, start];
        const result = await database.query(query, values);

        return result.rows;
    } catch (error) {
        console.error("Error al obtener datos de movimientos:", error);
        throw error;
    }
}

//-------------------------------------------------------------reports 
//this is for use python and that we can do datascine
//const { spawn } = require('child_process');

router.get('/:id_company/reports2', isLoggedIn, (req, res) => {
    res.render("links/manager/reports/report");
})

router.get('/:id_company/reports3', isLoggedIn, async (req, res) => {
    const { id_company } = req.params;
    const data = await get_sales_company(id_company); //get data of the database
    const salesData = get_sales_data(data); //convert this data for that char.js can read

    // convert the data in a format for Chart.js
    const chartLabels = Object.keys(salesData);
    const days = [];
    const months = [];
    const years = [];

    chartLabels.forEach(dateString => {
        const parts = dateString.split('/'); // Split date string into parts
        const day = parseInt(parts[0]); // get the day 
        const month = parseInt(parts[1]); // get the month
        const year = parseInt(parts[2]); // get the year

        //save the data in his array
        days.push(day);
        months.push(month);
        years.push(year);
    });

    //this is for convert the data of sale to object 
    const chartData = Object.values(salesData);

    res.render("links/manager/reports/sales", { days: days, months: months, years: years, chartData: JSON.stringify(chartData) });
})

async function create_PDF_page(url,name) {
    // Launch the browser and open a new blank page
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(url); // URL of the page that we would like convert to PDF
    // Set screen size
    await page.setViewport({width: 1080, height: 1024});

    // Type into search box
    await page.type('.devsite-search-field', 'automate beyond recorder')

    // Wait and click on first result
    const searchResultSelector = '.devsite-result-item-link';
    await page.waitForSelector(searchResultSelector);
    await page.click(searchResultSelector);



    await page.pdf({ path: name, format: 'A4',printBackground: true }); // PDF name and format

    await browser.close();
    console.log('PDF generado correctamente');
}

router.get('/:id_company/reports', isLoggedIn, async (req, res) => {
    const { id_company } = req.params;
    const company = await this_company_is_of_this_user(req, res);
    if (company != null) {
        //--------------------------------------------------------------this is data all--------------------------------------
        //-----------graph of sales
        const data = await get_sales_company(id_company); //get data of the database
        const salesData = get_sales_data(data); //convert this data for that char.js can read

        //convert the data in a format for Chart.js
        const chartLabels = Object.keys(salesData);
        const days = [];
        const months = [];
        const years = [];

        chartLabels.forEach(dateString => {
            const parts = dateString.split('/'); // Split date string into parts
            const day = parseInt(parts[0]); // get the day 
            const month = parseInt(parts[1]); // get the month
            const year = parseInt(parts[2]); // get the year

            //save the data in his array
            days.push(day);
            months.push(month);
            years.push(year);
        });

        //this is for convert the data of sale to object 
        const chartData = Object.values(salesData);

        //this is for get the total of the sale of today
        const total = await get_total_sales_company(id_company);
        const unity = await get_total_unity_company(id_company);

        const totalYear = await get_total_year(id_company);
        const totalMonth = await get_total_month(id_company);
        const totalCompany = await get_total_company(id_company);

        const branches = await get_branchIds_by_company(id_company);


        const moveNegative = await get_movements_company_negative(branches);
        const movePositive = await get_movements_company_positive(branches)

        //this is for tha table of the sales of the branch 
        const dataSalesBranches = await get_sale_branch(branches)
        const salesBranchesLabels = []
        const salesBranchesData = []
        dataSalesBranches.forEach(item => {
            salesBranchesLabels.push(item[0]); // add the name of the branch 
            salesBranchesData.push(item[1]); // add the sales of the array 
        });

        //% aument 
        const totalYearOld = await get_total_year_old(id_company);
        const percentageYear = calculate_sale_increase(totalYearOld, totalYear);

        const totalMonthOld = await get_total_month_old(id_company);
        const percentageMonth = calculate_sale_increase(totalMonthOld, totalMonth);

        const totalDayhOld = await get_total_day_old(id_company);
        const percentageDay = calculate_sale_increase(totalDayhOld, total);

        //----graph distribute
        const distribute = await get_data_distribute_company(id_company)
        const distributeLabels = []
        const distributeData = []

        // we will reading all the array and get the elements
        distribute.forEach(item => {
            distributeLabels.push(item[0].replace(/'/g, '')); // add the name of the array 
            distributeData.push(parseFloat(item[1])); // add the numer of the array 
        });

        //graph sale combos
        const salesByCombos = await get_sales_total_by_combo(id_company)
        const salesByCombosLabels = []
        const salesByCombosData = []
        salesByCombos.forEach(sale => {
            salesByCombosLabels.push(sale.name);
            salesByCombosData.push(sale.total_sales);
        });

        totalMovimientos = total + moveNegative + movePositive;



        //--------------------------------------------------------------this is data day--------------------------------------
        //this is for know much profit have we had today
        const dataDay = await get_sales_company_for_day(id_company); //get data of the database
        const salesDataDay = get_sales_data_day(dataDay); //convert this data for that char.js can read (hours)

        const salesDayLabels = Object.keys(salesDataDay);
        const salesDayData = Object.values(salesDataDay);

        //this is for get the sale of the branch today
        const dataSalesBranchesDay = await get_sale_branch_today(branches)
        const salesBranchesLabelsDay = []
        const salesBranchesDataDay = []
        dataSalesBranchesDay.forEach(item => {
            salesBranchesLabelsDay.push(item[0]); // add the name of the branch 
            salesBranchesDataDay.push(item[1]); // add the sales of the array 
        });

        //graph distribute, 
        //for know which products is most sale. This not means that that combos be the that most money generate in the business 
        const comboMostSaleForDay = await get_data_distribute_company_day(id_company)
        const comboMostSaleForDayLabels = []
        const comboMostSaleForDayData = []
        console.log(comboMostSaleForDay)
        // we will reading all the array and get the elements
        comboMostSaleForDay.forEach(item => {
            comboMostSaleForDayLabels.push(item[0].replace(/'/g, '')); // add the name of the array 
            comboMostSaleForDayData.push(parseFloat(item[1])); // add the numer of the array 
        });


        //graph sale combos for day. This is for knwo when much profit does each combo leave me for day
        //this is for know how is distribuite the sale of the business 
        const salesByCombosDay = await get_sales_total_by_combo_today(id_company)
        const salesByCombosLabelsDay = []
        const salesByCombosDataDay = []
        salesByCombosDay.forEach(sale => {
            salesByCombosLabelsDay.push(sale.name);
            salesByCombosDataDay.push(sale.total_sales);
        });

        //--------------------------------------------------------------this is data month--------------------------------------
        //this is for know much profit have we had today
        const dataMonth = await get_sales_company_for_month(id_company); //get data of the database
        const salesDataMonth = get_sales_data(dataMonth); //convert this data for that char.js can read
        const salesMonthLabels = Object.keys(salesDataMonth);
        const salesMonthData = Object.values(salesDataMonth);

        //this is for get the sale of the branch month
        const dataSalesBranchesMonth = await get_sale_branch_month(branches)
        const salesBranchesLabelsMonth = []
        const salesBranchesDataMonth = []
        dataSalesBranchesMonth.forEach(item => {
            salesBranchesLabelsMonth.push(item[0]); // add the name of the branch 
            salesBranchesDataMonth.push(item[1]); // add the sales of the array 
        });

        //graph sale combos for day. This is for knwo when much profit does each combo leave me for month
        //this is for know how is distribuite the sale of the business 
        const salesByCombosMonth = await get_sales_total_by_combo_month(id_company)

        const salesByCombosLabelsMonth = []
        const salesByCombosDataMonth = []
        salesByCombosMonth.forEach(sale => {
            salesByCombosLabelsMonth.push(sale.name);
            salesByCombosDataMonth.push(sale.total_sales);
        });

        //graph distribute, 
        //for know which products is most sale. This not means that that combos be the that most money generate in the business 
        const comboMostSaleForMonth = await get_data_distribute_company_month(id_company)
        const comboMostSaleForMonthLabels = []
        const comboMostSaleForMonthData = []

        // we will reading all the array and get the elements
        comboMostSaleForMonth.forEach(item => {
            comboMostSaleForMonthLabels.push(item[0].replace(/'/g, '')); // add the name of the array 
            comboMostSaleForMonthData.push(parseFloat(item[1])); // add the numer of the array 
        });


        //--------------------------------------------------------------this is data year--------------------------------------
        //this is for know much profit have we had today
        const dataYear = await get_sales_company_for_year(id_company); //get data of the database
        const salesDataYear = get_sales_data(dataYear); //convert this data for that char.js can read
        const salesYearLabels = Object.keys(salesDataYear);
        const salesYearData = Object.values(salesDataYear);

        //this is for get the sale of the branch year
        const dataSalesBranchesYear = await get_sale_branch_year(branches)
        const salesBranchesLabelsYear = []
        const salesBranchesDataYear = []
        dataSalesBranchesYear.forEach(item => {
            salesBranchesLabelsYear.push(item[0]); // add the name of the branch 
            salesBranchesDataYear.push(item[1]); // add the sales of the array 
        });

        //graph sale combos for day. This is for knwo when much profit does each combo leave me for year
        //this is for know how is distribuite the sale of the business 
        const salesByCombosYear = await get_sales_total_by_combo_year(id_company)
        const salesByCombosLabelsYear = []
        const salesByCombosDataYear = []
        salesByCombosYear.forEach(sale => {
            salesByCombosLabelsYear.push(sale.name);
            salesByCombosDataYear.push(sale.total_sales);
        });

        //graph distribute, 
        //for know which products is most sale. This not means that that combos be the that most money generate in the business 
        const comboMostSaleForYear = await get_data_distribute_company_year(id_company)
        const comboMostSaleForYearLabels = []
        const comboMostSaleForYearData = []

        // we will reading all the array and get the elements
        comboMostSaleForYear.forEach(item => {
            comboMostSaleForYearLabels.push(item[0].replace(/'/g, '')); // add the name of the array 
            comboMostSaleForYearData.push(parseFloat(item[1])); // add the numer of the array 
        });

        res.render("links/manager/reports/global", { comboMostSaleForDayLabels, comboMostSaleForDayData, comboMostSaleForMonthLabels, comboMostSaleForMonthData, comboMostSaleForYearLabels, comboMostSaleForYearData, salesByCombosLabelsYear, salesByCombosDataYear, salesByCombosLabelsMonth, salesByCombosDataMonth, salesByCombosLabelsDay, salesByCombosDataDay, salesBranchesLabelsYear, salesBranchesDataYear, salesBranchesLabelsMonth, salesBranchesDataMonth, salesBranchesLabelsDay, salesBranchesDataDay, salesYearLabels, salesYearData, salesMonthLabels, salesMonthData, salesDayLabels, salesDayData, salesByCombosLabels, salesByCombosData: JSON.stringify(salesByCombosData), salesBranchesLabels, salesBranchesData, company, total, percentageDay, unity, totalYear, percentageYear, totalMonth, percentageMonth, totalCompany, moveNegative, movePositive, totalMovimientos, days: days, months: months, years: years, distributeLabels, distributeData: JSON.stringify(distributeData), chartData: JSON.stringify(chartData) });

    }
})

router.post('/create-pdf', async (req, res) => {
    try {
        // Obtiene la URL de la página del cuerpo de la solicitud
        const { url } = req.body;
        console.log('url')
        console.log(url)
        // Lanza una instancia de Puppeteer
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
    
        // Navega a la URL especificada
        await page.goto(url);
    
        // Genera el PDF
        const pdfBuffer = await page.pdf({
          format: 'A4',
          printBackground: true
        });
    
        // Cierra el navegador
        await browser.close();
    
        // Envía el PDF como respuesta
        res.setHeader('Content-Type', 'application/pdf');
        res.send(pdfBuffer);
      } catch (error) {
        console.error('Error al generar el PDF:', error);
        res.status(500).send('Error al generar el PDF');
      }
})

//-----------------------------------------------------------this function is for get all the sale of today (day,month,reay)
function get_sales_data(data) {
    const salesData = {};
    data.forEach(item => {
        const saleDay = new Date(item.sale_day).toLocaleDateString();
        if (!salesData[saleDay]) {
            salesData[saleDay] = 0;
        }
        salesData[saleDay] += item.total;
    });

    return salesData;
}

async function get_sales_company_for_day(idCompany) {
    try {
        const query = `
            SELECT sh.*, dc.*, u.first_name AS employee_first_name, u.second_name AS employee_second_name, 
                   u.last_name AS employee_last_name, c.email AS customer_email, b.name_branch,
                   EXTRACT(HOUR FROM sh.sale_day) AS sale_hour
            FROM "Box".sales_history sh
            LEFT JOIN "Kitchen".dishes_and_combos dc ON sh.id_dishes_and_combos = dc.id
            LEFT JOIN "Company".employees e ON sh.id_employees = e.id
            LEFT JOIN "Fud".users u ON e.id_users = u.id
            LEFT JOIN "Company".branches b ON sh.id_branches = b.id
            LEFT JOIN "Company".customers c ON sh.id_customers = c.id
            WHERE sh.id_companies = $1
            AND DATE(sh.sale_day) = current_date
        `;
        const values = [idCompany];
        const result = await database.query(query, values);

        return result.rows;
    } catch (error) {
        console.error("Error al obtener datos de ventas get_sales_company_for_day:", error);
        throw error;
    }
}

function get_sales_data_day(data) {
    const salesData = {};
    data.forEach(item => {
        const saleHour = new Date(item.sale_day).getHours(); // Obtener solo la hora de la venta
        if (!salesData[saleHour]) {
            salesData[saleHour] = 0;
        }
        salesData[saleHour] += item.total;
    });

    return salesData;
}

async function get_sales_company_for_month(idCompany) {
    try {
        const query = `
            SELECT sh.*, dc.*, u.first_name AS employee_first_name, u.second_name AS employee_second_name, 
                   u.last_name AS employee_last_name, c.email AS customer_email, b.name_branch
            FROM "Box".sales_history sh
            LEFT JOIN "Kitchen".dishes_and_combos dc ON sh.id_dishes_and_combos = dc.id
            LEFT JOIN "Company".employees e ON sh.id_employees = e.id
            LEFT JOIN "Fud".users u ON e.id_users = u.id
            LEFT JOIN "Company".branches b ON sh.id_branches = b.id
            LEFT JOIN "Company".customers c ON sh.id_customers = c.id
            WHERE sh.id_companies = $1
            AND EXTRACT(MONTH FROM sh.sale_day) = EXTRACT(MONTH FROM CURRENT_DATE)
            AND EXTRACT(YEAR FROM sh.sale_day) = EXTRACT(YEAR FROM CURRENT_DATE)
        `;
        const values = [idCompany];
        const result = await database.query(query, values);

        return result.rows;
    } catch (error) {
        console.error("Error al obtener datos de ventas get_sales_company_for_month:", error);
        throw error;
    }
}

async function get_sales_company_for_year(idCompany) {
    try {
        const query = `
            SELECT sh.*, dc.*, u.first_name AS employee_first_name, u.second_name AS employee_second_name, 
                   u.last_name AS employee_last_name, c.email AS customer_email, b.name_branch
            FROM "Box".sales_history sh
            LEFT JOIN "Kitchen".dishes_and_combos dc ON sh.id_dishes_and_combos = dc.id
            LEFT JOIN "Company".employees e ON sh.id_employees = e.id
            LEFT JOIN "Fud".users u ON e.id_users = u.id
            LEFT JOIN "Company".branches b ON sh.id_branches = b.id
            LEFT JOIN "Company".customers c ON sh.id_customers = c.id
            WHERE sh.id_companies = $1
            AND EXTRACT(YEAR FROM sh.sale_day) = EXTRACT(YEAR FROM CURRENT_DATE)
        `;
        const values = [idCompany];
        const result = await database.query(query, values);

        return result.rows;
    } catch (error) {
        console.error("Error al obtener datos de ventas get_sales_company_for_year:", error);
        throw error;
    }
}

//-----------------------------------------------------------this function is for get all the moving of branches (day)
async function get_branchIds_by_company(idCompany) {
    try {
        const query = `
            SELECT id
            FROM "Company".branches
            WHERE id_companies = $1;
        `;
        const values = [idCompany];
        const result = await database.query(query, values);
        return result.rows.map(row => row.id);
    } catch (error) {
        console.error("Error al obtener los IDs de sucursales:", error);
        throw error;
    }
}

async function get_movements_company_negative(branches) {
    var total = 0;
    for (var i = 0; i < branches.length; i++) {
        total += await get_negative_moves_by_branch(branches[i]);
    }
    return total;
}

async function get_negative_moves_by_branch(idBranch) {
    try {
        const query = `
            SELECT COALESCE(SUM(move), 0) AS total_negative_moves
            FROM "Box".movement_history
            WHERE id_branches IN (
                SELECT id
                FROM "Company".branches
                WHERE id = $1
            )
            AND date_move::date = CURRENT_DATE
            AND move < 0;
        `;
        const values = [idBranch];
        const result = await database.query(query, values);
        return result.rows[0].total_negative_moves;
    } catch (error) {
        console.error("Error al obtener los movimientos en negativo:", error);
        throw error;
    }
}

//-----------------------------------------------------------this function is for get all the sale of the combo (day,month,reay,all)
async function get_sale_branch(branches) {
    const dataSales = []
    for (var i = 0; i < branches.length; i++) {
        const data = await get_sales_total_by_branch(branches[i]);
        dataSales.push([data.name_branch, data.total_sales])
    }

    return dataSales;
}

async function get_sales_total_by_branch(idBranch) {
    try {
        const query = `
            SELECT b.name_branch, COALESCE(SUM(s.total), 0) AS total_sales
            FROM "Company".branches AS b
            LEFT JOIN "Box".sales_history AS s ON s.id_branches = b.id
            WHERE b.id = $1
            GROUP BY b.name_branch;
        `;
        const values = [idBranch];
        const result = await database.query(query, values);
        return result.rows[0] || { name_branch: null, total_sales: 0 };
    } catch (error) {
        console.error("Error al obtener la suma total de ventas por sucursal:", error);
        throw error;
    }
}

async function get_sale_branch_today(branches) {
    const dataSales = []
    for (var i = 0; i < branches.length; i++) {
        const data = await get_sales_total_by_branch_today(branches[i]);
        dataSales.push([data.name_branch, data.total_sales])
    }

    return dataSales;
}

async function get_sales_total_by_branch_today(idBranch) {
    try {
        const query = `
            SELECT b.name_branch, COALESCE(SUM(sh.total), 0) AS total_sales
            FROM "Company".branches AS b
            LEFT JOIN "Box".sales_history AS sh ON sh.id_branches = b.id
            WHERE b.id = $1
            AND sh.sale_day >= CURRENT_DATE AND sh.sale_day < CURRENT_DATE + INTERVAL '1 day'
            GROUP BY b.name_branch;
        `;
        const values = [idBranch];
        const result = await database.query(query, values);
        return result.rows[0] || { name_branch: null, total_sales: 0 };
    } catch (error) {
        console.error("Error al obtener la suma total de ventas por sucursal:", error);
        throw error;
    }
}

async function get_sale_branch_month(branches) {
    const dataSales = []
    for (var i = 0; i < branches.length; i++) {
        const data = await get_sales_total_by_branch_this_month(branches[i]);
        dataSales.push([data.name_branch, data.total_sales])
    }

    return dataSales;
}

async function get_sales_total_by_branch_this_month(idBranch) {
    try {
        const query = `
            SELECT b.name_branch, COALESCE(SUM(sh.total), 0) AS total_sales
            FROM "Company".branches AS b
            LEFT JOIN "Box".sales_history AS sh ON sh.id_branches = b.id
            WHERE b.id = $1
            AND EXTRACT(MONTH FROM sh.sale_day) = EXTRACT(MONTH FROM CURRENT_DATE)
            AND EXTRACT(YEAR FROM sh.sale_day) = EXTRACT(YEAR FROM CURRENT_DATE)
            GROUP BY b.name_branch;
        `;
        const values = [idBranch];
        const result = await database.query(query, values);
        return result.rows[0] || { name_branch: null, total_sales: 0 };
    } catch (error) {
        console.error("Error al obtener la suma total de ventas por sucursal:", error);
        throw error;
    }
}

async function get_sale_branch_year(branches) {
    const dataSales = []
    for (var i = 0; i < branches.length; i++) {
        const data = await get_sales_total_by_branch_this_year(branches[i]);
        dataSales.push([data.name_branch, data.total_sales])
    }

    return dataSales;
}

async function get_sales_total_by_branch_this_year(idBranch) {
    try {
        const query = `
            SELECT b.name_branch, COALESCE(SUM(sh.total), 0) AS total_sales
            FROM "Company".branches AS b
            LEFT JOIN "Box".sales_history AS sh ON sh.id_branches = b.id
            WHERE b.id = $1
            AND EXTRACT(YEAR FROM sh.sale_day) = EXTRACT(YEAR FROM CURRENT_DATE)
            GROUP BY b.name_branch;
        `;
        const values = [idBranch];
        const result = await database.query(query, values);
        return result.rows[0] || { name_branch: null, total_sales: 0 };
    } catch (error) {
        console.error("Error al obtener la suma total de ventas por sucursal:", error);
        throw error;
    }
}

//-----------------------------------------------------------this function is for get all sale that we get with the combos (day,month,reay,all)
async function get_sales_total_by_combo(idCompany) {
    try {
        const query = `
            WITH productos AS (
                SELECT id, name
                FROM "Kitchen".dishes_and_combos
                WHERE id_companies = $1
            )
            SELECT p.id, p.name, COALESCE(SUM(s.total), 0) AS total_sales
            FROM productos p
            LEFT JOIN "Box".sales_history s ON p.id = s.id_dishes_and_combos
            GROUP BY p.id, p.name;
        `;
        const values = [idCompany];
        const result = await database.query(query, values);
        return result.rows || [];
    } catch (error) {
        console.error("Error al obtener la suma total de ventas por empresa:", error);
        throw error;
    }
}

async function get_sales_total_by_combo_today(idCompany) {
    try {
        const query = `
            WITH productos AS (
                SELECT id, name
                FROM "Kitchen".dishes_and_combos
                WHERE id_companies = $1
            )
            SELECT p.id, p.name, COALESCE(SUM(s.total), 0) AS total_sales
            FROM productos p
            LEFT JOIN "Box".sales_history s ON p.id = s.id_dishes_and_combos
            WHERE DATE(s.sale_day) = CURRENT_DATE
            GROUP BY p.id, p.name;
        `;
        const values = [idCompany];
        const result = await database.query(query, values);
        return result.rows || [];
    } catch (error) {
        console.error("Error al obtener la suma total de ventas por empresa:", error);
        throw error;
    }
}

async function get_sales_total_by_combo_year(idCompany) {
    try {
        const query = `
            WITH productos AS (
                SELECT id, name
                FROM "Kitchen".dishes_and_combos
                WHERE id_companies = $1
            )
            SELECT p.id, p.name, COALESCE(SUM(s.total), 0) AS total_sales
            FROM productos p
            LEFT JOIN "Box".sales_history s ON p.id = s.id_dishes_and_combos
            WHERE EXTRACT(YEAR FROM s.sale_day) = EXTRACT(YEAR FROM CURRENT_DATE)
            GROUP BY p.id, p.name;
        `;
        const values = [idCompany];
        const result = await database.query(query, values);
        return result.rows || [];
    } catch (error) {
        console.error("Error al obtener la suma total de ventas por empresa:", error);
        throw error;
    }
}

async function get_sales_total_by_combo_month(idCompany) {
    try {
        const query = `
            WITH productos AS (
                SELECT id, name
                FROM "Kitchen".dishes_and_combos
                WHERE id_companies = $1
            )
            SELECT p.id, p.name, COALESCE(SUM(s.total), 0) AS total_sales
            FROM productos p
            LEFT JOIN "Box".sales_history s ON p.id = s.id_dishes_and_combos
            WHERE EXTRACT(MONTH FROM s.sale_day) = EXTRACT(MONTH FROM CURRENT_DATE)
              AND EXTRACT(YEAR FROM s.sale_day) = EXTRACT(YEAR FROM CURRENT_DATE)
            GROUP BY p.id, p.name;
        `;
        const values = [idCompany];
        const result = await database.query(query, values);
        return result.rows || [];
    } catch (error) {
        console.error("Error al obtener la suma total de ventas por empresa:", error);
        throw error;
    }
}


//---------------------------------------------------------this function is for get the combo most sale (day,month,reay,all)
//for know which products is most sale. This not means that that combos be the that most money generate in the business 
async function get_data_distribute_company(id_company) {
    /*
    // This function is for converting the string returned by the Python script into an array for web reading 
    var distribute = await get_data_report_distribute(id_company);
    distribute = distribute.slice(1, -3); // Delete the [ ] from the corners
    const matches = distribute.match(/\[.*?\]/g);

    // Check if matches is not null
    if (matches) {
        // Iterate over the sets of brackets found
        const arrayData = matches.map(match => {
            // Remove the brackets and quotes and split by comma
            return match.slice(1, -1).split(", ");
        });

        return arrayData;
    } else {
        // If no matches were found, return an empty array
        return [];
    }
    */
    // This function is for converting the string returned by the Python script into an array for web reading 
    var distribute = await get_data_report_distribute(id_company);

    // Convert distribute to string if it's not already
    if (typeof distribute !== 'string') {
        distribute = String(distribute);
    }

    distribute = distribute.slice(1, -3); // Delete the [ ] from the corners
    const matches = distribute.match(/\[.*?\]/g);

    // Check if matches is not null
    if (matches) {
        // Iterate over the sets of brackets found
        const arrayData = matches.map(match => {
            // Remove the brackets and quotes and split by comma
            return match.slice(1, -1).split(", ");
        });

        return arrayData;
    } else {
        // If no matches were found, return an empty array
        return [];
    }
}

async function get_data_report_distribute(id_company) {
    /*
    //this function is for read a script of python for calculate the distribute of the bussiner 
    return new Promise((resolve, reject) => {
        //we going to call the script python, send the id company
        const pythonPath = 'src/dataScine/sales/sales.py';
        const arg = [id_company];
        const pythonProcess = spawn('python', [pythonPath, ...arg]);

        let outputData = ''; //this is for save the output 

        //get the result of the script 
        pythonProcess.stdout.on('data', (data) => {
            outputData += data.toString();
        });


        //we will watching if exist a error in the script 
        pythonProcess.stderr.on('data', (data) => {
            //Handle standard output errors
            console.error('Error en la salida estándar del proceso de Python:', data.toString());
            reject(new Error(data.toString()));
        });

        pythonProcess.on('close', (code) => {
            if (code === 0) {
                resolve(outputData);
            } else {
                // Python process terminated with error code
                reject(new Error(`El proceso de Python terminó con un código de error: ${code}`));
            }
        });
    });
    */
    try {
        const query = `
            SELECT sh.*, dc.*, u.first_name AS employee_first_name, u.second_name AS employee_second_name, 
                    u.last_name AS employee_last_name, c.email AS customer_email, b.name_branch
            FROM "Box".sales_history sh
            LEFT JOIN "Kitchen".dishes_and_combos dc ON sh.id_dishes_and_combos = dc.id
            LEFT JOIN "Company".employees e ON sh.id_employees = e.id
            LEFT JOIN "Fud".users u ON e.id_users = u.id
            LEFT JOIN "Company".branches b ON sh.id_branches = b.id
            LEFT JOIN "Company".customers c ON sh.id_customers = c.id
            WHERE sh.id_companies = $1
        `;
        const res = await database.query(query, [id_company]);
        const rows = res.rows;

        let names = [];
        for (let i = 0; i < rows.length; i++) {
            const amount = rows[i].cant;
            for (let j = 0; j < amount; j++) {
                names.push(rows[i].name);
            }
        }

        const combos = Array.from(new Set(names));
        const answer = combos.map(combo => [combo, names.filter(name => name === combo).length]);

        return answer;
    } catch (err) {
        console.error('Error fetching data from database:', err);
        return [];
    } 
}

async function get_data_distribute_company_day(id_company) {
    /*
    // This function is for converting the string returned by the Python script into an array for web reading 
    var distribute = await get_data_report_distribute_day(id_company);
    distribute = distribute.slice(1, -3); // Delete the [ ] from the corners
    const matches = distribute.match(/\[.*?\]/g);

    // Check if matches is not null
    if (matches) {
        // Iterate over the sets of brackets found
        const arrayData = matches.map(match => {
            // Remove the brackets and quotes and split by comma
            return match.slice(1, -1).split(", ");
        });

        return arrayData;
    } else {
        // If no matches were found, return an empty array or null as preferred
        return []; // Or you can return null if you prefer
    }
    */
    // This function is for converting the string returned by the Python script into an array for web reading 
    var distribute = await get_data_report_distribute_day(id_company);

    // Convert distribute to string if it's not already
    if (typeof distribute !== 'string') {
        distribute = String(distribute);
    }

    distribute = distribute.slice(1, -3); // Delete the [ ] from the corners
    const matches = distribute.match(/\[.*?\]/g);

    // Check if matches is not null
    if (matches) {
        // Iterate over the sets of brackets found
        const arrayData = matches.map(match => {
            // Remove the brackets and quotes and split by comma
            return match.slice(1, -1).split(", ");
        });

        return arrayData;
    } else {
        // If no matches were found, return an empty array
        return [];
    }
}

async function get_data_report_distribute_day(id_company) {
    /*
    //this function is for read a script of python for calculate the distribute of the bussiner 
    return new Promise((resolve, reject) => {
        //we going to call the script python, send the id company
        const pythonPath = 'src/dataScine/sales/salesDay.py';
        const arg = [id_company];
        const pythonProcess = spawn('python', [pythonPath, ...arg]);

        let outputData = ''; //this is for save the output 

        //get the result of the script 
        pythonProcess.stdout.on('data', (data) => {
            outputData += data.toString();
        });


        //we will watching if exist a error in the script 
        pythonProcess.stderr.on('data', (data) => {
            //Handle standard output errors
            console.error('Error en la salida estándar del proceso de Python:', data.toString());
            reject(new Error(data.toString()));
        });

        pythonProcess.on('close', (code) => {
            if (code === 0) {
                resolve(outputData);
            } else {
                // Python process terminated with error code
                reject(new Error(`El proceso de Python terminó con un código de error: ${code}`));
            }
        });
    });*/
    try {
        const query = `
        SELECT sh.*, dc.*, u.first_name AS employee_first_name, u.second_name AS employee_second_name, 
               u.last_name AS employee_last_name, c.email AS customer_email, b.name_branch
        FROM "Box".sales_history sh
        LEFT JOIN "Kitchen".dishes_and_combos dc ON sh.id_dishes_and_combos = dc.id
        LEFT JOIN "Company".employees e ON sh.id_employees = e.id
        LEFT JOIN "Fud".users u ON e.id_users = u.id
        LEFT JOIN "Company".branches b ON sh.id_branches = b.id
        LEFT JOIN "Company".customers c ON sh.id_customers = c.id
        WHERE sh.id_companies = $1
        AND DATE(sh.sale_day) = $2
        `;
        const res = await database.query(query, [id_company]);
        const rows = res.rows;

        let names = [];
        for (let i = 0; i < rows.length; i++) {
            const amount = rows[i].cant;
            for (let j = 0; j < amount; j++) {
                names.push(rows[i].name);
            }
        }

        const combos = Array.from(new Set(names));
        const answer = combos.map(combo => [combo, names.filter(name => name === combo).length]);

        return answer;
    } catch (err) {
        console.error('Error fetching data from database:', err);
        return [];
    } 
}

async function get_data_distribute_company_month(id_company) {
    /*
    // This function is for converting the string returned by the Python script into an array for web reading
    var distribute = await get_data_report_distribute_month(id_company);
    distribute = distribute.slice(1, -3); // Remove the [ ] from the corners
    const matches = distribute.match(/\[.*?\]/g);

    // Check if matches is not null
    if (matches) {
        // Iterate over the sets of brackets found
        const arrayData = matches.map(match => {
            // Remove the brackets and quotes and split by comma
            return match.slice(1, -1).split(", ");
        });

        return arrayData;
    } else {
        // If no matches were found, return an empty array or null as preferred
        return []; // Or you can return null if you prefer
    }*/
    // This function is for converting the string returned by the Python script into an array for web reading 
    var distribute = await get_data_report_distribute_month(id_company);

    // Convert distribute to string if it's not already
    if (typeof distribute !== 'string') {
        distribute = String(distribute);
    }

    distribute = distribute.slice(1, -3); // Delete the [ ] from the corners
    const matches = distribute.match(/\[.*?\]/g);

    // Check if matches is not null
    if (matches) {
        // Iterate over the sets of brackets found
        const arrayData = matches.map(match => {
            // Remove the brackets and quotes and split by comma
            return match.slice(1, -1).split(", ");
        });

        return arrayData;
    } else {
        // If no matches were found, return an empty array
        return [];
    }
}

async function get_data_report_distribute_month(id_company) {
    /*
    //this function is for read a script of python for calculate the distribute of the bussiner 
    return new Promise((resolve, reject) => {
        //we going to call the script python, send the id company
        const pythonPath = 'src/dataScine/sales/salesMonth.py';
        const arg = [id_company];
        const pythonProcess = spawn('python', [pythonPath, ...arg]);

        let outputData = ''; //this is for save the output 

        //get the result of the script 
        pythonProcess.stdout.on('data', (data) => {
            outputData += data.toString();
        });


        //we will watching if exist a error in the script 
        pythonProcess.stderr.on('data', (data) => {
            //Handle standard output errors
            console.error('Error en la salida estándar del proceso de Python:', data.toString());
            reject(new Error(data.toString()));
        });

        pythonProcess.on('close', (code) => {
            if (code === 0) {
                resolve(outputData);
            } else {
                // Python process terminated with error code
                reject(new Error(`El proceso de Python terminó con un código de error: ${code}`));
            }
        });
    });
    */
    try {
        const query = `
            SELECT sh.*, dc.*, u.first_name AS employee_first_name, u.second_name AS employee_second_name, 
                   u.last_name AS employee_last_name, c.email AS customer_email, b.name_branch
            FROM "Box".sales_history sh
            LEFT JOIN "Kitchen".dishes_and_combos dc ON sh.id_dishes_and_combos = dc.id
            LEFT JOIN "Company".employees e ON sh.id_employees = e.id
            LEFT JOIN "Fud".users u ON e.id_users = u.id
            LEFT JOIN "Company".branches b ON sh.id_branches = b.id
            LEFT JOIN "Company".customers c ON sh.id_customers = c.id
            WHERE sh.id_companies = $1
            AND EXTRACT(MONTH FROM sh.sale_day) = EXTRACT(MONTH FROM CURRENT_DATE)
            AND EXTRACT(YEAR FROM sh.sale_day) = EXTRACT(YEAR FROM CURRENT_DATE)
        `;
        const res = await database.query(query, [id_company]);
        const rows = res.rows;

        let names = [];
        for (let i = 0; i < rows.length; i++) {
            const amount = rows[i].cant;
            for (let j = 0; j < amount; j++) {
                names.push(rows[i].name);
            }
        }

        const combos = Array.from(new Set(names));
        const answer = combos.map(combo => [combo, names.filter(name => name === combo).length]);

        return answer;
    } catch (err) {
        console.error('Error fetching data from database:', err);
        return [];
    } 
}

async function get_data_distribute_company_year(id_company) {
    // This function is for converting the string returned by the Python script into an array for web reading 
    var distribute = await get_data_report_distribute_month(id_company);

    // Convert distribute to string if it's not already
    if (typeof distribute !== 'string') {
        distribute = String(distribute);
    }

    distribute = distribute.slice(1, -3); // Delete the [ ] from the corners
    const matches = distribute.match(/\[.*?\]/g);

    // Check if matches is not null
    if (matches) {
        // Iterate over the sets of brackets found
        const arrayData = matches.map(match => {
            // Remove the brackets and quotes and split by comma
            return match.slice(1, -1).split(", ");
        });

        return arrayData;
    } else {
        // If no matches were found, return an empty array
        return [];
    }
    /*
    // This function is for converting the string returned by the Python script into an array for web reading 
    var distribute = await get_data_report_distribute_month(id_company);
    distribute = distribute.slice(1, -3); // Delete the [ ] from the corners
    const matches = distribute.match(/\[.*?\]/g);

    // Check if matches is not null
    if (matches) {
        // Iterate over the sets of brackets found
        const arrayData = matches.map(match => {
            // Remove the brackets and quotes and split by comma
            return match.slice(1, -1).split(", ");
        });

        return arrayData;
    } else {
        // If no matches were found, return an empty array
        return [];
    }*/
}

async function get_data_report_distribute_year(id_company) {
    //this function is for read a script of python for calculate the distribute of the bussiner 
    return new Promise((resolve, reject) => {
        //we going to call the script python, send the id company
        const pythonPath = 'src/dataScine/sales/salesYear.py';
        const arg = [id_company];
        const pythonProcess = spawn('python', [pythonPath, ...arg]);

        let outputData = ''; //this is for save the output 

        //get the result of the script 
        pythonProcess.stdout.on('data', (data) => {
            outputData += data.toString();
        });


        //we will watching if exist a error in the script 
        pythonProcess.stderr.on('data', (data) => {
            //Handle standard output errors
            console.error('Error en la salida estándar del proceso de Python:', data.toString());
            reject(new Error(data.toString()));
        });

        pythonProcess.on('close', (code) => {
            if (code === 0) {
                resolve(outputData);
            } else {
                // Python process terminated with error code
                reject(new Error(`El proceso de Python terminó con un código de error: ${code}`));
            }
        });
    });
}
//-----------------------------------------------------------this function is for get all the sale of today (all)
async function get_total_sales_company(idCompany) {
    try {
        const query = `
            SELECT COALESCE(SUM(total), 0) AS total_sales
            FROM "Box".sales_history
            WHERE id_companies = $1
            AND DATE_TRUNC('day', sale_day) = CURRENT_DATE;
        `;
        const values = [idCompany];
        const result = await database.query(query, values);

        return result.rows[0].total_sales;
    } catch (error) {
        console.error("Error al obtener datos de ventas get_total_sales_company:", error);
        return 0;
    }
}

async function get_total_day_old(idCompany) {
    try {
        const query = `
            SELECT COALESCE(SUM(total), 0) AS total_sales
            FROM "Box".sales_history
            WHERE id_companies = $1
            AND DATE_TRUNC('day', sale_day) = CURRENT_DATE-1;
        `;
        const values = [idCompany];
        const result = await database.query(query, values);

        return result.rows[0].total_sales;
    } catch (error) {
        console.error("Error al obtener datos de ventas del dia pasado:", error);
        return 0;
    }
}

async function get_total_unity_company(idCompany) {
    try {
        const query = `
            SELECT COALESCE(SUM(amount), 0) AS total_items_sold
            FROM "Box".sales_history
            WHERE id_companies = $1
            AND DATE_TRUNC('day', sale_day) = CURRENT_DATE;
        `;
        const values = [idCompany];
        const result = await database.query(query, values);

        return result.rows[0].total_items_sold;
    } catch (error) {
        console.error("Error al obtener datos de ventas get_total_unity_company:", error);
        return 0;
    }
}

async function get_total_year(idCompany) {
    try {
        const query = `
            SELECT COALESCE(SUM(total), 0) AS total_sales
            FROM "Box".sales_history
            WHERE id_companies = $1
            AND EXTRACT(YEAR FROM sale_day) = EXTRACT(YEAR FROM CURRENT_DATE)
        `;
        const values = [idCompany];
        const result = await database.query(query, values);
        return result.rows[0].total_sales;
    } catch (error) {
        console.error("Error al obtener la suma de ventas get_total_year:", error);
        return 0;
    }
}

async function get_total_year_old(idCompany) {
    try {
        const query = `
            SELECT COALESCE(SUM(total), 0) AS total_sales
            FROM "Box".sales_history
            WHERE id_companies = $1
            AND EXTRACT(YEAR FROM sale_day) = EXTRACT(YEAR FROM CURRENT_DATE)-1;
        `;
        const values = [idCompany];
        const result = await database.query(query, values);
        return result.rows[0].total_sales;
    } catch (error) {
        console.error("Error al obtener la suma de ventas get_total_year_old:", error);
        return 0;
    }
}

async function get_total_month(idCompany) {
    try {
        const query = `
            SELECT COALESCE(SUM(total), 0) AS total_sales
            FROM "Box".sales_history
            WHERE id_companies = $1
            AND EXTRACT(MONTH FROM sale_day) = EXTRACT(MONTH FROM CURRENT_DATE)
        `;
        const values = [idCompany];
        const result = await database.query(query, values);
        return result.rows[0].total_sales;
    } catch (error) {
        console.error("Error al obtener la suma de ventas get_total_month:", error);
        return 0;
    }
}

async function get_total_month_old(idCompany) {
    try {
        const query = `
            SELECT COALESCE(SUM(total), 0) AS total_sales
            FROM "Box".sales_history
            WHERE id_companies = $1
            AND EXTRACT(MONTH FROM sale_day) = EXTRACT(MONTH FROM CURRENT_DATE)-1;
        `;
        const values = [idCompany];
        const result = await database.query(query, values);
        return result.rows[0].total_sales;
    } catch (error) {
        console.error("Error al obtener la suma de ventas get_total_month_old:", error);
        return 0;
    }
}

async function get_total_company(idCompany) {
    try {
        const query = `
            SELECT COALESCE(SUM(total), 0) AS total_sales
            FROM "Box".sales_history
            WHERE id_companies = $1
        `;
        const values = [idCompany];
        const result = await database.query(query, values);
        return result.rows[0].total_sales;
    } catch (error) {
        console.error("Error al obtener la suma de ventas get_total_company:", error);
        return 0;
    }
}

function calculate_sale_increase(previousSales, currentSales) {
    if (previousSales == 0) {
        return 100;
    }

    // calculate the aument absolute in the sales
    const salesIncrease = currentSales - previousSales;

    // calculate the % of aument
    const percentageIncrease = (salesIncrease / previousSales) * 100;

    return percentageIncrease;
}

async function get_movements_company_positive(branches) {
    var total = 0;
    for (var i = 0; i < branches.length; i++) {
        total += await get_positive_moves_by_branch(branches[i]);
    }
    return total;
}

async function get_positive_moves_by_branch(idBranch) {
    try {
        const query = `
            SELECT COALESCE(SUM(move), 0) AS total_negative_moves
            FROM "Box".movement_history
            WHERE id_branches IN (
                SELECT id
                FROM "Company".branches
                WHERE id = $1
            )
            AND date_move::date = CURRENT_DATE
            AND move > 0;
        `;
        const values = [idBranch];
        const result = await database.query(query, values);
        return result.rows[0].total_negative_moves;
    } catch (error) {
        console.error("Error al obtener los movimientos en negativo get_positive_moves_by_branch:", error);
        return 0;
    }
}

//-----------------------------------------------------------options 
router.get('/:id_company/options', isLoggedIn, async (req, res) => {
    const company = await this_company_is_of_this_user(req, res);
    const country=await get_country()
    if (company != null) {
        res.render('links/manager/options/options', { company,country });
    }
})


//-----------------------------------------------------------manager (visit branch)

//-------------------------------------------------------------home
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

async function get_data_employee(req) {
    const id_user = req.user.id;
    var queryText = 'SELECT * FROM "Company"."employees" WHERE id_users= $1';
    var values = [id_user];
    const result = await database.query(queryText, values);
    const data = result.rows;
    return data;
}

async function home_company(req, res) {
    var queryText = 'SELECT * FROM "User".companies Where id_users= $1';
    var values = [parseInt(req.user.id)];
    const result = await database.query(queryText, values);
    const companies = result.rows;
    res.render('links/manager/home', { companies });
}


async function get_id_branch(id_company){
    var queryText = 'SELECT * FROM "Company".branches Where id_companies= $1';
    var values = [parseInt(req.user.id)];
    const result = await database.query(queryText, values);
    const branches = result.rows;
    if(branches.length>1){

    }else{

    }
}

router.get('/:id_user/:id_company/:id_branch/:id_employee/:id_role/store-home', isLoggedIn, async (req, res) => {
    //we will waching if exist this branch
    //if (await this_employee_works_here(req, res)) {
        const { id_company, id_branch } = req.params;
        //const company=await get_data_company_with_id(id_company)

        if(id_branch!=null){
            const branchFree = await get_data_branch(req);
            const branch=branchFree;

            //update the variable pack branch and pack database company
            //req.pack_branch=branchFree[0].pack_branch;
            //req.pack_company=company[0].pack_database;

            //we get all the combo of the branch 
            const dishAndCombo = await get_all_dish_and_combo(id_company, id_branch);
            const dataEmployee = await get_data_employee(req);
            const newCombos = await get_data_recent_combos(id_company);
            const mostSold = await get_all_data_combo_most_sold(id_branch);
    
            //we going to get all the type of ad in the branch
            const offerAd = await get_all_ad(id_branch, 'offer');
            const newAd = await get_all_ad(id_branch, 'new');
            const combosAd = await get_all_ad(id_branch, 'combo');
            const specialsAd = await get_all_ad(id_branch, 'special');

            //const addition=await get_all_additions(dishAndCombo)
            const addition='{"nombre": "Juan", "edad": 30, "ciudad": "Madrid"}';
            if(req.user.rol_user==rolFree){
                res.render('links/store/home/home', { branchFree,dishAndCombo, dataEmployee, mostSold, newCombos, offerAd, newAd, combosAd, specialsAd , addition: JSON.stringify(addition)});
            }
            else{
                if (await this_employee_works_here(req, res)) {
                    res.render('links/store/home/home', { dishAndCombo, dataEmployee, mostSold, newCombos, offerAd, newAd, combosAd, specialsAd , addition: JSON.stringify(addition)});
                }else{
                    res.render('links/store/branchLost')
                }
            }
        }else{
            res.render('links/store/branchLost')
        }
    //}
    
});


async function this_employee_works_here(req, res) {
    const { id_user } = req.params;

    //first we will watching if the id of the user is equal to the id of the account.
    if (id_user == req.user.id) {
        //we will watching if the employee data is of the user and work in this company 
        if (await this_data_employee_is_user(req)) {
            return true;
        }
    }
    req.flash('message', '⚠️ ¡Estás intentando acceder a una cuenta que no te pertenece! ⚠️')
    res.render('links/store/branchLost')
    //res.redirect('/fud/home');
}

async function this_data_employee_is_user(req) {
    const employee = await get_data_employee(req);
    const data = employee[0]
    const id_user_employee = data.id_users
    const id_company_employee = data.id_companies
    const id_branch_employee = data.id_branches
    const id_employee_employee = data.id
    const id_role_employee = data.id_roles_employees

    const { id_company, id_branch, id_employee, id_role } = req.params;

    return (id_user_employee == req.user.id) && (id_company_employee == id_company) && (id_branch_employee == id_branch) && (id_employee_employee == id_employee) && (id_role_employee == id_role)
}

async function get_all_dish_and_combo(idCompany, idBranch) {
    var queryText = `
        SELECT 
            i.*,
            d.barcode,
            d.name,
            d.description,
            d.img,
            d.id_product_department,
            d.id_product_category
        FROM "Inventory".dish_and_combo_features i
        INNER JOIN "Kitchen".dishes_and_combos d ON i.id_dishes_and_combos = d.id
        WHERE i.id_branches = $1
    `;
    var values = [idBranch];
    const result = await database.query(queryText, values);
    return result.rows;
}

async function get_all_additions(dishAndCombo){
    var additional=[]
    for(var i = 0; i < dishAndCombo.length; i++){
        try{
            var queryText = `
                SELECT id, id_dishes_and_combos, id_products_and_supplies FROM "Kitchen".table_supplies_combo 
                WHERE id_dishes_and_combos = $1 and additional=true
            `;
            var values = [dishAndCombo[i].id_dishes_and_combos];
            const result = await database.query(queryText, values);
            if(result.rows.length>0){
                additional.push(result.rows)
            }
        }catch (error) {
            // Manejo de errores
            console.error('Error al actualizar leer los addition de los combos:', error);
        }
    }

    return additional;
}

async function get_all_data_combo_most_sold(id_branch) {
    const mostSold = await get_all_combo_most_sold(id_branch);
    var dataComboSold = []
    for (let i = 0; i < mostSold.length; i++) {
        const combo = mostSold[i];
        const data = await get_dish_and_combo_with_id(combo.id_dishes_and_combos);
        dataComboSold.push(data);
    }

    return dataComboSold;
}

async function get_data_recent_combos(id_company) {
    const newCombo = await get_recent_combos(id_company);
    var dataCombo = []
    for (let i = 0; i < newCombo.length; i++) {
        const combo = newCombo[i];
        const data = await get_dish_and_combo_with_id(combo.id);
        dataCombo.push(data);
    }

    return dataCombo;
}

async function get_recent_combos(id_company) {
    try {
        const queryText = `
            SELECT *
            FROM "Kitchen".dishes_and_combos
            WHERE id_companies = $1
            ORDER BY id DESC
            LIMIT 10;
        `;
        const values = [id_company];
        const result = await database.query(queryText, values);
        return result.rows;
    } catch (error) {
        console.error("Error occurred while fetching recent combos:", error);
        throw error;
    }
}


async function get_all_combo_most_sold(idNranch) {
    try {
        const queryText = `
            SELECT id_dishes_and_combos, SUM(amount) AS total_sold
            FROM "Box".sales_history
            WHERE id_branches = $1
            GROUP BY id_dishes_and_combos
            ORDER BY total_sold DESC
            LIMIT 10;
        `;
        const values = [idNranch];
        const result = await database.query(queryText, values);
        return result.rows;
    } catch (error) {
        console.error("Error occurred while fetching top 10 products:", error);
        throw error;
    }
}

async function get_dish_and_combo_with_id(idCombo) {
    var queryText = `
        SELECT 
            i.*,
            d.barcode,
            d.name,
            d.description,
            d.img,
            d.id_product_department,
            d.id_product_category
        FROM "Inventory".dish_and_combo_features i
        INNER JOIN "Kitchen".dishes_and_combos d ON i.id_dishes_and_combos = d.id
        WHERE d.id = $1
    `;
    var values = [idCombo];
    const result = await database.query(queryText, values);
    return result.rows[0];
}


router.get('/store-home', isLoggedIn, async (req, res) => {
    res.render('links/store/home/home');
})


router.get('/:id_company/:id_branch/:id_dishes_and_combos/edit-data-combo-free', isLoggedIn, async (req, res) => {
    const { id_dishes_and_combos, id_company } = req.params;

    const branchFree = await get_data_branch(req);
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

router.get('/:id_company/:id_branch/order-free', isLoggedIn, async (req, res) => {
    const {id_branch } = req.params;
    const branchFree = await get_data_branch(req);
    if (branchFree != null) {
        const order=await get_all_order_by_id_branch(id_branch);
        res.render('links/branch/order/order', {branchFree, order});
    } else {
        res.render('links/store/branchLost');
    }
});

async function get_all_order_by_id_branch(idBranches) {
    const queryText = `
        SELECT
            o.id AS order_id,
            o.id_branches AS order_branch_id,
            o.id_commanders,
            o.id_employees AS order_employee_id,
            o.phone AS order_phone,
            o.address AS order_address,
            o.comment AS order_comment,
            o.status AS order_status,
            o.name_customer AS customer_name,
            o.cellphone AS customer_cellphone,
            c.id AS commander_id,
            c.id_employees AS commander_employee_id,
            c.id_customers AS commander_customer_id,
            c.order_details AS commander_order_details,
            c.total AS commander_total,
            c.money_received AS commander_money_received,
            c.change AS commander_change,
            c.status AS commander_status,
            c.comentary AS commander_comment,
            c.commander_date AS commander_date
        FROM
            "Branch".order o
        LEFT JOIN
            "Branch".commanders c ON c.id = o.id_commanders
        WHERE
            o.id_branches = $1
    `;
    const values = [idBranches];

    try {
        const result = await database.query(queryText, values);
        return result.rows; // Devuelve todas las filas que coinciden con idBranches
    } catch (error) {
        console.error('Error al obtener órdenes y comandantes:', error);
        throw error;
    }
}

router.post('/update-order', async (req, res)=>{
    update_order_status_by_id(req.body.taskId,req.body.newStatus);
    res.status(200).json({ message: 'true'});
});

async function update_order_status_by_id(orderId, newStatus) {
    const queryText = `
        UPDATE "Branch".order
        SET
            status = $2
        WHERE
            id = $1
    `;
    const values = [orderId, newStatus];

    try {
        const result = await database.query(queryText, values);
        return result.rowCount; // Devuelve el número de filas actualizadas (debería ser 1)
    } catch (error) {
        console.error('Error al actualizar el estado de la orden:', error);
        throw error;
    }
}

router.get('/:id_branch/get-new-order', async (req, res)=>{
    const {id_branch } = req.params;
  // Aquí podrías obtener las nuevas tareas de tu base de datos o de donde las almacenes
  const nuevasTareas = await get_all_order_by_id_branch(id_branch)
  res.json(nuevasTareas);
});

router.get('/:id_branch/:id_order/edit-order', async (req, res)=>{
    const {id_branch,id_order } = req.params;
    const branchFree = await get_data_branch(req);
    const dataOrder=await get_order_by_id(id_order);
    const employees = await search_employees_branch(id_branch);
    res.render('links/branch/order/editOrder', {branchFree,dataOrder,employees})
});

async function get_order_by_id(order_id) {
    const queryText = `
        SELECT
            o.id AS order_id,
            o.id_branches AS order_branch_id,
            o.id_commanders,
            o.id_employees AS order_employee_id,
            o.phone AS order_phone,
            o.address AS order_address,
            o.comment AS order_comment,
            o.status AS order_status,
            o.name_customer AS customer_name,
            o.cellphone AS customer_cellphone,
            c.id AS commander_id,
            c.id_employees AS commander_employee_id,
            c.id_customers AS commander_customer_id,
            c.order_details AS commander_order_details,
            c.total AS commander_total,
            c.money_received AS commander_money_received,
            c.change AS commander_change,
            c.status AS commander_status,
            c.comentary AS commander_comment,
            c.commander_date AS commander_date
        FROM
            "Branch".order o
        LEFT JOIN
            "Branch".commanders c ON c.id = o.id_commanders
        WHERE
            o.id = $1
    `;
    const values = [order_id];

    try {
        const result = await database.query(queryText, values);
        return result.rows[0]; // Devuelve la fila que coincide con order_id
    } catch (error) {
        console.error('Error al obtener la orden y el comandante:', error);
        throw error;
    }
}

router.get('/my-order', async (req, res)=>{
    const dataEmployee=await get_data_employee(req)
    const order=await get_all_order_by_id_employee(dataEmployee[0].id);
    res.render('links/branch/order/myorder', {order});
});

async function get_all_order_by_id_employee(idEmployee) {
    const queryText = `
        SELECT
            o.id AS order_id,
            o.id_branches AS order_branch_id,
            o.id_commanders,
            o.id_employees AS order_employee_id,
            o.phone AS order_phone,
            o.address AS order_address,
            o.comment AS order_comment,
            o.status AS order_status,
            o.name_customer AS customer_name,
            o.cellphone AS customer_cellphone,
            c.id AS commander_id,
            c.id_employees AS commander_employee_id,
            c.id_customers AS commander_customer_id,
            c.order_details AS commander_order_details,
            c.total AS commander_total,
            c.money_received AS commander_money_received,
            c.change AS commander_change,
            c.status AS commander_status,
            c.comentary AS commander_comment,
            c.commander_date AS commander_date
        FROM
            "Branch".order o
        LEFT JOIN
            "Branch".commanders c ON c.id = o.id_commanders
        WHERE
            o.id_employees = $1
    `;
    const values = [idEmployee];

    try {
        const result = await database.query(queryText, values);
        return result.rows; // Devuelve todas las filas que coinciden con idEmployee
    } catch (error) {
        console.error('Error al obtener órdenes y comandantes:', error);
        throw error;
    }
}

router.get('/get-new-my-order', async (req, res)=>{
    const dataEmployee=await get_data_employee(req)
    const order=await get_all_order_by_id_employee(dataEmployee[0].id);
    res.json(order);
});


router.get('/:id_branch/:id_order/edit-my-order', async (req, res)=>{
    const {id_order } = req.params;
    const dataOrder= await get_order_by_id(id_order);
    const employees = await get_data_employee(req);
    console.log(employees)
    res.render('links/branch/order/editMyOrder', {dataOrder,employees})
});




//----------------------------------------------------FUD ONE----------------------------------------------------//
async function get_free_company(id_user){
    var queryText = 'SELECT id FROM "User".companies WHERE id_users = $1';
    var values = [id_user];
    const result = await database.query(queryText, values);
    const companyId = result.rows[0].id;
    return companyId;
}

async function home_free(req, res) {
    /*
    const idUser = parseInt(req.user.id);
    const idCompany = await get_free_company(idUser);

    var queryText = 'SELECT * FROM "Company".branches WHERE id_companies = $1';
    var values = [idCompany];
    const result = await database.query(queryText, values);
    const idBranch = result.rows[0].id;*/
    //var link = '/fud/' + idUser + '/' + idCompany +'/'  + idBranch + '/'+ idUser + '/'+ 0 + '/store-home';

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

router.get('/:id_company/:id_branch/marketplace', isLoggedIn, async (req, res) => {
    const { id_company, id_branch } = req.params;
    const branchFree = await get_data_branch(req);
    if (branchFree != null) {
        res.render('links/branch/marketplace', { branchFree });
    } else {
        res.render('links/store/branchLost');
    }
});

/*
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
    const branchFree = await get_data_branch(req);
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
    const branchFree = await get_data_branch(req);
    if (branchFree != null) {
        //const supplies_products = await search_company_supplies_or_products(req, true);
        const combos = await get_combo_features(id_branch);
        res.render('links/free/combo/combo', { branchFree, combos});
    } else {
        res.render('links/store/branchLost');
    }
});
*/

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

async function the_user_can_add_most_combo(comboLength,packCombo){
    const limits = {
        1: 300,
        2: 600,
        3: 1500
    };

    const limit = limits[packCombo] || 25; // if packCombo no is in the limit en, we will use 25 how value

    return comboLength < limit;
}

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

/*store online*/
router.get('/myrestaurant/:id_company/:id_branch', async (req, res) => {
    const { id_company, id_branch } = req.params;
    const branchFree = await get_data_branch(req);
    if (branchFree != null) {
        const digitalMenu=[{menu:''}]
        //we get all the combo of the branch 
        const dishAndCombo = await get_all_dish_and_combo(id_company, id_branch);
        const newAd = await get_all_ad(id_branch, 'new');
        /*
        const newCombos = await get_data_recent_combos(id_company);
        const mostSold = await get_all_data_combo_most_sold(id_branch);

        //we going to get all the type of ad in the branch
        const offerAd = await get_all_ad(id_branch, 'offer');
        const newAd = await get_all_ad(id_branch, 'new');
        const combosAd = await get_all_ad(id_branch, 'combo');
        const specialsAd = await get_all_ad(id_branch, 'special');

        res.render('links/store/home/digitalMenu', { branchFree ,digitalMenu,dishAndCombo,newCombos,mostSold,offerAd,newAd,combosAd,specialsAd});
        */
        res.render('links/store/home/digitalMenu', { branchFree ,digitalMenu,dishAndCombo,newAd});
    } else {
        res.render('links/store/branchLost');
    }
});

/*reports*/
router.get('/report-sales', isLoggedIn, (req, res) => {
    res.render("links/manager/reports/sales");
})

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