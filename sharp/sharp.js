const sharp=require('sharp')
const fs=require('fs')
const path=require('path')


function imageCrop(req,res,next){
    
    console.log(req.files,'thdi is fiels');
    console.log(req.file,'this is file');

    const inputImgpath=req.files[0].path
    console.log(inputImgpath,'thid is input image ath');
    sharp(inputImgpath)
        .resize(440,380)
        .toFormat('webp')
        .toBuffer((err,processedImg)=>{
            if(err){
                console.log('error happend in image crop ',err)
                next(err)
            }else{
                fs.writeFile(inputImgpath,processedImg,(writeErr)=>{
                    if(writeErr){
                        console.log('error while saving the sharped img',writeErr)
                        next(writeErr)
                    }else{
                        console.log('successfully saved sharped img to file path',inputImgpath)
                        next()
                    }
                })
            }
        })
    
}
module.exports=imageCrop
