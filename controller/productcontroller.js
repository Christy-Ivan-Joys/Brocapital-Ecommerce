const db = require('../Config/connection')
const mongoose = require('mongoose')
const User = require('../model/usermodel')
const Product = require('../model/productmodel')
const Category = require('../model/categorymodel')
const Order = require('../model/ordermodel')
const Brand = require('../model/brandmodel')
const Banner = require('../model/bannermodel')
const easyinvoice = require('easyinvoice');
const fs = require('fs');
const { Readable } = require("stream");
const invoice = require('../utils/invoice')



const addproductpage = async (req, res , next) => {
    if (req.session.isAdmin) {
        try {

            const brand = await Brand.find()
            const category = await Category.find()

            res.render('Admin/addproduct', { category, brand })

        } catch (error) {
            console.log('Error in add product in product ctlr', error)
            next(error)
        }
    } else {
        res.redirect('/admin')
    }

}


const addproduct = async (req, res,next) => {
    console.log('iam here');
    const files = req.files
    const admin = req.session.isAdmin
    console.log(files.length)
    if (admin) {
        try {
            const name = req.body.productname
            const product = req.body
            const categoryname = req.body.category

            const category = await Category.findOne({ name: categoryname })

            const categoryId = category._id


            const existingpro = await Product.findOne({ productname: name })
            if (existingpro) {

                res.redirect('/admin/addproductpage')
            } else {

                if (files.length !== 0) {
                    console.log(files.length)
                    const file = [req.files[0]?.filename, req.files[1]?.filename, req.files[2]?.filename, req.files[3]?.filename]

                    const newproduct = new Product({
                        productname: product.productname,
                        price: product.price,
                        quantity: product.quantity,
                        size: product.size,
                        color: product.color,
                        category: category,
                        brand: product.brand,
                        description: product.description,
                        image: file,
                        offerprice: product.offerprice,
                        stock: product.stock


                    })
                    const savedpro = await newproduct.save()

                    res.redirect('/admin/productpage')
                } else {
                    res.redirect('/admin/addproductpage')
                }
            
            }

        } catch (error) {

            console.log('Error happend in addproduct at produc cntlr', error)
            next(error)
        }
    } else {
        res.redirect('/admin')
    }
}
const productpage = async (req, res,next) => {
    try {
        const brand = await Brand.find()

        const products = await Product.find()

        const itemsperPage = 5
        const currentPage = parseInt(req.query.page) || 1
        const startIndex = (currentPage - 1) * itemsperPage
        const endIndex = startIndex + itemsperPage
        const totalPages = Math.ceil(products.length / 5)

        const product = products.slice(startIndex, endIndex)
        res.render('Admin/productpage', { product, brand, currentPage, totalPages, })
    } catch (error) {
        console.log('error in product controller show products', error)
        next(error)
    }
}
const categorypage = async (req, res,next) => {
    try {
        const category = await Category.find()
        res.render('Admin/categorypage', { category })
    } catch (error) {
        console.log('error in productcnrlr in categorypage');
        next(error)
    }
}

const addcategorypage = async (req, res,next) => {
    try {
        if (req.session.err) {
            req.session.err = false;
            res.render('Admin/addcategory', { err: 'already exist' })

        } else {
            res.render('Admin/addcategory', { err: '' })
        }


    } catch (error) {
        console.log('Error in procntrl in addcategorypage render', error);
        next(error)
    }
}
const addcategory = async (req, res,next) => {
    try {
        const name = req.body.categoryname
        const category = req.body
        const file = req.file
        const existingcat = await Category.findOne({ name: name })
       
        if (existingcat) {

            req.session.err = true;
            res.redirect('/admin/addcategorypage')
        } else {
          
            const newcategory = new Category({
                name: category.categoryname,
                status: category.status,
                image: req.file.filename,
            })
            const savedcat = await newcategory.save()

            res.redirect('/admin/categorypage')
        }

    } catch (error) {
        console.log('error happend in procontrl addcategory', error);
        next(error)
    }
}
const editcategorypage = async (req, res,next) => {
    try {
        const categoryId = req.params.id
        const category = await Category.findById(categoryId)
        if (req.session.err) {
            req.session.err = false

            res.render('Admin/editcategorypage', { category, err: 'Category already exist !' })
        } else {
            res.render('Admin/editcategorypage', { category, err: '' })
        }

    } catch (error) {
        console.log('error happend in procontrl editcatpage render', error);
        next(error)
    }

}

