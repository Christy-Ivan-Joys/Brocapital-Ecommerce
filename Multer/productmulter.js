const multer=require('multer')
const path=require('path')
const axios=require('axios')









const storage= multer.diskStorage({
    
destination:function(req,file,callback){
   
    

    callback(null,'public/adminassets/images/productimg')
},filename:function(req,file,callback){


    const uniqueSuffix = Math.round(Math.random() * 1E9);
    callback(null , `${Date.now()}-${uniqueSuffix}.webp`);
}})
const proUpload=multer({storage:storage})
module.exports = {proUpload}