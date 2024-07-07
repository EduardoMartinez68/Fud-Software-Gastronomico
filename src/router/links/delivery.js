const express = require('express');
const router = express.Router();
const { isLoggedIn, isNotLoggedIn } = require('../../lib/auth');
/*
*----------------------functions-----------------*/
//functions delivery
const {
    get_all_order_by_id_branch,
    get_all_order_by_id_employee,
    get_order_by_id,
    update_order_status_by_id
} = require('../../services/delivery');

//functions employee
const {
    search_employees_branch
} = require('../../services/employees');

//functions branch
const {
    get_data_branch,
} = require('../../services/branch');



/*
*------------------------router-------------------*/
//------------------------------------------------------delivery fud
router.post('/update-order', async (req, res)=>{
    update_order_status_by_id(req.body.taskId,req.body.newStatus);
    res.status(200).json({ message: 'true'});
});

router.get('/:id_branch/get-new-order', async (req, res)=>{
    const {id_branch } = req.params;
  // Aquí podrías obtener las nuevas tareas de tu base de datos o de donde las almacenes
  const nuevasTareas = await get_all_order_by_id_branch(id_branch)
  res.json(nuevasTareas);
});

router.get('/:id_branch/:id_order/edit-order', async (req, res)=>{
    const {id_branch,id_order } = req.params;
    const branchFree = await get_data_branch(id_branch);
    const dataOrder=await get_order_by_id(id_order);
    const employees = await search_employees_branch(id_branch);
    res.render('links/branch/order/editOrder', {branchFree,dataOrder,employees})
});

router.get('/my-order', async (req, res)=>{
    const dataEmployee=await get_data_employee(req)
    const order=await get_all_order_by_id_employee(dataEmployee[0].id);
    res.render('links/branch/order/myorder', {order});
});

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

router.get('/:id_company/:id_branch/order-free', isLoggedIn, async (req, res) => {
    const {id_branch } = req.params;
    const branchFree = await get_data_branch(id_branch);
    if (branchFree != null) {
        const order=await get_all_order_by_id_branch(id_branch);
        res.render('links/branch/order/order', {branchFree, order});
    } else {
        res.render('links/store/branchLost');
    }
});


//--------------------------------------------------------delivery uber and rappy  
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

const {UBER_APPLICATION_ID,UBER_CLIENT_SECRET,UBER_SIGNING_KEY,RAPPI_CLIENT_ID,RAPPI_CLIENT_SECRET,RAPPI_REDIRECT_URI} = process.env;
//--------------------------------------------------------uber 
const uberClientId = UBER_APPLICATION_ID;
const uberClientSecret = UBER_CLIENT_SECRET;
const deliveryRedirectUri = 'http://localhost:4000/fud/callback/ubereat' //'https://fud-tech.cloud/fud/main';
const uberRedirectUrl='http://localhost:4000/fud/callback/ubereat' //'https://fud-tech.cloud/callback/ubereat'
const querystring = require('querystring');


//--------------------------------------------------------rappi
const rappiClientId = RAPPI_CLIENT_ID;
const rappiClientSecret = RAPPI_CLIENT_SECRET;
const rappiRedirectUri = RAPPI_REDIRECT_URI;
var https = require("https");
router.post('https://rests-integrations-dev.auth0.com/oauth/token', isLoggedIn, async (req, res) => {
    console.log(req.body)
});


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

/*REPORTE DE PEDIDOS DE USUARIO*/
const axios = require('axios');

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





module.exports = router;
