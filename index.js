const express = require("express");
const app = express();
const ejs = require('ejs');
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
dotenv.config();
const PORT = process.env.PORT || 5000;
const user = require("./routes/userRoute");
const inventory = require("./routes/inverntoryRoute");
const image = require('./routes/imageRoute');
const path = require("path");




//  database connection
require("./conn/db");



// Simple api for checking that server is running...
app.get("", (req, res) => {
  res.status(200).send("Welcome to Food Saving Application......🥰🥰🥰");
});



////     Some Middlewares 
app.use(express.json());
app.set('view engine','ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({ extended: false }));



// static folder
app.use("uploads", express.static(path.join(__dirname, "/uploads")));



//  routes 
app.use("/api/help/user", user);
app.use("/api/help/inventory", inventory);
app.use("/api/help/imageupdate",image);





// Server listener
app.listen(PORT, (error) => {
  if (!error) {
    console.log(`Server is listening on PORT ${PORT}`);
  } else console.log(`Server is not listening on PORT ${PORT}`);
});
