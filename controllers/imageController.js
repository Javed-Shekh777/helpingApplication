const expressAsyncHandler = require("express-async-handler");
const errorHandler = require("../utils/errorHandler");
const Inventory = require("../models/InventoryModel");
const responseHandler = require("../utils/responsehandler");
const User = require("../models/UserModel");
const cloudinary = require("cloudinary").v2;


// Cloudinary configuration
require("../utils/cloudinaryConfig");

const updateImage = expressAsyncHandler(async (req, res) => {
  if (!req.user._id) {
    errorHandler(res, 404, "You are not a valid User.");
    return;
  }

  if (!req.file) {
    errorHandler(res, 404, "Please select an Image to Upload.");
    return;
  }

  const itemId = req.query.id || "";
  console.log("Image : ", req.file);

  try {
    if (itemId) {
      const imageData = await Inventory.findById({ _id: itemId });

      const image = await cloudinary.uploader.upload(req?.file?.path, {
        folder: "helpItem",
      });

      const del = await cloudinary.uploader.destroy(
        imageData?.itemImage?.publicId
      );

      console.log("deltes : ", del);

      if (del && image) {
        const data = await Inventory.findByIdAndUpdate(
          { _id: itemId },
          {
            $set: {
              itemImage: {
                url: image?.secure_url,
                publicId: image?.public_id,
              },
            },
          },
          {
            returnOriginal: false,
          }
        );

        if (data) {
          responseHandler(res, data);
        }
      } else {
        errorHandler(res, "Something went wrong.");
        return;
      }
    } else {
      const imageData = await User.findById(req.user._id);

      const image = await cloudinary.uploader.upload(req?.file?.path, {
        folder: "help",
      });


      const del = await cloudinary.uploader.destroy(
        imageData?.picture?.publicId
      );

      if (del && image) {
        const data = await User.findByIdAndUpdate(
            req.user._id,
          {
            $set: {
              picture: {
                url: image?.secure_url,
                publicId: image?.public_id,
              },
            },
          },
          {
            returnOriginal: false,
          }
        );

        if (data) {
          responseHandler(res, data);
        }
      } else {
        errorHandler(res, "Image not Updated.");
        return;
      }
    }
  } catch (error) {
    errorHandler(res, 500, "Internal Error in Image Update API");
    return;
  }
});

module.exports = updateImage;
