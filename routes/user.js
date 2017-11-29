module.exports = (app) => {
    app.get('/' , function(req, res, next){
        res.render('index', {title: 'Index || RateMe'});
    });


    app.get('/signup', (req, res)=> {
        res.render('user/signup', {title: "Sign Up || RateMe"});
    });

    
    app.get('/login', (req, res)=> {
        res.render('user/login', {title: "Login || RateMe"});
    });
    
}