const User = require('../model/usermodel')
const Product = require('../model/productmodel')
const Order = require('../model/ordermodel')
const db = require('../Config/connection')
const mongoose = require('mongoose')
const Coupon = require('../model/couponmodel')
const Razorpay = require('razorpay')
const { constants } = require('buffer')
require('dotenv').config()

var instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET_KEY

})

const cartPage = async (req, res) => {
    try {
        let Id = req.session.user
        if (Id) {
            const coupons = await Coupon.find()
            const product = await Product.find()
            const user = await User.findById(Id)

            const cartItemsId = user.cart.map(item => item.productId)
            const cartItems = await Product.find({ _id: { $in: cartItemsId } })

            const productMap = new Map(cartItems.map(product => [product._id.toString(), product]));
            const sortedCartItems = cartItemsId.map(id => productMap.get(id));
            let cart = user.cart

            const ShortQuanitityUpdate = sortedCartItems.filter(async product => {
                const cartItem = cart.find(cartItem => cartItem.productId.toString() === product._id.toString())
                if (product.quantity < cartItem.quantity) {
                    const update = await User.updateOne({ _id: Id, 'cart.productId': cartItem._id }, { $set: { 'cart.$.quantity': product.quantity } })
                    console.log(update)
                }
            })

            const subtotal = cart.reduce((total, item) => total + (item.quantity * item.price), 0)
            const grandtotal = subtotal



            if (user) {

                res.render('User/cart', { user, cart, sortedCartItems, cartItemsId, subtotal, grandtotal, coupons })

            } else {
                res.redirect('/')
            }
        } else {
            res.redirect('/')
        }

    } catch (error) {
        console.log('error happend in cart contrl in cartpage', error);
    }
}



const addtoCart = async (req, res) => {
    try {
   
        const size = req.params.size
      
        const Id = req.params.id
        const product = await Product.findById(Id)
        const user = req.session.user
        const AlreadyInCart = await User.findOne({ _id: user }, { cart: { $elemMatch: { productId: Id } } })

        if (AlreadyInCart.cart.length === 0) {


            if (product.quantity >= 1) {
                const userData = await User.findById(user)
                if (userData) {
                    const Proexist = userData.cart.find(product => product.productId === Id)
                
                    if (Proexist) {

                        const ProUpdate = await User.updateOne({
                            _id: user, 'cart.productId': Id
                        },
                            {
                                $inc: {

                                    'cart.$.quantity': 1,



                                }
                            })
                        res.status(200).json({ success: true })

                    } else {

                        userData.cart.push({
                            productId: Id,
                            quantity: 1,
                            price: product.price,
                            size: size

                        })
                        await userData.save()
                        res.status(200).json({ success: true })
                    }

                }


            } else {
                res.status(500).send({ status: false })
            }
        } else {
            
            res.json({ alreadyExist: true })
        }


    } catch (error) {
        console.log('error happend in user contrl in addtocart', error);

    }
}
const updateCart = async (req, res) => {
    try {
       
        const Id = req.body.productId
        const count = req.body.count
        const userId = req.session.user
        const user = await User.findById(userId)
        const product = await Product.findById(Id)


        if (user) {
          
            const existingCartItem = user.cart.find((item => item.productId === Id))

            
            
            if (existingCartItem) {
               
                let newQty
                if (count == 1) {
                    newQty = existingCartItem.quantity + 1
                    console.log('i am inside', newQty)

                } else
                    if (count == -1) {

                        newQty = existingCartItem.quantity - 1

                    } else {

                        res.status(400).send({ status: false, error: 'Unexpected error !' })
                    }
                if (newQty > 0 && newQty <= product.quantity) {
                   
                    const update = await User.updateOne(
                        {
                            _id: userId, 'cart.productId': Id
                        },
                        {
                            $set: {

                                'cart.$.quantity': newQty,


                            }
                        })

                    const updatedCart = await user.save()
                   

                    res.status(200).send({ status: true, quantityInput: newQty })

                } else {

                    res.json({ status: false, error: 'out of stock' })
                }

            }
        }

    } catch (error) {
        console.log('error happend in cart contrl in updateCart', error)

    }
}

