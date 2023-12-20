const db = require('../Config/connection')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const User = require('../model/usermodel')
const Product = require('../model/productmodel')
const Category = require('../model/categorymodel')
const Order = require('../model/ordermodel')
const nodemailer = require('../node_modules/nodemailer')
const invoice = require('../utils/invoice')
function GenerateOtp() {
    var numbers = "1234567890"
    var otp = ""
    for (let i = 0; i < 6; i++) {

        otp += numbers[Math.floor(Math.random() * 10)]

    }
    return otp
}




const homepage = async (req, res) => {
    try {

        let user = req.session.user
        const product = await Product.find().limit(4)

        if (user) {
            console.log('if worked', user);
            const userdata = await User.findById(user)
            const cart = userdata.cart

            res.render('User/home', { user: userdata, product, cart })
        } else {

            console.log('else worked', user);
            res.render('User/home', { user: false, product })
        }




    } catch (error) {
        console.log('Error in homepage route', error)
        res.render('Error', { error: 'error occured' })
    }

}

const Shoppage = async (req, res) => {
    try {


        const filtercategory = req.query.category
        const sortQuery = req.query.sort || 'status'
        const sortValue = req.query.order || 1
        const sort = { [sortQuery]: sortValue }
        const searchword = req.query.search



        let filter = [{ stock: "In Stock" }, { status: true }, { "category.status": "Active" },]

        filtercategory && filter.push({ "category.name": filtercategory })
        searchword && filter.push({
            $or: [
                { 'category.name': { $regex: new RegExp(`^${searchword}`, 'i') } },

                { 'productname': { $regex: new RegExp(`^${searchword}`, 'i') } }
            ]
        }
        );
        console.log(filter)


        const product = await Product.find({ $and: filter }).sort(sort)
        const category = await Category.find()
        const user = await User.find()


        const itemsperPage = 8
        const currentPage = parseInt(req.query.page) || 1
        const startIndex = (currentPage - 1) * itemsperPage
        const endIndex = startIndex + itemsperPage
        const totalPages = Math.ceil(product.length / 8)



        const currentProducts = product.slice(startIndex, endIndex)
        if (req.session.user) {
            res.render('User/shop', { currentPage, totalPages, product: currentProducts, user, filtercategory, sortQuery, sortValue, searchword, category })
        } else {
            res.render('User/shop', { currentPage, totalPages, product: currentProducts, filtercategory, category, sortQuery, sortValue, searchword })
        }


    } catch (error) {

        console.log('Error happend in userctrl in the funtion shoppage', error);

    }
}

const search = async (req, res) => {
    try {
        const userId = req.session.user
        const searchword = req.body.search
        const product = await Product.find(
            {
                $or: [
                    { 'category.name': { $regex: new RegExp(`^${searchword}`, 'i') } },
                    { productname: { $regex: new RegExp(`^${searchword}`, 'i') } }
                ]
            }
        )




    } catch (error) {
        console.log('error happend in user contrl in search', error)
    }
}




const Loginpage = async (req, res) => {

    try {
        // if (req.session.user) {
        //     res.redirect('/')
        // } else {

        //     res.render('User/login')
        // }
        res.render('User/login')
    } catch (error) {
        res.render('Error happend in login page render loginpage', error)
    }
}


const Dologin = async (req, res) => {
    let isBlock = false
    try {
        const userData = req.body
        const product = await Product.find()
        const user = await User.findOne({ email: userData.email })
        if (user) {
            if (user.block == false) {

                bcrypt.compare(userData.password, user.password).then((status) => {
                    if (status) {
                        console.log(status)
                        req.session.user = user._id
                        res.redirect('/')
                    } else {
                        const wrongpass = true
                        res.render('User/login', { wrongpass, isBlock })

                    }
                })
            } else {

                isBlock = true
                res.render('User/login', { isBlock })


            }

        } else {

            const nouser = true

            res.render('User/login', { nouser })
        }

    } catch (error) {
        console.log(error);
    }
}

const signuppage = async (req, res) => {
    try {
        res.render('User/signup')
    } catch (error) {

    }
}

