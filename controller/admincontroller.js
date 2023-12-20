const db = require('../Config/connection')
const mongoose = require('mongoose')
const User = require('../model/usermodel')
const Order = require('../model/ordermodel')
const Product = require('../model/productmodel')
const fs = require('fs');
const { Readable } = require("stream");
const moment = require('moment');
const ExcelJS = require('exceljs')
const salesReport = require('../utils/salesReport')
const PDFDocument = require('pdfkit')
const { nextTick } = require('process')

const Aloginpage = async (req, res) => {

    try {
     
        res.render('Admin/Alogin')

    } catch (error) {
        console.log('Error in admin login render', error)
        next(error)
    }
}
const Adminlogin = async (req, res) => {
    try {
    
        const { email, password } = req.body
        const admin = await User.findOne({ $and: [{ email: email }, { isAdmin: 1 }] })

        if (admin) {
            if (admin.password == password) {
                req.session.isAdmin = true
                res.redirect('/admin/dashboard')
            } else {
                let passerror = true
                res.render('Admin/Alogin', { passerror })
            }



        } else {
            let usererror = true
            res.render('Admin/Alogin', { usererror })
        }
    } catch (error) {
        console.log('error happend in admin contrl in alogin', error);
    }
}

const dashboard = async (req, res) => {
    try {
        if (req.session.isAdmin) {
            const totalOrders = await Order.find({ UserOrderStatus: 'Order placed' })
            const Products = await Product.find().count()
            const Details = await Order.aggregate([{
                $group: {
                    _id: null, TotalRevenue: { $sum: '$totalprice' },
                    TotalOrders: {
                        $sum: {
                            $cond: {
                                if: { $eq: ['$UserOrderStatus', 'Order placed'] },
                                then: 1,
                                else: 0
                            }
                        }
                    }
                }
            }])

            console.log(Details[0], Details)

            res.render('Admin/Dashboard', { Details, Products })

        } else {
            res.redirect('/admin')
        }
    } catch (error) {
        console.log('error happend in admin contlr in dashboard', error)
    }
}
const AdminLogout = async (req, res) => {
    try {
        req.session.isAdmin = null
        res.redirect('/admin')

    } catch (error) {
        console.log('Error happend in ADMIN logout cntlr', error);
    }
}