const checkoutPage = async (req, res) => {
    try {
        const user = req.session.user


        const coupons = await Coupon.find()
        if (user) {
            const userDetails = await User.findById(user)
            const cart = userDetails.cart
            const Address = userDetails.address

            const cartItemsId = userDetails.cart.map(item => item.productId)
            const cartItems = await Product.find({ _id: { $in: cartItemsId } })
            const productMap = new Map(cartItems.map(product => [product._id.toString(), product]));
            const sortedCartItems = cartItemsId.map(id => productMap.get(id))

            await Promise.all(cart.map(async (cartItem) => {
                const item = await Product.findById(cartItem.productId)
                if (item && item.quantity < cartItem.quantity) {
                    const update = await User.updateOne({ _id: user, 'cart.productId': item._id.toString() }, { $set: { 'cart.$.quantity': item.quantity } })
                }
            }))

        

            const details = await User.findById(user)
            const Cart = details.cart
           
            let grandtotal = 0;
            for (let i = 0; i < Cart.length; i++) {
                grandtotal += cartItems[i].price * Cart[i].quantity;
            }
            res.render('User/checkout', { user, sortedCartItems, Cart, Address, grandtotal, coupons, userDetails })

        } else {
            res.redirect('/')
        }



    } catch (error) {
        console.log('error happend in cart contrl in checkoutPage', error);
    }
}
const deleteCartItem = async (req, res) => {
    try {
        const userId = req.session.user
        const itemId = req.body.cartItemId
        const walletAmount=req.body.walletAmountApplied
        if(walletAmount!==undefined){
            const ID= new mongoose.Types.ObjectId(userId);
           const  walletAppliedReturn=await User.findByIdAndUpdate(ID,{$inc:{wallet:walletAmount}})
          
        }

       
        const user = await User.findById(userId)

        const cartItem = user.cart.findIndex(item => item.productId === itemId)
        const cartquatity = user.cart[cartItem].quantity
        
        if (cartItem !== -1) {
            user.cart.splice(cartItem, 1)
            await user.save()
            res.status(200).send({ status: true })
        } else {
            res.status(500).send({ status: false })
            console.log('error in deleting cartItem')
        }


    } catch (error) {
        console.log('error happend in cart contrl in deletecartitem', error)

    }
}
const placeOrder = async (req, res) => {
    try {
        
        let userid = req.session.user
        const data = req.body
        var grandtotal = parseInt(req.body.currentTotalNumber)
        const paymentMethod = req.body.payment
        const user = await User.findById(userID)
        const addressid = req.body.addressId
        const cart = user.cart

        var couponId = data['couponName[_id]'] ?? null
        
        if (couponId !== null) {
            var coupon = await Coupon.findById(couponId)
        
        }


        const cartItemsId = user.cart.map(item => item.productId)
        const cartItems = await Product.find({ _id: { $in: cartItemsId } })
        const productMap=new Map(cartItems.map(product=>[product._id.toString(),product]))
        const sortedCartItems=cartItems.map(id=>productMap.get(id))
       
      await Promise.all(cart.map(async(cartItem)=>{
        const item=await Product.findById(cartItem.productId)
        if(item && item.quantity<cartItem.quantity){
            const update=await User.updateOne({_id:userID,'cart.productId':item._id.toString()},
            {$set:{'cart.$.quantity':item.quantity}},{new:true})
           
        }
        
      }))

const AfterUpdateUser=await User.findById(userID)
const Cart=AfterUpdateUser.cart

        const address = user.address.id(addressid)
        if (paymentMethod == 'cod') {
            paymentstatus = 'completed'
        } else if (paymentMethod == 'wallet') {
            paymentstatus = 'completed'
            grandtotal = req.body.currentTotalNumber

        } else if (paymentMethod === 'razorpay') {
            paymentstatus = 'pending'
        }


        var order = new Order({
            user: userID,
            totalprice: grandtotal,
            products: Cart,
            createdOn:new Date(),
            Address: address,
            status: 'pending',
            paymentMethod: paymentMethod,
            paymentStatus: paymentstatus,
        })
        order.save()


        if (order) {
            if (paymentMethod == 'cod' || paymentMethod == 'wallet') {
                for (const cartItem of Cart) {
                    var product = await Product.findById(cartItem.productId)
                    if (product) {
                        if (coupon) {
                            const update = await Coupon.findByIdAndUpdate(coupon._id, { $push: { user: userID } }, { new: true })
                           
                            product.quantity -= cartItem.quantity
                            await product.save()
                        } else {
                            product.quantity -= cartItem.quantity
                            await product.save()
                        }

                    }
                }
                res.status(200).send({ status: true })
                await User.updateOne({ _id: userID }, { $unset: { cart: 1 } })

            } else if (paymentMethod == 'razorpay') {

                var options = {

                    amount: grandtotal * 100,
                    currency: "INR",
                    receipt: "" + order._id
                }
                instance.orders.create(options, async function (err, order) {
                    if (err) {

                        console.log('error happend in creating order in razorpay', err)
                    } else {
                        for (const cartItem of Cart) {
                            var product = await Product.findById(cartItem.productId)
                            if (product) {
                                if (coupon) {
                                    const update = await Coupon.findByIdAndUpdate(coupon._id, { $push: { user: userID } }, { new: true })
                                    product.quantity -= cartItem.quantity
                                    await product.save()
                                } else {
                                    product.quantity -= cartItem.quantity
                                    await product.save()
                                }

                            }
                        }

                        res.json({ order: order, razorpay: true })
                        const razorpayCart = await User.updateOne({ _id: userID }, { $unset: { cart: 1 } })
                        

                    }
                })
            }



        } else {
            res.status(400).send({ status: false })
        }


    } catch (error) {
        console.log('error happend in user contrl', error)

    }
}

