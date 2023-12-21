

//module scaffolding
const enviroment = {};

enviroment.staging = {

    port : 3000,
    envName : 'staging',
    secretkey : "arittraIsaDumb",
    maxChecks : 5,
    twilio : {
        fromPhone : '+15309243450',
        accountSid : 'ACaa21e9907e9e041565651e4be08abbd2',
        authToken : 'c72c2449e67c76dc8cfe776bc82e8eb5'
    }

};

enviroment.production = {

    port : 4000,
    envName : 'production',
    secretkey : "avishekIsaDumb",
    maxChecks : 5,
    twilio : {
        fromPhone : '+15309243450',
        accountSid : 'ACaa21e9907e9e041565651e4be08abbd2',
        authToken : 'c72c2449e67c76dc8cfe776bc82e8eb5'
    }
};

// console.log("Current game " +  process.env.NODE_ENV);


//determine which enviroment was passed
const currentEnviroment = typeof(process.env.NODE_ENV)==='string' ? process.env.NODE_ENV : 'staging';
console.log(currentEnviroment);

//export corresponding enviroment
const enviromentToExport = typeof(enviroment[currentEnviroment])==='object' ? enviroment[currentEnviroment]: enviroment.staging;
// console.log(enviromentToExport);

module.exports = enviromentToExport;