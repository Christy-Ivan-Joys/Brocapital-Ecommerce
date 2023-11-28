const ISadmin = async (req, res,next) => {
    try {
        if (req.session.isAdmin) {
            next()
        } else {
            res.redirect('/admin')
        }

    } catch (error) {
        console.log('error in admin auth in middleware', error)
    }
}


module.exports={
    ISadmin
}