const Dosignup = async (req, res) => {
    const email = req.body.email
    try {
        console.log(req.body)
        const userData = req.body
        const email = req.body.email
        const user = await User.findOne({ email: userData.email })

        if (user) {
            console.log('if worked')
            req.session.userExist = true
            const userExist = req.session.userExist

            console.log('user already exist')
            res.render('User/signup', { userExist })
            console, log('heloo end')
        } else {

            console.log('else worked');
            const Otp = GenerateOtp()
            const transport = nodemailer.createTransport({

                service: "Gmail",
                port: 587,
                requireTLS: true,
                auth: {
                    user: process.env.AUTH_EMAIL,
                    pass: process.env.AUTH_PASS,
                    method: 'LOGIN'
                }

            })
            const send = await transport.sendMail({
                from: process.env.AUTH_EMAIL,
                to: email,
                subject: "verify Account",
                text: `Your Signup OTP is : ${Otp}`,
            })
            if (send) {


                req.session.userOtp = Otp
                req.session.userData = req.body
                console.log('otp end');
                console.log(req.body);
                console.log(Otp)
                res.render('User/emailOtp')


            } else {

                res.json('email error')
            }

        }


    }
    catch (error) {
        console.log(error)
        res.render('error', { error: 'error occoured' })
    }
}


const verifySignup = async (req, res) => {

    console.log('started');
    const { first, second, third, fourth, fifth, sixth } = req.body
    const extract = Object.values(req.body)
    const enteredOTP = extract.join('')
    console.log(enteredOTP);

    if (enteredOTP === req.session.userOtp) {
        console.log(req.session.userOtp)
        const userData = req.session.userData

        userData.password = await bcrypt.hash(userData.password, 10)
        let user = new User({
            name: userData.name,
            email: userData.email,
            password: userData.password,
            phonenumber: userData.phonenumber

        })

        await user.save()
        res.status(200).send({ status: true })

        // res.redirect('/loginpage')

    } else {
        res.status(400).send({ status: false, error: 'wrong otp' })
        req.session.otperr = true
        console.log('otp not matching')

    }

}


const resendOtp = async (req, res) => {
    const userData = req.session.userData
    const email = userData.email
    try {
        const user = await User.findOne({ email: email })
        console.log(user)
        if (user) {
            let userExist = true
            res.render('User/emailOtp', { userExist })

        } else {
            console.log('i am here in resend')

            const Otp = GenerateOtp()


            const transport = nodemailer.createTransport({
                service: 'Gmail',
                port: 587,
                requireTLS: true,
                auth: {
                    user: process.env.AUTH_EMAIL,
                    pass: process.env.AUTH_PASS,
                    method: 'LOGIN'
                }
            })

            console.log('last step')
            const send = await transport.sendMail({
                from: process.env.AUTH_EMAIL,
                to: email,
                subject: "Verify account with the resend otp",
                text: `Your Signup OTP is : ${Otp}`,


            })
            console.log('last step1')
            console.log(Otp)
            if (send) {
                console.log('last step2')
                req.session.userOtp = Otp
                res.render('User/emailOtp')
                console.log('last step emd')
                console.log(send)
            }
        }

    } catch (error) {
        console.log('errorn happend in user contrl in resendOtp', error)

    }
}
const forgotPassPage = async (req, res) => {
    try {
        res.render('User/forgotPassword')
    } catch (error) {
        console.log('error happend in user contrl in forgotPassPage', error)

    }

}
const forgotPassword = async (req, res) => {
    try {
        const email = req.body.email

        const user = await User.findOne({ email: email })

        if (user) {
            console.log('otp entered')
            const Otp = GenerateOtp()

            const transport = nodemailer.createTransport({
                service: 'Gmail',
                port: 587,
                requireTLS: true,
                auth: {
                    user: process.env.AUTH_EMAIL,
                    pass: process.env.AUTH_PASS,
                    method: 'LOGIN'
                }
            })

            const send = await transport.sendMail({
                from: process.env.AUTH_EMAIL,
                to: email,
                subject: "Verify account with the resend otp",
                text: `Your Signup OTP is : ${Otp}`,
            })


            console.log(Otp)
            if (send) {
                req.session.userEmail = email
                req.session.userOtp = Otp
                res.render('User/forgotpassOtp')
                console.log('email send')
                console.log('finish')

            }
        } else {
            let noUser = true
            res.render('User/forgotPassword', { noUser })
            console.log('user not exist')
            noUser = false
        }

    } catch (error) {
        console.log('error happend in user contrl in forgotpassword', error)

    }
}
const verifyPass = async (req, res) => {
    try {
        const { first, second, third, fourth, fifth, sixth } = req.body


        const extract = Object.values(req.body)
        const enteredOTP = extract.join('')
        if (enteredOTP === req.session.userOtp) {

            res.status(200).send({ status: true })
        } else {
            res.status(400).send({ status: false, error: 'wrong otp' })
        }

    } catch (error) {
        console.log('error happend in user contrl in verifypass', error)
    }
}

const passResetPage = async (req, res) => {
    try {
        res.render('User/passResetPage')

    } catch (error) {
        console.log('error happend in user contrl in passResetpage render', error)
    }
}

