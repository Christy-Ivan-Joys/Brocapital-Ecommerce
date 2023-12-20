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
    // Indian Standard Time (IST) is UTC+5:30
    const istOffset = 330;

    // Adjust the startdate and Enddate based on the IST offset
    this.startdate.setMinutes(this.startdate.getMinutes() + istOffset);
    this.Enddate.setMinutes(this.Enddate.getMinutes() + istOffset);

    next();
});

// couponModel.pre("save", function (next) {

//     this.startdate.setUTCHours(0, 0, 0, 0);
//     this.Enddate.setUTCHours(0, 0, 0, 0);
//     const startDateOffset = this.startdate.getTimezoneOffset();
//     this.startdate.setUTCMinutes(this.startdate.getUTCMinutes() - startDateOffset);

//     const endDateOffset = this.Enddate.getTimezoneOffset();
//     this.Enddate.setUTCMinutes(this.Enddate.getUTCMinutes() - endDateOffset);
//     next();
    
//   });
module.exports=mongoose.model('Coupon',couponModel)                          