t http = require('unit-http');
const fs = require('fs');
const baseUrl = '/proxyserver';
const app = {};

const readDatabase = () => JSON.parse(fs.readFileSync('database.json'));

const writeDatabase = (data) => {
    const oldData = readDatabase();
    fs.writeFileSync('database.json',  JSON.stringify({...oldData, ...data}));
};

app[baseUrl] = (req, res) => res.write("welcome to my proxy server");

app[baseUrl + '/health'] = (req, res) => {
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.write(JSON.stringify({healthy: true}));
};

/* ----------- GET ----------- */
app[baseUrl + '/getData'] = (req, res) => {
    const data = readDatabase();
    return res.status(200).json(data);
};

/* ----------- UPDATED ----------- */
app[baseUrl + '/updateData'] = (req, res) => {
    if (!req.query.data) return res.status(400).json({error: "Bad request"});
    writeDatabase(JSON.parse(req.query.data));
    return res.status(200).json({queryString: req.query});
};

http.createServer(function (req, res) {
    try {
        app[req.url](req, res);
        res.end();
    }
    catch (e) {
        res.end(e);
    }
}).listen();

