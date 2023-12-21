

//module scaffolding
const handler = {};

handler.notFoundHandler = (requestProperties,callBack)=>{
    callBack(404,{
        message : "Your requested URL was not Found",
    });
}
module.exports = handler;