const getSalesData = async (req, res) => {
    try {

        const soldOrders = await Order.find({ status: 'delivered' })
      
        const soldOrdersByDate = soldOrders.reduce((acc, order) => {
            const date = moment(order.createdOn).format('YYYY-MM');

            acc[date] = (acc[date] || 0) + 1
            return acc

        }, {})

        const salesData = Object.entries(soldOrdersByDate).map(([date, value]) => {
            const dateObj = new Date(date)
            const monthName = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(dateObj)

            return {
                date: monthName,
                value: value,
            }

        }).reverse()

        res.json({ salesData })

    } catch (error) {
        console.log('error happend in amdincontrl', error)
    }
}
const getYearlySalesData = async (req, res) => {
    try {
        const soldOrders = await Order.find({ status: 'delivered' })
        const soldOrdersByYear = soldOrders.reduce((acc, order) => {
            const year = moment(order.createdOn).format('YYYY')
           
            acc[year] = (acc[year] || 0) + 1
            return acc
        }, {})

      
        const salesData = Object.entries(soldOrdersByYear).map(([year, value]) => ({
            year: parseInt(year),
            value: value
        })).reverse()



       
        res.json({ salesData })


    } catch (error) {
        console.log('error happend in admincontrl in getYearlySalesData', error)

    }
}
const SalesReport = async (req, res) => {
    try {

        const order = await Order.find({ status: 'delivered' }).populate('user').sort({createdOn:-1})
        const filter = req.query.filter
       
        if (filter === 'week') {
            const currentDate = new Date()

            const startDate = new Date()
            currentDate.setHours(0, 0, 0, 0)
            startDate.setHours(0, 0, 0, 0)
            startDate.setDate(currentDate.getDate() - 7)
           
            const filteredOrders = order.filter(order => {
                const orderDate = order.createdOn
                return orderDate >= startDate
            })
            const itemsperPage = 8
            const currentPage = parseInt(req.query.page) || 1
            const startIndex = (currentPage - 1) * itemsperPage
            const endIndex = startIndex + itemsperPage
            const totalPages = Math.ceil(order.length / 8)


            const orders = filteredOrders.slice(startIndex, endIndex)
            res.render('Admin/salesReport', { orders, currentPage, totalPages, filter })

        } else if (filter === 'year') {
            const currentDate = new Date()
            const startDate = new Date()
            currentDate.setHours(0, 0, 0, 0)
            startDate.setHours(0, 0, 0, 0)
            startDate.setDate(currentDate.getDate() - 365)
         
            const filteredOrders = order.filter(order => {
                const orderDate = order.createdOn
                return orderDate >= startDate
            })
            
            const itemsperPage = 8
            const currentPage = parseInt(req.query.page) || 1
            const startIndex = (currentPage - 1) * itemsperPage
            const endIndex = startIndex + itemsperPage
            const totalPages = Math.ceil(order.length / 8)


            const orders = filteredOrders.slice(startIndex, endIndex)
            res.render('Admin/salesReport', { orders, currentPage, totalPages, filter })

        } else if (filter === 'month') {

            const currentDate = new Date()
            const startDate = new Date()
            currentDate.setHours(0, 0, 0, 0)
            startDate.setHours(0, 0, 0, 0)
            startDate.setDate(currentDate.getDate() - 28)
            
            const filteredOrders = order.filter(order => {
                const orderDate = order.createdOn
                return orderDate >= startDate
            })
           
            const itemsperPage = 8
            const currentPage = parseInt(req.query.page) || 1
            const startIndex = (currentPage - 1) * itemsperPage
            const endIndex = startIndex + itemsperPage
            const totalPages = Math.ceil(order.length / 8)


            const orders = filteredOrders.slice(startIndex, endIndex)
            res.render('Admin/salesReport', { orders, currentPage, totalPages, filter })

        } else if (filter === 'all') {

            const itemsperPage = 8
            const currentPage = parseInt(req.query.page) || 1
            const startIndex = (currentPage - 1) * itemsperPage
            const endIndex = startIndex + itemsperPage
            const totalPages = Math.ceil(order.length / 8)


            const orders = order.slice(startIndex, endIndex)


            res.render('Admin/salesReport', { orders, currentPage, totalPages, filter })
        }

    } catch (error) {
        console.log('error happend in adminContrl in SalesReport', error)

    }
}

