const ISadmin = async (req, res,next) => {
    try {
        if (req.session.isAdmin) {
            next()
        } else {
            console.log('ehlloooo')
            res.redirect('/admin')
        }

    } catch (error) {
        console.log('error in admin auth in middleware', error)
    }
}
const isLogout=async(req,res,next)=>{
    try{
        if(req.session.isAdmin){
            res.redirect("/admin/dashboard");
            
        }else{
            next();
        }
        
        
        
    } catch(error){
        console.log(error.message);
    }
};

module.exports={
    ISadmin,
    isLogout
}