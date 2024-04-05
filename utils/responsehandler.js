const responseHandler= async(res,data)=>{

    res.status(200).json({
        success : true,
        data
    });

    res.end();
}


module.exports = responseHandler