const editCategory = async (req, res,next) => {

    try {
        const categoryId = req.params.id
        const category = await Category.findById(categoryId)
        const name = req.body.name
        const ExistingCat = await Category.findOne({ _id: { $ne: categoryId }, name: name })
        if (ExistingCat) {
            req.session.err = true
            res.redirect(`/admin/editcategorypage/${categoryId}`)
        } else {
            const newImg = req.file ? req.file.filename : null
            if (newImg) {
                const updated = await Category.findByIdAndUpdate(categoryId, {
                    name: req.body.name,
                    status: req.body.status,
                    image: req.file.filename,
                }, { new: true })
            } else {

                const update = await Category.findByIdAndUpdate(categoryId, {
                    name: req.body.name,
                    status: req.body.status,

                }, { new: true })

            }
            res.redirect('/admin/categorypage')
        }
    } catch (error) {

        console.log('error happend in procontrl editcategory', error);
        next(error)
    }
}

const deleteCategory = async (req, res,next) => {
    try {


        const catId = req.body.categoryid
        const categoryId = new mongoose.Types.ObjectId(catId);

        const category = await Category.findById(categoryId)
        const name = category.name


        const products = await Product.find({ 'category._id': categoryId });


        if (products.length) {
            res.status(500).send({ status: false })


        } else {
            const deleteCategory = await Category.findByIdAndDelete(categoryId)


            res.status(200).send({ status: true })
        }
    } catch (error) {
        console.log('error happend in procontrl in delecategory', error)
        next(error)

    }
}
const BrandPage = async (req, res, next) => {
    try {

        const brand = await Brand.find()


        const itemsperPage = 7
        const currentPage = parseInt(req.query.page) || 1
        const startIndex = (currentPage - 1) * itemsperPage
        const endIndex = startIndex + itemsperPage
        const totalPages = Math.ceil(brand.length / 7)

        const currentBrands = brand.slice(startIndex, endIndex)
        res.render('Admin/brandPage', { currentPage, totalPages, brand: currentBrands })

    } catch (error) {
        console.log('error happend in pro contrl in brandPage', error)
        next(error)

    }
}
const AddbrandPage = async (req, res,next) => {
    try {

        res.render('Admin/addbrandpage')

    } catch (error) {
        console.log('error happend in pro contrl in addbrand page', error)
        next(error)

    }
}
const AddBrand = async (req, res,next) => {
    try {
       
        const Brandname = req.body.brandname
        const brand = await Brand.findOne({ name: Brandname })
        if (brand) {
            let existError = true
            res.render('Admin/addbrandpage', { existError })
        } else {
            const Nbrand = new Brand({
                name: req.body.brandname,
                status: req.body.status
            })
            const draft = await Nbrand.save()
            res.redirect('/admin/AddBrandPage')
        }

    } catch (error) {
        console.log('error happend in pro contrl in addBrand', error)
        next(error)
    }
}
const editbrandPage = async (req, res,next) => {
    try {
        
        const brandId = req.params.id
         const brand = await Brand.findById(brandId)
        res.render('Admin/editbrandPage', { brand })
    } catch (error) {
        console.log('error happend in user contrl in editbrandPage', error)
        next(error)
    }
}
const editBrand = async (req, res,next) => {
    try {
        let brandId = req.params.id
        const data = req.body
        const update = await Brand.findByIdAndUpdate(brandId, {
            name: req.body.name,
            status: req.body.status,

        }, { new: true })

        console.log('update', update)

    } catch (error) {
        console.log('error happend in procontrl in editbrand'.error)
        next(error)
    }
}
const deleteBrand = async (req, res,next) => {
    try {

        const brandId = req.body.brandId
      
        const brand = await Brand.findById(brandId)
      
        const brandname = brand.name
       
        const product = await Product.find({ brand: brandname })
       
        if (product.length) {
            res.status(500).send({ status: false })
        } else {
            const deleteBrand = await Brand.findByIdAndDelete(brandId)
        
            res.status(200).send({ status: true })
        }
    } catch (error) {
        console.log('error happend in procontrl in deleteBrand ', error)
        next(error)
    }
}
const UnlistProduct = async (req, res,next) => {
    try {

        const productId = req.query.id

        const productunlisted = await Product.findByIdAndUpdate(productId,
            { status: false }, { new: true }
        )


        res.redirect('/admin/productpage')


    } catch (error) {
        console.log('error happend in procontrl unlistpro', error)
        next(error)
    }
}
const listproduct = async (req, res,next) => {
    try {
        const productId = req.query.id
        const productlisted = await Product.findByIdAndUpdate(productId, { status: true }, { new: true })
        res.redirect('/admin/productpage')
    } catch (error) {
        console.log('error happend in procontrl in listpro', error);
        next(error)
    }
}
const editProductpage = async (req, res,next) => {
    try {

        const productId = req.query.id
        const brand = await Brand.find()
        const category = await Category.find()
        const product = await Product.findById(productId)


        res.render('Admin/editproductpage', { product, category, brand })

    } catch (error) {

        console.log('error happend in procontrl in editpropage render', error);
        next(error)
    }
}
const editProduct = async (req, res,next) => {
    try {
        const categoryname = req.body.category
        const categoryId = await Category.findOne({ name: categoryname })

        const productId = req.params.id
        var ImportedImage = req.body.imageImport
       
        let currentImages = ImportedImage.split(',')
      

        let newfilenames = []
        let imageArray = []
        if (req.files.length) {

            for (let i = 0; i < req.files.length; i++) {
                newfilenames.push(req.files[i].filename)
            }
            imageArray = newfilenames.concat(currentImages).filter(Boolean)
        } else {
            imageArray = req.body.imageImport.split(',')
        }

        const product = req.body


        const updated = await Product.findByIdAndUpdate(productId, {
            productname: product.productname,
            category: categoryId,
            price: product.price,
            quantity: product.quantity,
            brand: product.brand,
            size: product.size,
            color: product.color,
            description: product.description,
            offerprice: product.offerprice,
            stock: product.stock,
            image: imageArray,




        }, { new: true })


        res.redirect('/admin/productpage')

    } catch (error) {

        console.log('error happend in procontrl in editproduct', error);
        next(error)
    }
}

