
const User = require('../models/userModel');
const Product = require('../models/productModel');
const cart = require('../models/cartModel');
const Address = require('../models/addressModel')
const { findOneAndUpdate } = require('../models/productModel');
const Wishlist = require('../models/wishlistModel.js');
const Wallet = require('../models/walletModel');
const Category = require('../models/categoryModel');



///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const loadCart = async (req, res) => {
    try {

        const user = req.session.isLoggedIn;
        const userId = req.session.userId;
        const category = await Category.find();
        if (user) {
            const walletData = await Wallet.findOne({user_id:userId})
            if(!walletData){
                const newWallet = new Wallet({
                    user_id:userId
              })
              await newWallet.save();
                }
            

            const cartData = await cart.findOne({ user_id: userId }).populate('products.product_id');
           if(cartData){
            const carts = await cart.findOne({ user_id: userId });
            const subTotalPrice = carts ? carts.products.reduce((acc, cur) => acc + cur.totalPrice, 0) : 0;
            const totalQuantity = carts ? carts.products.reduce((acc, cur)=>acc + cur.quantity , 0) : 0;
            res.render('add-cart', { cartData, user, subTotalPrice,totalQuantity ,category});
           }else{
            res.render('add-cart', { cartData:'', user, subTotalPrice:'',totalQuantity:'' , category});
           }
        } else {
            res.redirect('/')
        }


    } catch (error) {
        console.log(error.message);
        res.render('error')
    }
}




///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const addToCart = async (req, res) => {
    try {
        const productId = req.query.id;
        const user = req.session.isLoggedIn;
        const userId = req.session.userId;
         const userData = await User.findOne({_id:userId});
        if (user) {
            const cartData = await cart.findOne({ user_id: userId })
            const productData = await Product.findOne({ _id: productId })

            if(productData.status === 'Available'){
                const products = {
                    product_id: productId,
                    quantity: 1,
                    price: productData.salePrice,
                    totalPrice: productData.salePrice
                }
    
               if(userData.is_User === 1 ){
                if (cartData) {
                    const exist = cartData.products.filter((value) => value.product_id.toString() == productId)
                    if (exist.length !== 0) {
                        await cart.findOneAndUpdate({ user_id: userId, "products.product_id": productId }, { $inc: { "products.$.quantity": 1 } })
                        res.redirect('/cart')
                    } else {
                        await cart.updateOne({ user_id: userId }, { $push: { products: { product_id: productId, quantity: 1, price: productData.salePrice, totalPrice: productData.salePrice } } })
                        res.redirect('/cart')
                    }
    
                } else {
                    const cartSave = new cart({
                        products: [products],
                        user_id: userId
                    })
                    await cartSave.save()
                    res.redirect('/cart')
                }
               }else{
                res.redirect('/');
               }
                //productData.status true
            }else{
                res.redirect('/');
                //productData.status false
            }
           


        } else {
           
            res.redirect('/');
        }

    } catch (error) {
        console.log(error.message);
        res.render('error');
    }
}




///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const incrementQty = async (req, res ,next) => {
    try {
        const userId = req.session.userId;
        const { id, proId, price, i, qty } = req.body;
        if (i === 1) {
            const productData = await cart.findOne({ user_id: userId })
            if (productData) {
                const product = productData.products.find((p) => p.product_id.toString() === proId)
                const qty = product.quantity + 1
                const tprice = product.price;
                const productDetails= await Product.findOne({_id:productData.products[0].product_id});
               if(productDetails.quantity>=qty && productDetails.status ==='Available' ){
                const incQty = await cart.updateOne({ user_id: userId, "products.product_id": proId }, { $set: { "products.$.quantity": qty, "products.$.totalPrice": tprice * qty } })
                const carts = await cart.findOne({ user_id: userId });
                const subTotalPrice = carts ? carts.products.reduce((acc, cur) => acc + cur.totalPrice, 0) : 0;
                const updatedCart = await cart.findOne({ user_id: userId });
                const updatedProduct = updatedCart.products.find((p) => p._id.toString() === id);
                res.json({ quantity: updatedProduct.quantity, totalPrice: updatedProduct.totalPrice, subTotalPrice });
               }else{
                  next();
               }

            }


        } else if (i === -1) {
            const productData = await cart.findOne({ user_id: userId })
            if (productData) {
                const product = productData.products.find((p) => p.product_id.toString() === proId)
                const qty = product.quantity - 1
                const tprice = product.price;
                if (qty <= 0 || productData.quantity ) {

                } else {
                    const incQty = await cart.updateOne({ user_id: userId, "products.product_id": proId }, { $set: { "products.$.quantity": qty, "products.$.totalPrice": qty * tprice } })
                }
                const carts = await cart.findOne({ user_id: userId });
                const subTotalPrice = carts ? carts.products.reduce((acc, cur) => acc + cur.totalPrice, 0) : 0;
                const updatedCart = await cart.findOne({ user_id: userId });
                const updatedProduct = updatedCart.products.find((p) => p._id.toString() === id);
                res.json({ quantity: updatedProduct.quantity, totalPrice: updatedProduct.totalPrice, subTotalPrice });
            }
        }




    } catch (error) {
        console.log(error.message);
    }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const removeCart =async(req,res)=>{
    try {
        const user =req.session.isLoggedIn;
        const proId = req.query.id;
        const userId = req.session.userId
        if(user){
            const productData = await cart.findOne({user_id:userId})
            if(productData){
                const product = productData.products.find((p) => p.product_id.toString() === proId)
                await cart.updateOne({ user_id: userId, "products._id": proId },   { $pull: { products: { _id: proId } } }   ).then((data)=>{
                    res.redirect('/cart')
                })

            }

        }else{
            res.redirect('/')
        }

    } catch (error) {
        console.log(error.message);
    }
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const addToWishlist = async(req,res) => {
    try {
        const productId = req.body;
        const user = req.session.isLoggedIn;
        const userId = req.session.userId;
        if(user){ 
            const exist = await Wishlist.findOne({user_id:userId});
            const productData = await Product.findOne({_id:productId.product});
            const products={
                 product_id: productId.product,
            }
            if(exist){
                const proId = productId.product;
                const proSame = exist.products.find((p) =>  p.product_id && p.product_id.toString() === proId ) ;
                if(!proSame){
                    const updateWishlist = await Wishlist.updateOne({user_id:userId},{$push:{products:{product_id:productId.product}}}).then(()=>{
                        res.json({status:true});
                    })
                }else{ 
                    const removeWishlist = await Wishlist.updateOne({user_id:userId},{$pull:{products:{product_id:productId.product}}}).then (()=>{
                        res.json({status:false});
                    })
                }
            }else{
                const saveWishlist = new Wishlist({
                    products:[products],
                    user_id:userId
                })
                await saveWishlist.save();
                res.json({status:true});
            }
        }else{
            res.redirect('/');
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({error: error.message});
    }
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const loadWishlist = async (req ,res) => {
    try {
        
        const user = req.session.isLoggedIn;
        const userId = req.session.userId;
        const category = await Category.find();
        if(user){
            const productData = await Wishlist.findOne({user_id:userId}).populate("products.product_id");
            if(productData){
                res.render('wishlist',{user, productData , category});
            }
        }else{
            res.redirect('/login');
        }
        
    } catch (error) {
        console.log(error.message);
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



module.exports = {
    addToCart,
    loadCart,
    incrementQty,
     removeCart,
     addToWishlist,
     loadWishlist

}