const { addItem ,fetchAllItem, fetchItem, deleteItem, editItem} = require('../controllers/inventoryController');
const router = require('express').Router();
const protect = require("../middlewares/verifyToken");
const upload = require("../middlewares/multerConfig");




//     Inventory routes

router.route('/additem').post(protect,upload.single("image"),addItem);
router.route('/deleteitem/:id').delete(protect,deleteItem);
router.route('/fetchallitems').get(protect,fetchAllItem);
router.route('/fetchitem').get(protect,fetchItem);
router.route("/edititem/:id").put(protect,editItem);


module.exports = router;