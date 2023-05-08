const Wishlist = require('../models/wishlistModel.js');
const Product = require('../models/productModel.js');
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
             const proSame = exist.products.find((val)=>val.product_id.toString()===productId.product);
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
            await saveWishlist.save()

        }
        }else{
            res.redirect('/');
        }

        
    } catch (error) {
        console.log(error.message);
    }
}





