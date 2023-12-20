var express = require('express');
const imageCrop = require('../sharp/sharp')
var router = express.Router();
const { upload } = require('../Multer/multer');
const { proUpload } = require('../Multer/productmulter')
const adminAuth=require('../middleware/Adminauth')
const {

  Aloginpage,
  Adminlogin,
  dashboard,
  AdminLogout,
  getSalesData,
  getYearlySalesData,
  getWeeklySalesData,
  getDaySalesData,
  SalesReport,
  SalesReportDownload,
  generatePDF,
  generateExcel,
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
  downloadinvoice,
  BannerPage,
  addBannerPage,
  addBanner,
  deleteBanner,


} = require('../controller/productcontroller');

const {
  showUserPage,
  BlockUser,
  UnblockUser,
} = require('../controller/adminUsercontroller')

const {
  ISadmin,
  isLogout

} = require('../middleware/Adminauth');
const { } = require('../controller/usercontroller');
const {
  couponPage,
  createCoupon,
  addcoupon,
  editCouponPage,
  editcoupon,
  deleteCoupon,
} = require('../controller/couponController')

router.get('/',isLogout, Aloginpage)
router.post('/adminlog', Adminlogin)
router.get('/dashboard', ISadmin, dashboard)
router.get('/MonthlySalesData',ISadmin, getSalesData)
router.get('/YearlySalesData',ISadmin, getYearlySalesData)
router.get('/WeeklySalesData',ISadmin,getWeeklySalesData)
router.get('/DaySalesData',ISadmin,getDaySalesData)



router.get('/addproductpage',ISadmin, addproductpage)
router.get('/productpage',ISadmin, productpage)
router.post('/addproduct', proUpload.array('image', 4), imageCrop, addproduct)
router.get('/editProductpage',ISadmin, editProductpage)
router.post('/editproduct/:id', proUpload.array('image', 4),imageCrop, editProduct)
router.get('/deleteImage/:id/:img',ISadmin, deleteImage)
router.get('/UnlistProduct',ISadmin, UnlistProduct)
router.get('/listproduct',ISadmin, listproduct)




router.get('/categorypage',ISadmin, categorypage)
router.get('/addcategorypage',ISadmin, addcategorypage)
router.get('/editcategorypage/:id',ISadmin, editcategorypage)
router.post('/editcategory/:id', upload.single('image'), editCategory)
router.post('/addcategory', upload.single('image'), addcategory)
router.post('/deleteCategory', deleteCategory)

router.get('/AddBrandPage',ISadmin, AddbrandPage)
router.post('/AddBrand', AddBrand)
router.get('/BrandPage',ISadmin, BrandPage)
router.get('/editbrandPage/:id',ISadmin, editbrandPage)
router.post('/editBrand/:id', editBrand)
router.post('/deleteBrand', deleteBrand)



router.get('/showUserPage',ISadmin, showUserPage)
router.get('/OrdersPage',ISadmin, OrdersPage)
router.get('/orderDetailsPage/:id',ISadmin, orderDetailsPage)
router.post('/updateOrderStatus/:id', updateOrderStatus)
router.get('/Blockuser',ISadmin, BlockUser)
router.get('/Unblockuser',ISadmin, UnblockUser)
router.get('/downloadinvoice',ISadmin, downloadinvoice)


router.get('/logout',ISadmin, AdminLogout)




router.get('/couponPage',ISadmin, couponPage)
router.get('/createCoupon',ISadmin, createCoupon)
router.post('/addcoupon', addcoupon)
router.get('/editCoupon',ISadmin, editCouponPage)
router.post('/editcoupon', editcoupon)
router.get('/deleteCoupon',ISadmin,deleteCoupon)




router.get('/banner',ISadmin, BannerPage)
router.get('/addBanner',ISadmin, addBannerPage)
router.post('/addBanner', upload.single('image'), addBanner)
router.get('/DeleteBanner/:id',ISadmin, deleteBanner)





router.get('/SalesReport',ISadmin,SalesReport)
router.post('/generatePDF',generatePDF)
router.post('/generateExcel',generateExcel)
router.get('/SalesReportDownload',ISadmin,SalesReportDownload)
module.exports = router;
