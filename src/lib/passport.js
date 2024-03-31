const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy; 

const database=require('../database');
const helpers=require('../lib/helpers.js');

const sendEmail = require('../lib/sendEmail.js'); //this is for send emails 

passport.use('local.login', new LocalStrategy({
    usernameField: 'userName',
    passwordField: 'password',
    passReqToCallback: true
}, async (req ,userName, password, done) => {
    const user=await search_user(userName);
    if(user.rows.length>0){
        //we will watch if the password is correct
        if (await helpers.matchPassword(password,user.rows[0].password)){
            done(null,user.rows[0],req.flash('success','Welcome '+user.rows[0].user_name));
        }
        else{
            done(null,false,req.flash('message','Your password is incorrect'));
        }
    }
    else{
        done(null,false,req.flash('message','invalid user'));
    }
}));

async function search_user(email){
    var queryText = 'SELECT * FROM "Fud".users WHERE email = $1';
    var values = [email] 
    return await database.query(queryText, values);
}

passport.use('local.signup', new LocalStrategy({
    usernameField: 'userName',
    passwordField: 'password',
    emailField:'email',
    passwordField: 'password',
    acceptTermsField:'acceptTerms',
    passReqToCallback: true
}, async (req ,userName, password, done) => {
    const {email,Name,confirmPassword,acceptTerms} = req.body;
    
    //we will watch if the user on the terms and conditions
    if(acceptTerms==undefined){
        done(null,false,req.flash('message','You must accept the terms and conditions to continue'));
    }
    else{
        //we will see if all the data was registered
        if(all_data_exists(req)){
            //we will see if this user is new
            if (!await this_user_exists(userName)){
                    //we will see if this email is new
                    if(!await this_email_exists(email)){
                        //we will watch if the passwords are equal
                        if (compare_password(password,confirmPassword)){
                            //create a new user 
                            const newUser=await create_a_new_user(req,userName,password);
                            return done(null,newUser);
                        }
                        else{
                            done(null,false,req.flash('message','Double check your passwords'));
                        }
                    }
                    else{
                        done(null,false,req.flash('message','This email already exists'));
                    }
            }
            else{
                done(null,false,req.flash('message','This user already exists'));
            }
        }
        else{
            done(null,false,req.flash('message','You need to fill in all the required fields'));
        }
    }


    console.log(req.body);
}));


async function create_a_new_user(req,userName,password){
    const {first_name,second_name,last_name,email,birthday} = req.body; //get the value of the from
    //create a new user 
    const newUser={
        user_name:userName,
        first_name: first_name,
        second_name: second_name,
        last_name: last_name,
        email:email,
        password:password,
        birthday:birthday
    };

    newUser.password=await helpers.encryptPassword(password); //create a password encrypt
    //add the user to the database
    if(await add_user(newUser)){
        //if the user was add with success, sen a email of welcome 
        subjectEmail=''
        const nameUser=first_name+' '+second_name+' '+last_name;
        await sendEmail.welcome_email(email,nameUser);
    }

    //add the id of the user 
    newUser.id=await search_id(email);    

    return newUser;
}


async function this_user_exists(user_name){
    var queryText = 'SELECT * FROM "Fud".users Where user_name = $1';
    var values = [user_name];
    var user=await database.query(queryText, values);
    return user.rows.length>0
}

async function this_email_exists(email){
    var queryText = 'SELECT * FROM "Fud".users Where email = $1';
    var values = [email];
    var user=await database.query(queryText, values);
    return user.rows.length>0
}

function all_data_exists(req){
    const {Name,email,birthday} = req.body;
    return Name!='' && email!='' && birthday!=''
}



function compare_password(P1,P2){
    if (P1==''){
        return false;
    }

    return P1==P2;
}

async function search_id(email){
    var queryText = 'SELECT id FROM "Fud".users WHERE email = $1';
    var values = [email];
    const result = await database.query(queryText, values);
    return result.rows[0].id;
}

async function add_user(user){
    try {
        var queryText = 'INSERT INTO "Fud".users (user_name, first_name,second_name,last_name, email, password, rol_user, id_packs_fud) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)';
        var values = [user.user_name,user.first_name,user.second_name,user.last_name,user.email,user.password,0,0] 
        await database.query(queryText, values);
        return true;
    } catch (error) {
        console.error('Error to add the a new user of the database:', error);
        return false;
    }
}






//this function not mov
passport.serializeUser((user,done)=>{
    done(null,user.id);
});

passport.deserializeUser(async (id,done)=>{
    var queryText = 'SELECT * FROM "Fud".users Where id = $1';
    var values = [id];
    const obj = await database.query(queryText, values);

    done(null,obj.rows[0]);
});
