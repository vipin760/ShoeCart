const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const { ObjectId } = require('mongodb');
const { validationResult } = require('express-validator');
const cart = require = require('../models/cartModel');
//const mongoose = require('mongoose');

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const insertProduct = async (req, res) => {
    try {
       const admin = req.session.isAdminLoggedIn;
       const categoryData = await Category.find();
       if(admin){
        console.log(req.body);
        const { productName, category, price, discount, quantity, status, description } = req.body
        const salePrice = price*discount/100;
        if(price<0 || salePrice <0 || discount <0 || quantity<0){
            res.render('add-product', { categoryData, message: "negative numbers is not allowed" })

        }else{
            if (!productName || !category || !price || !discount || !quantity || !status || !description) {
                res.render('add-product', { categoryData, message: "invalid field here please fill" })
            } else {
    
                let imagesUpload = []
                for (let i = 0; i < req.files.length; i++) {
                    imagesUpload[i] = req.files[i].filename
                }
               
                const product = new Product({
                    productName: productName,
                    category: category,
                    price: price,
                    salePrice: salePrice,
                    discount: discount,
                    quantity: quantity,
                    status: status,
                    description: description,
                    images: imagesUpload
                })
                const productData = await product.save();
                const categoryData = await Category.find();
                if (productData) {
                        res.render('add-product', { categoryData, message: "product added successfully" })
                   
                } else {
    
                    res.redirect('/admin/add-product')
                }
        }
       


        }
  }




    } catch (error) {
        console.log(error.message);
    }
}




//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const loadProductlist = async (req, res) => {
    try {
        const admin = req.session.isAdminLoggedIn
        if (admin) {
            const productData = await Product.find().populate('category');
           
            if (productData) {
                res.render('product-list', { productData})
            }
        } else {
            res.redirect('/admin/admin-login')
        }
    } catch (error) {
        console.log(error.message);
    }
}
const loadCategory = async (req, res) => {
    try {
        res.render('add-category');
    } catch (error) {
        res.render('error');
    }
}



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const loadProduct = async (req, res) => {
    try {
        const admin = req.session.isAdminLoggedIn
        if (admin) {
            const categoryData = await Category.find();
            res.render('add-product', { categoryData, errors: '' })
        } else {
            res.redirect('/admin/admin-login')
        }
    } catch (error) {
        console.log(error.message);
    }
}



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const loadEditProduct = async (req, res) => {
    try {
        const admin = req.session.isAdminLoggedIn
        if (admin) {
            const id = req.query.id;
            const categoryData = await Category.find();
            const productData = await Product.findOne({ _id: id }).populate('category');
            if (productData) {
                res.render('edit-product', { productData, categoryData })
            } else {
                res.render('edit-product');
            }
        } else {
            res.redirect('/admin/admin-login')
        }
    } catch (error) {
        res.render('error')
    }
}



/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const updateEditProduct = async (req, res) => {
    try {
        const id = req.body.id;
        const admin = req.session.isAdminLoggedIn;
        if (admin) {
            const { productName, category, price, discount, status, quantity, description } = req.body
            const salePrice = price*discount/100;
            if(price<0 || salePrice<0 || discount<0 || quantity <0){
                const categoryData = await Category.find();
                const productData = await Product.findOne({ _id: id });
                res.render('edit-product', { productData, categoryData,message:"Negative number not allowed" });

            }else{
                if(req.files.length>= 1){
                    const imagesUpload = []
                    for (let i = 0; i < req.files.length; i++) {
                        imagesUpload[i] = req.files[i].filename
                        await Product.updateOne({ _id: id },{$push : {images : imagesUpload[i] }})
                    }
                    const productData = await Product.findByIdAndUpdate({ _id: id }, {
                        $set: {
                            productName: productName,
                            category: category,
                            price: price,
                            salePrice: salePrice,
                            discount: discount,
                            status: status,
                            quantity: quantity,
                            description: description,
                        }
                    }).then(()=>{
                        res.redirect('/admin/product-list')
                    })
                }
                
            }
               
              
        }
    } catch (error) {
        console.log(error.message)
        res.render("error")
    }

}



/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const loadSingleProduct = async (req, res) => {
    try {
        const category = await Category.find();
        const productId = req.query.id;
        const user = req.session.isLoggedIn;
        const productData = await Product.find({ _id: productId }).populate('category');
        res.render('single-product', { productData, user ,category })

    } catch (error) {
        console.log(error.message)
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const deleteimgEdidtproducts = async (req, res) => {
    try {
      const admin = req.session.isAdminLoggedIn;
      if (admin) {
        const { id, images } = req.body;

  
        const updatedProduct = await Product.findOneAndUpdate(
            { _id: id },
            { $pull: { images: images } },
            { new: true }
          )
      }
    } catch (error) {
      console.log(error.message);
      res.render("error");
    }
  };
  

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////







module.exports = {
    insertProduct,
    loadProductlist,
    loadCategory,
    loadProduct,
    updateEditProduct,
    loadEditProduct,
    loadSingleProduct,
    deleteimgEdidtproducts



}

