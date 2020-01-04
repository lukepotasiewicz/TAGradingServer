#!/opt/nodejs/v10/bin/node

const http = require('unit-http');
const url = require('url');
const fs = require('fs');
const baseUrl = '/proxyserver';
const app = {};

const readDatabase = () => JSON.parse(fs.readFileSync('database.json'));
const readUsers = () => JSON.parse(fs.readFileSync('users.json'));
const readAssignments = () => JSON.parse(fs.readFileSync('assignments.json'));

const writeDatabase = (data) => {
  const oldData = readDatabase();
  data.students = { ...oldData.students, ...data.students };
  fs.writeFileSync('database.json', JSON.stringify({...oldData, ...data}));
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
};

app[baseUrl] = (req, res) => res.write("welcome to my proxy server");

app[baseUrl + '/health'] = (req, res) => {
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.write(JSON.stringify({healthy: true}));
};

/* -------------------------------------------- GET -------------------------------------------- */
app[baseUrl + '/getData'] = (req, res) => {
  const {query} = url.parse(req.url, true);
  if (!query.user) return res.write(JSON.stringify({error: "Bad request"}));
  const data = readDatabase();
  data.user = getUser(query.user);
  if (!data.user.admin) {
    Object.keys(data.students).forEach((student) => {
      Object.keys(data.students[student]).forEach((assignment) => {
        if (data.students[student][assignment].grader !== query.user) {
          data.students[student][assignment] = undefined;
        }
      })
    });
  }
  return res.write(JSON.stringify(data));
};

app[baseUrl + '/getAllUsers'] = (req, res) => {
  const {query} = url.parse(req.url, true);
  if (!query.user) return res.write(JSON.stringify({error: "Bad request"}));
  if (!getUser(query.user).admin) return res.write(JSON.stringify({error: "Permission Denied"}));
  return res.write(JSON.stringify(readUsers()));
};

app[baseUrl + '/getAssignments'] = (req, res) => {
  const {query} = url.parse(req.url, true);
  if (!query.user) return res.write(JSON.stringify({error: "Bad request"}));
  return res.write(JSON.stringify(readAssignments()));
};

/* -------------------------------------------- ADD -------------------------------------------- */
app[baseUrl + '/addUser'] = (req, res) => {
  const {query} = url.parse(req.url, true);
  if (!query.user || !query.netId || !query.admin) return res.write(JSON.stringify({error: "Bad request"}));
  if (!getUser(query.user).admin) return res.write(JSON.stringify({error: "Permission Denied"}));
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
  if (!getUser(query.user).admin) return res.write(JSON.stringify({error: "Permission Denied"}));
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
  if (!getUser(query.user).admin) return res.write(JSON.stringify({error: "Permission Denied"}));
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
};

app[baseUrl + '/addStudent'] = (req, res) => {
  const {query} = url.parse(req.url, true);
  if (!query.user || !query.student) return res.write(JSON.stringify({error: "Bad request"}));
  if (!getUser(query.user).admin) return res.write(JSON.stringify({error: "Permission Denied"}));
  const database = readDatabase();
  database.students[query.student] = readAssignments();
  writeDatabase(database);
  return res.write(JSON.stringify(database));
};

/* -------------------------------------------- UPDATE -------------------------------------------- */
app[baseUrl + '/updateData'] = (req, res) => {
  const {query} = url.parse(req.url, true);
  if (!query.user || !query.data) return res.write(JSON.stringify({error: "Bad request"}));

  // this code stops a user from updating data of students they are not assigned to
  const data = JSON.parse(query.data);
  const oldData = readDatabase();
  data.user = getUser(query.user);
  if (!data.user.admin) {
    Object.keys(oldData.students).forEach((student) => {
      Object.keys(oldData.students[student]).forEach((assignment) => {
        if (oldData.students[student][assignment].grader === query.user) {
          oldData.students[student][assignment] = data.students[student][assignment];
        }
      })
    });
    writeDatabase(oldData);
  } else {
    writeDatabase(data);
  }

  return res.write(JSON.stringify({success: true}));
};

app[baseUrl + '/updateAssignmentGrader'] = (req, res) => {
  const {query} = url.parse(req.url, true);
  if (!query.user || !query.grader || !query.assignment || !query.student) return res.write(JSON.stringify({error: "Bad request"}));
  if (!getUser(query.user).admin) return res.write(JSON.stringify({error: "Permission Denied"}));

  const { grader, assignment, student } = query;
  const database = readDatabase();
  if (!database.students[student]) {
    return res.write(JSON.stringify({error: "Student not found"}));
  }
  if (!database.students[student][assignment]) {
    return res.write(JSON.stringify({error: "Assignment not found"}));
  }
  database.students[student][assignment].grader = grader;
  writeDatabase(database);
  return res.write(JSON.stringify({success: true}));
};

/* -------------------------------------------- DELETE -------------------------------------------- */
app[baseUrl + '/deleteUser'] = (req, res) => {
  const {query} = url.parse(req.url, true);
  if (!query.user || !query.netId) return res.write(JSON.stringify({error: "Bad request"}));
  if (!getUser(query.user).admin) return res.write(JSON.stringify({error: "Permission Denied"}));
  writeUsers({
    [query.netId]: undefined
  });
  return res.write(JSON.stringify({success: true}));
};

app[baseUrl + '/deleteAssignment'] = (req, res) => {
  const {query} = url.parse(req.url, true);
  if (!query.user || !query.assignment) return res.write(JSON.stringify({error: "Bad request"}));
  if (!getUser(query.user).admin) return res.write(JSON.stringify({error: "Permission Denied"}));
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
  if (!getUser(query.user).admin) return res.write(JSON.stringify({error: "Permission Denied"}));
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
  if (!getUser(query.user).admin) return res.write(JSON.stringify({error: "Permission Denied"}));
  const database = readDatabase();
  database.students[query.student] = undefined;
  writeDatabase(database);
  return res.write(JSON.stringify({success: true}));
};

http.createServer(function (req, res) {
  try {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
    });
    const {pathname} = url.parse(req.url, true);
    req.url = decodeURI(req.url);
    app[pathname](req, res);
    res.end();
  } catch (e) {
    res.end('ERROR: ' + e);
  }
}).listen();