const SalesReportDownload = async (req, res) => {
    try {
        await salesReport.generateSalesReport(req, res)

    } catch (error) {
        console.log('error happend in admin contrl in salesRepodownload', error)

    }
}
const generatePDF = async (req, res) => {
    try {
        console.log('reached')
        const doc = new PDFDocument()
        const filename = 'salesReport.pdf'
        const orders = req.body
     
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', `attachment;filename=${filename}`)
        doc.pipe(res)
        doc.fontSize(12)
        doc.text('Sales Report', { align: 'center', fontSize: 16 })
        const margin = 5
       
        doc
            .moveTo(margin, margin)
            .lineTo(600 - margin, margin)
            .lineTo(600 - margin, 842 - margin)
            .lineTo(margin, 842 - margin)
            .lineTo(margin, margin)
            .lineTo(600 - margin, margin)
            .lineWidth(3)
            .strokeColor('#000000')
            .stroke();

        doc.moveDown();
        const headers = ['OrderId', 'Customer', 'Date', 'Total', 'Payment', 'Products(Nos)']
        let headerX = 20
        const headerY = doc.y + 10
        doc.text(headers[0], headerX, headerY)
        headerX += 160
        headers.slice(1).forEach(header => {
            if (header === 'Payment') {
                doc.text(header, headerX - 40, headerY);
            } else
                if (header === 'Products(Nos)') {
                    doc.text(header, headerX + 40, headerY);
                } else {
                    doc.text(header, headerX, headerY)
                    headerX += 90
                }

        })
        let dataY = headerY + 25
        let Total = 0
        let totalSales = 0


        function generateOrderID() {
            const currentDate = new Date();
            const year = currentDate.getFullYear();
            const month = (currentDate.getMonth() + 1).toString().padStart(2, '0'); 
            const day = currentDate.getDate().toString().padStart(2, '0'); 
        
           
            const randomNumber = Math.floor(Math.random() * Math.pow(10, 4)).toString().padStart(4, '0');
        
            
            const customOrderID = `${year}${month}${day}-${randomNumber}`;
        
            return customOrderID;
        }


        orders.forEach(order => {
            const customOrderID = generateOrderID();
            doc.text(customOrderID, 20, dataY)
            doc.text(order.name, 190, dataY)
            doc.text(order.date, 250, dataY)
            doc.text(order.totalAmount, 360, dataY)
            doc.text(order.payment, 420, dataY)
            doc.text(order.products, 500, dataY)
            totalSales += 1
            Total += order.totalAmount
            dataY += 30
        })
        const TotalHeight = dataY
        const footerY = TotalHeight + 30
        doc.text(`Total Revenue :Rs.${Total}`, 400, footerY)
        doc.text(`Total sales : ${totalSales}`, 300, footerY)
        doc.end()

    } catch (error) {
        console.log('error happend in generatePDF', error)

    }
}
const generateExcel = async (req, res) => {
    try {

      
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sales Report');

        worksheet.columns = [
            { header: 'Order ID', key: 'orderId', width: 15 },
            { header: 'Customer', key: 'customer', width: 30 },
            { header: 'Date', key: 'date', width: 20 },
            { header: 'Total', key: 'totalAmount', width: 15 },
            { header: 'Payment', key: 'payment', width: 15 },
            { header: 'Products(Nos)', key: 'products', width: 30 },
        ];

        const orders = req.body;

        orders.forEach(order => {
            worksheet.addRow({
                orderId: order.orderId,
                customer: order.name,
                date: order.date,
                totalAmount: order.totalAmount,
                payment: order.payment,
                products: order.products,
            });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=salesReport.xlsx`);

        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.log('error happend in admin contrl in generateExcel', error)

    }
}
const getWeeklySalesData = async (req, res) => {
    try {
        const currentDate = new Date()
        const istOffset = 5.5 * 60 * 60 * 1000;
        const istTime = new Date(currentDate.getTime() + istOffset);
      
        let lastWeekDay = new Date(currentDate)
        lastWeekDay.setDate(currentDate.getDate() - 7)
    
        const orders = await Order.find({ status: 'delivered', createdOn: { $gte: lastWeekDay, $lte: istTime } })
     
        const data = orders.reduce((acc, order) => {
            const day = moment(order.createdOn).format('dddd')
            acc[day] = (acc[day] || 0) + 1
            return acc
        }, {})
    
        const days = {}
        while (lastWeekDay <= istTime) {
            const day = lastWeekDay.toLocaleDateString('en-US', { weekday: 'long' })
            days[day] = 0
            lastWeekDay.setDate(lastWeekDay.getDate() + 1)
        }

        for (const day in data) {
            if (Object.keys(days).includes(day)) {

                days[day] = data[day]
            }
        }
        let Data = []
        let Days = []
        for (const day in days) {
            Data.push(days[day])
            Days.push(day)
        }
      
        res.json({ Days, Data })

    } catch (error) {
        console.log('error happend in admin contrl in weeklysalesData', error)

    }
}


const getDaySalesData = async (req, res) => {
    try {
        const currentDate = new Date()

        const nextDate = new Date(currentDate)
        nextDate.setDate(currentDate.getDate() + 1)
        const orders = await Order.find({
            status: 'delivered', createdOn: {
                $gte: currentDate,
                $lt: nextDate
            }
        })
       
        const data = orders.reduce((acc, order) => {
            const time = moment.utc(order.createdOn)
            time.startOf('hour')
            const formattedTime = time.format('HH')
           
            acc[`${formattedTime}.00`] = (acc[`${formattedTime}.00`] || 0) + 1
            return acc
        }, {})
       
        let Hours = {};

        for (let hour = 0; hour < 24; hour++) {
            const formattedHour = hour.toString().padStart(2, '0');
            Hours[`${formattedHour}.00`] = 0;
        }

        for (const Time in data) {
            if (Object.keys(Hours).includes(Time)) {

                Hours[Time] = data[Time]
            }
        }
        const hours = Object.keys(Hours)
        const values = Object.values(Hours)
       
        res.json({ hours, values })
    } catch (error) {
        console.log('error happend in admin contrl in getDaySalesData', error)

    }
}
module.exports = {
    Aloginpage,
    Adminlogin,
    dashboard,
    AdminLogout,
    getSalesData,
    getYearlySalesData,
    SalesReport,
    SalesReportDownload,
    generatePDF,
    generateExcel,
    getWeeklySalesData,
    getDaySalesData,

}