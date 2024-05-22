const express = require('express');
const app = express.Router();
const fs = require('fs');

const routes = fs.readdirSync('./routes').filter(file => 
    file.endsWith('.js') && 
    file !== __filename.slice(__dirname.length + 1)
);
for(const route of routes){
    const _route = require(`../routes/${route}`);
    let routeName = route.slice(0, route.length-3);
    if(_route.app){
        app.use(`/${routeName}`, _route.app);
    }
    else{
        app.get(`/${routeName}`, (req, res) => {res.send("ROUTE NOT SETUP YET!")});
    }
};

module.exports = {app};