const OrdersPage = async (req, res,next) => {
    try {
        const order = await Order.find().sort({ createdOn: -1 })
       

        const itemsperPage = 10
        const currentPage = parseInt(req.query.page) || 1
        const startIndex = (currentPage - 1) * itemsperPage
        const endIndex = startIndex + itemsperPage
        const totalPages = Math.ceil(order.length / 10)


        const orders = order.slice(startIndex, endIndex)
        const admin = req.session.isAdmin

        const ordersWithUserDetails = await Promise.all(
            orders.map(async (order) => {
                const user = await User.findById(order.user)
                return {
                    ...order.toObject(),
                    user: user ? user.toObject() : null,
                }
            })
        )
        res.render('Admin/ordersPage', { orders: ordersWithUserDetails, currentPage, totalPages, })
    } catch (error) {
        console.log('error happend in procontrl in orderspage', error)
        next(error)
    }
}
const orderDetailsPage = async (req, res,next) => {
    try {

        const orderId = req.params.id

        const order = await Order.findById(orderId)
        const user = await User.findById(order.user)

        const orderProducts = order.products
        let productIDs = orderProducts.map(item => item.productId)
        const products = await Product.find({ _id: { $in: productIDs } })
        const productMap = new Map(products.map(product => [product._id.toString(), product]));

        const sortedProducts = productIDs.map(id => productMap.get(id.toString()));

        res.render('Admin/orderDetailsPage', { order, sortedProducts, orderProducts, user })
    } catch (error) {
        console.log('error happend in procontrl in ordrdetailsPage', error)
        next(error)
    }
}

