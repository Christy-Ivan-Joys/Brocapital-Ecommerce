const mongoose = require('mongoose')
let bannerModel=new  mongoose.Schema({
name:{
    type:String,
    required:true
},
image:{
    type:String,
    required:true
},
status:{
    type:String,
    required:true
},
isDeleted:{
    type:Boolean,
    required:true,
    default:false
}

})
module.exports=mongoose.model('Banner',bannerModel)