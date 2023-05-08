const mongoose = require ('mongoose');

const bannerSchema = new mongoose.Schema({
    bannerTitle1:{
        type:String,
        require:true
    },
    bannerTitle2:{
        type:String,
        require:true
    },
    price:{
        type:Number,
        require:true
    },
    thumbnail:{
        type:String,
        require:true
    },
    list:{
        type:Number,
        default:1
    },
    images:{
        type:Array
    }


})

module.exports = mongoose.model('Banner',bannerSchema);