//depend
const { handleReqRes } = require("../../helpers/handleRequest");
const data = require("../../lib/data");
const utilities = require("../../helpers/utilities");
const tokenHandler = require("./tokenHandler");
const { user } = require("../../route");
const { maxChecks } = require("../../helpers/enviroment");

//noted here primary id is user's phone number

const handler = {};
console.log('Check Handler')
handler.checkHandler = (requestProperties, callBack) => {

    //accepted method  only get/post/delete/put

    const acceptedMethod = ['get', 'post', 'put', 'delete'];
    if (acceptedMethod.indexOf(requestProperties['method']) > -1) {
        handler._check[requestProperties['method']](requestProperties, callBack);
        // console.log("Hello");
    } else {
        callBack(405);
    }


}

handler._check = {};

//post means user add or create
handler._check.post = (requestProperties, callBack) => {


    //validate inputs
    let protocol = typeof (requestProperties.body.protocol) === 'string' && ['http', 'https'].indexOf
        (requestProperties.body.protocol) > -1 ? requestProperties.body.protocol : false;

    let url = typeof (requestProperties.body.url) === 'string' && requestProperties.body.url.trim().length > 0 ?
        requestProperties.body.url : false;

    let method = typeof (requestProperties.body.method) === 'string' && ['POST', 'GET', 'PUT', 'DELETE'].indexOf(requestProperties.body.method) > -1 ?
        requestProperties.body.method : false;

    let succesCodes = typeof (requestProperties.body.succesCodes) === 'object' && requestProperties.body.succesCodes instanceof Array ?
        requestProperties.body.succesCodes : false;

    let timeoutSeconds = typeof (requestProperties.body.timeoutSeconds) === 'number' && requestProperties.body.timeoutSeconds % 1 === 0 && requestProperties.body.timeoutSeconds >= 1 &&
        requestProperties.body.timeoutSeconds <= 5 ?
        requestProperties.body.timeoutSeconds : false;

    if (protocol && url && method && succesCodes && timeoutSeconds) {

        let tokenId = typeof (requestProperties.headersObject.id) === 'string' ? requestProperties.headersObject.id : false;

        //lookup the user mobileNo by reading the token
        data.read('token', tokenId, (err1, tokenData) => {
            if (!err1 && tokenData) {

                let userPhone = utilities.parseJson(tokenData).mobileNo;  //string to object

                //now find the user info
                data.read('user', userPhone, (err2, userData) => {
                    if (!err2 && userData) {
                        tokenHandler._token.verify(tokenId, userPhone, (noterr) => {
                            if (noterr) {
                                let userObject = utilities.parseJson(userData);
                                let userChecks = typeof (userObject.checks) === 'object' && userObject.checks instanceof Array
                                    ? userObject.checks : [];  //type of check user wants

                                if (userChecks.length < maxChecks) {
                                    let checkId = utilities.createRandomString(20);

                                    const checkObject = {
                                        id: checkId,
                                        mobileNo: userPhone,
                                        protocol,
                                        url,
                                        method,
                                        succesCodes,
                                        timeoutSeconds
                                    }

                                    //save the object 
                                    data.create('checks', checkId, checkObject, (err3) => {
                                        if (!err3) {
                                            userObject.checks = userChecks;  //insert a array
                                            userObject.checks.push(checkId); //insert a another element check Id to that array 

                                            //save the new user data
                                            data.update('user', userPhone, userObject, (err4) => {
                                                if (!err4) {
                                                    callBack(200, checkObject);
                                                } else {
                                                    callBack(500, {
                                                        error: 'There is a problem in server side'
                                                    })
                                                }
                                            })

                                        } else {
                                            callBack(500, {
                                                error: 'There is a problem in server side'
                                            })
                                        }
                                    })
                                } else {
                                    callBack(403, {
                                        error: 'use already reached max check limit'
                                    })
                                }
                            }
                        })
                    } else {
                        callBack(403, {
                            error: 'user not found'
                        })
                    }

                })
            } else {
                callBack(403, {
                    error: 'you have a problem in your request'
                })
            }
        })

    } else {
        callBack(400, {
            error: 'you have a problem in your request'
        })
    }

}

handler._check.get = (requestProperties, callBack) => {

    //check id
    let checkId = typeof (requestProperties.queryStringObject.id) === 'string' && requestProperties.queryStringObject.id.trim().length == 20 ? requestProperties.queryStringObject.id : false;

    if (checkId) {
        data.read('checks', checkId, (err1, checkData) => {
            if (!err1 && checkData) {

                const token = typeof (requestProperties.headersObject.id) === 'string' ? requestProperties.headersObject.id : false;
                tokenHandler._token.verify(token, utilities.parseJson(checkData).mobileNo, (notErr) => {
                    if (notErr) {
                        callBack(200, utilities.parseJson(checkData));
                    } else {
                        callBack(403, {
                            error: 'Authentication failure'
                        })
                    }
                })
            } else {
                callBack(400, {
                    error: 'you have a problem in your request'
                })
            }
        })
    }


}

