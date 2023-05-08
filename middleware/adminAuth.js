const verify_admin = (req,res,next)=>{
    try {
        if(req.session.adminId){
            next()
        }else{
            res.redirect('/admin/admin-login')
        }
        
    } catch (error) {
        console.log(error.message);
    }
}

const logout_admin = (req,res,next)=>{
    try {
        if(req.session.adminId){
           res.redirect('/admin/admin-home');
        }else{
           next()
        }
        
    } catch (error) {
        console.log(error.message);
    }
}

module.exports={
    verify_admin,
    logout_admin
}