const express=require("express")
const router=express.Router()
const userRoutes=require("./userRoutes/userRoutes")

router.use("/user",userRoutes)

module.exports=router