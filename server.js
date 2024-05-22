const express = require('express');
const app = express();
const server = require("http").createServer(app);

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false}));
app.use('/assets', express.static('assets'));
app.get('/', (req, res) => res.redirect('/home'));
app.use('/', require('./routes/_routes.js').app)

process.on("unhandledRejection", e => {
    console.log('An unhandledRejection occured:\n' + e)
});

process.on("uncaughtException", e => {
    console.log('An uncaughtException occured:\n' + e)
});

require('./discordbot.js')();

let port = process.env.PORT || 5000;
server.listen(port, () => {
    console.log(`server: listening at port: ${port}`);
})