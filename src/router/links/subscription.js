const express = require('express');
const router = express.Router();
const { isLoggedIn, isNotLoggedIn } = require('../../lib/auth');
/*
*----------------------functions-----------------*/
//functions subscription
const {
    validate_subscription,
    get_subscription_by_branch_id,
    update_subscription,
    update_subscription_date,
    get_subscription_stripe_with_id,
    this_subscription_is_activate,
    this_subscription_is_activate_for_date,
    get_subscription_for_id_user,
    get_subscription_for_email_user,
    create_subscription,
    create_subscription_free,
    save_subscription_in_database,
    create_subscription_app,
    delete_subscription,
    update_pack_branch_with_the_company_id,
    update_database_company_with_the_user_id,
    update_suscription_of_app_in_branch
} = require('../../services/subscription');

//functions sales and move
const {
    check_company,
    check_company_other,
} = require('../../services/company');

/*
*----------------------links-----------------*/
const companyName='links'
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



module.exports = router;