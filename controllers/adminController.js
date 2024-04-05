const expressAsyncHandler = require("express-async-handler");
const responseHandler = require("../utils/responsehandler");
const fs = require("fs");
const path = require("path");
const User = require("../models/UserModel");
const Inventory = require("../models/InventoryModel");

const admin = expressAsyncHandler(async (req, res) => {
  const { email, password } = req.body;

  console.log(req.body);

  // if (
  //   password == process.env.ADMIN_PASSWORD &&
  //   email == process.env.ADMIN_EMAIL
  // ) {
  //   console.log("Value is : ", true);
    res.render("index.ejs");
  // }
});

const send = expressAsyncHandler(async (req, res) => {
  res.render("home.ejs");
});

const findAllUser = expressAsyncHandler(async (req, res) => {
  try {
    const user = await User.find();
    console.log(user);

    res.status(200).json({ status: true, user });
  } catch (error) {
    res.send("Something went wrong");
  }
});

const findAllItems = expressAsyncHandler(async (req, res) => {
  try {
    const items = await Inventory.find();
    console.log(items);

    res.status(200).json({ status: true, items });
  } catch (error) {
    res.send("Something went wrong");
  }
});

module.exports = { findAllUser, admin, send, findAllItems };
