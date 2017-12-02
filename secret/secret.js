module.exports = {
    auth:{
        user: 'shumana.chowdhury186@gmail.com ',
        pass: ''
    },

    facebook: {
        clientID: '1737679586527252',
        clientSecret: 'b5c3a0d9a5fefacf871a664c0920a0a9',
        profileFields: [ 'email', 'dispalyName'],
        callbackURL: 'http://localhost:3000/auth/facebook/callback',
        passReqToCallback: true
    }
}
