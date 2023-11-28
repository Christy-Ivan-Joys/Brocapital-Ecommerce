const mongoose = require('mongoose')
const moment = require('moment-timezone')

const getCurrentDateWithoutTime = () => {
    const currentDate = new Date();
    currentDate.setUTCHours(0, 0, 0, 0);
    
    const year  = currentDate.getUTCFullYear();
    const month = String(currentDate.getUTCMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(currentDate.getUTCDate()).padStart(2, '0');
    const hours = String(currentDate.getHours()).padStart(2, '0');
    const minutes = String(currentDate.getMinutes()).padStart(2, '0');
    const seconds = String(currentDate.getSeconds()).padStart(2, '0');
    
    return `${day}-${month}-${year} Time :${hours}:${minutes}:${seconds}`;
};

let orderModel = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    totalprice: {
        type: Number,
        required: true
    },

    createdOn: {
        type: String,
        required: true,
        default: getCurrentDateWithoutTime(),



    },
    
    date: {
        type: String,
        required: true,

    },
    products: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
            },
            quantity: Number,
            price: Number,
            size:String,
        },
    ],
    Address: {
        type: Array,
        required: true
    },
    status: {
        type: String,
        required: true,
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        required: true
    },
    paymentStatus: {
        type: String,
        required: true
    },


})
module.exports = mongoose.model('order', orderModel)