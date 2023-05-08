const mongoose = require('mongoose')
const{ObjectId} = require('mongoose')

const addressSchema = new mongoose.Schema({
    user_id:{
        type:ObjectId,
    },
    userName:{
        type:String,
        require:true
    },
    mobile : {
        type : Number
    },
    email : {
        type : String,
    },

    address:{
        type:String,
        require:true
    },
    state:{
        type:String,
        require:true
    },
    district:{
        type:String,
        require:true
    },
    city : {
        type : String
    },
    landMark : {
        type : String 
    },
    pincode:{
        type:Number,
        require:true
    },
    delete:{
        type:Boolean,
        default:true
    }
})

module.exports=mongoose.model('Address',addressSchema);