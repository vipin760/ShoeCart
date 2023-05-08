const mongoose = require ('mongoose');

const couponSchema = new mongoose.Schema({
    name:{
        type:String,
        require:true,
        unique:true,
        uppercase:true,
    },
    expiry:{
        type:Date,
        require:true,
    },
    discount:{
        type:Number,
        require:true,
    },
    minPrice:{
        type:Number,
    },
    maxPrice:{
        type:String,
    },
    active:{
        type:String,
        default:true,
    },
    status:{
        type:String,
        default:true,
        
    }
})


module.exports = mongoose.model('coupon',couponSchema);