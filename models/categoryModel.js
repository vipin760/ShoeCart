const mongoose=require('mongoose');

const categorySchema=new mongoose.Schema({
    name:{
       type:String,
       require:true
    },
    description:{
        type:String,
        require:true
    }
})


module.exports=mongoose.model('category',categorySchema);