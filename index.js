#!/opt/nodejs/v10/bin/node

const http = require('unit-http');
const url = require('url');
const fs = require('fs');
const baseUrl = '/proxyserver';
const app = {};

const ADMIN = "lmpotasi";

const readDatabase = () => JSON.parse(fs.readFileSync('database.json'));
const readUsers = () => JSON.parse(fs.readFileSync('users.json'));
const readAssignments = () => JSON.parse(fs.readFileSync('assignments.json'));

const writeDatabase = (data) => {
  const oldData = readDatabase();
  fs.writeFileSync('database.json', JSON.stringify({...oldData, ...data}));
<<<<<<< HEAD
};
const writeUsers = (data) => {
  const oldData = readUsers();
  fs.writeFileSync('users.json', JSON.stringify({...oldData, ...data}));
};
const writeAssignments = (data) => {
  const oldData = readAssignments();
  fs.writeFileSync('assignments.json', JSON.stringify({...oldData, ...data}));
};

const getUser = (user) => {
  const users = readUsers();
  if (!users[user]) return {error: "User not found"};
  return users[user];
=======
>>>>>>> 7cc881a3ce5492995dc52eb07784f8ed3a5235cd
};

app[baseUrl] = (req, res) => res.write("welcome to my proxy server");

app[baseUrl + '/health'] = (req, res) => {
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.write(JSON.stringify({healthy: true}));
};

/* ----------- GET ----------- */
app[baseUrl + '/getData'] = (req, res) => {
<<<<<<< HEAD
  const {query} = url.parse(req.url, true);
  if (!query.user) return res.write(JSON.stringify({error: "Bad request"}));
  const data = readDatabase();
  data.user = getUser(query.user);
  if (!data.user.admin) {
    const tempStudents = data.students;
    data.students = {};
    data.user.students.forEach((s) => data.students[s] = tempStudents[s]);
  }
  return res.write(JSON.stringify(data));
};

app[baseUrl + '/getAllUsers'] = (req, res) => {
  const {query} = url.parse(req.url, true);
  if (!query.user) return res.write(JSON.stringify({error: "Bad request"}));
  if (query.user !== ADMIN) return res.write(JSON.stringify({error: "Permission Denied"}));
  return res.write(JSON.stringify(readUsers()));
};

app[baseUrl + '/getAssignments'] = (req, res) => {
  const {query} = url.parse(req.url, true);
  if (!query.user) return res.write(JSON.stringify({error: "Bad request"}));
  return res.write(JSON.stringify(readAssignments()));
};

/* ----------- ADD ----------- */
app[baseUrl + '/addUser'] = (req, res) => {
  const {query} = url.parse(req.url, true);
  if (!query.user || !query.netId || !query.admin) return res.write(JSON.stringify({error: "Bad request"}));
  if (query.user !== ADMIN) return res.write(JSON.stringify({error: "Permission Denied"}));
  writeUsers({
    [query.netId]: {
      admin: query.admin === "true",
      students: []
    }
  });
  return res.write(JSON.stringify({success: true}));
};

app[baseUrl + '/addAssignment'] = (req, res) => {
  const {query} = url.parse(req.url, true);
  if (!query.user || !query.assignment) return res.write(JSON.stringify({error: "Bad request"}));
  if (query.user !== ADMIN) return res.write(JSON.stringify({error: "Permission Denied"}));
  const assignments = readAssignments();
  assignments[query.assignment] = {sliders: {}, comment: {value: ""}};
  writeAssignments(assignments);

  const database = readDatabase();
  Object.keys(database.students).forEach(s => {
    database.students[s][query.assignment] = {sliders: {}, comment: {value: ""}};
  });
  writeDatabase(database);

  return res.write(JSON.stringify({success: true}));
};

