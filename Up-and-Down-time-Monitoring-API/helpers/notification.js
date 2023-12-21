//dependencies 
const https = require('https');
const { twilio } = require("../helpers/enviroment");
const utilities = require('./utilities');

const queryString = require('querystring');

//module scaffolding
const notification = {};

//send sms to user using twillo api

notification.sendTwilloSms = (phone, msg, callback) => {

    //input validation

    const userPhone = typeof (phone) === 'string' && phone.trim().length === 11 ? phone.trim() : false;
    const userMsg = typeof (msg) === 'string' && msg.trim().length > 0 && msg.trim().length <= 1600 ? msg.trim() : false;

    if (userPhone && userMsg) {

        //configure the request playload
        // console.log(twilio);
        const payload = {
            From: twilio.fromPhone,
            To: `+88&${userPhone}`,
            Body: userMsg
        }

        //convert object to string 
        const string_playload = queryString.stringify(payload);

        //comfigure the request details
        const reqestDetailsObject = {
            hostname: 'api.twilio.com',
            method: 'POST',
            path: `/2010-04-01/Accounts/${twilio.accountSid}/Messages.json`,
            auth: `${twilio.accountSid}:${twilio.authToken}`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        }

        // instatiate  the 
        const req = https.request(reqestDetailsObject, (res) => {

            // get the status of the send request

            if (res.statusCode === 200 || res.statusCode === 201) {
                callback(false);
            } else {
                callback(`status code return ${res.statusCode}`);
            }
        });

        req.on('error',(err)=>{
            callback(err);
        })
        req.write(string_playload);
        req.end();

    } else {
        callback('Given parameter is missing');
    }
};

//export the module
module.exports = notification;