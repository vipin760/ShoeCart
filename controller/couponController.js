const Coupon = require ('../models/couponModel');

const loadCreateCouponPage = async(req,res)=>{
    try {
       const admin = req.session.isAdminLoggedIn
       if(admin){
        const couponData = await Coupon.find();
        const usedcouponData = await Coupon.find({status:false})
        res.render('coupon',{admin,couponData,usedcouponData});
       }else{
        res.redirect('/admin/admin-login');
       }
    } catch (error) {
        console.log(error.message);
        res.render('error');
    }
} 


const insertCoupon = async (req,res) => {
    try {
        const { couponCodeName , discount ,expireDate , minPrice ,maxPrice } = req.body;
   if(!couponCodeName || !discount || !expireDate || discount<0 || couponCodeName.length<5 || couponCodeName.length>14 || maxPrice <0 || minPrice<0){
        res.json({status:false});
   }else{ 
    const saveCoupon = new Coupon({
        name:couponCodeName,
        expiry:expireDate,
        discount:discount,
        minPrice:minPrice,
        maxPrice:maxPrice,
    })
    await saveCoupon.save().then(()=>{
        res.json({status:true});
    })
}
        
    } catch (error) {
        console.log(error.message);
        res.render('error')
    }
    
}


//////////////////////////////////users apply coupon//////////////////////////////////////////////////////////////////////////////////////



module.exports = {
    loadCreateCouponPage,
    insertCoupon,
}