app[baseUrl + '/addSlider'] = (req, res) => {
  const {query} = url.parse(req.url, true);
  if (!query.user || !query.data || !query.assignment) return res.write(JSON.stringify({error: "Bad request"}));
  if (query.user !== ADMIN) return res.write(JSON.stringify({error: "Permission Denied"}));
  const assignments = readAssignments();
  const newSlider = JSON.parse(query.data);
  assignments[query.assignment].sliders[newSlider.id] = newSlider;
  writeAssignments(assignments);

  const database = readDatabase();
  Object.keys(database.students).forEach(s => {
    database.students[s][query.assignment].sliders[newSlider.id] = newSlider;
  });
  writeDatabase(database);

  return res.write(JSON.stringify({success: true}));
=======
  const data = readDatabase();
  return res.write(JSON.stringify(data));
>>>>>>> 7cc881a3ce5492995dc52eb07784f8ed3a5235cd
};

app[baseUrl + '/addStudent'] = (req, res) => {
  const {query} = url.parse(req.url, true);
  if (!query.user || !query.student) return res.write(JSON.stringify({error: "Bad request"}));
  if (query.user !== ADMIN) return res.write(JSON.stringify({error: "Permission Denied"}));
  const database = readDatabase();
  database.students[query.student] = readAssignments();
  writeDatabase(database);
  return res.write(JSON.stringify(database));
};

/* ----------- UPDATE ----------- */
app[baseUrl + '/updateData'] = (req, res) => {
  const {query} = url.parse(req.url, true);
  if (!query.data) return res.write(JSON.stringify({error: "Bad request"}));
  writeDatabase(JSON.parse(query.data));
  return res.write(JSON.stringify({success: true}));
<<<<<<< HEAD
};

/* ----------- DELETE ----------- */
app[baseUrl + '/deleteUser'] = (req, res) => {
  const {query} = url.parse(req.url, true);
  if (!query.user || !query.netId) return res.write(JSON.stringify({error: "Bad request"}));
  if (query.user !== ADMIN) return res.write(JSON.stringify({error: "Permission Denied"}));
  writeUsers({
    [query.netId]: undefined
  });
  return res.write(JSON.stringify({success: true}));
};

app[baseUrl + '/deleteAssignment'] = (req, res) => {
  const {query} = url.parse(req.url, true);
  if (!query.user || !query.assignment) return res.write(JSON.stringify({error: "Bad request"}));
  if (query.user !== ADMIN) return res.write(JSON.stringify({error: "Permission Denied"}));
  writeAssignments({
    [query.assignment]: undefined
  });

  const database = readDatabase();
  Object.keys(database.students).forEach(s => {
    database.students[s][query.assignment] = undefined;
  });
  writeDatabase(database);

  return res.write(JSON.stringify({success: true}));
};

app[baseUrl + '/deleteSlider'] = (req, res) => {
  const {query} = url.parse(req.url, true);
  if (!query.user || !query.slider || !query.assignment) return res.write(JSON.stringify({error: "Bad request"}));
  if (query.user !== ADMIN) return res.write(JSON.stringify({error: "Permission Denied"}));
  const assignments = readAssignments();
  assignments[query.assignment].sliders[query.slider] = undefined;
  writeAssignments(assignments);

  const database = readDatabase();
  Object.keys(database.students).forEach(s => {
    database.students[s][query.assignment].sliders[query.slider] = undefined;
  });
  writeDatabase(database);

  return res.write(JSON.stringify({success: true}));
};

app[baseUrl + '/deleteStudent'] = (req, res) => {
  const {query} = url.parse(req.url, true);
  if (!query.user || !query.student) return res.write(JSON.stringify({error: "Bad request"}));
  if (query.user !== ADMIN) return res.write(JSON.stringify({error: "Permission Denied"}));
  const database = readDatabase();
  database.students[query.student] = undefined;
  writeDatabase(database);
  return res.write(JSON.stringify({success: true}));
=======
>>>>>>> 7cc881a3ce5492995dc52eb07784f8ed3a5235cd
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
