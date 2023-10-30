const express=require('express');
const router=express.Router();
const passport=require('passport');
const {isLoggedIn,isNotLoggedIn}=require('../lib/auth');

router.get('/fud/signup',isNotLoggedIn,(req,res)=>{
    res.render('links/web/singup');
});

router.get('/fud/login',isNotLoggedIn,(req,res)=>{
    res.render('links/web/login');
});

router.get('/fud/logout',(req,res)=>{
    req.logout(function(err) {
        if (err) {
          console.error('Error al desautenticar:', err);
          return res.status(500).json({ message: 'Error al desautenticar' });
        }
        res.redirect('/fud/login');
    })
});

router.post('/fud/signup',passport.authenticate('local.signup',{
        successRedirect: '/fud/home',
        failureRedirect: '/fud/signup',
        failureFlash:true
}));

router.post('/fud/login',passport.authenticate('local.login',{
    successRedirect: '/fud/home',
    failureRedirect: '/fud/login',
    failureFlash:true
}));

//from
router.post('/fud/addCompany',passport.authenticate('local.add_company',{
    successRedirect: '/fud/add-company',
    failureRedirect: '/fud/add-company',
    failureFlash:true
}));

router.post('/fud/editCompany',passport.authenticate('local.edit_company',{
    successRedirect: '/fud/home',
    failureRedirect: '/fud/home',
    failureFlash:true
}));

router.post('/fud/:id/add-department',passport.authenticate('local.add_department',{
    successRedirect: '/fud/home', // /fud/:id/food-department
    failureRedirect: '/fud/home',
    failureFlash:true
}));

//fud/13/food-department




module.exports=router;