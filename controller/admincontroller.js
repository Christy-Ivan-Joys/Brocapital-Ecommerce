const db = require('../Config/connection')
const mongoose = require('mongoose')
const User = require('../model/usermodel')


const Aloginpage = async (req, res) => {

    try {
        if (req.session.isAdmin) {
            res.redirect('/admin/dashboard')
        } else {

            res.render('Admin/Alogin')
        }


    } catch (error) {
        console.log('Error in admin login render', error)
    }
}
const Adminlogin = async (req, res) => {
    try {
        console.log('hello admin login', req.body)
        const { email, password } = req.body
        const admin = await User.findOne({ $and: [{ email: email }, { isAdmin: 1 }] })

        if (admin) {
            if (admin.password == password) {
                req.session.isAdmin = true
                res.redirect('/admin/dashboard')
            } else {
                let passerror = true
                res.render('Admin/Alogin', { passerror })
            }



        } else {
            let usererror = true
            res.render('Admin/Alogin', { usererror })
        }
    } catch (error) {
        console.log('error happend in admin contrl in alogin', error);
    }
}

const dashboard = async (req, res) => {
    try {
        if (req.session.isAdmin) {
            res.render('Admin/Dashboard')
        } else {
            res.redirect('/admin')
        }
    } catch (error) {
    }
}
const AdminLogout = async (req, res) => {
    try {
        req.session.isAdmin = null
        res.redirect('/admin')

    } catch (error) {
        console.log('Error happend in ADMIN logout cntlr', error);
    }
}



module.exports = {
    Aloginpage,
    Adminlogin,
    dashboard,
    AdminLogout,
}