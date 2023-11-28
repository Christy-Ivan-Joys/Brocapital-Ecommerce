const mongoose = require('mongoose')
let couponModel = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true
    },
    startdate: {
        type: Date,
        required: true,
        

    },
    Enddate: {
        type: Date,
        required: true,

    },
    description:{
        type:String,
        required:true
    },
    discount: {
        type: Number,
        required: true,

    },
    minprice: {
        type: Number,
        required: true,

    },
    user: {
        type: Array,

    },
    isdeleted:{
        type:Boolean,
        default:false,

    }

})
couponModel.pre("save", function (next) {

    this.startdate.setUTCHours(0, 0, 0, 0);
    this.enddate.setUTCHours(0, 0, 0, 0);
    this.startdate.setUTCMinutes(this.startdate.getUTCMinutes() - this.startdate.getTimezoneOffset());
    this.enddate.setUTCMinutes(this.enddate.getUTCMinutes() - this.enddate.getTimezoneOffset());
    next();
  });
module.exports=mongoose.model('Coupon',couponModel)                          