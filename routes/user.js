var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var async = require('async');

var crypto = require('crypto');
var User = require('../models/user');
var secret = require('../secret/secret');


var passport = require('../config/passport.js');

module.exports = (app, passport) => {
    app.get('/' , function(req, res, next){
        res.render('index', {title: 'Index || RateMe'});
    });

    
    app.get('/signup', (req, res) => {
        var errors = req.flash('error');
        console.log(errors);
        res.render('user/signup', {title: 'Sign Up || RateMe', messages: errors, hasErrors: errors.length > 0});
    });

    app.post('/signup', validate, passport.authenticate('local.signup', {
        successRedirect: '/',
        failureRedirect: '/signup',
        failureFlash : true
    }));
    app.get('/login', (req, res) => {
        var errors = req.flash('error');
        console.log(errors);
        res.render('user/login', {title: 'Login || RateMe', messages: errors, hasErrors: errors.length > 0});
    });

    app.post('/login', loginValidation, passport.authenticate('local.login', {
        successRedirect: '/home',
        failureRedirect: '/login',
        failureFlash : true
    }));

    app.get('/home', (req, res) => {
        res.render('home', {title:'Home || RateMe'});
    });

    app.get('/forgot', (req, res) => {
        var errors = req.flash('error');
        var info = req.flash('info');
        res.render('user/forgot', {title:'Request Password Reset', messages: errors, hasErrors:errors.length >0, info: info, noErrors:info.length >0});
    })


    app.post('/forgot', (req, res, next) => {
        async.waterfall([
            function(callback){
                crypto.randomBytes (20, (err, buf) => {
                    var rand = buf.toString('hex');
                    callback(err, rand);
                });
               
            }, 
            function(rand, callback){
                User.findOne({'email': req.body.email}, (err, user) => {
                    if(!user){
                        req.flash('error', 'No account with that email exist or email is invalid');
                       return res.redirect('/forgot');
                    }
                    user.passwordResetToken = rand;
                    user.passwordResetExpires = Date.now()+ 60*60*1000;
                    user.save((err)=>{
                        callback(err, rand, user)
                    console.log(  user.passwordResetToken);
                    })
                })
            }, 
            function(rand, user, callback){
                var smtpTransport = nodemailer.createTransport({
                    service: 'Gmail',
                    auth: {
                        user: secret.auth.user,
                        pass: secret.auth.pass
                    }
                });
                var mailOptions = {
                    to: user.email,
                    from: 'RateMe '+' <'+ secret.auth.user +'>',
                    subject: "RateMe Application Password Reset Token",
                    text: 'You have requested for password reset token. \n \n'+
                    'Please click on the link. \n \n'+
                    'http://localhost/reset/'+rand+'\n\n' 
                };
                smtpTransport.sendMail(mailOptions, (err, response) => {
                    req.flash('info', 'A password reset token has been send to'+'' + user.email);
                    return callback(err, user);
                });
            }

        ], (err) =>{
            if(err){
                return next(err);
                console.log(err);

            }
            res.redirect('/forgot');
        })
    
    
    
    });


    


function validate(req, res, next){
    req.checkBody('fullname', 'Fullname is required').notEmpty();
    req.checkBody('fullname', 'Fullname Must Not Be Less Than 5').isLength({min:5});
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('password', 'Password must contain at least 1 number').matches(/^(?=.*\d)(?=.*[a-z])[0-9a-z]{5,}$/, "i");

    var errors = req.validationErrors();

    if(errors){
        var messages = [];
        errors.forEach((errors) => {
            messages.push(errors.msg)
        });
        req.flash ('error', messages);
        res.redirect('/signup');
    }else{
        return next();
    }




}


function loginValidation(req, res, next){
   
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is Invalid').isEmail();
    req.checkBody('password', 'Password Must Not Be Less Than 5 Characters').isLength({min:5});
    req.check("password", "Password Must Contain at least 1 Number.").matches(/^(?=.*\d)(?=.*[a-z])[0-9a-z]{5,}$/, "i");

    var loginErrors = req.validationErrors();

    if(loginErrors){
        var messages = [];
        loginErrors.forEach((loginErrors) => {
            messages.push(loginErrors.msg)
        });
        req.flash ('error', messages);
        res.redirect('/login');
    }else{
        return next();
    }




}





}