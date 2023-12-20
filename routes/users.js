const express = require('express');
const router = express.Router();
const usercontrols=require('../controller/usercontroller');
const userAuth=require('../middleware/userAuth')
const{
isLogged,
isUser
}=require('../middleware/userAuth')
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
  UserInvoice,
 
  
}=require('../controller/usercontroller')


const {
  addtoCart,
  cartPage,    
  updateCart,
  checkoutPage,
  deleteCartItem,
  placeOrder,
  cancelOrder,
  verifyRazPayment,
  ReturnProduct,

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

router.get('/',homepage)
router.get('/loginpage',isLogged,Loginpage)
router.get('/signup',isLogged,signuppage)
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
router.get('/profile',isUser,profile)
router.get('/ordersPage',isUser,orderPage)    
router.get('/orderDetails/:id',isUser,orderDetailsPage)
router.get('/UserAddress',UserAddressPage)
router.get('/ManageAddress',isUser,ManageAddress)
router.post('/edituserDetails',edituserDetails)
router.get('/productDetails/:id',productDetails)
router.get('/addtoCart/:id/:size',addtoCart)
router.get('/cart',isUser,cartPage)
router.post('/updateCart',updateCart)
router.get('/checkoutPage',isUser,checkoutPage)
router.post('/placeOrder',placeOrder)
router.get('/addAddressPage',addAddressPage)
router.post('/addAddress',addAddress)
router.get('/editAddressPage/:id',editAddressPage)
router.get('/walletPage',isUser,walletPage)
router.post('/addMoneytoWallet',addMoneytoWallet)
router.post('/editAddress/:id',editAddress)
router.get('/deleteAddress/:id',isUser,deleteAddress)
router.get('/primaryAddress/:id',PrimaryAddress)
router.post('/deleteCartItem/',deleteCartItem)
router.get('/cancelOrder/:id',cancelOrder)
router.get('/UserInvoice',UserInvoice)
router.post('/applyCoupon',applyCoupon)


router.post('/verifyRazPayment',verifyRazPayment)
router.post('/verifyRazWalletPayment',verifywalletPayment)
router.post('/applywallet',applywallet)
router.get('/ReturnProduct/:id/:orderId',ReturnProduct)
module.exports = router;
