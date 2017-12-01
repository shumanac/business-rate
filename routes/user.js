var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var async = require('async');

var crypto = require('crypto');
var User = require('../models/user');
var secret = require('../secret/secret');


var passport = require('../config/passport.js');

module.exports = (app, passport) => {
    app.get('/' , function(req, res, next){
        
        if(req.session.cookie.originalMaxAge !== null){
            res.redirect('/home');
        }else{
            res.render('index', {title: 'Index || RateMe'});
        }
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
     //   successRedirect: '/home',
        failureRedirect: '/login',
        failureFlash : true
    }), (req, res) => {
        if(req.body.rememberme){
            req.session.cookie.maxAge = 30*24*60*60*1000; //30 days
        }else{
            req.session.cookie.expires = null;
        }
        res.redirect('/home');
    });

    app.use('/auth/facebook', passport.authenticate('facebook'));
    app.use('/auth/facebook/callback', passport.authenticate('facebook', {

        successRedirect: '/home',
        failureRedirect: '/login',
        failureFlash: true
    }))

    

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
                crypto.randomBytes(20, (err, buf) => {
                    var rand = buf.toString('hex');
                    callback(err, rand);
                });
            },
            
            function(rand, callback){
                User.findOne({'email':req.body.email}, (err, user) => {
                    if(!user){
                        req.flash('error', 'No Account With That Email Exist Or Email is Invalid');
                        return res.redirect('/forgot');
                    }
                    
                    user.passwordResetToken = rand;
                    user.passwordResetExpires = Date.now() + 60*60*1000;
                    
                    user.save((err) => {
                        callback(err, rand, user);
                    });
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
                    from: 'RateMe '+'<'+secret.auth.user+'>',
                    subject: 'RateMe Application Password Reset Token',
                    text: 'You have requested for password reset token. \n\n'+
                        'Please click on the link to complete the process: \n\n'+
                        'http://localhost:3000/reset/'+rand+'\n\n'
                };
                
                smtpTransport.sendMail(mailOptions, (err, response) => {
                   req.flash('info', 'A password reset token has been sent to '+user.email);
                    return callback(err, user);
                });
            }
        ], (err) => {
            if(err){
                return next(err);
            }
            
            res.redirect('/forgot');
        })
    });
    
app.get('/logout', (req, res) =>{
    req.logout();
    req.session.destroy((err) => {
        res.redirect('/');
    })
})

    


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