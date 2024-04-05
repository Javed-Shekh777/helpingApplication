const mongoose = require("mongoose");


// creating schema for User
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      lowercase : true,
      unique: true,
    },
    mobile: {
      type : String,
      unique : true,
      required:true,
    },
    password: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    picture: {
      url : {type : String , required : true},
      publicId : {type : String , required : true},
    },
    userType: {
      type: String,
      enum: [
        "donor",
        "recipient",
        "administrator",
        "verified",
        "guest",
        "communityPartner",
        "serviceProvider",
      ],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
