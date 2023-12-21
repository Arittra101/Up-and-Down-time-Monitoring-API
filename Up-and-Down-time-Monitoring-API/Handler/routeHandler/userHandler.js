//depend
const { handleReqRes } = require("../../helpers/handleRequest");
const data = require("../../lib/data");
const utilities = require("../../helpers/utilities");
const tokenHandler = require("./tokenHandler");

//noted here primary id is user's phone number

const handler = {};
console.log('User Handler')
handler.userHandler = (requestProperties, callBack) => {

    //accepted method  only get/post/delete/put

    const acceptedMethod = ['get', 'post', 'put', 'delete'];
    if (acceptedMethod.indexOf(requestProperties['method']) > -1) {
        handler._users[requestProperties['method']](requestProperties, callBack);
        // console.log("Hello");
    } else {
        callBack(405);
    }


}

handler._users = {};

//post means user add or create
handler._users.post = (requestProperties, callBack) => {

    const firstName = typeof (requestProperties.body.firstName) === 'string' && requestProperties.body.firstName.trim().length > 0 ? requestProperties.body.firstName : false;

    const lastName = typeof (requestProperties.body.lastName) === 'string' && requestProperties.body.lastName.trim().length > 0 ? requestProperties.body.lastName : false;

    const mobileNo = typeof (requestProperties.body.mobileNo) === 'string' && requestProperties.body.mobileNo.trim().length == 11 ? requestProperties.body.mobileNo : false;

    let password = typeof (requestProperties.body.password) === 'string' && requestProperties.body.password.trim().length > 0 ? requestProperties.body.password : false;

    const terms = typeof (requestProperties.body.terms) === 'boolean' && requestProperties.body.terms.trim().length > 0 ? requestProperties.body.terms : false;

    console.log(firstName);
    console.log(lastName);
    console.log(mobileNo);
    console.log(password);
    console.log(terms);


    if (firstName && lastName && mobileNo && password) {
        //we have to make does user already exist or not

        data.read('users', mobileNo, (err, user) => {
            if (err) {
                password = utilities.hash(password);
                //basically creating a user info in object
                let userObject = {
                    firstName,
                    lastName,
                    mobileNo,
                    password,
                    terms
                }

                //console.log("Now you can inseert it" + password)
                // data.create('users',)

                // store to user to db

                data.create('user', mobileNo, userObject, (err) => {
                    if (!err) {
                        callBack(200, {
                            message: "User is created Succesfully"
                        });
                    } else {
                        callBack(200, {
                            error: "Could not create user"
                        });
                    }
                });

            } else {
                callBack(500, {
                    error: 'There was a problem in server side!'
                })
            }
        })


    } else {
        callBack(400, {
            message: "Failed to create account",
        });
    }  //400 dite hbe jodi client er request e problem thakle
    // console.log(requestProperties.body);



}

handler._users.get = (requestProperties, callBack) => {
    //client get info from server 

    //check the phone number is valid?
    let mobileNo = typeof (requestProperties.queryStringObject.mobileNo) === 'string' && requestProperties.queryStringObject.mobileNo.trim().length == 11 ? requestProperties.queryStringObject.mobileNo : false;
    // console.log(mobileNo);
    if (mobileNo) {

        //verify token
        let id = typeof (requestProperties.headersObject.id) == 'string' ? requestProperties.headersObject.id : false;

        tokenHandler._token.verify(id, mobileNo, (err) => {
            if (err) {
                //lookup the user
                data.read('user', mobileNo, (err, user) => {

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
            } else {
                callBack(404, {
                    error: "Failed Authentication"
                })
            }
        });




    } else {    //404 means emon kono user pawa jai nai server 
        callBack(404, {
            error: "Requested user was not found"
        })
    }

}

handler._users.put = (requestProperties, callBack) => {

    //fetch data from client -- requestproperties body has the client info
    const mobileNo = typeof (requestProperties.body.mobileNo) === 'string' && requestProperties.body.mobileNo.trim().length == 11 ? requestProperties.body.mobileNo : false;

    const firstName = typeof (requestProperties.body.firstName) === 'string' && requestProperties.body.firstName.trim().length > 0 ? requestProperties.body.firstName : false;

    const lastName = typeof (requestProperties.body.lastName) === 'string' && requestProperties.body.lastName.trim().length > 0 ? requestProperties.body.lastName : false;

    let password = typeof (requestProperties.body.password) === 'string' && requestProperties.body.password.trim().length > 0 ? requestProperties.body.password : false;

    if (mobileNo) {


        let id = typeof (requestProperties.headersObject.id) == 'string' ? requestProperties.headersObject.id : false;

        tokenHandler._token.verify(id, mobileNo, (err) => {

            if (err) {

                if (firstName || lastName || password) {
                    // check the mobileno exist in the file system
                    data.read('user', mobileNo, (err1, uData) => {
                        //uData is a string we sent data as a object.After it's converted to
                        // string and insert to the database

                        //not to modify the real object we just make copy of that
                        //only usable for single object
                        const userData = { ...utilities.parseJson(uData) }
                        if (!err1 && userData) {
                            if (firstName)
                                userData.firstName = firstName;
                            if (lastName)
                                userData.lastName = lastName;

                            if (password)
                                userData.password = utilities.hash(password);

                            data.update('user', mobileNo, userData, (err2) => {
                                if (!err2) {
                                    callBack(200, {
                                        message: 'User has updated'
                                    })
                                } else {
                                    callBack(400, {
                                        error: 'There is a problem in server side' + err2
                                    })
                                }
                            })
                        } else {
                            callBack(400, {
                                error: err1 + 'you have a problem in your request'
                            })
                        }
                    })
                } else {
                    callBack(400, {
                        error: 'You have a problem in your request'
                    })
                }
            } else {
                callBack(404, {
                    error: "Failed Authentication"
                })
            }

        });

    } else {
        callBack(400, {
            error: 'invalid phone number'
        })
    }

}

handler._users.delete = (requestProperties, callBack) => {
    const mobileNo = typeof (requestProperties.body.mobileNo) === 'string' && requestProperties.body.mobileNo.trim().length == 11 ? requestProperties.body.mobileNo : false;

    if (mobileNo) {


        let id = typeof (requestProperties.headersObject.id) == 'string' ? requestProperties.headersObject.id : false;

        tokenHandler._token.verify(id, mobileNo, (err) => {

            if (err) {

                data.read('user', mobileNo, (err1, userData) => {
                    if (!err1) {
                        data.delete('user', mobileNo, (err) => {
                            if (!err) {
                                callBack(200, {
                                    message: 'Succesfully deleted'
                                })
                            } else {
                                callBack(400, {
                                    error: 'You have a problem in your request and not delete'
                                })
                            }
                        })
                    } else {
                        callBack(400, {
                            error: 'You have a problem in your request and not delete'
                        })
                    }
                })


            } else {
                callBack(404, {
                    error: "Failed Authentication"
                })
            }

        });
    } else {
        callBack(400, {
            error: 'You have a problem in your request'
        })
    }
}
module.exports = handler;