handler._check.put = (requestProperties, callBack) => {


    let id = typeof (requestProperties.body.id) === 'string' && requestProperties.body.id.trim().length === 20 ? requestProperties.body.id : false;


    let protocol = typeof (requestProperties.body.protocol) === 'string' && ['http', 'https'].indexOf
        (requestProperties.body.protocol) > -1 ? requestProperties.body.protocol : false;

    let url = typeof (requestProperties.body.url) === 'string' && requestProperties.body.url.trim().length > 0 ?
        requestProperties.body.url : false;

    let method = typeof (requestProperties.body.method) === 'string' && ['POST', 'GET', 'PUT', 'DELETE'].indexOf(requestProperties.body.method) > -1 ?
        requestProperties.body.method : false;

    let succesCodes = typeof (requestProperties.body.succesCodes) === 'object' && requestProperties.body.succesCodes instanceof Array ?
        requestProperties.body.succesCodes : false;

    let timeoutSeconds = typeof (requestProperties.body.timeoutSeconds) === 'number' && requestProperties.body.timeoutSeconds % 1 === 0 && requestProperties.body.timeoutSeconds >= 1 &&
        requestProperties.body.timeoutSeconds <= 5 ?
        requestProperties.body.timeoutSeconds : false;


    if (id) {

        if (protocol || url || method || succesCodes || timeoutSeconds) {

            data.read('checks', id, (err1, checkData) => {

                if (!err1 && checkData) {

                    let checkObject = utilities.parseJson(checkData);
                    let token = typeof (requestProperties.headersObject.id) === 'string' ?
                        requestProperties.headersObject.id : false;

                    //  console.log(checkData + "khela");
                    console.log("token" + token);
                    tokenHandler._token.verify(token, checkObject.mobileNo, (notErr) => {
                        if (notErr) {
                            if (protocol) checkObject.protocol = protocol;
                            if (url) checkObject.url = url;
                            if (method) checkObject.method = method;
                            if (succesCodes) checkObject.succesCodes = succesCodes;
                            if (timeoutSeconds) checkObject.timeoutSeconds = timeoutSeconds;
                            data.update('checks', id, checkObject, (err3) => {
                                if (!err3) {
                                    callBack(200, {
                                        message: 'Update successfully'
                                    })
                                } else {
                                    callBack(400, {
                                        error: 'Failed to updates checks'
                                    })
                                }
                            })
                        } else {
                            callBack(400, {
                                error: 'Authentication error'
                            })
                        }
                    })



                } else {
                    callBack(400, {
                        error: 'Failed to updates checks'
                    })
                }
            })
        } else {
            callBack(400, {
                error: 'you atleast provide on field to update'
            })
        }

    } else {
        callBack(400, {
            error: 'you have a problem in your request'
        })
    }

}

handler._check.delete = (requestProperties, callBack) => {

    //check id
    let checkId = typeof (requestProperties.queryStringObject.id) === 'string' && requestProperties.queryStringObject.id.trim().length == 20 ? requestProperties.queryStringObject.id : false;

    if (checkId) {
        data.read('checks', checkId, (err1, checkData) => {
            if (!err1 && checkData) {

                const token = typeof (requestProperties.headersObject.id) === 'string' ? requestProperties.headersObject.id : false;
                tokenHandler._token.verify(token, utilities.parseJson(checkData).mobileNo, (notErr) => {
                    if (notErr) {

                        //delete the check data
                        data.delete('checks', checkId, (err3) => {
                            if (!err3) {
                                //we basically delete the check id but we have to delete from user also those particular instance
                                data.read('user', utilities.parseJson(checkData).mobileNo, (err4, userData) => {
                                    let userObject = utilities.parseJson(userData);
                                    if (!err4 && userData) {
                                        let userCheck = typeof (userObject.checks) === 'object' &&    //we get the array of the checks
                                            userObject.checks instanceof Array ? userObject.checks : [];

                                        let checkPosition = userCheck.indexOf(checkId);
                                        if (checkPosition > -1) {
                                            userCheck.splice(checkPosition, 1);

                                            //update to userObject
                                            userObject.checks = userCheck;
                                            data.update('user', userObject.mobileNo, userObject, (err5) => {
                                                if (!err4) {
                                                    callBack(200, {
                                                        error: 'Done Succesfully from user also'
                                                    })
                                                }else{
                                                    callBack(500, {
                                                        error: 'Failed to delete from user side check'
                                                    })
                                                }
                                            })


                                        } else {
                                            callBack(500, {
                                                error: 'No check found to delete from user'
                                            })
                                        }
                                    } else {
                                        callBack(500, {
                                            error: 'Failed to delete'
                                        })
                                    }
                                })
                            } else {
                                callBack(403, {
                                    error: 'Failed to delete'
                                })
                            }
                        })

                    } else {
                        callBack(403, {
                            error: 'Authentication failure'
                        })
                    }
                })
            } else {
                callBack(400, {
                    error: 'you have a problem in your request'
                })
            }
        })
    }


}
module.exports = handler; 