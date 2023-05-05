require("dotenv").config()
const express=require("express")
const morgan=require("morgan")
require("./models/config")
const app=express()
const bodyparser=require("body-parser")
const MainRoutes=require("./routes/commonRoutes")
app.use(bodyparser.json())
app.use(morgan("dev"))
app.use("/",MainRoutes)

app.listen(process.env.PORT,()=>{
    console.log(`Server is running port no :${process.env.PORT}`)
})
