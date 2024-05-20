const express=require('express');
const morgan=require('morgan');
const {engine}=require('express-handlebars');
const multer=require('multer');
const flash=require('connect-flash');
const session=require('express-session');
const passport=require('passport');
const { database } = require('./keys');

const { v4: uuid } = require('uuid');
const path=require('path');

//ReCAPTCHA of Google
const { RecaptchaV2 } = require('express-recaptcha');

//------------------initializations 
const app=express();
require('./lib/passport');
//require('./lib/addFrom');
require('./lib/editFrom');

//------------------settings
app.set('port',process.env.PORT || 8080);
app.set('views',path.join(__dirname,'views'))
app.engine('.hbs',engine({ //we will create the engine for the web
    defaultLayout:'main',
    layoutsDir: path.join(app.get('views'),'layouts'),
    partialsDir: path.join(app.get('views'),'partials'),
    extname: '.hbs',
    helpers:require('./lib/handlebars')
}))
app.set('view engine','.hbs');


//------------------middlewares
require('dotenv').config();
const {APP_PG_USER,APP_PG_HOST,APP_PG_DATABASE,APP_PG_PASSWORD,APP_PG_PORT}=process.env; //this code is for get the data of the database

const pg = require('pg');
const pgPool = new pg.Pool({
    user: APP_PG_USER,
    host: APP_PG_HOST,
    database: APP_PG_DATABASE,
    password: APP_PG_PASSWORD,
    port: APP_PG_PORT,
    ssl: {
        rejectUnauthorized: false,
    }
});
app.use(session({
    secret: 'FudSession',
    resave: false ,
    saveUninitialized:false,
    store: new (require('connect-pg-simple')(session))({
        pool : pgPool,
        tableName : 'session'  
      }),
    //store: new MySQLStore(pool)
}));

const {MY_SITE_KEYS,MY_SECRET_KEY}=process.env; //this code is for get the data of the database
const recaptcha = new RecaptchaV2(MY_SITE_KEYS, MY_SECRET_KEY); //this is for load the Recaptcha in the web for delete to the bots
app.use(recaptcha.middleware.verify);


//------------------activate the our library 
app.use(flash());
app.use(morgan('dev'));
app.use(express.urlencoded({extended:false}));
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());

const storage=multer.diskStorage({ //this function is for load a image in the forms
    destination: path.join(__dirname,'public/img/uploads'),
    filename: (req,file,cb,filename)=>{
        cb(null,uuid()+path.extname(file.originalname));
    }
});

app.use(multer({storage: storage}).single('image'));


//------------------global variables
app.use((req,res,next)=>{
    app.locals.success=req.flash('success');
    app.locals.message=req.flash('message');
    app.locals.user=req.user;
    app.locals.company=req.company;
    next();
});

//------------------routes
const companyName='/fud' //Füd
app.use(require('./router'))
app.use(require('./router/authentication'))
app.use(companyName,require('./router/links'))
app.use(require('./lib/addFrom'));

//add database
//app.use(companyName,require('./router/addDatabase'))

//public
app.use(express.static(path.join(__dirname,'public')));

//starting the server
app.listen(app.get('port'),()=>{
    console.log('server on port ',app.get('port'));
});

//python
/*
const {spawn}=require('child_process');
//const { database } = require('./keys');
const pythonPath='src/dataScine/script.py';
const arg=['a','a'];
const pythonProcess=spawn('python',[pythonPath,...arg]);
pythonProcess.stdout.on('data',(data)=>{
    const output=data.toString();
    console.log('salida del script python: ', output);
});
pythonProcess.stderr.on('data',(data)=>{
    const output=data.toString();
    console.log('salida del script python: ${output}', output);
});
pythonProcess.on('close',(code)=>{
    const output=code.toString();
    console.log('python a cerrado ',output);
});*/
