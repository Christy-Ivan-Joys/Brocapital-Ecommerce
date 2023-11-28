const db = require('../Config/connection')
const mongoose = require('mongoose')
const User = require('../model/usermodel')
const Product = require('../model/productmodel')
const Order = require('../model/ordermodel')
const Category = require('../model/categorymodel')
const Coupon = require('../model/couponmodel')





const couponPage = async (req, res) => {
    try {
        const coupons = await Coupon.find()


        res.render('Admin/couponlist', { coupons })

    } catch (error) {
        console.log('error happend in coupon contlr in couponPage', error)

    }
}

const createCoupon = async (req, res) => {
    try {
        let couponexist = false
        res.render('Admin/addcoupon', { couponexist })
    } catch (error) {
        console.log('error happend in coupon contlr in createcoupon', error)

    }
}


const addcoupon = async (req, res) => {
    try {
        console.log(req.body)

        const startDate = new Date(req.body.startdate)
        const endDate = new Date(req.body.enddate)
        console.log(startDate, endDate)
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);

        const couponData = req.body
        const existCoupon = await Coupon.findOne({ code: { $regex: new RegExp(req.body.code, 'i') } })
        console.log(existCoupon ? existCoupon : null)
        if (existCoupon) {
            let couponexist = true
            res.render('Admin/addcoupon', { couponexist })
            console.log('coupon already exist')

        } else {

            const coupon = new Coupon({
                name: couponData.couponname,
                code: couponData.code,
                startdate: startDate,
                Enddate: endDate,
                description: couponData.description,
                discount: couponData.discount,
                minprice: couponData.minPrice,
            })
            console.log(coupon)
            await coupon.save()
            res.redirect('/admin/couponPage')

        }




    } catch (error) {
        console.log('error happend in coupon cotrl in addcoupon', error)

    }
}
const applyCoupon = async (req, res) => {
    try {
        const userId = req.session.user
        const currentdate = new Date()
        currentdate.setHours(0, 0, 0, 0);

        const couponcode = req.body.couponCode
        const grandtotal = req.body.grandtotal
        const coupon = await Coupon.findOne({ code: couponcode })
        const expirydate = coupon.Enddate

        console.log(coupon._id)
        const alreadyUsed = await Coupon.findOne({ _id: coupon._id, user: { $in: [userId] } });

        console.log('useddddddddddddddddddddddddddddddddd', alreadyUsed)
        console.log(currentdate, expirydate)


        if (currentdate <= expirydate) {
            console.log('yessssssssssssss')
            if (alreadyUsed === null) {
                console.log('else')
                const discount = coupon.discount
                
                const Discount = grandtotal * discount / 100
                const discountedvalue = grandtotal - grandtotal * discount / 100
                const update = await Coupon.findByIdAndUpdate(coupon._id, { $push: { user: userId } }, { new: true })
                
               
                res.json({ status: true, discountedvalue, Discount })

            }else{
                console.log('alereadt')
                res.json({alreadyUsed:true})
            }

        } else {
            console.log('error as the coupon expired')
            res.json({expired: true })
        }






    } catch (error) {
        console.log('error happend in coupon contrl in applyCoupon', error)
    }
}
const editCouponPage = async (req, res) => {
    try {
        const couponid = req.query.id
        const coupon = await Coupon.findById(couponid)
        res.render('Admin/editcoupon', { coupon })
    } catch (error) {
        console.log('error happend in coupon contlr in editcoupon', error)
    }
}
const editcoupon = async (req, res) => {
    try {
        const couponid = req.query.id
        const data = req.body
        console.log(data, couponid)
        const update = await Coupon.findByIdAndUpdate(couponid, {
            name: data.couponname,
            code: data.code,
            startdate: data.startdate,
            Enddate: data.enddate,
            description: data.description,
            discount: data.discount,
            minprice: data.minPrice,
        }, { new: true })
        console.log(update)
        res.redirect('/admin/couponPage')
    } catch (error) {
        console.log('errror happend in coupon contrl in editcoupon', error)
    }
}
module.exports = {
    couponPage,
    createCoupon,
    addcoupon,
    applyCoupon,
    editCouponPage,
    editcoupon,

}