const updateOrderStatus = async (req, res,next) => {
    try {

        let allowedStatus = []
        const orderId = req.params.id
        

        if (req.body.status === 'pending') {
            allowedStatus = ['pending', 'placed', 'shipped', 'delivered', 'cancelled'];
        } else if (req.body.status === 'placed') {
            allowedStatus = ['placed', 'shipped', 'delivered', 'cancelled'];
        } else if (req.body.status === 'shipped') {
            allowedStatus = ['shipped', 'delivered', 'cancelled'];
        } else if (req.body.status === 'delivered') {
            allowedStatus = ['delivered']
        }

        if (allowedStatus.length > 0 && allowedStatus.includes(req.body.status)) {
            if (req.body.status === 'delivered') {

                const order = await Order.findByIdAndUpdate(orderId, { $set: { status: req.body.status } });
                res.redirect('/admin/orderDetailsPage/' + orderId);
            } else {

                const order = await Order.findByIdAndUpdate(orderId, { $set: { status: req.body.status } });
                res.redirect('/admin/orderDetailsPage/' + orderId);
            }

        } else {
        
            
            let Wrongstatus = true;
            res.redirect('/admin/orderDetailsPage/' + orderId);
        }


    } catch (error) {
        console.log('error happend in user contrl procontrl in cancelorder', error)
        next(error)
    }
}
const deleteImage = async (req, res,next) => {
    let productId = req.params.id
    let imgId = req.params.img
    try {
        const update = await Product.findOneAndUpdate({ _id: productId }, { $pull: { image: imgId } })
        if (update) {
            console.log(update)
            res.redirect('/admin/editProductpage?id=' + productId)
        } else {
            console.log('error happend in adding product img')
        }

    } catch (error) {
        console.log('error happend in procontlr in deleteImg', error)
        next(error)
    }
}
const downloadinvoice = async (req, res) => {
    try {
        await invoice.invoice(req, res)
    } catch (error) {
        console.log('error happend in procontlr in downloadinvoice', error)
    }
}
const BannerPage = async (req, res) => {
    try {
        const banner = await Banner.find({ isDeleted: false })
        console.log(banner)
        res.render('Admin/Banner', { banner })
    } catch (error) {
        console.log('error happend in procontlr in BannerPage', error)
    }
}
const addBannerPage = async (req, res) => {
    try {
        res.render('Admin/addBannerPage')
    } catch (error) {
        console.log('error happend in procontrl in addBanner', error)
    }
}
const addBanner = async (req, res) => {
    try {
        console.log(req.body)
        const file = req.file
        const banner = new Banner({
            name: req.body.name,
            image: file.filename,
            status: req.body.status
        })
        banner.save()
        res.redirect('/admin/addBanner')
    } catch (error) {
        console.log('error happend in procontlr in addBanner', error)

    }
}
const deleteBanner = async (req, res) => {
    try {
        console.log(req.params.id)
        const bannerId = req.params.id
        const bannerUpdate = await Banner.findByIdAndUpdate(bannerId, { $set: { isDeleted: true } }, { new: true })
        
        res.redirect('/admin/banner')
    } catch (error) {
        console.log('error happend in procontrl in deleteBanner', error)

    }
}

module.exports = {

    addproductpage,
    addproduct,
    productpage,
    categorypage,
    addcategorypage,
    addcategory,
    editcategorypage,
    AddbrandPage,
    AddBrand,
    BrandPage,
    editbrandPage,
    editBrand,
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
    deleteBanner
}