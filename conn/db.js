const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');



const connection = asyncHandler( async ()=>{

    try {
        mongoose.connect(process.env.MONGODB_URI);

        console.log(`Database is connected...`);
        
    } catch (error) {
        console.log(`Error in database connection ${error}`);
        
    }
});


connection();

module.exports = connection;

