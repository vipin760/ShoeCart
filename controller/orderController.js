const Address = require('../models/addressModel');
const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
const Order = require('../models/orderModel');
const User = require('../models/userModel');
const Coupon = require('../models/couponModel');
const Wallet = require('../models/walletModel');
const Category = require('../models/categoryModel')
var dateTime = require('node-datetime');
const mongoose = require('mongoose');
const Razorpay = require('razorpay');
const { resolve } = require('path');
const DateTime = require('node-datetime/src/datetime');
require('dotenv').config()
var instance = new Razorpay({
    key_id: process.env.KEY_ID,
    key_secret: process.env.KEY_SECRET,
});


const pdf = require('html-pdf')
const path = require('path')
const fs = require('fs')
const ejs = require('ejs')
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const loadCheckout = async (req, res) => {
    try {
        const user = req.session.isLoggedIn;
        const userId = req.session.userId;
        const totalQuantity = req.body.totalQuantity;

        if (user) {
            const category = await Category.find();
            const address = await Address.find({ user_id: userId, delete: true });
            const cartData = await Cart.findOne({ user_id: userId }).populate('products.product_id');
            const subTotalPrice = cartData ? cartData.products.reduce((acc, cur) => acc + cur.totalPrice, 0) : 0;
            const wallet = await Wallet.findOne({ user_id: userId })
            res.render('place-order', { user, address, cartData, subTotalPrice, totalQuantity, userId, wallet, category });
        } else {
            res.redirect('/');
        }
    } catch (error) {
        console.log(error.message);
        res.render('error');
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const applyCoupon = async (req, res) => {
    try {
        const user = req.session.isLoggedIn;
        const userId = req.session.userId;
        if (user) {
            const couponCode = req.body.couponCode;
            const couponData = await Coupon.findOne({ name: couponCode });
            //  const discount = Number(couponData.discount);
            if (couponData) {
                const currentDate = new Date();
                if (couponData.status === 'true') {
                    if (couponData && currentDate <= couponData.expiry) {
                        // Coupon is valid and not expired
                        const discount = couponData.discount;
                        const cartData = await Cart.findOne({ user_id: userId }).populate('products.product_id');
                        const subTotalPrice = cartData ? cartData.products.reduce((acc, cur) => acc + cur.totalPrice, 0) : 0;
                        const getDiscount = subTotalPrice * discount / 100
                        res.json({ status: true, getDiscount });
                    } else {
                        // Coupon is invalid or expired
                        res.json({ status: false, msg: 'coupon expire' });
                    }
                } else {
                    res.json({ status: false, msg: 'coupon already used...!' })
                }

            } else {
                res.json({ status: false, msg: 'invalid coupon' });

                //couponData else
            }


        }
    } catch (error) {
        console.log(error.message);
        res.render('error')
    }
}



///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const placedOrder = async (req, res) => {
    try {
        const user = req.session.isLoggedIn;
        const userId = req.session.userId;
        if (user) {
            if (!req.body.flexRadioDefault || !req.body.selector) {
            } else {

                const cartData = await Cart.findOne({ user_id: userId }).populate('products.product_id');
                const outofStock = cartData.products.filter(p => p.product_id.status === 'Available');
                const userData = await User.findOne({ _id: userId })
                if (userData.is_User === 1) {
                    if (outofStock.length !== 0) {
                        if (cartData) {
                            const cartOrders = cartData.products;
                            let subTotalPrice = cartData ? cartData.products.reduce((acc, cur) => acc + cur.totalPrice, 0) : 0;
                            const totalQuantity = cartData ? cartData.products.reduce((acc, cur) => acc + cur.quantity, 0) : 0;
                            //find order date and deliverDate
                            var days = 7;
                            var newDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
                            var recentDate = new Date();
                            var deliveredDate = newDate;
                            if (req.body.subTotalPrice) {
                                subTotalPrice = req.body.subTotalPrice;
                            }

                            // create orders in database
                            if (cartOrders) {
                                const orderSave = new Order({
                                    products: cartData.products,
                                    user_id: userId,
                                    address_id: req.body.flexRadioDefault,
                                    quantity: totalQuantity,
                                    totalPrice: subTotalPrice,
                                    orderDate: recentDate,
                                    deliveryDate: deliveredDate,
                                    paymentMethod: req.body.selector,
                                    orderStatus: '',
                                    userStatus: '',
                                    paymentStatus: 'pending',
                                    status: 'pending',
                                })
                                await orderSave.save().then(async (response) => {
                                    if (req.body.selector === 'COD') {
                                        const orderId = response._id;
                                        await Order.updateOne({ user_id: userId, _id: orderId }, { $set: { status: 'success', orderstatus: 'confirm', paymentStatus: 'pending' } }).then(() => {
                                        }).then((status) => {
                                            res.json({ codSuccess: true })
                                        }).then(async () => {
                                            for (let i = 0; i < cartOrders.length; i++) {
                                                const productId = cartOrders[i].product_id;
                                                const productQty = cartOrders[i].quantity;
                                                const productActQty = await Product.findOne({ _id: productId });
                                                if (productActQty.quantity >= 1 || productActQty.status === "Available") {
                                                    const updateQty = productActQty.quantity - productQty
                                                    await Product.updateOne({ _id: productId }, { $set: { quantity: updateQty } }).then(p => { }).then(async () => {
                                                        if (updateQty === 0) {
                                                            await Product.updateOne({ _id: productId }, { $set: { status: 'unavailable' } })
                                                        } else {
                                                            await Product.updateOne({ _id: productId }, { $set: { status: 'Available' } })
                                                        }
                                                    })
                                                }
                                            }
                                        }).then(async () => {
                                            if (req.body.CouponName) {

                                                const couponData = await Coupon.updateOne({ name: req.body.CouponName }, { $set: { status: 'false' } });
                                            }
                                        })
                                    } else if (req.body.selector === 'wallet') {
                                        const walletAmount = await Wallet.findOne({ user_id: userId });
                                        if (walletAmount.amount < subTotalPrice) {
                                            res.json({ msg: 'wallet amount is less your purachase product' });
                                        } else {
                                            const orderId = response._id;
                                            await Order.updateOne({ user_id: userId, _id: orderId }, { $set: { status: 'success', orderstatus: 'confirm', paymentStatus: 'success' } }).then(() => {
                                            }).then(() => {
                                                res.json({ codSuccess: true })
                                            }).then(async () => {
                                                for (let i = 0; i < cartOrders.length; i++) {
                                                    const productId = cartOrders[i].product_id;
                                                    const productQty = cartOrders[i].quantity;
                                                    const productActQty = await Product.findOne({ _id: productId });
                                                    if (productActQty.quantity >= 1 || productActQty.status === "Available") {
                                                        const updateQty = productActQty.quantity - productQty
                                                        await Product.updateOne({ _id: productId }, { $set: { quantity: updateQty } }).then(p => { }).then(async () => {
                                                            if (updateQty === 0) {
                                                                await Product.updateOne({ _id: productId }, { $set: { status: 'unavailable' } })
                                                            } else {
                                                                await Product.updateOne({ _id: productId }, { $set: { status: 'Available' } })
                                                            }
                                                        })
                                                    }
                                                }
                                            }).then(async () => {
                                                if (req.body.CouponName) {

                                                    const couponData = await Coupon.updateOne({ name: req.body.CouponName }, { $set: { status: 'false' } });
                                                }
                                            }).then(async () => {
                                                const walletAmount = await Wallet.findOne({ user_id: userId });
                                                const updateAmount = walletAmount.amount - subTotalPrice;
                                                await Wallet.updateOne({ user_id: userId }, { $set: { amount: updateAmount } })
                                            })

                                        }

                                    }
                                    else {




                                        const orderId = "" + response._id;
                                        generateRazorpay(orderId, subTotalPrice).then((response) => {
                                            res.json({ response })
                                        }).then(async () => {
                                            for (let i = 0; i < cartOrders.length; i++) {
                                                const productId = cartOrders[i].product_id;
                                                const productQty = cartOrders[i].quantity;
                                                const productActQty = await Product.findOne({ _id: productId });
                                                if (productActQty.quantity >= 1 || productActQty.status === "Available") {
                                                    const updateQty = productActQty.quantity - productQty
                                                    await Product.updateOne({ _id: productId }, { $set: { quantity: updateQty } }).then(p => { }).then(async () => {
                                                        if (updateQty === 0) {
                                                            await Product.updateOne({ _id: productId }, { $set: { status: 'unavailable' } })
                                                        } else {
                                                            await Product.updateOne({ _id: productId }, { $set: { status: 'Available' } })
                                                        }
                                                    }).then(async () => {
                                                        if (req.body.totalQuantity) {
                                                            const couponData = await Coupon.updateOne({ name: req.body.CouponName }, { $set: { status: 'false' } });
                                                        }
                                                    })
                                                }
                                            }
                                        })
                                    }
                                })
                                //  res.json(req.body.selector);
                                await Cart.deleteOne({ user_id: userId });
                            }
                        } else {
                            res.redirect('/');
                        }
                        //end out of not stock
                    } else {
                        res.json({ status: false, msg: "out of stock" });
                        //end out of stock else case
                    }

                    //users check here 1 or 0    
                } else {
                    res.json({ status: false, msg: 'something issue about your account contact admin' });
                    //user check else case     
                }

            }
        } else {
            res.redirect('/')
        }

    } catch (error) {
        console.log(error.message);
        res.render('error')
    }
}
const generateRazorpay = async (orderId, subTotalPrice) => {
    try {
        const amount = subTotalPrice * 100; // amount in paisa
        const currency = 'INR';
        const receipt = orderId;

        const options = {
            amount: amount,
            currency: currency,
            receipt: orderId,
        };
        const response = await instance.orders.create(options);
        return response;
    } catch (error) {
        console.log(error);
        throw error;
    }
};


const verifyPayment = async (req, res) => {
    try {
        const { payment, order } = req.body;
        const userId = req.session.userId;
        const user = req.session.isLoggedIn;
        const orderId = order.response.receipt;
        if (user) {
            checkPayment(req.body).then(async () => {
                const orders = await Order.updateOne({ user_id: userId, _id: orderId }, { $set: { status: 'success', orderstatus: 'confirm', paymentStatus: 'success' } })
                res.json({ status: true })

            }).catch((error) => {
                console.log(error);
                res.json({ status: false, errMsg: '' })
            })

        } else {
            res.redirect('/');
        }



    } catch (error) {
        console.log(error);
        res.status(500).send('Server Error');
    }
};

const checkPayment = (details) => {
    return new Promise((resolve, reject) => {

        const crypto = require('crypto');
        let hmac = crypto.createHmac('sha256', '11zuaZwQgEkNaUT4lQosOaob');
        hmac.update(details.payment.razorpay_order_id + '|' + details.payment.razorpay_payment_id);
        hmac = hmac.digest('hex');
        if (hmac === details.payment.razorpay_signature) {
            resolve()


        } else {
            reject();

        }

    })
}



///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const thanksPage = async (req, res) => {
    try {
        const user = req.session.isLoggedIn;
        const userId = req.session.userId;
        if (user) {
            const category = await Category.find();
            const orderData = await Order.findOne({ user_id: userId }).populate('products.product_id');
            const addressId = orderData.address_id;
            const addresses = await Address.find();
            const addressData = addresses.find((value) => value._id.toString() == addressId);
            res.render('thanks-page', { user, orderData, addressData, category });
        } else {
            res.redirect('/')
        }

    } catch (error) {
        console.log(error.message);
        res.render('error');
    }
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const orderList = async (req, res) => {
    try {
        const category = await Category.find();
        const user = req.session.isLoggedIn;
        const userId = req.session.userId;
        if (user) {
            const orderData = await Order.find({ user_id: userId }).populate('address_id');
            if (orderData.length !== 0) {
                orderData.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))

                const users = await User.find();
                const addressId = orderData[0].address_id;
                const userData = users.find((val) => val._id.toString() == userId);
                const addressess = await Address.find();
                const addressData = addressess.find(val => val._id.toString() == addressId);
                res.render('orders', { user, orderData: orderData, userData, addressData, category });
            } else {
                res.render('orders', { user, orderData: '', category });
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

const viewProducts = async (req, res) => {
    try {
        const user = req.session.userId;
        if (user) {
            const category = await Category.find();
            const id = req.query.id;
            const orderData = await Order.findOne({ _id: id }).populate('products.product_id');
            const totalPrice = orderData.totalPrice;
            const totalQuantity = orderData.quantity;

            res.render('view-products-orders', { user, orderData, totalPrice, totalQuantity, category });

        } else {
            res.redirect('/');
        }

    } catch (error) {
        console.log(error.message);
        res.render('error');
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const loadOrderManagement = async (req, res) => {
    try {
        const admin = req.session.isAdminLoggedIn;
        const successOrders = await Order.find({ orderstatus: 'confirm' }).populate('address_id')
        const addressData = await Order.find({ orderstatus: 'confirm' }).populate('address_id');
        console.log("addressData.................................................", successOrders);
        res.render('order-management', { successOrders: successOrders.reverse(), addressData });
    } catch (error) {
        console.log(error.message);
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const orderShipped = async (req, res) => {
    try {
        const admin = req.session.isAdminLoggedIn;
        if (admin) {
            const id = req.body.id;
            const orderData = await Order.findOne({ _id: id })
            if (orderData.status !== 'cancel') {
                const inputStatus = req.body.status
                if (inputStatus === 'Shipping') {
                    await Order.updateOne({ _id: id }, { $set: { status: 'shipping' } }).then((response) => {
                        console.log(response)
                        res.json({ status: true })
                    })
                } else {
                    await Order.updateOne({ _id: id }, { $set: { status: 'delivered' } }).then((response) => {
                        res.json({ status: false });
                    })
                }
            } else {

            }


        }
    } catch (error) {
        console.log(error.message)
        res.render('error');
    }
}

//////////////////////////////////////////user cancel order////////////////////////////////////////////////////////////////////////

const orderCancel = async (req, res) => {
    try {
        const user = req.session.isLoggedIn;
        if (user) {
            const id = req.body.id;
            // await Order.updateOne({ _id: id }, { $set: { status: 'cancel' } }).then((response) => {
            //     res.json({ status: true, msg: 'order cancel' });
            // })

            const orderData = await Order.findOne({ _id: id });
            await Order.updateOne({ _id: id }, { $set: { status: 'cancel' } })
            if (orderData.paymentMethod === 'Razorpay' && orderData.paymentStatus === 'success') {
                await Wallet.updateOne({ user_id: req.session.userId }, { $inc: { amount: orderData.totalPrice } })
                res.json({ status: true, msg: 'order cancel' });

            } else if (orderData.paymentMethod === 'wallet') {
                await Wallet.updateOne({ user_id: req.session.userId }, { $inc: { amount: orderData.totalPrice } })
                res.json({ status: true, msg: 'order cancel' });

            } else {
                res.json({ status: true, msg: 'order cancel' });
            }
        }
    } catch (error) {
        console.log(error.message)
        res.render('error');
    }
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const loadSalesreport = async (req, res) => {
    try {
        const orderData = await Order.find({ status: "delivered" }).populate('address_id').populate('user_id')
        console.log(orderData)
        res.render('sales-report', { orderData: orderData.reverse() })

    } catch (error) {
        res.render('error');
    }
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const searchDate = async (req, res) => {
    try {
        const { startDate, endDate } = req.body;
        const productData = await Order.find().populate('address_id')
        const deliveryDate = productData.map(data => {
            const year = data.deliveryDate.getFullYear();
            const month = String(data.deliveryDate.getMonth() + 1).padStart(2, '0');
            const day = String(data.deliveryDate.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;

        })

        const filteredOrders = productData.filter(data => {
            const date = data.deliveryDate.toISOString().substr(0, 10)
            return data.status == "delivered" && date >= startDate && date <= endDate
        })
        const data = {
            orderSuccess: filteredOrders

        }

        const filePath = path.resolve(__dirname, '../views/admin/salesPdf.ejs')
        const htmlString = fs.readFileSync(filePath).toString()
        const ejsData = ejs.render(htmlString, { data: data.orderSuccess })
        let options = {
            format: 'A4',
            orientation: "portrait",
            border: "10mm",
            html: htmlString
        }
        pdf.create(ejsData, options).toStream((err, stream) => {
            if (err) {
                console.log(err);
            }
            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="sales-report.pdf"'
            });
            stream.pipe(res);
        });


    } catch (error) {
        res.render('error');
    }
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
module.exports = {
    loadCheckout,
    applyCoupon,
    placedOrder,
    thanksPage,
    orderList,
    viewProducts,
    verifyPayment,
    loadOrderManagement,
    orderShipped,
    orderCancel,
    loadSalesreport,
    searchDate



}