const mongoose=require("mongoose")
const jwt=require("jsonwebtoken")

const schema=new mongoose.Schema({
    userName:{
        type:String,
        require:true,
    },
    userEmail:{
        type:String,
        require:true
    },
    password:{
        type:String,
        require:true
    }
})
schema.set("timestamps",true)
schema.methods.generateUserAuthToken = function () {
    const token = jwt.sign({ _id: this._id }, "ultra-security", {
      expiresIn: "30d",
    });
    return token;
  };
module.exports=mongoose.model("user",schema)