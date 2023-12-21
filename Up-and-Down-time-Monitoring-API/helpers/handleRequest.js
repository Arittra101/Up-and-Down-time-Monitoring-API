

//dependencies

const url = require('url');
const { StringDecoder } = require('string_decoder');
const routes = require('../route');
const {notFoundHandler} = require('../Handler/routeHandler/notFoundHandler');
const {parseJson} = require('../helpers/utilities');

//module Scaffolding
const handler = {};

handler.ob = "ds";

handler.handleReqRes = (req, res) => {
    // request handling
    // get the url and parse it
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, '');
    const method = req.method.toLowerCase();
    const queryStringObject = parsedUrl.query;   //check ?=01869544099
    const headersObject = req.headers;

    const requestProperties = {
        parsedUrl,
        path,   
        trimmedPath,
        method,
        queryStringObject,       //?shdsjhd=54
        headersObject,          //request with header
    };


    let realData = '';
    const decoder = new StringDecoder('utf-8');


    const chosenHandler = routes[trimmedPath] ? routes[trimmedPath]:notFoundHandler;

   


    req.on('data', (buffer) => {
        realData += decoder.write(buffer);
    });

    req.on('end', () => {
        realData += decoder.end();  //make sure the complete buffer coming 
        

        requestProperties.body = parseJson(realData); //converting to object
        //console.log(requestProperties.body);
        chosenHandler(requestProperties,(statusCode,payload)=>{
            statusCode = typeof statusCode === 'number' ? statusCode : 500;
            payload = typeof payload === 'object' ? payload : {};
    
            const payloadString = JSON.stringify(payload);
            
            //Final Respose from Client
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);
    
        });
        

    });

   

}
// console.log(handler);
module.exports = handler;