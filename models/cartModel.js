const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
const { Number } = require('twilio/lib/twiml/VoiceResponse');

const productSchema=new mongoose.Schema({
    product_id:{
        type:ObjectId,
        ref:'product'
    },
    quantity:{
        type:Number,
    },
    price:{
        type:Number,

    },
    totalPrice : {
        type : Number,
    },
})

const cartSchema=new mongoose.Schema({
    products:[productSchema],
    user_id:{
        type:ObjectId,
        ref:'User'
    }
})

module.exports = mongoose.model('cart', cartSchema);

