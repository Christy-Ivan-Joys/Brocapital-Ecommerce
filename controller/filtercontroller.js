const User = require('../model/usermodel')
const Product = require('../model/productmodel')
const db = require('../Config/connection')
const mongoose = require('mongoose')
const Category=require('../model/categorymodel')

const getAllproducts=async(req,res)=>{
    try {
        const products=await Product.find({$or:[
            {category:'Men'},{category:'Women'}]}).limit(8)
res.status(200).json({status:true,data:products})
        
    } catch (error) {
        console.log('error happend in user contrl in getAllproducts',error)   
        res.status(400).json({status:false})     
    }
}
module.exports={
    getAllproducts,        
}
