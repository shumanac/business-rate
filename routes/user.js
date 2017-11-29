var passport = require('../config/passport.js');

module.exports = (app, passport) => {
    app.get('/' , function(req, res, next){
        res.render('index', {title: 'Index || RateMe'});
    });

    
    app.get('/signup', (req, res) => {
        var errors = req.flash('error');
        res.render('user/signup', {title: 'Sign Up || RateMe', messages: errors, hasErrors: errors.length > 0});
    });

    app.post('/signup', passport.authenticate('local.signup', {
        successRedirect: '/home',
        failureRedirect: '/signup',
        failureFlash : true
    }));
    app.get('/login', (req, res)=> {
        res.render('user/login', {title: "Login || RateMe"});
    });
    
}