const Category = require('../models/categoryModel');
const User = require('../models/userModel');
const Product = require('../models/productModel');
const bcrypt = require('bcrypt');
const Admin = require('../models/adminModel')
const Order = require('../models/orderModel');
const { body, validationResult } = require('express-validator');
const { ObjectId } = require('mongodb');



/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const loadAdminHome = async (req, res) => {
    try {
        const admin = req.session.isAdminLoggedIn;
        if (admin) {
            const orders = await Order.find()
            const oneYearAgo = new Date(Date.now() - (365 * 24 * 60 * 60 * 1000)); // set the date one year ago
            const ordersLastYear = orders.filter(order => new Date(order.orderDate) >= oneYearAgo);

            const userData = await User.find({is_User:1});
            const users = userData.length

            const newOrder = await Order.find({ status: 'success' });
            
           if(ordersLastYear.length ||  users || newOrder.length ){
            res.render('admin-home', { orderNumber: ordersLastYear.length, users: users, newOrderCount: newOrder.length });
           }else{
            res.render('admin-home', { orderNumber: '' , users: '', newOrderCount: '' });
           }
            
        } else {
            res.redirect('/admin/admin-login')
        }

    } catch (error) {
        console.log(error.message)
        res.render('error');
    }
}



/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const loadProduct = async (req, res) => {
    try {
        const admin = req.session.isAdminLoggedIn
        if (admin) {
            const categoryData = await Category.find()
            res.render('add-product', { categoryData, errors: '' })
        } else {
            res.redirect('/admin/admin-login')
        }
    } catch (error) {
        console.log(error.message);
    }
}



///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const addCategory = async (req, res) => {
    try {
        const admin = req.session.isAdminLoggedIn
        if (admin) {
            res.render('add-category', { errors: '' });
        } else {
            res.redirect('/admin/admin-login')
        }
    } catch (error) {
        res.render('error');
    }
}



//////////////////// admin add and insert category list of products/////////////////////////////////////////////////////////////////////

const categoryList = async (req, res) => {
    try {
        const admin = req.session.isAdminLoggedIn
        if (admin) {
            const categoryData = await Category.find();
            res.render('category-list', { categoryData });
        } else {
            res.redirect('/admin/admin-login')
        }
    } catch (error) {
        res.render('error');
    }
}



//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const insertCategory = async (req, res) => {
    try {

        const { name, description } = req.body;

        if (!name || !description) {
            res.render('add-category', { message: 'incorrect values' })

        } else {
            const exist = await Category.findOne({ name: name })


            if (!exist) {
                const category = new Category({
                    name: name,
                    description: description
                })

                const categoryData = await category.save();
                if (categoryData) {
                    res.redirect('/admin/category-list')
                }
            } else {
                res.render('add-category', { message: 'category already exist' })
            }


        }



    } catch (error) {
        console.log(error.message);
    }
}



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const loadAdminlogin = async (req, res) => {
    try {
        const admin = req.session.adminId;
        if (admin) {
            res.render('admin-home');
        } else {
            res.render('admin-login')
        }
    } catch (error) {
        res.render('error');
    }
}




/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const verifyAdminLogin = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const adminData = await Admin.findOne({ email: email });
        if (adminData) {
            const passwordMatch = await bcrypt.compare(password, adminData.password);
            if (passwordMatch) {
                if (adminData.is_Admin === 1) {
                    req.session.isAdminLoggedIn = true;
                    req.session.adminId = adminData._id;
                    if (req.session.adminId) {
                        res.render('admin-home')
                    } else {
                        res.render('/admin/admin-login')
                    }

                }
            } else {
                res.render('admin-login', { message: "email or password incorrect" });
            }
        } else {
            res.render('admin-login', { message: "email or password incorrect" });
        }
    } catch (error) {
        res.render('error');
    }
}



////////////////////////////////////////////////load edit users page///////////////////////////////////////////////////////////////////

const loadEditUsers = async (req, res) => {
    try {
        const admin = req.session.isAdminLoggedIn
        if (admin) {
            const userData = await User.find();
            res.render('edit-users', { userData });
        } else {
            res.redirect('/admin/admin-login')
        }
    } catch (error) {
        res.render('error');
    }
}



///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const blockUser = async (req, res) => {
    try {
        const id = req.query.id;
        const user = await User.updateOne({ _id: id }, { $set: { is_User: 0 } });
        const userData = await User.find()

        if (user) {
            res.render('edit-users', { message: "user blocked successfully", userData });
        } else {
            res.render('edit-users', { message: "user notblocked", userData });
        }
    } catch (error) {
        res.render('error');
    }
}



///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const unblockUser = async (req, res) => {
    try {
        const id = req.query.id;
        const user = await User.updateOne({ _id: id }, { $set: { is_User: 1 } })
        const userData = await User.find()
        if (user) {
            res.render('edit-users', { message: "user notblocked", userData });
        } else {
            res.render('edit-users', { message: "user blocked successfully", userData });
        }
    } catch (error) {
        console.log(error.message);
    }
}




///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const productDeleted = async (req, res) => {
    try {
        const id = req.query.id;
        await Product.deleteOne({ _id: id }).then((response) => {
            res.redirect('/admin/product-list')
        })

    } catch (error) {
        console.log(error);
    }
}




///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const loadLogout = async (req, res) => {
    try {
        delete req.session.adminId;
        delete req.session.isAdminLoggedIn;
        if (req.session.isLoggedIn) {
            res.redirect('/admin/admin-login')
        } else {
            res.redirect('/admin/admin-login')
        }


    } catch (error) {
        res.render('error');
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const deleteCategory = async (req, res) => {
    try {
        const id = req.query.id
        await Category.deleteOne({ _id: id }).then((data) => {
            res.redirect('/admin/category-list')
        })
    } catch (error) {
        res.render(error)
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const loadEditCategory = async (req, res) => {
    try {
        const admin = req.session.isAdminLoggedIn;
        if (admin) {
            const id = req.query.id
            req.session.query = id
            const categoryData = await Category.findOne({ _id: id });
            res.render('edit-category', { categoryData })
        } else {
            res.redirect('/admin/admin-login');
        }


    } catch (error) {
        res.render('error');
    }

}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const updateCategory = async (req, res) => {
    try {
        const admin = req.session.isAdminLoggedIn;
        const id = req.session.query;
        if (admin) {
            const categoryDatas = await Category.find();
            const { name, description } = req.body;
            if (!name || !description) {
                res.render('edit-category', { message: 'please fill the form' })
            } else {
                await Category.findOneAndUpdate({ _id: id }, { $set: { description: description } }).then(async () => {
                    //same category not allowed
                    const exist = categoryDatas.filter((p) => p.name === name);
                    if (exist.length === 0) {
                        const updateOne = await Category.findOneAndUpdate({ _id: id }, { $set: { name: name } });
                        res.redirect('/admin/category-list')
                    } else {
                        const categoryData = await Category.findOne({ _id: id });
                        res.render("edit-category", { categoryData, message: "already exist please add another category name" });
                    }
                })
            }
        }

        delete req.session.query;


    } catch (error) {
        res.render('error');
    }
}

module.exports = {
    loadAdminHome,
    loadProduct,
    addCategory,
    categoryList,
    loadAdminlogin,
    insertCategory,
    verifyAdminLogin,
    loadEditUsers,
    blockUser,
    unblockUser,
    productDeleted,
    loadLogout,
    deleteCategory,
    loadEditCategory,
    updateCategory




}