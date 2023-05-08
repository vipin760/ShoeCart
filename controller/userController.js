const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const Product = require('../models/productModel');
const cart = require('../models/cartModel')
const twilio = require('twilio');
const cartModel = require('../models/cartModel');
const accountSid = "AC675a25a2d780ee8725bf65b03375b04f";
const authToken = "615f0a1cb5977894b5963fd9b18601bc";
const verifySid = "VA6ceb2129702f416081156cb20ce9ca85";
const client = require("twilio")(accountSid, authToken);
const nodemailer = require('nodemailer');
const randomstring = require("randomstring");
const config = require('../config/config');
const { findOneAndUpdate } = require('../models/userModel');
const { body, validationResult } = require('express-validator');
const objectId = require('mongodb').ObjectID
const Banner = require('../models/bannerModel');
const Category = require('../models/categoryModel')



//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;
    } catch (error) {
        console.log(error.message);
    }
}




//////////////////////////////////////////load error page//////////////////////////////////////////////////////////////

const loadError = async (req, res) => {
    try {
        res.render('error')
    } catch (error) {
        console.log(error.message);
    }
}




////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const loadLogin = async (req, res) => {
    try {
        res.render('login', { productData: '', user: '', bannerData: '', type: '' });
    } catch (error) {
        console.log(error.message);
    }
}




////////////////////////////////////////////////////////verify login for users//////////////////////////////////////////////

const verifyLogin = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const userData = await User.findOne({ email: email })
        if (userData) {
            const passwordMatch = await bcrypt.compare(password, userData.password);
            if (passwordMatch) {
                if (userData.status === true) {
                    if (userData.is_User == 1) {
                        req.session.isLoggedIn = true;
                        req.session.userId = userData._id;
                        res.redirect('/login');
                    } else {
                        res.render('login', { message: "admin blocked please contact" });
                    }



                } else {
                    res.render('login', { message: "email or password incorrect" });
                }

            } else {
                res.render('login', { message: "email or password incorrect" });
            }

        } else {
            res.render('login', { message: "email or password incorrect" })
        }

    } catch (error) {
        console.log(error.message);
    }
}



/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const loadRegister = async (req, res) => {
    try {
        res.render('registration', { errors: '' })
    } catch (error) {
        console.log(error.message);
    }
}




/////////////////////////////////////////////////////////////////////////////////user values insert here///////////////////////////////

const insertUser = async (req, res) => {
    try {

        const { username, email, mobile, password } = req.body
        const errors = validationResult(req);
        
        if (!errors.isEmpty()) {
            return res.render('registration', {
                pageTile: 'registration',
                page: 'registration',
                isAuthenticated: req.session.isLoggedIn,
                errors: errors.array()[0].msg
            });
        }
        const spassword = await securePassword(password);
        const user = new User({
            username: username,
            email: email,
            mobile: mobile,
            password: spassword
        })
        const userData = await user.save()
        if (userData) {
            res.render('registration', { message: "registered successfully", errors: '' });
        } else {
            res.render('registration', { message: "registration failed", errors: '' })
        }


    } catch (error) {
        console.log(error.message);
    }
}




////////////////////////////////////////////////// home page loading//////////////////////////////////////////////////////////////////////

const loadHome = async (req, res) => {
    try {
        const user = req.session.isLoggedIn;
        var productData = await Product.find({ list: true });
        var search = '';
        if (req.query.search) {
            search = req.query.search
        }
        var page =1 ;
        if(req.query.page){
            page = req.query.page;
        }
        const lim = 4
            var productData = await Product.find({
                list: true,
                $or: [
                    { productName: { $regex: '.*' + search + '.*', $options: 'i' } },
                    { status: { $regex: '.*' + search + '.*', $options: 'i' } },

                ]
            })
            .limit(lim*1)
            .skip((page - 1) * lim)
            .exec();


            var count = await Product.find({
                list: true,
                $or: [
                    { productName: { $regex: '.*' + search + '.*', $options: 'i' } },
                    { status: { $regex: '.*' + search + '.*', $options: 'i' } },

                ]
            }).countDocuments()
        const bannerData = await Banner.findOne({ list: 1 });
        const category = await Category.find();
        if (user) {
            res.render('home', { productData, user, bannerData, type: '' , totalPages:Math.ceil(count/lim) , currentPage:page ,category });

        } else {
            res.render('home', { productData, user: '', bannerData, type: '' , totalPages:Math.ceil(count/lim) , currentPage:page , category })
        }

    } catch (error) {
        console.log(error.message)
        res.render('error');
    }
}



