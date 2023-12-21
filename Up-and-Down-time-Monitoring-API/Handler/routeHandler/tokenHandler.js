//depend
const { handleReqRes } = require("../../helpers/handleRequest");
const data = require("../../lib/data");

const utilities = require("../../helpers/utilities");

//noted here primary id is user's phone number

const handler = {};
console.log('tokenHandler ')
handler.tokenHandler = (requestProperties, callBack) => {

    //accepted method  only get/post/delete/put

    const acceptedMethod = ['get', 'post', 'put', 'delete'];
    if (acceptedMethod.indexOf(requestProperties['method']) > -1) {
        handler._token[requestProperties['method']](requestProperties, callBack);
        console.log("Hello");
    } else {
        callBack(405);
    }


}

handler._token = {};

//post means user add or create
handler._token.post = (requestProperties, callBack) => {

    let password = typeof (requestProperties.body.password) === 'string' && requestProperties.body.password.trim().length > 0 ? requestProperties.body.password : false;

    const mobileNo = typeof (requestProperties.body.mobileNo) === 'string' && requestProperties.body.mobileNo.trim().length == 11 ? requestProperties.body.mobileNo : false;

    if (password && mobileNo) {
        data.read('user', mobileNo, (err, user) => {

            //data string akare ashe amr kache
            //database e data string akare ache
            //so use korte string to object e convert korte hbe
            if (!err && user) {
                const hashPass = utilities.hash(password);
                //    // console.log(hashPass);
                //     console.log(utilities.parseJson(data));
                if (utilities.parseJson(user).password === hashPass) {
                    let tokenId = utilities.createRandomString(20);
                    let expire = Date.now() + 60 * 60 * 1000;
                    let tokenObject = {
                        mobileNo,
                        'id': tokenId,
                        expire
                    }
                    data.create('token', tokenId, tokenObject, (err2) => {
                        if (!err2) {
                            callBack(200, tokenObject);
                        } else {
                            callBack(500, {
                                error: "There was a problem in server side"
                            });
                        }
                    })

                } else {
                    callBack(200, {
                        error: "Password is not valid"
                    });
                }
            }
        })
    } else {
        callBack(400, {
            error: "There is a problems"
        });
    }
}

//from query we use the value
handler._token.get = (requestProperties, callBack) => {
    //client get info from server 

    //check the phone number is valid?
    let tokenId = typeof (requestProperties.queryStringObject.id) === 'string' && requestProperties.queryStringObject.id.trim().length == 20 ? requestProperties.queryStringObject.id : false;
    // console.log(mobileNo);
    if (tokenId) {
        //lookup the user
        data.read('token', tokenId, (err, user) => {

            // console.log(typeof user);

            let damy_user = utilities.parseJson(user);
            if (!err && user) {
                delete damy_user.password;
                callBack(200, damy_user);
            } else {
                callBack(404, {
                    error: err
                })
            }
        })

    } else {    //404 means emon kono user pawa jai nai server 
        callBack(404, {
            error: "Requested id was not found"
        })
    }
}

//basically token update means token take refresh kora
//we use cliend body request 
handler._token.put = (requestProperties, callBack) => {

    let tokenId = typeof (requestProperties.body.id) === 'string' && requestProperties.body.id.trim().length === 20 ? requestProperties.body.id : false;

    let extend = typeof (requestProperties.body.extend) === 'boolean' && requestProperties.body.extend === true ? requestProperties.body.id : false;

    if (tokenId && extend) {
        //check client given is valid or not
        data.read('token', tokenId, (err, tokenData) => {
            let tokenObject = utilities.parseJson(tokenData);
            if (tokenObject.expire > Date.now()) {

                tokenObject.expire = Date.now + 60 * 60 * 1000;
                //expand more token time 1h
                console.log("hello pur")
                //now update the data
                data.update('token', tokenId, tokenObject, (err2) => {

                    if (!err2) {
                        callBack(200, {
                            message: "Token updated"
                        });
                    } else {
                        callBack(400, {
                            error: "Problem in server side"
                        });
                    }
                })
            } else {

                callBack(400, {
                    error: "Token Already expired"
                });

            }
        })

    } else {
        callBack(400, {
            error: "There was a problem in your request"
        })
    }

}

handler._token.delete = (requestProperties, callBack) => {
    let tokenId = typeof (requestProperties.queryStringObject.id) === 'string' && requestProperties.queryStringObject.id.trim().length == 20 ? requestProperties.queryStringObject.id : false;
   console.log(tokenId)
    if (tokenId) {
        data.read('token', tokenId, (err1, userData) => {
            if (!err1) {
                data.delete('token', tokenId, (err) => {
                    if (!err) {
                        callBack(200, {
                            message: 'Succesfully token deleted'
                        })
                    } else {
                        callBack(400, {
                            error: 'You have a problem in your request and not delete'
                        })
                    }
                })
            } else {
                callBack(400, {
                    error: 'You have a problem in your token id and not delete'
                })
            }
        })
    } else {
        callBack(400, {
            error: 'You have a problem in your request'
        })
    }
}

handler._token.verify = (id,mobileNo,callBack)=>{
    data.read('token',id,(err,tokenData)=>{
        if(!err && tokenData){
            if(utilities.parseJson(tokenData).mobileNo==mobileNo && utilities.parseJson(tokenData).expire>Date.now())
            {
                callBack(true);
            }else{
                callBack(false);
            }
        }else{
            callBack(false);
        }
    })
}
module.exports = handler;