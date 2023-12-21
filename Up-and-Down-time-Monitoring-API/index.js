/*
    Title : Uptime Monitoring Application
    Description :  A RestFul Api  to monitor up or down time of user defined links
    Author :  Arittra 
    Credit : Learn with summit
    Date : 11/24/2023
*/

//dependencies

const server =  require("./lib/server.js");
const worker =  require("./lib/worker.js");




//app object - module scaffolding
const app = {};

app.init = ()=>{
    //start the server
    server.init();

    //start the worker
    worker.init();
};

app.init();

module.exports =  app;

