const otpgenerator = require('otp-generator');
const otpGenerate = ()=>{
    const otp = otpgenerator.generate(6,{
        upperCaseAlphabets : false,
        lowerCaseAlphabets : false,
        specialChars : false,
        
    });

    return otp;
}

module.exports = otpGenerate;