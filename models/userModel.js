const mongoose=require('mongoose');

const userSchema=new mongoose.Schema({
    username:{
        type:String,
        require:true
    },
    email:{
        type:String,
        require:true
    },
    password:{
        type:String,
        require:true
    },
    mobile:{
        type:Number,
        require:true
    },
    address:{
        type:String,
    },
    state:{
        type:String,
    },
    district:{
        type:String,
    },
    city : {
        type : String
    },
    landMark : {
        type : String 
    },
    pincode:{
        type:Number,
    },
    is_Admin:{
        type:Number,
        default:0
    },
    is_User:{
        type:Number,
        default:1

    },
    status:{
        type:Boolean,
        default:true
    },
    token:{
        type:String,
        default:''
    },
})


module.exports=mongoose.model("User",userSchema);