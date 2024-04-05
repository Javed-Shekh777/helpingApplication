const expressAsyncHandler = require("express-async-handler");
const responseHandler = require("../utils/responsehandler");
const Inventory = require("../models/InventoryModel");
const User = require("../models/UserModel");
const errorHandler = require("../utils/errorHandler");
const cloudinary = require("cloudinary").v2;

//  cloudinary configuration
require("../utils/cloudinaryConfig");

const addItem = expressAsyncHandler(async (req, res) => {
  console.log("Add ITtem : ", req.body);

  if (!req.user._id) {
    errorHandler(res, 404, "You are not a valid User.");
    return;
  }

  console.log("File is : ", req.file);

  const {
    itemName,
    quantity,
    category,
    expirationDate,
    description,
    location,
  } = req.body;

  if (!itemName || !quantity || !category || !expirationDate || !description) {
    errorHandler(res, 404, "Please Provide Me Full Information of Item.");
    return;
  }

  if (req.file == undefined) {
    errorHandler(res, 404, "Please upload Item Image!!");
    return;
  }

  try {
    const image = await cloudinary.uploader.upload(req?.file?.path, {
      folder: "helpItem",
    });

    console.log("\n\n Item Image is : ", image);

    if (!image) {
      errorHandler(res, 404, "Image not Uploaded!!");
      return;
    }

    var item = new Inventory({
      userId: req.user._id,
      itemName,
      quantity,
      category,

      expirationDate,
      description,
      itemImage: {
        url: image?.secure_url,
        publicId: image?.public_id,
      },
    });

    item = await item.save();

    if (!item) {
      errorHandler(res, 404, "I'm SORRY Item not saved.");
      return;
    }
    responseHandler(res, item);
  } catch (error) {
    console.log(`Error In AddItem : ${error.message}`);
    errorHandler(res, 500, "Error in AddItem API");
    return;
  }
});

const deleteItem = expressAsyncHandler(async (req, res) => {
  if (!req.user._id) {
    errorHandler(res, 404, "You are not a valid User.");
    return;
  }

  const itemId = req.params.id || "";

  try {
    const item = await Inventory.deleteOne({ _id: itemId });

    if (!item) {
      errorHandler(res, 404, "Item Not Deleted!!!");
      return;
    }

    responseHandler(res, item);
  } catch (error) {
    errorHandler(res, 500, "Error in DeleteItem API");
    return;
  }
});

const fetchAllItem = expressAsyncHandler(async (req, res) => {
  if (!req.user._id) {
    errorHandler(res, 404, "You are not a valid User.");
    return;
  }

  try {
    const fetchItems = await Inventory.find({ userId: req.user._id });

    if (!fetchItems) {
      errorHandler(res, 404, "No item Found.");
      return;
    }

    responseHandler(res, fetchItems);
  } catch (error) {
    errorHandler(res, 500, "Error in AddItem API");
    return;
  }
});

const fetchItem = expressAsyncHandler(async (req, res) => {
  let data;
  let query;
  if (!req.user._id) {
    errorHandler(res, 404, "You are not a valid User.");
    return;
  }

  const itemId = req.query.itemId || "";
  const itemName = req.query.itemName || "";
  const quantity = req.query.quantity || "";
  const category = req.query.category || "";

  if (itemName) {
    query = {
      itemName: { $regex: itemName, $options: "i" },
    };
  }

  if (category) {
    query = {
      category: { $regex: category, $options: "i" },
    };
  }

  if (quantity) {
    query = {
      quantity: { $regex: quantity, $options: "i" },
    };
  }

  try {
    if (itemId) {
      data = await Inventory.findById({ _id: itemId });

      if (!data) {
        errorHandler(res, 402, "No item Found!!");
        return;
      }
    }

    const count = (await Inventory.countDocuments(query)) || 2000;

    if (query) {
      data = await Inventory.find(query);
    }

    responseHandler(res, { count, data });
  } catch (error) {
    errorHandler(res, 500, "Error in FetchItem API");
    return;
  }
});

const editItem = expressAsyncHandler(async (req, res) => {
  console.log("\n\n Edit Item API : ", req.body);

  if (!req.user._id) {
    errorHandler(res, 404, "You are not a valid User.");
    return;
  }

  const itemId = req.params.id || "";
  if (!itemId) {
    errorHandler(res, 404, "Please Select an Item to Edit.");
    return;
  }

  const { itemName, quantity, category, expirationDate, description } =
    req.body;

  if (!itemName || !quantity || !category || !expirationDate || !description) {
    errorHandler(res, 404, "Please Provide Me Full Information of Item.");
    return;
  }

  try {
    const editItem = await Inventory.findByIdAndUpdate(
      { _id: itemId },
      {
        $set: {
          description,
          quantity,
          itemName,
          expirationDate,
          category,
        },
      },
      { returnOriginal: false }
    );

    if (!editItem) {
      errorHandler(res, 404, "Item not Edited.");
      return;
    }

    responseHandler(res, editItem);
  } catch (error) {
    errorHandler(res, 500, "Error in EditItem API");
    return;
  }
});
module.exports = { addItem, deleteItem, fetchAllItem, fetchItem, editItem };
