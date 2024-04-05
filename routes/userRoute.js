const { register,login,updation, changePsw,sendmail } = require("../controllers/userController");
const protect = require("../middlewares/verifyToken");
const express= require('express');
const upload = require("../middlewares/multerConfig");
const { findAllUser ,admin,send,findAllItems} = require("../controllers/adminController");
const router = express.Router();
 
 
 // All user routes of Application
router.route('/register').post(upload.single("image"),register);
router.route('/login').post(login);
router.route('/update').post(protect,updation);
router.route('/sendemail').all(sendmail);
router.route('/changepsw').post(changePsw)





///  All routes for Admin 
router.route('/findalluser').get(findAllUser);
router.route('/findallitems').get(findAllItems);
router.route('/').get(admin);
router.route('/send').get(send);


 
 

// exporting the router 
module.exports = router;