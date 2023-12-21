

const {sampleHandler} = require('./Handler/routeHandler/sampleHandler');
const { tokenHandler } = require('./Handler/routeHandler/tokenHandler');
const {userHandler} = require('./Handler/routeHandler/userHandler');
const {checkHandler} = require('./Handler/routeHandler/checkHandler');

const routes = {
    sample: sampleHandler,
    user : userHandler,
    token : tokenHandler,
    check : checkHandler
}
module.exports = routes;