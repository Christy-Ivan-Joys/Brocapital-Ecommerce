const express = require('express');
const router = express.Router();
const usercontrols=require('../controller/usercontroller');
const userAuth=require('../middleware/userAuth')
const {
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
  UserAddressPage,
  ManageAddress,
  orderPage,
  orderDetailsPage,
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
 
  
}=require('../controller/usercontroller')

const {
isLogged,
}=require('../middleware/userAuth')

const {
  addtoCart,
  cartPage,    
  updateCart,
  checkoutPage,
  deleteCartItem,
  placeOrder,
  cancelOrder,
  verifyRazPayment,
  
}=require('../controller/cartcontroller')
const {
  getAllproducts

}=require('../controller/filtercontroller')
const {
  applyCoupon,
}=require('../controller/couponController');
const { 
  addMoneytoWallet, 
  verifywalletPayment,
  applywallet,
} = require('../controller/walletcontroller');

router.get('/', homepage)
router.get('/loginpage',Loginpage)
router.get('/signup',signuppage)
router.post('/login',Dologin)
router.post('/signup',Dosignup)
router.post('/verifySignup',verifySignup)
router.get('/resendOtp',resendOtp)
router.get('/forgotPassPage',forgotPassPage)
router.post('/forgotPassword',forgotPassword)
router.post('/verifyPass',verifyPass)
router.get('/passResetPage',passResetPage)
router.post('/ResetPassword',ResetPassword)
router.get('/shop',Shoppage)
router.post('/searchShop',search)
router.get('/getAllproducts',getAllproducts)
router.get('/logout',Logout)
router.get('/profile',profile)
router.get('/ordersPage',orderPage)    
router.get('/orderDetails/:id',orderDetailsPage)
router.get('/UserAddress',UserAddressPage)
router.get('/ManageAddress',ManageAddress)
router.post('/edituserDetails',edituserDetails)
router.get('/productDetails/:id',productDetails)
router.get('/addtoCart/:id/:size',addtoCart)
router.get('/cart',cartPage)
router.post('/updateCart',updateCart)
router.get('/checkoutPage',checkoutPage)
router.post('/placeOrder',placeOrder)
router.get('/addAddressPage',addAddressPage)
router.post('/addAddress',addAddress)
router.get('/editAddressPage/:id',editAddressPage)
router.get('/walletPage',walletPage)
router.post('/addMoneytoWallet',addMoneytoWallet)
router.post('/editAddress/:id',editAddress)
router.get('/deleteAddress/:id',deleteAddress)
router.get('/primaryAddress/:id',PrimaryAddress)
router.post('/deleteCartItem/',deleteCartItem)
router.get('/cancelOrder/:id',cancelOrder)

router.post('/applyCoupon',applyCoupon)

router.post('/verifyRazPayment',verifyRazPayment)
router.post('/verifyRazWalletPayment',verifywalletPayment)
router.post('/applywallet',applywallet)
module.exports = router;
