const nodemailer=require("nodemailer")

exports.transpoter=nodemailer.createTransport({
    service:"gmail",
    auth:{
        user:"narendracharan25753@gmail.com",
        pass:process.env.PASS
    }
})