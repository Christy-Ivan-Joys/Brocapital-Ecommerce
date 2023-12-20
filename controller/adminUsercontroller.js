const db = require('../Config/connection')
const mongoose = require('mongoose')
const User = require('../model/usermodel')
const Product = require('../model/productmodel')

const showUserPage = async (req, res) => {
    try {
        const users = await User.find({isAdmin:0})
  
        res.render('Admin/UsersPage', { users })

    } catch (error) {
        console.log('error happend in adminUser contrl in showuserpage', error)

    }
}
const BlockUser = async (req, res) => {
    try {
        const Userid = req.query.id
        const BlockedUser = await User.findByIdAndUpdate(Userid, { block: true }, { new: true })
        res.redirect('/admin/showUserPage')

    } catch (error) {
        console.log('error happend in adminuser contrl in blockuser', error)
    }

}
const UnblockUser = async (req, res) => {
    try {
        const Userid = req.query.id
        const UnblockUser = await User.findByIdAndUpdate(
            Userid, { block: false }, { new: true }
            )
        res.redirect('/admin/showUserPage')

    } catch (error) {
        console.log('error happend in admincontrl unblock user', error)

    }
}

module.exports = {
    showUserPage,
    BlockUser,
    UnblockUser,
   
}