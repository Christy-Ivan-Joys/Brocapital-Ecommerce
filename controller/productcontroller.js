const db = require('../Config/connection')
const mongoose = require('mongoose')
const User = require('../model/usermodel')
const Product = require('../model/productmodel')
const Category = require('../model/categorymodel')
const Order = require('../model/ordermodel')
const Brand = require('../model/brandmodel')
const easyinvoice = require('easyinvoice');
const fs = require('fs');
const { Readable } = require("stream");
const invoice=require('../utils/invoice')



const addproductpage = async (req, res) => {
    try {
        const brand = await Brand.find()
        const category = await Category.find()

        res.render('Admin/addproduct', { category, brand })

    } catch (error) {
        console.log('Error in add product in product ctlr', error)
    }
}


const addproduct = async (req, res) => {
    console.log('iam here');
    const files = req.files
    const admin = req.session.isAdmin
    console.log(files)
    console.log(req.body, 'req.bdoyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy')
    try {
        if (admin) {





            const name = req.body.productname
            const product = req.body
            const categoryname = req.body.category

            const category = await Category.findOne({ name: categoryname })
            console.log(category)
            const categoryId = category._id
            console.log(req.body)

            console.log('filesssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss', files)
            const existingpro = await Product.findOne({ productname: name })
            if (existingpro) {
                console.log(existingpro)
                res.redirect('/admin/addproductpage')
            } else {
                if (files.length !== 0) {
                    const file = [req.files[0].filename, req.files[1].filename, req.files[2].filename, req.files[3].filename]
                    const newproduct = new Product({
                        productname: product.productname,
                        price: product.price,
                        quantity: product.quantity,
                        size: product.size,
                        color: product.color,
                        category: categoryId,
                        brand: product.brand,
                        description: product.description,
                        image: file,
                        offerprice: product.offerprice,
                        stock: product.stock


                    })
                    const savedpro = await newproduct.save()
                    console.log(savedpro, 'thiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii')
                    res.redirect('/admin/productpage')
                } else {
                    res.redirect('/admin/addproductpage')
                }
                console.log(req.body)



            }

        } else {
            res.redirect('/admin')
        }

    } catch (error) {


        console.log('Error happend in addproduct at produc cntlr', error)
    }
}
const productpage = async (req, res) => {
    try {
        const brand = await Brand.find()

        const products = await Product.find()
        console.log(products)
        const itemsperPage = 5
        const currentPage = parseInt(req.query.page) || 1
        const startIndex = (currentPage - 1) * itemsperPage
        const endIndex = startIndex + itemsperPage
        const totalPages = Math.ceil(products.length / 5)

        const product = products.slice(startIndex, endIndex)
        res.render('Admin/productpage', { product, brand, currentPage, totalPages, })
    } catch (error) {
        console.log('error in product controller show products', error)
    }
}
const categorypage = async (req, res) => {
    try {
        const category = await Category.find()
        res.render('Admin/categorypage', { category })
    } catch (error) {
        console.log('error in productcnrlr in categorypage');
    }
}

