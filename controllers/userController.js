const asyncHandler = require("express-async-handler");
const errorHandler = require("../utils/errorHandler");
const User = require("../models/UserModel");
const responseHandler = require("../utils/responsehandler");
const bcrypt = require("bcrypt");
const generateToken = require("../middlewares/generateToken");
const expressAsyncHandler = require("express-async-handler");
const cloudinary = require("cloudinary").v2;
const nodemailer = require("nodemailer");
const otpGenerator = require("../middlewares/otpGenerate");

// cloudinary config
require("../utils/cloudinaryConfig");

const register = asyncHandler(async (req, res) => {
 

  const { username, email, password, usertype, location, mobile } = req.body;

  try {
    if (!username || !email || !password || !usertype || !location || !mobile) {
      errorHandler(res, 404, "Please Fill All Fields!!");
      return;
    }

    if (req.file == undefined) {
      errorHandler(res, 404, "Please upload your profile Image!!");
      return;
    }

    const userExist = await User.findOne({ email: email });

    if (userExist) {
      errorHandler(res, 404, "User Already Exist!!");
      return;
    }

    const psw = await bcrypt.hashSync(password, 12);

    if (!psw) {
      errorHandler(res, 404, "Something went wrong!!");
      return;
    }

    const image = await cloudinary.uploader.upload(req?.file?.path, {
      folder: "help",
    });

    if (!image) {
      errorHandler(res, 404, "Image not Uploaded!!");
      return;
    }

    const data = await User.create({
      username,
      email,
      password: psw,
      location,
      mobile,
      userType: usertype,
      picture: {
        url: image?.secure_url,
        publicId: image?.public_id,
      },
    });

    data.password = undefined;
    responseHandler(res, data);
  } catch (error) {
    
    errorHandler(res, 500, "Internal error in Register API");
  }
});

const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  

  try {
    if (!email || !password) {
      errorHandler(res, 404, "Please Fill All Fields");
      return;
    }

    const userAuth = await User.findOne({ email: email });

    if (!userAuth) {
      errorHandler(res, 404, "User not Found!!");
      return;
    }

    const psw = await bcrypt.compare(password, userAuth.password);

    if (!psw) {
      errorHandler(res, 404, "Email or Password are Invalid!!");
      return;
    }

    const token = await generateToken(userAuth._id);

    

    if (token.message) {
      errorHandler(res, 404, token?.message);
      return;
    } else {
      userAuth.password = undefined;
      responseHandler(res, { token, userAuth });
    }
  } catch (error) {
     
    errorHandler(res, 500, "Internal error in Login API");
  }
});

const updation = asyncHandler(async (req, res) => {
  if (!req.user) {
    errorHandler(res, 404, "You can't access this work");
  }

  const { username } = req.body || req?.user;
  const { email } = req.body || req?.user;
  const { picture } = req.body || req?.user;
  const { userType } = req.body || req?.user;
  const { location } = req.body || req?.user;

  try {
    const filter = { _id: req.user?._id };

    // Define the update operation
    const update = {
      $set: {
        username: username,
        email: email,
        picture: picture,
        location: location,
        userType: userType,
      },
      $currentDate: { lastModified: true },
    };

    // Set the options for the update operation
    const options = {
      returnOriginal: false, // To return the updated document instead of the original
    };

    const result = await User.findOneAndUpdate(filter, update, options);

    
    responseHandler(res, result.value);
    // }
  } catch (error) {
    errorHandler(res, 404, "Internal error in Update API");
  }
});

const sendmail = expressAsyncHandler(async (req, res) => {
  const { email } = req.body;

  

  if (!email) {
    errorHandler(res, 404, "Please Enter Email.");
    return;
  }

  const forgot = await User.findOne({ email: email });

  if (!forgot) {
    errorHandler(res, 404, "User doesn't Exist.");
    return;
  }

  const name = forgot?.username;

  const OTP = otpGenerator();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
      user: process.env.EMAIL,
      pass: process.env.KEY,
    },
  });

  const mailOptions = {
    from: {
      name: "Help Community",
      address: "help@gmail.com",
    }, // sender address
    to: email, // list of receivers
    subject: "Forgot Password", // Subject line
    text: "Reset Password ", // plain text body
    html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>OTP Email</title>
        <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          margin: 0;
          padding: 20px;
      }
      .container {
          max-width: 600px;
          margin: auto;
          border: 1px solid #ccc;
          border-radius: 5px;
          padding: 20px;
      }
      h1 {
          color: #333;
      }
      p {
          color: #666;
      }
      .otp {
          font-size: 24px;
          font-weight: bold;
          color: #007bff;
          margin-top: 10px;
      }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>One-Time Password (OTP) Email</h1>
            <h3 style="display : inline-block;">Hey ${name},</h3> <br/>
            <p>Your One-Time Password (OTP) for accessing our service is:</p>
            <div class="otp">${OTP}</div>
            <p>This OTP is valid for a limited time. Please do not share it with anyone.</p>
            <p>If you didn't request this OTP, please ignore this email.</p>
        </div>
    </body>
    </html>
  `, // html body
    // attachments : [
    //   {
    //   filename : 'cuet.pdf',
    //   path : path.join(__dirname,'cuet.pdf'),
    //   contentType : 'application/pdf'
    // }]
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      errorHandler(res, 404, "Email not Send.");
      return;
    } else {
      responseHandler(res, OTP);
       return ;
    }
  });
});

const changePsw = expressAsyncHandler(async (req, res) => {
  const { password, email } = req.body;

  if (!password) {
    errorHandler(res, 404, "Please Enter a new Password.");
    return;
  }
  try {
    const psw = await bcrypt.hashSync(password, 12);

    if (!psw) {
      errorHandler(res, 404, "Something went wrong!!");
      return;
    }

    const user = await User.findOneAndUpdate(
      { email: email },
      {
        $set: {
          password: psw,
        },
      },
      {
        returnOriginal: false,
      }
    );

    user.password = undefined;
    responseHandler(res, user);
  } catch (error) {
    errorHandler(res, 500, "Internal Error in Forgot Password API");
    return;
  }
});
module.exports = { register, login, updation, sendmail, changePsw };
