const userSchema = require("../../models/userSchema/userSchema");
const { transpoter } = require("../../services/mailService");
const { error, success } = require("../responseCode");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../../models/userSchema/userSchema");
const {validationResult}=require("express-validator")

exports.userSignup = async (req, res) => {
  try {
    const user = new userSchema(req.body);
    const { userEmail } = req.body;
    const error=validationResult(req)
    if(!error.isEmpty()){
        res.status(200).json({errors:error.array()})
    }
    const userExist = await userSchema.findOne({ userEmail: userEmail });
    if (userExist) {
      return res.status(403).json({
        status: "Failed",
        message: "userEmail Already Exited",
      });
    }
    user.password = await bcrypt.hash(user.password, 10);
    const createUser = await user.save();
    res
      .status(201)
      .json(success(res.statusCode, "userSignup Successfully", { createUser }));
  } catch (err) {
    console.log(err);
    res.status(400).json(error("Failed", res.statusCode));
  }
};

exports.userLogin = async (req, res) => {
  try {
    const { userEmail, password } = req.body;
    if (userEmail && password) {
      const verifyUser = await userSchema.findOne({ userEmail: userEmail });
      if (verifyUser != null) {
        const isMatch = await bcrypt.compare(password, verifyUser.password);
        if (isMatch) {
          const token = await verifyUser.generateUserAuthToken();
          return res
            .header("x-auth-token-user", token)
            .header("access-control-expose-headers", "x-auth-token-admin")
            .status(201)
            .json(
              success(res.statusCode, "login SuccessFully", {
                verifyUser,
                token,
              })
            );
        } else {
          res
            .status(403)
            .json(error("User Password Are Incorrect", res.statusCode));
        }
      } else {
        res.status(403).json(error("User Email Are Incorrect", res.statusCode));
      }
    } else {
      res
        .status(403)
        .json(error("User Email and Password Are Not Valid", res.statusCode));
    }
  } catch (err) {
    res.status(400).json(error("Failed", res.statusCode));
  }
};

exports.sendMailResetPassword = async (req, res) => {
  try {
    const { userEmail } = req.body;
    const user = await userSchema.findOne({ userEmail: userEmail });
    if (user) {
      const secret = user._id + process.env.SECRET_KEY;
      const token = jwt.sign({ userID: user._id }, secret, { expiresIn: "3d" });
      const link = `http://127.0.0.1:3000/api/user/reset${user._id}/${token}}`;
      let info = await transpoter.sendMail({
        from: "narendracharan25753@gmail.com",
        to: userEmail,
        subject: "Email Send For Reset Password",
        text: `<a href=${link}></a>`,
      });
      return res.status(200).json(
        success(res.statusCode, "Mail Send Successfully", {
          userID: user._id,
          token,
        })
      );
    } else {
      res.statusCode(200).json(error("Invalid Email", res.statusCode));
    }
  } catch (err) {
    res.status(400).json(error("Failed", res.statusCode));
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { password, confirm_Password } = req.body;
    const { id, token } = req.params;
    const user = await User.findById(id);
    const secret = user._id + process.env.SECRET_KEY;
    const decodedToken = jwt.verify(token, secret);
    if ((password, confirm_Password)) {
      if (password != confirm_Password) {
        res.status(400).json(error("Password Not Match", res.statusCode));
      } else {
        const newPassword = await bcrypt.hash(password, 10);
        const createPassword = await User.findByIdAndUpdate(user._id, {
          $set: { password: newPassword },
        });
        res
          .status(200)
          .json(
            success(res.statusCode, "Password Updated Successfully", {
              createPassword,
            })
          );
      }
    }
  } catch (err) {
    res.status(400).json(error("Failed", res.statusCode));
  }
};
