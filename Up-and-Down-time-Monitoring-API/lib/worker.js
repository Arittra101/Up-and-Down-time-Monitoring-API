/*
    Title : Uptime Monitoring Application
    Description :  A RestFul Api  to monitor up or down time of user defined links
    Author :  Arittra 
    Credit : Learn with summit
    Date : 11/24/2023
*/

//dependencies
const data = require('./data');
const url = require('url');
const http = require('http');
const https = require('https');
const utiliti = require('../helpers/utilities');
const {sendTwilloSms} = require('../helpers/notification');

//app object - module scaffolding
const worker = {};

worker.gatherAllchecks = () => {
    //get all the checks
    data.list('checks', (err, checks) => {
        if (!err && checks && checks.length > 0) {
            checks.forEach(check => {
                data.read('checks', check, (err2, originalCheckData) => {
                    if (!err && originalCheckData) {
                        //pass the data to the check validator
                        const objchek = utiliti.parseJson(originalCheckData);
                        worker.validateCheckData(objchek);
                    } else {
                        console.log("Error");
                    }
                })
            });
        } else {
            console.log('Error could not find any checks');
        }
    })

}

worker.performCheck = (originalCheckData) => {
    //prepare the intial check outcome
    let checkoutCome = {
        error: false,
        responseCode: false
    }
    //mark the outcome has not been sent yet
    let outcomeSent = false;


    //parse the hostname && full url from original data
    let parseUrl = url.parse(originalCheckData.protocol + '://' + originalCheckData.url, true);
    let hostname = parseUrl.hostname;
    const path = parseUrl.path;


    //construct the request
    const requireDetails = {
        protocol: originalCheckData.protocol + ':',
        hostname: hostname,
        method: originalCheckData.method.toUpperCase(),
        path,
        timeoutSeconds: originalCheckData.timeoutSeconds * 1000,
    }

    const protocolUse = originalCheckData.protocol === 'http' ? http : https;
    //send request to the site
    let req = protocolUse.request(requireDetails, (res) => {
        // const  
        const status = res.statusCode;
        checkoutCome.responseCode = status;
        if (!outcomeSent) {
            worker.processCheckOutcome(originalCheckData, checkoutCome);
            outcomeSent = true;
        }

        //update the check outcome and pass to the next process
    })

    //basically respond buffer akare ashe so amder wait korte hte pare
    // ei data ashar age amder error o aste pare
    // so amder ucit ekta error event handle kora
    //amra pabo ta req variable theke

    req.on('error', (e) => {

        checkoutCome = {
            error: true,
            value: e
        }

        if (!outcomeSent) {
            worker.processCheckOutcome(originalCheckData, checkoutCome);
            outcomeSent = true;
        }

    })

    req.on('timeout', (e) => {

        checkoutCome = {
            error: true,
            value: 'timeout'
        }

        if (!outcomeSent) {
            worker.processCheckOutcome(originalCheckData, checkoutCome);
            outcomeSent = true;
        }

    })


    //req send 
    req.end();
}

worker.alterUserToStatusChange = (newCheckData) => {

    let msg = `Alert Your check for ${newCheckData.method.toUpperCase()} ${newCheckData.protocol} :// ${newCheckData.url} is currently 
    ${newCheckData.state}`;

    sendTwilloSms(newCheckData.mobileNo,msg,(err)=>{
            if(!err){
                console.log("User was alerted to a status change via sms: "+ msg);
            }else{
                console.log("there is a problem sending sms to one of the user!");
            }
    })

}

worker.processCheckOutcome = (originalCheckData, checkoutCome) => {
    //check  if check outcome is up or down
    let state = !checkoutCome.error && checkoutCome.responseCode && originalCheckData.succesCodes.indexOf(checkoutCome.responseCode) > -1 ? 'up' : 'down';

    //decide we should alert the user or not
    let alertWanted = originalCheckData.lastChecked && originalCheckData.state != state ? true : false;

    let newCheckData = originalCheckData;

    newCheckData.lastChecked = Date.now();

    //update the check to the database
    data.update('checks', newCheckData.id, newCheckData, (err) => {
        if (!err) {
            //send the checkdata to next process
            if (alertWanted) {
                worker.alterUserToStatusChange(newCheckData);
            } else {
                console.log("Alert is not needed as there is no state change");
            }

        } else {
            console.log("Error Trying to save check data of one of the checks!");
        }
    });

}

worker.validateCheckData = (originalCheckData) => {
    //validate check data
    if (originalCheckData && originalCheckData.id) {
        originalCheckData.state = typeof (originalCheckData.state) === 'string' && ['up', 'down'].indexOf(originalCheckData.state) > -1 ?
            originalCheckData.state : 'down';

        originalCheckData.lastChecked = typeof (originalCheckData.lastChecked) === 'number' && originalCheckData.lastChecked > 0 ?
            originalCheckData.lastChecked : false;

        //pass to the next process
        worker.performCheck(originalCheckData);

    } else {
        console.log("Error in check Data");
    }

}


worker.loop = () => {
    setInterval(() => {
        worker.gatherAllchecks();
    }, 5000);
};


//Start the server
worker.init = () => {
    // execute all the checks
    worker.gatherAllchecks();

    //execute the loop
    worker.loop();
}
module.exports = worker;

