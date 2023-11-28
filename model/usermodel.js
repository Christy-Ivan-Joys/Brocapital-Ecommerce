const mongoose = require('mongoose')

const addressModel = new mongoose.Schema({
    fullname: {
        type: String,
        required: true,
    },
    mobile: {
        type: Number,
        required: true,

    },
    pincode: {
        type: Number,
        required: true
    },
    town: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    primary: {
        type: Boolean,
        required: true,
        default: false
    },

    landmark: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    addressline: {
        type: String,
        required: true
    }
})




let userModel = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phonenumber: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    isAdmin: {
        type: Number,
        default: 0
    },
    block: {
        type: Boolean,
        required: true,
        default: false
    },
    wallet: {
        type: Number,
        default:0
    },

    cart: {
        type: Array,
        default: []
    },
    address: [addressModel]
})


module.exports = mongoose.model('User', userModel)
