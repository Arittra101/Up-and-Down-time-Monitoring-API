
const crypto = require('crypto');
const enviromentToExport = require("../helpers/enviroment");
//module scaffolding
const utilities = {};

//parse  JSON string to object
utilities.parseJson = (jsonString) => {
    let output = {};

    try {
        output = JSON.parse(jsonString);
    }
    catch {
        output = {};
    }
    return output;
}

//hash password 
utilities.hash = (pass) => {
    console.log(enviromentToExport);
    if (typeof (pass) === 'string' && pass.length > 0) {
        const hash = crypto
            .createHmac('sha256', enviromentToExport.secretkey)
            .update(pass)
            .digest('hex');
            return hash;
    }
    return null;
}

//create random String
utilities.createRandomString = (stringlenth)=>{
    let length =  stringlenth;
    const possibleChar = 'abcdefghijklmnopqrstwxyz1234567890';
    let output = '';
    length = typeof(stringlenth)==='number' && stringlenth>0?stringlenth:0;

    if(length){
        for(let i=0;i<length;i++)
        {
            let random_char = possibleChar.charAt(Math.floor(Math.random()*possibleChar.length));
            output+=random_char;
        }
        return output;
    }return false;
}
module.exports = utilities;