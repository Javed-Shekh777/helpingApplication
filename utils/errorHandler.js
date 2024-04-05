const errorHandler= async(res,statusCode , message)=>{

    res.status(statusCode).json({
        success : false,
        error : message
    });
    res.end();
}


module.exports = errorHandler