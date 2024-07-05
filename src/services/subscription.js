const database = require('../database');
const addDatabase = require('../router/addDatabase');
const rolFree=0

async function validate_subscription(req,res){
    return true;
    const { id_branch } = req.params;
    const dataSubscription=await get_subscription_by_branch_id(id_branch); //get the data of the subscription from my database
    //we going to wacht if exist a branch with this id 
    if(dataSubscription.length>0){
        //we will watching if the subscription expire
        const currentDay=new Date(); //get the current day
        if(dataSubscription.final_date<currentDay){ 
            //we will getting the data subscrtiption of stripe 
            const idSubscription=dataSubscription[0].id;
            const stripe_subscription=get_subscription_stripe_with_id(idSubscription)

            //we going to wacht if this subscription not is activate in this branch
            if(!await this_subscription_is_activate(stripe_subscription)){
                //if the subscription not is activate or not exist show a message of subscription renewal
                req.flash('message', 'Esta sucursal no cuenta con una suscripción activa. Por favor, renueva o asígnale una suscripción ya existente 🙅‍♂️')
                res.redirect('/fud/subscription');
                return false;
            }else{
                //if the subscription is activate, update the expiration date of the subscription
                await update_subscription_date(idSubscription,stripe_subscription);
            }
        }

        return true; //if this subscription is activate return true
    }

    //if the subscription not is activate or not exist show a message of subscription renewal
    req.flash('message', 'Esta sucursal no cuenta con una suscripción activa. Por favor, renueva o asígnale una suscripción ya existente 🙅‍♂️')
    res.redirect('/fud/subscription');

    return false; //if not exist a branch with this subscription return false
}

async function get_subscription_by_branch_id(id_branch){
    try {
        var queryText = 'SELECT * FROM "User".subscription WHERE id_branches= $1';
        var values = [id_branch];
        const result = await database.query(queryText, values);
        const data = result.rows;
        return data;
    } catch (error) {
        console.log('Error al obtener las subscription: ' + error.message)
        return []
    }
}

async function update_subscription(id_subscription,id_branch){
    try {
        //if the user can use his free pack and buy the free pack , we will updating his status in the database
        const queryText = 'UPDATE "Fud".subscription SET id_branches = $1 WHERE id = $2';
        const values = [id_branch, id_subscription];
        await database.query(queryText, values); //update the status
        return true;
      } catch (error) {
        console.error('Error al actualizar id_packs_fud:', error);
        return false;
      }
}

async function update_subscription_date(idSubscription,subscription){
    try {
        const day_delete=new Date(subscription.current_period_end * 1000) //get the day of expire of the subscription of stripe 
        //we will update the subscription
        const queryText = 'UPDATE "Fud".subscription SET final_date = $1 WHERE id = $2';
        const values = [day_delete, idSubscription];
        await database.query(queryText, values); //update the status
        return true;
      } catch (error) {
        console.error('Error al actualizar id_packs_fud:', error);
        return false;
      }
}

async function this_subscription_is_activate(subscription){
    const status = subscription.status; //get the status of the suscription (active,canceled)
    return (status!='canceled')
}

async function get_subscription_stripe_with_id(idSubscription){
    //we will waching if the subscription is activate 
    const subscription = await stripe.subscriptions.retrieve(idSubscription); //get the data subscription from stripe 
    return subscription;
}


async function this_subscription_is_activate_for_date(dataSubscription){
    //we going to wacht if exist a branch with this id 
    if(dataSubscription.length>0){
        const idSubscription=dataSubscription[0].id; //get the subscription id

        //we will waching if the subscription is activate 
        const subscription = await stripe.subscriptions.retrieve(idSubscription); //get the data subscription from stripe 
        const day_delete=new Date(subscription.current_period_end * 1000)
        
        const status = subscription.status; //get the status of the suscription (active,canceled)
        return (status!='canceled')
    }

    return false;
}

