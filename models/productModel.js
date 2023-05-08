const { ObjectId } = require('mongodb');
const mongoose=require('mongoose');
const moment = require('moment');

const productSchema=new mongoose.Schema({
    productName: {
        type: String,
        require: true
    },
    category : {
        type: ObjectId,
        ref: "category",
        required: true,
     
    },
    price: {
        type: Number,
    },
    salePrice: {
        type: Number,
    },
    discount: {
        type: String,
    },
    quantity : {
        type : Number,
        required : true
    },
    status : {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    images: {
        type : Array
    },
    list:{
        type:Boolean,
        default:true
    },
})


module.exports=mongoose.model('product',productSchema);