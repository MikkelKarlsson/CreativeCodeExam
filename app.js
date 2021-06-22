    // Importing Express
    const express = require('express');

    // Instantiate Express
    const app = express();

    const path = require('path');

    const fs = require('fs');

    app.use(express.static("public"))

    // All API's served to the html pages
    app.get('/', (req, res) => {
        res.sendFile(`${__dirname}/public/index.html`);
    });

    app.get('/yourface', (req, res) => {
        res.sendFile(`${__dirname}/public/facecamrec.html`);
    });

    app.get('/thegame', (req, res) => {
        res.sendFile(`${__dirname}/public/facegame.html`);
    });


//Define port
const port = 8080;

//Listenen to the port
app.listen(port, (error) => {
    if(error) {
        console.log(error);
    }
    console.log("Server is running on port", port);
});