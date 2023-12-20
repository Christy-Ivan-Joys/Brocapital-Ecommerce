const mongoose = require('mongoose')
const moment = require('moment-timezone')



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
        type: Date,
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
            size: String,
            isReturned: {
                type: Boolean,
                default: false
            }
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
    UserOrderStatus: {
        type: String,
        required: true,
        default: 'Order placed'

    }


})

orderModel.pre('save', function (next) {
  // Assuming that createdOn is a Date object
  const updatedDate = new Date(this.createdOn);
  updatedDate.setHours(updatedDate.getHours() + 5);
  this.createdOn = updatedDate;
  next();
});
module.exports = mongoose.model('order', orderModel)