const {authorize} = require('./authorize')
const fs = require('fs');
const { promisify } = require('util');
const fsAsync = {
    readFile: promisify(fs.readFile)
};

const credentials = JSON.parse(fs.readFileSync('credentials.json'));
authorize(credentials, function(auth){
   console.log(auth);
});