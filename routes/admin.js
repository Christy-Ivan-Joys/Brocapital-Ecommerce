var express = require('express');
const imageCrop=require('../sharp/sharp')
var router = express.Router();
const { upload } = require('../Multer/multer');
const { proUpload } = require('../Multer/productmulter')

const {

  Aloginpage,
  Adminlogin,
  dashboard,
  AdminLogout,

} = require('../controller/admincontroller')

const {
  addproductpage,
  addproduct,
  productpage,
  categorypage,
  addcategorypage,
  addcategory,
  editcategorypage,
  BrandPage,
  AddbrandPage,
  AddBrand,
  editBrand,
  editbrandPage,
  deleteBrand,
  UnlistProduct,
  listproduct,
  editProductpage,
  editProduct,
  editCategory,
  deleteCategory,
  OrdersPage,
  orderDetailsPage,
  updateOrderStatus,
  deleteImage,
  downloadinvoice

} = require('../controller/productcontroller');

const {
  showUserPage,
  BlockUser,
  UnblockUser,
}=require('../controller/adminUsercontroller')

const {
  ISadmin
  
}=require('../middleware/Adminauth');
const {  } = require('../controller/usercontroller');
const {
  couponPage,
  createCoupon,
  addcoupon,
  editCouponPage,
  editcoupon,
}=require('../controller/couponController')

router.get('/', Aloginpage)
router.post('/adminlog', Adminlogin)
router.get('/dashboard',ISadmin,dashboard)
router.get('/addproductpage', addproductpage)
router.get('/productpage', productpage)
router.post('/addproduct', proUpload.array('image', 4),imageCrop, addproduct)
router.get('/categorypage', categorypage)
router.get('/addcategorypage', addcategorypage)
router.get('/editcategorypage/:id', editcategorypage)
router.post('/editcategory/:id',upload.single('image'),editCategory)
router.get('/AddBrandPage',AddbrandPage)
router.post('/AddBrand',AddBrand)
router.get('/BrandPage',BrandPage)
router.get('/editbrandPage/:id',editbrandPage)
router.post('/editBrand/:id',editBrand)
router.post('/deleteBrand',deleteBrand)
router.get('/UnlistProduct', UnlistProduct)
router.get('/listproduct', listproduct)
router.get('/editProductpage', editProductpage)
router.post('/editproduct/:id',proUpload.array('image',4),editProduct)
router.get('/showUserPage',showUserPage)
router.get('/OrdersPage',OrdersPage)
router.get('/orderDetailsPage/:id',orderDetailsPage)
router.get('/Blockuser',BlockUser)   
router.get('/Unblockuser',UnblockUser)
router.post('/addcategory', upload.single('image'), addcategory)
router.get('/logout',AdminLogout)
router.post('/deleteCategory',deleteCategory)
router.post('/updateOrderStatus/:id',updateOrderStatus)
router.get('/deleteImage/:id/:img',deleteImage)

router.get('/couponPage',couponPage)
router.get('/createCoupon',createCoupon)
router.post('/addcoupon',addcoupon)
router.get('/editCoupon',editCouponPage)
router.post('/editcoupon',editcoupon)
router.get('/downloadinvoice',downloadinvoice)
module.exports = router;
