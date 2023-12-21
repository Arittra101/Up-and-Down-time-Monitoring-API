const fs = require('fs');
const path = require('path');
console.log('file');
const lib = {};

//base directory of the data folder
lib.basedir = path.join(__dirname, '/../.data/');
console.log(lib.basedir);

//write data to file  //dir=>folder name ,file=>file name
lib.create = function (dir, file, data, callback) {
    //open file for writting
    fs.open(lib.basedir + dir + '/' + file + '.json', 'wx', (err1, fileDescriptor) => {
        if (!err1 && fileDescriptor) {

            //convert object to string
            const stringData = JSON.stringify(data);


            //write data to file and then close it
            fs.writeFile(fileDescriptor, stringData, (err2) => {
                if (!err2) {
                    fs.close(fileDescriptor, (err3) => {
                        if (!err3) {
                            callback(false);
                        } else {
                            callback('Error closing the new file');
                        }
                    });
                } else {
                    callback('Error writting to new file');
                }
            })
        } else {
            callback(err1);
        }
    });

}

//here  dir means folder create and file means filename

//read data
lib.read = (dir, file, callback) => {
    fs.readFile(lib.basedir + dir + '/' + file + '.json', 'utf8', (err, data) => {
        callback(err, data);
    })
}

//update data

lib.update = (dir, file, data, callback) => {
    fs.open(lib.basedir + dir + '/' + file + '.json', 'r+', (err, fileDescriptor) => {
        if (!err && fileDescriptor) {
            //convert the data to String
            const stringData = JSON.stringify(data);

            fs.ftruncate(fileDescriptor, (err1) => {
                if (!err1) {

                    //write to the file and close it
                    fs.writeFile(fileDescriptor, stringData, (err2) => {
                        if (!err2) {
                            fs.close(fileDescriptor, (err3) => {
                                callback(false);
                            })
                        } else {
                            callback("Failed to close");
                        }
                    })

                } else {
                    callback("Error trancating file");
                }
            });

        } else {
            callback("Error Updating");
        }
    })
}

lib.delete = (dir,file,callback)=>{
    //unlink file
    fs.unlink(lib.basedir + dir + '/' + file + '.json',(err)=>{
        if(!err){
            callback(false);
        }
        else{
            callback("Error in deleting file");
        }
    })
}

//list all the items
lib.list = (dir,callback)=>{
    fs.readdir(lib.basedir + dir + '/', (err,fileNames)=>{
        if(!err && fileNames && fileNames.length>0){
            let trimmedFileNames = [];
            fileNames.forEach(fileName =>{
                trimmedFileNames.push(fileName.replace('.json',''));
            })
            callback(false,trimmedFileNames);
        }else{  
            callback("Error in reading directory");
        }
    })
}
module.exports = lib;
