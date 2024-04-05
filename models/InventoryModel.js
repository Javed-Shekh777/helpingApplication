const mongoose = require("mongoose");



// creating schema for Inventory items 
const InventorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    itemName: {
      type: String,
      required: true,
    },
    itemImage: {
      url : {type : String , required : true},
      publicId : {type : String , required : true},
    },
    quantity: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    expirationDate: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("InventoryItem", InventorySchema);
