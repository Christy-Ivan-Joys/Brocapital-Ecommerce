const Order = require('../model/ordermodel');
const db = require('../Config/connection');
const User = require('../model/usermodel');
const Product = require('../model/productmodel');
const easyinvoice = require('easyinvoice');
const fs = require('fs');
const { Readable } = require("stream");
const mongoose = require('mongoose');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const Stream = require('stream');
module.exports = {
    generateSalesReport: async (req, res) => {
        try {
            const file = req.query.file
            console.log(file)
            if (file === 'Excel') {

            } else if (file === 'PDF') {
                await generatePDF(res);

            } else {
                console.log('no files requested to download in utils in salesReport')
            }



        } catch (error) {
            console.log('error happend in salesReport in utils', error)
        }
    }
}
async function generatePDF(res) {

    const orders = await Order.find({ status: 'delivered' }).populate('user').populate('products.productId')
    console.log(orders)
    const ordersPerPage = 3; // Adjust the number of orders per page as needed
    let ordersCount = 0;
    const doc = new PDFDocument()
    res.setHeader('Content-Disposition', 'attachment;filename="salesReport.pdf"');
    res.setHeader('Content-Type', 'application/pdf');
    doc.pipe(res);
    doc.fontSize(16).text('Sales report', { align: 'center' });
    const tableHeaders = ['Product Name', 'Price', 'Quantity'];
   


    for (const oder of orders) {
        const order = {
            OrderID: oder._id,
            Date: oder.createdOn,
            customer: oder.user.name,

            products: oder.products,
            Total: oder.totalprice
        }

        if (ordersCount > 0) {
            doc.addPage();
        }

       
           console.log(customOrderID)

        doc
            
            .fontSize(14)
            .text(`Order ID : ${customOrderID}`)
            .text(`Customer : ${order.customer}`)
            .text(`Date : ${order.Date}`)
            .text(`Amount : ${order.Total}`)
        doc.font('Helvetica-Bold').text('Ordered Products:').moveDown()
        doc.font('Helvetica')

        
        const columnWidths = [200, 100, 100];

        tableHeaders.forEach((header, i) => {
            doc.text(header, i * 200, doc.y, { width: 200, align: 'left', font: 'Helvetica-Bold'  });
        });

        doc.moveDown();


        order.products.forEach(product => {
            const rowData = [
                product.productId.productname,
                product.productId.price.toFixed(2),
                product.quantity
            ];
            console.log(rowData)
            rowData.forEach((data, colIndex) => {
                doc.text(data, colIndex * 200, doc.y, { width: 200, align: 'left' });
            });

            doc.moveDown();
        });

        ordersCount++;

        if (ordersCount >= ordersPerPage) {
            ordersCount = 0;
        }
}

    doc.end();
    console.log(`PDF generated for all orders`)

}

