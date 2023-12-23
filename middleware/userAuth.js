const User = require('../model/usermodel')

const isLogged = ((req, res, next) => {
    if (req.session.user) {

        User.findById(req.session.user)
            .then((data) => {

                if (data.block == false) {
                    res.redirect('/')
                } else {

                    res.render('User/login', { isBlock })
                }
            })
    } else {

        next()
    }

})
const isUser = ((req, res, next) => {
    if (req.session.user) {
        console.log('hello')
        User.findById(req.session.user)
            .then((data) => {


                if (data.block == false) {

                    next()
                } else {

                    let isBlock = true
                    res.render('User/login', { isBlock })
                }
            })
    } else {

        res.redirect('/loginpage')
    }

})

module.exports = {
    isLogged,
    isUser
}