const ResetPassword = async (req, res) => {
    try {
        const userEmail = req.session.userEmail
        let password = req.body.newPassword
        password = await bcrypt.hash(password, 10)
        const user = await User.findOneAndUpdate({ email: userEmail },
            { password: password }, { new: true })
        res.status(200).send({ status: true })

    } catch (error) {
        console.log('error happend in user contrl in ResetPassword', error)
    }
}




const Logout = async (req, res) => {
    try {
      
        req.session.user = null
        res.redirect('/loginpage')
    } catch (error) {
        console.log('Error happend in userconroller at logout', error)
    }
}

const profile = async (req, res) => {
    try {
        
        const userId = req.session.user
        const user = await User.findById(userId)
        let currentPassError
        if (req.session.user) {
            const Address = user.address
            res.render('User/profile', { user, Address, currentPassError })

        } else {
            res.redirect('/')
        }

    } catch (error) {
        console.log('Error happend in usercntl of userprofile', error)
    }
}

const orderPage = async (req, res) => {
    try {
       
        const order = await Order.find().sort({createdOn:-1})
      
        
        const itemsperPage = 8
        const currentPage = parseInt(req.query.page) || 1
        const startIndex = (currentPage - 1) * itemsperPage
        const endIndex = startIndex + itemsperPage
        const Orders=order.length
        const totalPages = Math.ceil(Orders / itemsperPage)
        const orders = order.slice(startIndex, endIndex)
        const user = req.session.user
       
        res.render('User/orders', { user, orders, currentPage, totalPages, })

    } catch (error) {
        console.log('error happend in user contrl in order page', error)

    }
}
const orderDetailsPage = async (req, res) => {
    try {
        const orderId = req.params.id
       
        const userId = req.session.user
        const user = await User.findById(userId)
        const order = await Order.findOne({ _id: orderId })
        let orderProducts = order.products      
        let productIDs = orderProducts.map(item => item.productId)
        const products = await Product.find({ _id: { $in: productIDs } })

        const productMap = new Map(products.map(product => [product._id.toString(), product]));
       
        const sortedProducts = productIDs.map(id => productMap.get(id.toString()));
     
        
        //sending the final sorted product to get the same order of the quatity placed inside the products inside the order
       res.render('User/orderDetails', { user, sortedProducts, orderProducts, order })

    } catch (error) {
        console.log('error happend in user contrl in orderDetailsPage', error)

    }
}
const UserAddressPage = async (req, res) => {
    try {
        if (req.session.user) {
            console.log('hello address')
            const userId = req.session.user
            const user = await User.findById(userId)
            const Address = user.address

            res.render('User/userAddress', { user, Address })
        } else {
            res.redirect('/')
        }
    } catch (error) {
        console.log('error happend in user contrl in userAddressPage', error)

    }
}
const ManageAddress = async (req, res) => {
    try {
        if (req.session.user) {
            const user = req.session.user
            const userdetails = await User.findById(user)
            const address = userdetails.address
            res.render('User/ManageAddress', { user, address })

        } else {
            res.redirect('/')
        }


    } catch (error) {
        console.log('error happend in user  contrl in manage address', error)

    }
}

const productDetails = async (req, res) => {
    try {
        const products = await Product.find()
        const id = req.params.id
        const product = await Product.findById(id)
   

        const user = req.session.user

        if (product) {
            if (user) {
                res.render('User/productDetail', { product, products, user })
             

            } else {
                res.render('User/productDetail', { product, products })
            }


        }
    } catch (error) {
        console.log('error happend in  usercontl in productDetails', error);
    }
}

const addAddressPage = async (req, res) => {
    try {
        const user = req.session.user
        if (user) {
            res.render('User/addAddressPage', { user })
        } else {
            res.redirect('/')
        }


    } catch (error) {
        console.log('error happend in user contrl in addAddressPage', error);

    }
}

const addAddress = async (req, res) => {
    try {

        const address = req.body
        id = req.session.user
        const user = await User.findById(id)
    

        if (user.address.length === 3) {
            let limiterror = true
            res.render('User/userAddress', { limiterror })
        } else {


            const Address = {
                fullname: address.fullname,
                mobile: address.mobile,
                pincode: address.pincode,
                town: address.town,
                state: address.state,
                landmark: address.landmark,
                country: address.country,
                addressline: address.addressline,
                primary: address.primary
            }
            if (user.address.length === 0) {
                Address.primary = true
            }
            user.address.push(Address)
            await user.save()

            res.redirect('/ManageAddress')
        }
    } catch (error) {
        console.log('error happend in user contlr in addAddress', error)

    }
}

const editAddressPage = async (req, res) => {
    try {
        const userId = req.session.user
        const user = await User.findById(userId)

        const addressId = req.params.id
        const address = user.address.id(addressId)


        res.render('User/editAddressPage', { user, address })

    } catch (error) {
        console.log('error happend in user contrl in editAddressPage', error)

    }
}

