const Order = require('../model/ordermodel')
const db = require('../Config/connection')
const User = require('../model/usermodel')
const Product=require('../model/productmodel')
const easyinvoice = require('easyinvoice')
const fs = require('fs')
const { Readable } = require("stream")
const mongoose = require('mongoose')
const mongodb = require('mongodb')
module.exports = {
    invoice: async (req, res) => {
        try {
            console.log(req.body)
            const id = req.query.id
            console.log(id)
            const result = await Order.findOne({ _id: id })
            console.log(result)
            const userData = await User.findOne({ _id: result.user })
            const address = result.Address[0]
            const order = {
                id: id,
                total: result.totalprice,
                date: result.createdOn,
                paymentMthod: result.paymentMethod,
                orderStatus: result.status,
                name: address.fullname,
                phone: address.mobile,
                pincode: address.pincode,
                town: address.town,
                state: address.state,
                address: address.addressline,
                country: address.country,

            }
            console.log(order)
            const oid = new mongoose.Types.ObjectId(order.id);
 
            const pname = await Order.findById(oid)
                .populate({
                    path: 'products.productId',
                    model: 'Product',
                    select: 'productname price',
                })
                .exec();
        
            
            const products = await Promise.all(result.products.map(async (product) => {
                console.log('product.productId:', product.productId);
            
              
                try {
                    const foundProduct = await Product.findById(product.productId);
            
                    if (foundProduct) {
                        return {
                            quantity: product.quantity,
                            description: foundProduct.productname,
                            price: product.price,
                            total: product.quantity * product.price,
                            "tax-rate": 0,
                        };
                    } else {
                        console.error(`Product with ID ${product.productId} not found.`);
                        return null; 
                    }
                } catch (error) {
                    console.error(`Error retrieving product with ID ${product.productId}: ${error}`);
                    return null; 
                }
            }));


            console.log(products);

            const options = { year: "numeric", month: "long", day: "numeric" }
            const data = {
                customize: {

                },
                images: {
                    background: "",
                },
                sender: {
                    company: "BROCAPITAL",
                    address: "Kakkanad PO,Ernakulam",
                    city: "Kochi",
                    country: "India",

                },
                client: {
                    company: "Customer Address",
                    "Name":order.name,
                    "zip": order.pincode,
                    "city": order.town,
                    "address": order.state,
                    "Phone":order.phone,
                    // "custom1": "custom value 1",
                    // "custom2": "custom value 2",
                    // "custom3": "custom value 3"
                },
                information: {
                    // Invoice number
                    number: order.id,
                    // ordered date
                    date: order.date,

                },
                products: products,
                data: "This is dataaaa",
                "bottom-notice": "Happy shoping and visit Brocapital again",

            }

            const pdfResult = await easyinvoice.createInvoice(data);
            const pdfBuffer = Buffer.from(pdfResult.pdf, "base64");

            // Set HTTP headers for the PDF response
            res.setHeader("Content-Disposition", 'attachment; filename="invoice.pdf"');
            res.setHeader("Content-Type", "application/pdf");

            // Create a readable stream from the PDF buffer and pipe it to the response
            const pdfStream = new Readable();
            pdfStream.push(pdfBuffer);
            pdfStream.push(null);

            pdfStream.pipe(res);
            return true;

        } catch (error) {
            console.log('error happend in invoice', error)
        }
    }
}