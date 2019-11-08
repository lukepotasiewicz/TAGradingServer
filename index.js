#!/opt/nodejs/v10/bin/node

const http = require('unit-http');
const url = require('url');
const fs = require('fs');
const baseUrl = '/proxyserver';
const app = {};

const readDatabase = () => JSON.parse(fs.readFileSync('database.json'));

const writeDatabase = (data) => {
  const oldData = readDatabase();
  fs.writeFileSync('database.json', JSON.stringify({...oldData, ...data}));
};

app[baseUrl] = (req, res) => res.write("welcome to my proxy server");

app[baseUrl + '/health'] = (req, res) => {
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.write(JSON.stringify({healthy: true}));
};

/* ----------- GET ----------- */
app[baseUrl + '/getData'] = (req, res) => {
  const data = readDatabase();
  return res.write(JSON.stringify(data));
};

/* ----------- UPDATED ----------- */
app[baseUrl + '/updateData'] = (req, res) => {
  const {query} = url.parse(req.url, true);
  if (!query.data) return res.write(JSON.stringify({error: "Bad request"}));
  writeDatabase(JSON.parse(query.data));
  return res.write(JSON.stringify({success: true}));
};

http.createServer(function (req, res) {
  try {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
    });
    const {pathname} = url.parse(req.url, true);
    app[pathname](req, res);
    res.end();
  } catch (e) {
    res.end('ERROR: ' + e);
  }
}).listen();
