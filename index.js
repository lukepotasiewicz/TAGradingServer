const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();
const port = 3000;
app.use(cors());

const readDatabase = () => JSON.parse(fs.readFileSync('database.json'));

const writeDatabase = (data) => {
    const oldData = readDatabase();
    fs.writeFileSync('database.json',  JSON.stringify({...oldData, ...data}));
};

app.get('/', (req, res) => res.send("welcome to my proxy server"));

app.get('/health', (req, res) => res.status(200).json({healthy: true}));

// ----------- GET -----------
app.get('/getData', (req, res) => {
    const data = readDatabase();
    return res.status(200).json(data);
});

// ----------- UPDATED -----------
app.get('/updateData', (req, res) => {
    if (!req.query.data) return res.status(400).json({error: "Bad request"});
    writeDatabase(JSON.parse(req.query.data));
    return res.status(200).json({queryString: req.query});
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
