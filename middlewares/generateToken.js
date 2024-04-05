const expressAsyncHandler = require("express-async-handler");
const jsonwebtoken = require("jsonwebtoken");



// function for generating the token 
const generateToken = expressAsyncHandler(async (id) => {
  try {
    const token = await jsonwebtoken.sign({ id }, process.env.SECRET_KEY,{expiresIn:"2d"});

    return token;
  } catch (error) {
    return error;
  }
});


module.exports = generateToken