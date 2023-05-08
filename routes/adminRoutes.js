
const express = require('express');
const admin_Route = express();
const { body, validationResult } = require('express-validator')
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/adminAuth')
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/images'));
    },
    filename: function (req, file, cb) {
        const name = Date.now() + '-' + file.originalname;
        cb(null, name)
    }
}) 

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb('Error: JPEG or PNG images only!');
    }
})
const adminController = require('../controller/adminController');
const productController = require('../controller/productController');
const couponController = require ('../controller/couponController');
const orderController = require ('../controller/orderController');
const bannerController = require ('../controller/bannerController.js');
admin_Route.set('views', './views/admin');
admin_Route.get('/admin-home',auth.verify_admin, adminController.loadAdminHome);
admin_Route.get('/add-category',auth.verify_admin, adminController.addCategory);
admin_Route.post('/add-category',auth.verify_admin,adminController.insertCategory);
admin_Route.get('/category-list',auth.verify_admin, adminController.categoryList);
admin_Route.get('/delete-category',auth.verify_admin, adminController.deleteCategory);
admin_Route.get('/update-category',auth.verify_admin,adminController.loadEditCategory);
admin_Route.post('/update-category',auth.verify_admin,adminController.updateCategory);
admin_Route.get('/sales-report',orderController.loadSalesreport)
admin_Route.post('/salesReport',auth.verify_admin,orderController.searchDate)

admin_Route.get('/admin-login',auth.logout_admin, adminController.loadAdminlogin);
admin_Route.post('/admin-login',auth.logout_admin, adminController.verifyAdminLogin);
admin_Route.get('/admin-logout',auth.verify_admin, adminController.loadLogout);

admin_Route.get('/product-list',auth.verify_admin, productController.loadProductlist);
admin_Route.get('/add-product',auth.verify_admin, adminController.loadProduct);
admin_Route.post('/add-product',auth.verify_admin, upload.array('images', 5), productController.insertProduct);
admin_Route.get('/edit-product',auth.verify_admin, productController.loadEditProduct)
admin_Route.post('/edit-product',auth.verify_admin, upload.array('images', 5), productController.updateEditProduct);
admin_Route.get('/delete-product',auth.verify_admin, adminController.productDeleted);
admin_Route.delete('/delete-edit-productimages',auth.verify_admin,productController.deleteimgEdidtproducts)

admin_Route.get('/order-management',auth.verify_admin,orderController.loadOrderManagement);
admin_Route.patch('/order-shipped',auth.verify_admin,orderController.orderShipped)

admin_Route.get('/edit-users',auth.verify_admin, adminController.loadEditUsers);
admin_Route.get('/block-user',auth.verify_admin, adminController.blockUser);
admin_Route.get('/unblock-user',auth.verify_admin, adminController.unblockUser);

admin_Route.get('/add-banner',auth.verify_admin,bannerController.loadBannerPage);
admin_Route.post('/add-banner',auth.verify_admin,upload.array('images',5),bannerController.insertBanner);
admin_Route.get('/banner-list',auth.verify_admin,bannerController.loadBannerList);
admin_Route.get('/edit-banner',auth.verify_admin,bannerController.loadeditBanner);
admin_Route.post('/edit-banner',auth.verify_admin,upload.array('images',5),bannerController.insertEditbanner);
admin_Route.get('/delete-banner',auth.verify_admin,bannerController.deleteBanner);
admin_Route.get('/banner-unlistBanner',auth.verify_admin,bannerController.listBanner);
admin_Route.get('/banner-listBanner',auth.verify_admin,bannerController.unlistBanner);

admin_Route.get('/create-coupon',auth.verify_admin,couponController.loadCreateCouponPage);
admin_Route.post('/create-coupon',auth.verify_admin,couponController.insertCoupon);






module.exports = admin_Route;