const db = require('../Config/connection')
const mongoose = require('mongoose')
const User = require('../model/usermodel')
const Product = require('../model/productmodel')
const Order = require('../model/ordermodel')
const Category = require('../model/categorymodel')
const Coupon = require('../model/couponmodel')
const Razorpay = require('razorpay')
require('dotenv').config()

var instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET_KEY

})






const addMoneytoWallet = async (req, res) => {
    try {

        const amount = req.body.amount * 100
        console.log(amount)

        const orderID = generateUniqueOrderId()
        var options = {
            amount: amount,
            currency: "INR",
            receipt: orderID
        }
        instance.orders.create(options, function (err, order) {
            if (err) {
                console.log('error happend in addmoneytowallet', err)
            } else {
                console.log(order)
                res.json({ order: order })
            }
        })

    } catch (error) {
        console.log('error happend in wallet Contrl in addMoneytoWallet', error)
    }
}

function generateUniqueOrderId() {

    const timestamp = Date.now();
    const uniqueId = Math.random().toString(36).substring(2, 15);
    return `order_${timestamp}_${uniqueId}`;
}
const verifywalletPayment = async (req, res) => {
    try {
        const userId = req.session.user
        console.log(req.body)
        const details = req.body
        const crypto = require('crypto')
        let hmac = crypto.createHmac('sha256', process.env.RAZORPAY_SECRET_KEY)
        hmac.update(details['response[razorpay_order_id]'] + '|' + details['response[razorpay_payment_id]'])
        hmac = hmac.digest('hex')
        if (hmac == details['response[razorpay_signature]']) {
            const update = await User.findByIdAndUpdate(userId, {
                $inc:
                    { wallet: parseInt(details['order[amount]']) / 100 }
            }, { new: true }).
                then((status) => {
                    console.log('successsssss')
                    res.json(true)

                }).catch((err) => {
                    res.json(false)

                })
            console.log(update)
        }



    } catch (error) {
        console.log('error happend in wallercontrl in verifywallet', error)

    }
}
const applywallet = async (req, res) => {
    try {
        const userId = req.session.user
        const user = await User.findById(userId)
        const wallet = user.wallet
        console.log(user, 'wallet issss', wallet)

        const data = req.body
        console.log(data)

        if (wallet >= req.body.total) {
            const balance = wallet - req.body.total
            // await User.findByIdAndUpdate(userId, { $set: { wallet: balance } })
            
            res.json({ status: true })
        } else {
            console.log('error happend in wallet Addd in else')
            res.json({ status: false })
        }
    } catch (error) {
        console.log('error happend in walletcontrl in applywallet', error)

    }
}

module.exports = {
    addMoneytoWallet,
    verifywalletPayment,
    applywallet
}