const addcategorypage = async (req, res) => {
    try {
        if (req.session.err) {
            req.session.err = false;
            res.render('Admin/addcategory', { err: 'already exist' })

        } else {
            res.render('Admin/addcategory', { err: '' })
        }


    } catch (error) {
        console.log('Error in procntrl in addcategorypage render', error);
    }
}
const addcategory = async (req, res) => {
    console.log("Req boyd ==>", req.body)

    try {
        const name = req.body.categoryname
        const category = req.body
        const file = req.file
        const existingcat = await Category.findOne({ name: name })
        console.log(existingcat)
        if (existingcat) {

            req.session.err = true;
            res.redirect('/admin/addcategorypage')
        } else {
            console.log('category adding.........')
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
    }
}
const editcategorypage = async (req, res) => {
    try {
        const categoryId = req.params.id


        const category = await Category.findById(categoryId)

        console.log(category)
        res.render('Admin/editcategorypage', { category })
    } catch (error) {
        console.log('error happend in procontrl editcatpage render', error);
    }

}

const editCategory = async (req, res) => {

    try {
        const categoryId = req.params.id
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
    } catch (error) {

        console.log('error happend in procontrl editcategory', error);
    }
}

const deleteCategory = async (req, res) => {
    try {
        console.log('hello')
        console.log(req.body)
        const catId = req.body.categoryid
        const categoryId = new mongoose.Types.ObjectId(catId);
        console.log(categoryId)
        const category = await Category.findById(categoryId)
        const name = category.name

        console.log(category)
        const products = await Product.find({ 'category._id': categoryId });


        if (products.length) {
            res.status(500).send({ status: false })


        } else {
            const deleteCategory = await Category.findByIdAndDelete(categoryId)
            console.log(deleteCategory)

            res.status(200).send({ status: true })
        }
    } catch (error) {
        console.log('error happend in procontrl in delecategory', error)

    }
}
const BrandPage = async (req, res) => {
    try {

        const brand = await Brand.find()


        const itemsperPage = 7
        const currentPage = parseInt(req.query.page) || 1
        const startIndex = (currentPage - 1) * itemsperPage
        const endIndex = startIndex + itemsperPage
        const totalPages = Math.ceil(brand.length / 7)

        const currentBrands = brand.slice(startIndex, endIndex)

        console.log(brand)
        res.render('Admin/brandPage', { currentPage, totalPages, brand: currentBrands })

    } catch (error) {
        console.log('error happend in pro contrl in brandPage', error)

    }
}
const AddbrandPage = async (req, res) => {
    try {

        res.render('Admin/addbrandpage')

    } catch (error) {
        console.log('error happend in pro contrl in addbrand page', error)

    }
}
const AddBrand = async (req, res) => {
    try {
        console.log(req.body)
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
    }
}
const editbrandPage = async (req, res) => {
    try {
        console.log(req.body)
        const brandId = req.params.id
        console.log(brandId)
        const brand = await Brand.findById(brandId)
        res.render('Admin/editbrandPage', { brand })
    } catch (error) {
        console.log('error happend in user contrl in editbrandPage', error)
    }
}
const editBrand = async (req, res) => {
    try {
        let brandId = req.params.id
        const data = req.body
        console.log(data)
        console.log('idis', brandId)
        const update = await Brand.findByIdAndUpdate(brandId, {
            name: req.body.name,
            status: req.body.status,

        }, { new: true })

        console.log('update', update)

    } catch (error) {
        console.log('error happend in procontrl in editbrand'.error)

    }
}
const deleteBrand = async (req, res) => {
    try {

        const brandId = req.body.brandId
        console.log(brandId)
        const brand = await Brand.findById(brandId)
        console.log(brand)
        const brandname = brand.name
        console.log(brandname)
        const product = await Product.find({ brand: brandname })
        console.log(product)
        if (product.length) {
            res.status(500).send({ status: false })
        } else {
            const deleteBrand = await Brand.findByIdAndDelete(brandId)
            console.log(deleteBrand)
            res.status(200).send({ status: true })
        }
    } catch (error) {
        console.log('error happend in procontrl in deleteBrand ', error)

    }
}
const UnlistProduct = async (req, res) => {
    try {

        const productId = req.query.id

        const productunlisted = await Product.findByIdAndUpdate(productId,
            { status: false }, { new: true }
        )


        res.redirect('/admin/productpage')


    } catch (error) {
        console.log('error happend in procontrl unlistpro', error)
    }
}
const listproduct = async (req, res) => {
    try {
        const productId = req.query.id
        const productlisted = await Product.findByIdAndUpdate(productId, { status: true }, { new: true })
        res.redirect('/admin/productpage')
    } catch (error) {
        console.log('error happend in procontrl in listpro', error);

    }
}
const editProductpage = async (req, res) => {
    try {

        const productId = req.query.id
        const brand = await Brand.find()
        const category = await Category.find()
        const product = await Product.findById(productId)


        res.render('Admin/editproductpage', { product, category, brand })

    } catch (error) {

        console.log('error happend in procontrl in editpropage render', error);

    }
}
const editProduct = async (req, res) => {
    try {
        const categoryname = req.body.category
        const categoryId = await Category.findOne({ name: categoryname })

        const productId = req.params.id
        var ImportedImage = req.body.imageImport
        console.log(ImportedImage)
        let currentImages = ImportedImage.split(',')
        console.log(currentImages)

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


        console.log(imageArray)

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

    }
}

const OrdersPage = async (req, res) => {
    try {
        const order = await Order.find()


        const itemsperPage = 5
        const currentPage = parseInt(req.query.page) || 1
        const startIndex = (currentPage - 1) * itemsperPage
        const endIndex = startIndex + itemsperPage
        const totalPages = Math.ceil(order.length / 8)


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

    }
}
const orderDetailsPage = async (req, res) => {
    try {

        const orderId = req.params.id
        console.log('idissssssssssssssss', orderId)
        const order = await Order.findById(orderId)
        const user = await User.findById(order.user)
console.log(user)
        const orderProducts = order.products
        let productIDs = orderProducts.map(item => item.productId)
        const products = await Product.find({ _id: { $in: productIDs } })
        const productMap = new Map(products.map(product => [product._id.toString(), product]));

        const sortedProducts = productIDs.map(id => productMap.get(id.toString()));
        console.log('orderssssss')
        res.render('Admin/orderDetailsPage', { order, sortedProducts, orderProducts, user })
    } catch (error) {
        console.log('error happend in procontrl in ordrdetailsPage', error)
    }
}

const updateOrderStatus = async (req, res) => {
    try {

        let allowedStatus = []
        const orderId = req.params.id
        console.log(orderId)
        console.log(req.body.status)
        console.log(req.body)
        if (req.body.status === 'pending') {
            allowedStatus = ['pending', 'placed', 'shipped', 'delivered', 'cancelled'];
        } else if (req.body.status === 'placed') {
            allowedStatus = ['placed', 'shipped', 'delivered', 'cancelled'];
        } else if (req.body.status === 'shipped') {
            allowedStatus = ['shipped', 'delivered', 'cancelled'];
        }else if(req.body.status==='delivered'){
            allowedStatus=['delivered']
        }

        if (allowedStatus.length > 0 && allowedStatus.includes(req.body.status)) {
            console.log('hello iam hereeeeee');
            const order = await Order.findByIdAndUpdate(orderId, { $set: { status: req.body.status } });
            res.redirect('/admin/orderDetailsPage/' + orderId);
        } else {
            console.log(allowedStatus);
            console.log('error in status update in admin side');
            let Wrongstatus = true;
            res.redirect('/admin/orderDetailsPage/' + orderId);
        }


    } catch (error) {
        console.log('error happend in user contrl procontrl in cancelorder', error)
    }
}
const deleteImage = async (req, res) => {
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
    }
}
const downloadinvoice=async(req,res)=>{
    try {
        await invoice.invoice(req,res)
    } catch (error) {
       console.log('error happend in procontlr in downloadinvoice',error)        
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
    downloadinvoice
}