const asyncHandler = require("express-async-handler");
const errorHandler = require("../utils/errorHandler");
const User = require("../models/UserModel");
const responseHandler = require("../utils/responsehandler");
const bcrypt = require("bcrypt");
const generateToken = require("../middlewares/generateToken");
const expressAsyncHandler = require("express-async-handler");
const cloudinary = require("cloudinary").v2;
const nodemailer = require("nodemailer");

// cloudinary config
require("../utils/cloudinaryConfig");

const register = asyncHandler(async (req, res) => {
  // console.log("\n Register Req is : ", req);

  const { username, email, password, usertype, location ,mobile} = req.body;

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
    console.log(`Error of Register : ${error.message}`);
    errorHandler(res, 500, "Internal error in Register API");
  }
});

const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  console.log("\n\n Login API : ", req.body);

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

    console.log("token : ", token);

    if (token.message) {
      errorHandler(res, 404, token?.message);
      return;
    } else {
      userAuth.password = undefined;
      responseHandler(res, { token, userAuth });
    }
  } catch (error) {
    console.log(`Error of Register : ${error.message}`);
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
  const {location} = req.body || req?.user ;

  try {
    const filter = { _id: req.user?._id };

    // Define the update operation
    const update = {
      $set: {
        username: username,
        email: email,
        picture: picture,
        location:location,
        userType: userType,
      },
      $currentDate: { lastModified: true },
    };

    // Set the options for the update operation
    const options = {
      returnOriginal: false, // To return the updated document instead of the original
    };

    const result = await User.findOneAndUpdate(filter, update, options);

    console.log(result);
   

    console.log("\nUpdated : ", result.value);
    responseHandler(res, result.value);
    // }
  } catch (error) {
    errorHandler(res, 404, "Internal error in Update API");
  }
});

const forgotPassword = expressAsyncHandler(async (req, res) => {
  const { email ,password} = req.body;

  if (!email || !password) {
    errorHandler(res, 404, "Please Enter All Detials.");
    return;
  }

  try {
     

    const forgot = await User.findOne({email:email});

    if(!forgot){
      errorHandler(res,404,"User doesn't Exist.");
      return ;
    }



    const psw = await bcrypt.hashSync(password, 12);

    if (!psw) {
      errorHandler(res, 404, "Something went wrong!!");
      return;
    }


    const user = await User.findOneAndUpdate({email:email},{
      $set:{
        password:psw
      }
    },{
      returnOriginal:false
    });

    user.password = undefined;
    responseHandler(res,user);

    
 

    
  } catch (error) {
    errorHandler(res, 500, "Internal Error in Forgot Password API");
    return;
  }
});

module.exports = { register, login, updation, forgotPassword };
