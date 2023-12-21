/*
    Title : Uptime Monitoring Application
    Description :  A RestFul Api  to monitor up or down time of user defined links
    Author :  Arittra 
    Credit : Learn with summit
    Date : 11/24/2023
*/

//dependencies
const http = require('http');
const {handleReqRes} = require('../helpers/handleRequest.js');
const enviroment = require('../helpers/enviroment.js');
const {sendTwilloSms} = require('../helpers/notification.js');






//app object - module scaffolding
const server = {};



//create server
server.createServer = ()=>{
    const createServerVariable  =  http.createServer(server.handleReqRes);
    createServerVariable.listen(enviroment.port,()=>{

        console.log(`Listening to port ${enviroment.port}`);

    });
}

//hande Request Response
server.handleReqRes = handleReqRes;


//Start the server
server.init = ()=>{
    server.createServer();
}
module.exports = server;

