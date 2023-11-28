const mongoose=require('mongoose')


let productSchema=new mongoose.Schema({
    productname:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true,
     },
     quantity:{
        type:Number,
        required:true
     },
   
     description:{
        type:String,
        required:true
     },
     brand:{
         type:String,
         required:true
     },
     category:{
        type:Object,
        required:true
     },
     size:{
        type:String,
        required:true
     },
   
     image:{
        type:Array

     },
     stock:{
        type:String,
        required:true
     },
     status:{
      type:Boolean,  
      default:true
     }

})

module.exports= mongoose.model('Product',productSchema)
