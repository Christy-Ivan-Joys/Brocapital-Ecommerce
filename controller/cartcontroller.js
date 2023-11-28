const User = require('../model/usermodel')
const Product = require('../model/productmodel')
const Order = require('../model/ordermodel')
const db = require('../Config/connection')
const mongoose = require('mongoose')
const Coupon = require('../model/couponmodel')
const Razorpay = require('razorpay')
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

            const cart = user.cart
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
        console.log('button call')
        const size = req.params.size
        const Id = req.params.id
        const product = await Product.findById(Id)
        const user = req.session.user
        if (product.quantity >= 1) {
            const userData = await User.findById(user)
            if (userData) {
                const Proexist = userData.cart.find(product => product.productId === Id)
                console.log(Proexist)
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
                    console.log(ProUpdate);
                    console.log(user);
                } else {
                    console.log('else worked', user)
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



    } catch (error) {
        console.log('error happend in user contrl in addtocart', error);

    }
}
const updateCart = async (req, res) => {
    try {
        console.log('i am in here')
        const Id = req.body.productId
        const count = req.body.count
        const userId = req.session.user
        const user = await User.findById(userId)
        const product = await Product.findById(Id)


        if (user) {
            console.log('i am inside')
            const existingCartItem = user.cart.find((item => item.productId === Id))

            console.log(existingCartItem)
            console.log(count);
            if (existingCartItem) {
                console.log('i am inside')
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
                    console.log('hyyyyyyyyyyy')
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
                    console.log(update)
                    console.log(updatedCart);

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
        let user = req.session.user


        const coupons = await Coupon.find()
        if (user) {
            const userDetails = await User.findById(user)
            const cart = userDetails.cart
            const Address = userDetails.address
            
            const cartItemsId = userDetails.cart.map(item => item.productId)
            const cartItems = await Product.find({ _id: { $in: cartItemsId } })
            const productMap = new Map(cartItems.map(product => [product._id.toString(), product]));
            const sortedCartItems = cartItemsId.map(id => productMap.get(id));


            console.log(cartItems)
            const filteredCartItems = cartItems.filter(item => {
                console.log(item)
                const cartItem = cart.find(cartItem => cartItem.productId.toString() === item._id.toString());

                console.log(cartItem.quantity);
                console.log(cartItem)

                return item.quantity < cartItem.quantity;
            });

            console.log(filteredCartItems)
            if (filteredCartItems) {

            }

            let grandtotal = 0;
            for (let i = 0; i < cart.length; i++) {
                grandtotal += cartItems[i].price * cart[i].quantity;
            }
            res.render('User/checkout', { user, sortedCartItems, cart, Address, grandtotal, coupons, userDetails })

        } else {
            res.redirect('/')
        }



    } catch (error) {
        console.log('error happend in cart contrl in checkoutPage', error);
    }
}
const deleteCartItem = async (req, res) => {
    try {
        console.log('i am herer')
        const itemId = req.body.cartItemId

        const userId = req.session.user
        const user = await User.findById(userId)

        const cartItem = user.cart.findIndex(item => item.productId === itemId)
        const cartquatity = user.cart[cartItem].quantity
        console.log(cartquatity)
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

        let userID = req.session.user
        const data = req.body
        console.log(req.body)
        var grandtotal = parseInt(req.body.currentTotalNumber)
        const paymentMethod = req.body.payment
        const user = await User.findById(userID)
        const addressid = req.body.addressId
        const cart = user.cart
        console.log(grandtotal)



        const cartItemsId = user.cart.map(item => item.productId)
        const cartItems = await Product.find({ _id: { $in: cartItemsId } })
        const cartQuantity = cart.map(item => item.quantity)

        const productsWithInsufficientStock = cartItems.filter((item, index) => {
            const stockQuantity = item.quantity
            return stockQuantity < cartQuantity[index]
        })
        console.log(productsWithInsufficientStock)


        const address = user.address.id(addressid)
        console.log(data)

        if (paymentMethod == 'cod') {
            paymentstatus = 'completed'
        } else if (paymentMethod == 'wallet') {
            paymentstatus = 'completed'
        } else {
            paymentStatus == 'pending'
        }


        var order = new Order({
            user: userID,
            totalprice: grandtotal,
            products: cart,

            date: Date.now(),
            Address: address,
            status: 'pending',
            paymentMethod: paymentMethod,
            paymentStatus: paymentstatus,
        })
        order.save()

        console.log(order)
        if (order) {
            if (paymentMethod == 'cod' || paymentMethod == 'wallet') {
                for (const cartItem of user.cart) {
                    var product = await Product.findById(cartItem.productId)
                    if (product) {
                        product.quantity -= cartItem.quantity
                        // await product.save()
                    }
                }
                res.status(200).send({ status: true })
                // await User.updateOne({ _id: userID }, { $unset: { cart: 1 } })

            } else if (paymentMethod == 'razorpay') {
                console.log(req.body.grandtotal)
                var options = {

                    amount: grandtotal * 100,
                    currency: "INR",
                    receipt: "" + order._id
                }
                instance.orders.create(options, function (err, order) {
                    if (err) {
                        console.log('error happend in creating order in razorpay', err)
                    } else {
                        console.log(order)
                        res.json({ order: order, razorpay: true })
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

        console.log(req.body)
        const details = req.body
        const crypto = require('crypto')
        let hmac = crypto.createHmac('sha256', process.env.RAZORPAY_SECRET_KEY)
        hmac.update(details['response[razorpay_order_id]'] + '|' + details['response[razorpay_payment_id]'])
        hmac = hmac.digest('hex')
        if (hmac == details['response[razorpay_signature]']) {
            const order = await Order.findByIdAndUpdate(req.body['order[receipt]'], { $set: { paymentStatus: 'completed', paymentMethod: 'razorpay' } }).

                then((status) => {
                    res.json(true)
                    try {

                    } catch (error) {
                        console.log('erorr happend in cartcontrl in verifypayment', error)
                    }
                }).catch((err) => {
                    res.json(false)

                })
        }
    } catch (error) {
        console.log('error happend in cart contrl in verifyRazpayment', error)

    }
}
const cancelOrder = async (req, res) => {
    try {

        res.redirect('/OrdersPage')

    } catch (error) {
        console.log('error happend in cartcontrl in cancelorder', error)

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
}