const editAddress = async (req, res) => {
    try {
       
        const userId = req.session.user
        const addressId = req.params.id
        const user = await User.findById(userId)
        
        const address = user.address.id(addressId)
        const newAddess = req.body
        const updated = await User.findOneAndUpdate(
            { _id: userId, 'address._id': addressId }, {
            $set: {
                'address.$.fullname': req.body.name,
                'address.$.mobile': req.body.mobile,
                'address.$.pincode': req.body.pincode,
                'address.$.town': req.body.town,
                'address.$.state': req.body.state,
                'address.$.landmark': req.body.landmark,
                'address.$.country': req.body.country,
                'address.$.addressline': req.body.addressline
            }
        }, { new: true })
        res.redirect('/profile')


    } catch (error) {
        console.log('error happend in user contrl in editAddress', error);
    }
}
const deleteAddress = async (req, res) => {
    try {
        const userId = req.session.user
        const user = await User.findById(userId)
        
        const addressId = req.params.id
        const deleteAddress = await User.findOneAndUpdate(
            { _id: userId }, {
            $pull: {
                address: { _id: addressId }
            }
        }, { new: true }
        )
        
        res.redirect('/ManageAddress')

    } catch (error) {
        console.log('error happend in user contrl', error)

    }
}

const edituserDetails = async (req, res) => {
    try {
        const userId = req.query.id
        const user = await User.findById(userId)
        const Address = user.address
       
        const password = req.body.password ? req.body.password : null

        if (password !== null) {
            let currentPassword = req.body.password
            let newPassword = req.body.npassword
            newPassword = await bcrypt.hash(newPassword, 10)
            
            const status = await bcrypt.compare(currentPassword, user.password)
            if (status) {
                const { name, email, phonenumber } = req.body


                const update = await User.findOneAndUpdate(
                    { _id: userId },
                    {
                        $set: {
                            name: name,
                            email: email,
                            phonenumber: phonenumber,
                            password: newPassword,
                        }
                    }, { new: true })
                
                res.redirect('/profile')
            } else {
                let currentPassError = true
                res.render('User/profile', { currentPassError, user, Address })
                currentPassError = false
                
            }
        } else {

            const { name, email, phonenumber } = req.body


            const update1 = await User.findOneAndUpdate(
                { _id: userId },
                {
                    $set: {
                        name: name,
                        email: email,
                        phonenumber: phonenumber
                    }
                }, { new: true })
           
            res.redirect('/profile')
        }




    } catch (error) {
        console.log('error happend in user contrl in edituserDetails', error)

    }
}

const PrimaryAddress = async (req, res) => {
    const userId = req.session.user
    
    try {
        if (userId) {


            const userData = await User.findById(userId)
            const addressId = req.params.id
            const address = userData.address.find((address) => address._id == addressId)

            const addressIds = userData.address.map(item => item._id)
            const update = await User.updateMany({ _id: userId, 'address._id': { $in: addressIds } }, {
                $set: {
                    'address.$[elem].primary': false,
                }
            }, {
                new: true,
                arrayFilters: [{ 'elem._id': { $in: addressIds } }],
            })
            const primaryUpdate = await User.findOneAndUpdate({ _id: userId, 'address._id': addressId },
                {
                    $set: {
                        'address.$.primary': true
                    }
                },

                { new: true }
            )
            res.status(200).send({ status: true })

        } else {
            res.redirect('/')
        }

    } catch (error) {
        console.log('error happend in user contrl in primaryaddress', error)
    }
}
const walletPage=async(req,res)=>{
    try {
        const userId = req.session.user
        const user = await User.findById(userId)
        const wallet=user.wallet
        res.render('User/wallet',{user,wallet})
    } catch (error) {
        console.log('error happend in user contrl in walletpage',error)
        
    }
}
const UserInvoice=async(req,res)=>{
    try {
        console.log(req.query.id)
        await invoice.invoice(req,res)
    } catch (error) {
        console.log('error happend in UserInvoice',error)
        
    }
}
module.exports = {
    homepage,
    Loginpage,
    Dologin,
    signuppage,
    Dosignup,
    resendOtp,
    forgotPassPage,
    forgotPassword,
    verifyPass,
    passResetPage,
    ResetPassword,
    Shoppage,
    Logout,
    profile,
    orderPage,
    orderDetailsPage,
    UserAddressPage,
    ManageAddress,
    edituserDetails,
    verifySignup,
    productDetails,
    addAddressPage,
    addAddress,
    editAddressPage,
    walletPage,
    editAddress,
    deleteAddress,
    search,
    PrimaryAddress,
    UserInvoice,
}