const verifyRazPayment = async (req, res) => {
    try {

        
        const details = req.body
        const crypto = require('crypto')
        let hmac = crypto.createHmac('sha256', process.env.RAZORPAY_SECRET_KEY)
        hmac.update(details['response[razorpay_order_id]'] + '|' + details['response[razorpay_payment_id]'])
        hmac = hmac.digest('hex')
        if (hmac == details['response[razorpay_signature]']) {
            const order = await Order.findByIdAndUpdate(req.body['order[receipt]'], { $set: { paymentStatus: 'completed', paymentMethod: 'razorpay' } }).

                then((status) => {
                    res.json(true)

                }).catch((err) => {
                    res.json({ RazorpayFailure: true })

                })
        }
    } catch (error) {
        console.log('error happend in cart contrl in verifyRazpayment', error)

    }
}
const cancelOrder = async (req, res) => {
    try {

        const userId = req.session.user
        const orderId = req.params.id
        const order = await Order.findById(orderId)
        const orderProducts = order.products

        const paymentMethod = order.paymentMethod
        const productIds = orderProducts.map(item => item.productId)
        const orderProductsQuantity = order.products.map(item => item.quantity)

        if (paymentMethod === 'cod') {

            for (let i = 0; i < productIds.length; i++) {
                const productId = productIds[i]
                const returnQuantity = orderProductsQuantity[i]
                const returnproduct = await Product.findByIdAndUpdate(productId, { $inc: { quantity: returnQuantity } }, { new: true })
                console.log(returnproduct)
            }
            const order = await Order.findByIdAndUpdate(orderId, { UserOrderStatus: 'cancelled' }, { new: true })
            res.redirect('/orderDetails/' + orderId)

        } else if (paymentMethod === 'wallet' || paymentMethod === 'razorpay') {
            const oder = await Order.findById(orderId)

            const ReturnAmount = oder.totalprice

            for (let i = 0; i < productIds.length; i++) {
                const productId = productIds[i]
                const returnQuantity = orderProductsQuantity[i]
                const returnproduct = await Product.findByIdAndUpdate(productId, { $inc: { quantity: returnQuantity } }, { new: true })
                console.log(returnproduct)
            }
           
            const WalletReturn = await User.findByIdAndUpdate(userId, { $inc: { wallet: ReturnAmount } }, { new: true })
          
            const order = await Order.findByIdAndUpdate(orderId, { UserOrderStatus: 'cancelled' }, { new: true })
        
            res.redirect('/orderDetails/' + orderId)
        }



    } catch (error) {
        console.log('error happend in cartcontrl in cancelorder', error)

    }
}
const ReturnProduct = async (req, res) => {
    try {
        const userId = req.session.user
        const productId = req.params.id
        const orderId = req.params.orderId
        const order = await Order.findById(orderId)

        const payment = order.paymentMethod
        const productDetails = order.products.find(product => product.productId == productId)

        if (payment === 'cod') {
            const returnStock = await Product.findByIdAndUpdate(productId, { $inc: { quantity: productDetails.quantity } }, { new: true })
            const statusUpdate = await Order.findByIdAndUpdate(orderId, {
                $set: { 'products.$[element].isReturned': true }
            },
                { new: true, arrayFilters: [{ 'element.productId': productId }] })

        } else if (payment === 'wallet' || payment === 'razorpay') {
            const Amount = productDetails.quantity * productDetails.price

            const returnStock = await Product.findByIdAndUpdate(productId, { $inc: { quantity: productDetails.quantity } }, { new: true })

           
            const ReturnAmount = await User.findByIdAndUpdate(userId, { $inc: { wallet: Amount } }, { new: true })
          
            const statusUpdate = await Order.findByIdAndUpdate(orderId,
                { $set: { 'products.$[element].isReturned': true } },
                { new: true, arrayFilters: [{ 'element.productId': productId }] })
        }

        res.redirect('/orderDetails/' + orderId)
    } catch (error) {
        console.log('error happend in cart contrl in returnproduct', error)
    }
}

module.exports = {
    addtoCart,
    cartPage,
    updateCart,
    checkoutPage,
    deleteCartItem,
    placeOrder,
    cancelOrder,
    verifyRazPayment,
    ReturnProduct,

}