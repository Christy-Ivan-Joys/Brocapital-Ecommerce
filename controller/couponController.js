const db = require('../Config/connection')
const mongoose = require('mongoose')
const User = require('../model/usermodel')
const Product = require('../model/productmodel')
const Order = require('../model/ordermodel')
const Category = require('../model/categorymodel')
const Coupon = require('../model/couponmodel')





const couponPage = async (req, res) => {
    try {
        const coupon = await Coupon.find()

        const itemsperPage = 8
        const currentPage = parseInt(req.query.page) || 1
        const startIndex = (currentPage - 1) * itemsperPage
        const endIndex = startIndex + itemsperPage
        const totalPages = Math.ceil(coupon.length / 8)

        const coupons = coupon.slice(startIndex, endIndex)

        res.render('Admin/couponlist', { coupons,totalPages,currentPage })

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

   
        const couponid=req.body._id
        const startDate = new Date(req.body.startdate)
        const endDate = new Date(req.body.enddate)
       
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);

        const couponData = req.body
       

        const ExistingCoupon = await Coupon.findOne({
            $and: [
                { _id: { $ne: couponid } }, {
                    $or: [
                        { code: req.body.code }, { name: req.body.couponname }]
                }]
        })



       
        if (ExistingCoupon) {
            let couponexist = true
            res.render('Admin/addcoupon', { couponexist })
            console.log('coupon already exist')
            couponexist = false

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
       
        if (coupon) {
            const expirydate = coupon?.Enddate ? coupon.Enddate : undefined;
            const alreadyUsed = await Coupon.findOne({ _id: coupon._id, user: { $in: [userId] } });
            const minPrice = coupon.minprice
            if (grandtotal >= minPrice) {


                if (grandtotal !== 0) {


                    if (currentdate <= expirydate) {

                        if (alreadyUsed === null) {

                            const discount = coupon.discount

                            const Discount = grandtotal * discount / 100
                            const discountedvalue = grandtotal - grandtotal * discount / 100



                            res.json({ status: true, discountedvalue, Discount, coupon })

                        } else {

                            res.json({ alreadyUsed: true })
                        }

                    } else {
                        console.log('error as the coupon expired')
                        res.json({ expired: true })
                    }

                } else {
                    res.json({ fullPaidwithWallet: true })
                }

            } else {
                console.log('minimum value error')
                res.json({ MinpurchaseError: true,minPrice })
            }

        } else {
            console.log('invalid coupon')
            res.json({ Invalidcoupon: true })
        }

    } catch (error) {
        console.log('error happend in coupon contrl in applyCoupon', error)
    }
}
const editCouponPage = async (req, res) => {
    try {
        const couponid = req.query.id
        const coupon = await Coupon.findById(couponid)
        if (req.session.Err) {

            req.session.Err = false

            res.render('Admin/editcoupon', { coupon, Err: 'Coupon already exist' })
        } else {
            res.render('Admin/editcoupon', { coupon, Err: '' })
        }

    } catch (error) {
        console.log('error happend in coupon contlr in editcoupon', error)
    }
}
const editcoupon = async (req, res) => {
    try {
        const couponid = req.query.id
        const data = req.body
        const ExistingCoupon = await Coupon.findOne({
            $and: [
                { _id: { $ne: couponid } }, {
                    $or: [
                        { code: req.body.code }, { name: req.body.couponname }]
                }]
        })

        if (ExistingCoupon) {
            req.session.Err = true
         
            res.redirect(`/admin/editCoupon?id=${couponid}`)
        } else {
            
            const coupon = await Coupon.findById()
            const update = await Coupon.findByIdAndUpdate(couponid, {
                name: data.couponname,
                code: data.code,
                startdate: data.startdate,
                Enddate: data.enddate,
                description: data.description,
                discount: data.discount,
                minprice: data.minPrice,
            }, { new: true })
           
            res.redirect('/admin/couponPage')
        }
    } catch (error) {
        console.log('errror happend in coupon contrl in editcoupon', error)
    }
}
const deleteCoupon = async (req, res) => {
    try {
        const id = req.query.CouponID
        
        const coupon = await Coupon.findByIdAndDelete(id)
      
        res.json({ deleted: true })

    } catch (error) {
        console.log('error happend in coupon COntrl in deleteCoupon', error)

    }
}
module.exports = {
    couponPage,
    createCoupon,
    addcoupon,
    applyCoupon,
    editCouponPage,
    editcoupon,
    deleteCoupon,

}