////////////////////////////////////////////////////////////////////////load single product///////////////////////////////////////////

const singleProduct = async (req, res) => {
    try {
        res.render('single-product')
    } catch (error) {
        res.render('error')
    }
}



//////////////////////////////////////////////////////////////////load checkout page/////////////////////////////////////////////////

const loadCheckout = async (req, res) => {
    try {
        const user = req.session.isLoggedIn;
        if (user) {
            res.render('checkout');
        } else {
            res.redirect('/');
        }

    } catch (error) {
        res.render('error');
    }
}




////////////////////////////////////////////////////////////////////////////load category pages/////////////////////////////////////////// 

const loadCategory = async (req, res) => {
    try {
        res.render('category');
    } catch (error) {
        res.render('error');
    }
}




//////////////////////////////////////////////////////////////////////////////// load contact///////////////////////////////////////////// 

const loadContact = async (req, res) => {
    try {
        res.render('contact');
    } catch (error) {
        res.render('error');
    }
}



//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const getNumber = async (req, res) => {
    try {
        res.render('verify-number')
    } catch (error) {
        res.render('error');
    }
}



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const verifynumber = async (req, res) => {
    try {
        const mobileData = req.body.number;
        req.session.mobileData = mobileData;
        client.verify.v2
            .services(verifySid)
            .verifications.create({ to: "+91" + mobileData, channel: "sms" })
            .then((verification) => {
                res.render('verify-otp');
            })
    } catch (error) {
        res.render('error');
        console.log(error.message)
    }
}



/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const getOtp = async (req, res) => {
    try {
        res.render('verify-otp');
    } catch (error) {
        res.render('error');
    }
}
const verifyOtp = async (req, res) => {
    try {
        const otp = req.body.otp;
        const mobileData = req.session.mobileData
        client.verify.v2
            .services(verifySid)
            .verificationChecks.create({ to: "+91" + mobileData, code: otp })
            .then((verification_check) => {
                req.session.isLoggedIn = true;
                res.redirect('/')
            })
        delete req.session.mobileData;
    } catch (error) {
        res.render('error');
    }
}



//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const loadMenCategory = async (req, res) => {
    try {
        const user = req.session.isLoggedIn;
        const id = req.query.id;
        const bannerData = await Banner.findOne({list:1});
        const category = await Category.find();
        const productData = await Product.find({category:id}).populate('category',)
        console.log("productData",productData)
        if (productData) {
            console.log("working",productData)
            res.render('category', { productData, user , category , bannerData });
        } else {
            res.redirect('/')
        }
    } catch (error) {
        console.log(error.message);
        res.render('error');
    }
}



/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const loadWomenCategory = async (req, res) => {
    try {
        const user = req.session.isLoggedIn;
        const id = req.query.id;
        const productData = await Product.find({ category: id });

        if (productData) {
            console.log(productData);
            res.render('category', { productData, user, type });
        } else {
            res.redirect('/')
        }
    } catch (error) {
        console.log(error.message);
    }
}



///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const loadKidsCategory = async (req, res) => {
    try {
        const user = req.session.isLoggedIn;
        const id = req.query.id;
        const productData = await Product.find({ category: id });
        if (productData) {
            res.render('category', { productData, user, type });
        } else {
            res.redirect('/')
        }
    } catch (error) {
        res.render('error');
    }
}




/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const loadLogout = async (req, res) => {
    try {
        const user = req.session.isLoggedIn
        if (user) {
            delete req.session.userId
            delete req.session.isLoggedIn
            res.redirect('/');
        } else {
            res.redirect('/');
        }

    } catch (error) {
        res.render(error);
    }
}


