const multer=require('multer')
const path=require('path')


const storage= multer.diskStorage({
destination:function(req,file,callback){
    callback(null,'public/adminassets/images/product')
},filename:function(req,file,callback){
// callback(null,file.filename+'-'+Date.now()+path.extname(file.originalname))
    const pathname = `${Date.now()}.webp`
    callback(null , pathname);
}})
const upload=multer({storage:storage})
module.exports = {upload}