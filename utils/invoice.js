const Order = require('../model/ordermodel')
const db = require('../Config/connection')
const User = require('../model/usermodel')
const easyinvoice=require('easyinvoice')
const fs=require('fs')
const {Readable}=require("stream")
const mongoose=require('mongoose')
const mongodb=require('mongodb')
module.exports = {
    invoice: async (req, res) => {
        try {
            const id = req.query.id
            console.log(id)
            const result = await Order.findOne({ _id:id })
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
            let pname = await Order.aggregate([
                
                { $match: { _id: oid } },
                { $unwind: '$products' },
                {
                    $project: {
                        proId: '$products.productId',
                        quantity: '$products.quantity',
                        price: '$products.price',
                        total: {
                            $multiply: ['$products.quantity', '$products.price']
                        }
                    }
                }
                ,
                {
                    
                    $lookup: {
                        from: 'products',
                        localField: 'proId',
                        foreignField: '_id',
                        as: 'ProductDetails'
                    }
                },
                {
                    $project: {
                        quantity: '$quantity',
                        description: { $arrayElemAt: ['$ProductDetails.productname', 0] },
                        price: { $arrayElemAt: ['$ProductDetails.price', 0] },
                        total: {
                            $multiply: ['$quantity', '$ProductDetails.price']
                        },
                        "tax-rate": '1',
                        _id: 0,
                    }
                }
            ])
            console.log(pname)
            console.log(result.products)
            const products = result.products.map((product, i) => ({
                quantity: product.quantity,
                description: pname[i].description,
                price: product.price,
                total: order.total,
                "tax-rate": 0,



            }))
            const options = { year: "numeric", month: "long", day: "numeric" }
            const data = {
                customize: {

                },
                images: {
                    background: "https://public.easyinvoice.cloud/img/watermark-draft.jpg",
                },
                sender: {
                    company: "Brototype",
                    address: "Kakkanad PO,Ernakulam",
                    city: "Kochi",
                    country: "India",

                },
                client: {
                    company: "Customer Address",
                    "zip": order.pincode,
                    "city": order.town,
                    "address": order.state,
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
                "bottom-notice": "Happy shoping and visit Cycle shop again",

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