/////////////////////////////////////////////////////////////////// cart pages section/////////////////////////////////////////////////////

const loadCart = async (req, res) => {
    try {
        const user = req.session.isLoggedIn
        res.render('add-cart', { user });
    } catch (error) {
        res.render('error');
    }
}



/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const addToCart = async (req, res) => {
    try {


        const productId = req.query.id;
        const userId = req.session.userId;
        const userCart = await cart.findOne({ user_id: userId });
        if (userCart) {

        } else {
            const cartObj = new cart({
                user: userId,
                products: [productId]
            })

            const saveData = await cartObj.save()
        }





    } catch (error) {
        res.render('error')
    }
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const loadForgetPassword = async (req, res) => {
    try {
        res.render('forget-password');
    } catch (error) {
        res.render('error')
    }
}

//////////////////////////yv8u0c0qQ1NoEnOC0gQ3rVAiFjfLyttll3D06DfR/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const sendResetPasswordMobile = async (req, res) => {
    try {
        const mobile = req.body.mobile;
        req.session.mobile = mobile
        const userData = await User.findOne({ mobile: mobile });
        console.log(userData);
        if (userData) {
            const mobile = userData.mobile;
            client.verify.v2
                .services(verifySid)
                .verifications.create({ to: "+91" + mobile, channel: "sms" })
                .then((verifications) => {
                    res.render('forget-password-otp');
                })

        } else {
            res.render('forget-password', { message: 'number is invalid' })
        }
    } catch (error) {
        console.log(error.message);
        res.render("error");
    }
};

const verifyforgetPassword = async (req, res) => {
    const otp = req.body.otp;
    const mobileData = req.session.mobile
    client.verify.v2
        .services(verifySid)
        .verificationChecks.create({ to: "+91" + mobileData, code: otp })
        .then((verification_check) => {
            res.render('forget-password-confirm')
        })

}

const insertPassword = async (req, res) => {
    try {
        const { password, cpassword } = req.body
        console.log(req.body);
        const mobile = req.session.mobile;
        if (password === cpassword) {
            const spassword = await securePassword(password);
            const updatePassword = await User.updateOne({ mobile: mobile }, { $set: { password: spassword } })
            res.render('login')

        } else {
            res.render('forget-password-confirm', { message: "new password and confirm password not match" });
        }
        delete req.session.mobile;

    } catch (error) {
        res.render('error');
    }
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const loadRough = async (req, res) => {
    try {
        res.render('rough', { user: '' })
    } catch (error) {
        res.render('error')
    }
}


/////////////////////////////////////////////////////////////////////////////////////////////////////

const updateUser = async (req, res) => {
    try {
        console.log(req.body)
        const user = req.session.isLoggedIn;
        const userId = req.session.userId;
        if (user) {
            const { mobile, address, state, district, city, landMark, pincode } = req.body
            if (!mobile || !address || !state || !district || city || landMark || pincode) {
                res.jsone({ status: false, msg: 'file data is not completed' })

            }
            console.log(mobile, address, state, district, city, landMark, pincode);
            const userData = await User.updateOne({ _id: userId }, {
                $set: {
                    mobile: mobile,
                    address: address,
                    state: state,
                    district: district,
                    city: city,
                    landMark: landMark,
                    pincode: pincode,
                }
            })
            if (userData) {
                res.json({ status: true });
            } else {
                res.json({ status: false });
            }

        }
    } catch (error) {

    }
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
module.exports = {
    loadLogin,
    loadRegister,
    insertUser,
    verifyLogin,
    loadError,
    loadHome,
    singleProduct,
    loadCheckout,
    loadCategory,
    loadContact,
    getOtp,
    verifyOtp,
    getNumber,
    verifynumber,
    loadMenCategory,
    loadWomenCategory,
    loadKidsCategory,
    loadLogout,
    loadCart,
    addToCart,
    loadForgetPassword,
    sendResetPasswordMobile,
    verifyforgetPassword,
    insertPassword,
    updateUser,
    loadRough,




}