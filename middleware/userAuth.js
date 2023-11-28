const User=require('../model/usermodel')

const isLogged=((req,res,next)=>{
    let isBlock=false
    
    if(req.session.user){
        User.findById({id:req.session.user}).lean()
        .then((data)=>{
            if(data.block==false){
                res.redirect('/')
            }else{
                 isBlock=true
                res.render('User/login',{isBlock})
            }
        })
    }else{
     
        next()
    }
    
})
module.exports={
    isLogged,
}