const expressAsyncHandler = require("express-async-handler");
const errorHandler = require("../utils/errorHandler");
const jwt = require("jsonwebtoken");
const User = require('../models/UserModel');


// Function for verifying the token 

const verifyToken = expressAsyncHandler(async (req, res, next) => {
   
    let token ;

    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")
    ){
        try {
            token =req.headers.authorization.split(" ")[1];


         
            // decodes token id 
            const decoded = jwt.verify(token ,process.env.SECRET_KEY);

            req.user = await User.findById(decoded.id).select("-password");

            next();
        }catch(error){
             errorHandler(res,404,"You are UnAuthorized!!");
            // throw new Error("Not authoruzed , token fialed")
        }
    }

    if(!token){
        errorHandler(res,404,"Token not Found!!");
        throw new Error("Not authoruzed , no token")
        
    }

});

module.exports = verifyToken;
