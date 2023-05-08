const express = require('express');
const user_Routes = express();
const userController = require('../controller/userController');
const productController = require('../controller/productController');
const addressController = require('../controller/addressController');
const orderController = require('../controller/orderController');
const couponController = require('../controller/couponController');
const auth = require('../middleware/userAuth')
const cartController = require('../controller/cartController');
//const wishlistController = require('../controller/wishlistController');
const { body, validationResult } = require('express-validator');



user_Routes.set('views', './views/users');


////////////////////////////////////////////////////////////////////////////

user_Routes.get('/login',auth.logout_user, userController.loadLogin);
user_Routes.post('/login',auth.logout_user,userController.verifyLogin);
user_Routes.get('/register',auth.logout_user,userController.loadRegister)
user_Routes.post('/register', body('username')
        .isLength({ min: 5 })
        .withMessage("please enter proper name"),
        body('email')
                .isEmail()
                .withMessage('please enter a vaid email'),
        body('mobile')
                .isMobilePhone()
                .withMessage("please ente a valid mobile number"),
        body('password')
                .isStrongPassword()
                .withMessage('please enter strong password using alphabet special charracter'),
        userController.insertUser)

////////////////////////////////////////////////////////////////////////////////////////

user_Routes.get('/',userController.loadHome)
user_Routes.get('/logout',auth.verify_user, userController.loadLogout);

/////////////////////////product and order section///////////////////////////////////////////////

user_Routes.get('/single-product',productController.loadSingleProduct);
user_Routes.get('/cart',auth.verify_user, cartController.loadCart);
user_Routes.get('/add-cart', cartController.addToCart);
user_Routes.post('/incrementQty',auth.verify_user,cartController.incrementQty);
user_Routes.post('/add-to-wishlist',auth.verify_user,cartController.addToWishlist);
user_Routes.get('/view-wishlist',auth.verify_user,cartController.loadWishlist);
user_Routes.get('/check-out',auth.verify_user,orderController.loadCheckout);
user_Routes.post('/placed-order',auth.verify_user,orderController.placedOrder);
user_Routes.get('/thanks-page',auth.verify_user,orderController.thanksPage);
user_Routes.get('/my-orders',auth.verify_user,orderController.orderList);
user_Routes.get('/view-products',auth.verify_user,orderController.viewProducts);
user_Routes.post('/verify-payment',auth.verify_user,orderController.verifyPayment);
user_Routes.get('/remove-product',auth.verify_user,cartController.removeCart);
user_Routes.patch('/order-cancel',auth.verify_user,orderController.orderCancel)

/////////////////////////////////////////////////////////////////

// user_Routes.get('/category', userController.loadCategory);
user_Routes.get('/men-category', userController.loadMenCategory);
// user_Routes.get('/women-category', userController.loadWomenCategory);
// user_Routes.get('/kids-category', userController.loadKidsCategory);

////////////////////////////////////////////////////////////////////////////////////

user_Routes.get('/contact', userController.loadContact);
user_Routes.get('/verify-number',auth.logout_user, userController.getNumber);
user_Routes.post('/verify-number',auth.logout_user, userController.verifynumber);
user_Routes.get('/verify-otp',auth.logout_user, userController.getOtp);
user_Routes.post('/verify-otp',auth.logout_user, userController.verifyOtp);

user_Routes.get('/forget', userController.loadForgetPassword);
user_Routes.post('/forget',userController.sendResetPasswordMobile);
user_Routes.post('/forget-password-otp',userController.verifyforgetPassword);
user_Routes.post('/insert-forget',userController.insertPassword)

//user_Routes.post('/forget', userController.forgetVerify);

//////////////////reset password/////////////////////////////////////////////////

//user_Routes.get('/forget-password',auth.verify_user,userController.loadForgetPassword);
//user_Routes.post('/forget-password',auth.verify_user,userController.insertnorgetPassword);

//user_Routes.post('/forget-password',auth.verify_user,userController.forgetVerify)

/////////////////////adress section////////////////////////////////////////////
user_Routes.get('/user-profile',auth.verify_user,addressController.loadUserProfile);
user_Routes.get('/address',auth.verify_user,addressController.addressForm);
user_Routes.post('/address',auth.verify_user,addressController.insertAddress);
user_Routes.get("/edit-address",auth.verify_user,addressController.editAddress);
user_Routes.post('/edit-address',auth.verify_user,addressController.updateAddress);
user_Routes.get('/delete-address',auth.verify_user,addressController.deleteAddress);
user_Routes.post('/edit-userProfile',auth.verify_user,userController.updateUser);
user_Routes.get('/reward',auth.verify_user,addressController.loadReward)

/////////////////////////////////////////////////////////////////////////
 user_Routes.post("/apply-coupon",auth.verify_user,orderController.applyCoupon)
user_Routes.get('/rough',userController.loadRough);

module.exports = user_Routes;