async function get_subscription_for_id_user(idUser) {
    try {
        var queryText = `
            SELECT 
                sub.*, 
                branch.name_branch AS branch_name, 
                company.name AS company_name
            FROM 
                "User".subscription AS sub
            LEFT JOIN 
                "Company".branches AS branch ON sub.id_branches = branch.id
            LEFT JOIN 
                "User".companies AS company ON branch.id_companies = company.id
            WHERE 
                sub.id_users = $1
            ORDER BY 
                company.name DESC`;
        var values = [idUser];
        const result = await database.query(queryText, values);
        const data = result.rows;
        return data;
    } catch (error) {
        console.log('Error al obtener las subscription: ' + error.message)
        return []
    }
}

async function get_subscription_for_email_user(email) {
    try {
        // search the customer in Stripe for his email
        const customer = await stripe.customers.list({ email: email });

        //we will watching if exist suscription 
        var customerLength=customer.data.length;
        if (customerLength === 0) {
            return []
        }

        //if exist suscription, get all his data
        var list=[]
        for(var i=0;i<customerLength;i++){
            // get the customer ID
            const customerId = customer.data[i].id;
            // get the suscription of the customer
            const suscripciones = await stripe.subscriptions.list({
                customer: customerId
            });
            //console.log(suscripciones)
            list.push(suscripciones.data)
        }

        return list;
    } catch (error) {
        console.log('Error al obtener las subscription: ' + error.message)
        //throw new Error('Error al obtener las suscripciones: ' + error.message);
        return []
    }
}

async function create_subscription(req,pack){
    const {session_id}=req.params; //this is the key of stripe of the buy of the subscription 
    const dataSubscription = await stripe.checkout.sessions.retrieve(session_id); //get the id of the subscription
    const idSubscription = dataSubscription.subscription;
    
    
    //we will waching if the subscription is activate for save the data in the database
    const subscription = await stripe.subscriptions.retrieve(idSubscription); //get the data subscription 
    const status = subscription.status; //get the status of the suscription (active,canceled)
    await create_subscription_free(req,pack); //this is for that the user not can get other pack free

    if(status!='canceled'){
        //if the subscription is activate, save the ID in the database 
        await save_subscription_in_database(idSubscription,req.user.id,pack);
    }
}

async function create_subscription_free(req,pack){
    //we will watching if the user not to used his free pack and if the pack that buy is the free pack
    if(req.user.id_packs_fud==0 && pack==13){
        try {
            //if the user can use his free pack and buy the free pack , we will updating his status in the database
            const queryText = 'UPDATE "Fud".users SET id_packs_fud = $1 WHERE id = $2';
            const values = [1, req.user.id];
            await database.query(queryText, values); //update the status
            return true;
          } catch (error) {
            console.error('Error al actualizar id_packs_fud:', error);
            return false;
          }
    }
}

async function save_subscription_in_database(id_subscription,id_user,id_packs_fud){
    const queryText = `
      INSERT INTO "User".subscription (id, id_users, id_packs_fud, initial_date, final_date)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (id) DO NOTHING
    `;
    //get the date buy
    var initialDate = new Date();

    // we will calculating the date final (30 days next)
    var finalDate = initialDate;
    finalDate.setDate(finalDate.getDate() + 30);


    const values = [id_subscription,id_user, id_packs_fud,initialDate,finalDate];
  
    try {
      await database.query(queryText, values);
      console.error('Subscription save');
      return true;
    } catch (error) {
      console.error('Error al guardar la suscripción en la base de datos:', error);
      return false;
    }
}

async function create_subscription_app(req,pack){
    const {session_id}=req.params; //this is the key of stripe of the buy of the subscription 
    const dataSubscription = await stripe.checkout.sessions.retrieve(session_id); //get the id of the subscription
    const idSubscription = dataSubscription.subscription;
    
    
    //we will waching if the subscription is activate for save the data in the database
    const subscription = await stripe.subscriptions.retrieve(idSubscription); //get the data subscription 
    const status = subscription.status; //get the status of the suscription (active,canceled)

    if(status!='canceled'){
        //if the subscription is activate, save the ID in the database 
        await save_subscription_in_database(idSubscription,req.user.id,pack);
    }
}

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






module.exports = {
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
};