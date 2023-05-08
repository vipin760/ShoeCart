const mongoose=require('mongoose');

const adminSchema=({
    username:{
        type:String,
        require:true
    },
    email:{
        type:String,
        require:true
    },
    mobile:{
        type:Number,
        require:true
    },
    password:{
        type:String,
        require:true
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
    }

})


module.exports=mongoose.model("Admin",adminSchema);