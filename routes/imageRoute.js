const protect = require("../middlewares/verifyToken");
const express= require('express');
const upload = require("../middlewares/multerConfig");
const updateImage = require("../controllers/imageController");
const router = express.Router();
 
 
// Image route
router.route('/').put(protect,upload.single("image"),updateImage);
 
 
 


module.exports = router;