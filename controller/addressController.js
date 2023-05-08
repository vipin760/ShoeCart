const Address = require('../models/addressModel')
const User = require('../models/userModel');
const Wallet = require('../models/walletModel');
const Coupon = require('../models/couponModel');
const Category = require('../models/categoryModel')
 
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

const loadUserProfile = async (req, res) => {
    try {
        const category = await Category.find();
        const user = req.session.isLoggedIn;
        const userId = req.session.userId;
        if (user) {
            const category = await Category.find();
            const couponData=await Coupon.find({status:'true'})
            const walletData = await Wallet.findOne({user_id:userId}); 
            const userData = await User.findOne({ _id: userId });
            const userAddress = await Address.findOne({ user_id: userId });
            if (userAddress) {
                res.render('user-profile', { user, userAddress, userData , walletData , couponData ,category});

            } else {
                //user adress not here
                
                if (userData) {
                    res.render('user-profile', { user, userData , category });
                }
            }
        } else {
            res.redirect('/');
        }


    } catch (error) {
        console.log(error.message);
        res.render('error');
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const loadReward = async(req,res) =>{
    try {
        const category = await Category.find();
        const user = req.session.isLoggedIn;
        const coupon = await Coupon.find({status:'true'});
        const usedCoupon = await Coupon.find({status:'false'});
        res.render('rewards',{user,category,coupon,usedCoupon});
    } catch (error) {
        res.render('error')
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const addressForm = async (req, res) => {
    try {
        const user = req.session.userId;
        if (user) {
            const category = await Category.find();
            const address = await Address.find({user_id : user})
            const userData = await Address.find({_id:user})
            console.log(userData)
            res.render('address-form', { user ,address, userData , category});
        } else {
            res.redirect('/')
        }

    } catch (error) {
        console.log(error.message)
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const insertAddress = async (req, res) => {
    try {
       const user = req.session.isLoggedIn
       const category = await Category.find();
       if(user){
        const { userName, mobile, email, address, state, district, city, landMark, pincode } = req.body       
        if(!userName  || !mobile || !email || !address || !state || !district || !city || !landMark || !pincode ){
            res.render('address-form',{user,message:"please fill form correctly"})
    
            
        }else{
            const userEmail = await Address.findOne({email:email});
            if(!userEmail){
                const userMobile = await Address.findOne({mobile:mobile})

                if(!userMobile){
                    const saveAddress = new Address({
                        user_id : req.session.userId,
                        userName: userName,
                        mobile: mobile,
                        email: email,
                        address: address,
                        state: state,
                        district: district,
                        city: city,
                        landMark: landMark,
                        pincode: pincode
                    })
                    await saveAddress.save();
                    res.redirect('/check-out');




                }else{
                    res.render('address-form',{user,category,message:'mobile is already exist'})
                }



            }else{
                res.render('address-form',{user,category,message:'email is already exist'})

            }
  
        }
       }else{
        res.redirect('/')
       }


    } catch (error) {
        console.log(error.message);
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const editAddress = async(req,res)=>{
    try {
        const user = req.session.isLoggedIn;
        const category = await Category.find();
        if(user){
            const id = req.query.id;
            const userAddress = await Address.findOne({_id:id});
            res.render('edit-address',{user,userAddress,category});
        }else{
            res.redirect('/')
        }

    } catch (error) {
        console.log(error.message);
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////

const updateAddress = async(req,res)=>{
    try {
        const user = req.session.isLoggedIn;
        if(user){
            const {userName , mobile ,email , address ,state , district , city , landMark ,pincode} = req.body;
            const id =req.body.id;
           const updated = await Address.updateOne({_id:id,email:email},{$set:{
                userName:userName,
                mobile:mobile,
                email:email,
                address:address,
                state:state,
                district:district,
                city:city,
                landMark:landMark,
                pincode:pincode
            }}).then(()=>{
                res.redirect('/placeOrder')
            })

            
        }else{
            res.redirect('/')
        }
    } catch (error) {
        console.log(error.message);
        res.render('error');
    }

}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const deleteAddress = async(req,res)=>{
    try {
        const user = req.session.isLoggedIn;
        if(user){
            const id = req.query.id;
            const deleted = await Address.updateOne({_id:id},{$set:{delete:false}});
            if(deleted){
                res.redirect('/placeOrder')
            }
        }else{
            res.redirect('/')
        }
        
    } catch (error) {
        console.log(error.message)
        res.render('error');
    }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

module.exports = {
    loadUserProfile,
    loadReward,
    addressForm,
    insertAddress,
    editAddress,
    updateAddress,
    deleteAddress
}