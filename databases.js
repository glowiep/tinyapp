// Import bcrypt to store passwords securely in the users object
const bcrypt = require("bcryptjs");

// The urlDatabase contain multiple 'urlID' objects, which contains the long url and the userID (used to set session cookie)
const urlDatabase = {
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
    visitorID: [
      ["newvisitor1", 'Sat Nov 04 2023 01:17:07 GMT-0400 (Eastern Daylight Time)'],
      ["newvisitor2", 'Sat Nov 04 2023 01:30:00 GMT-0400 (Eastern Daylight Time)']
    ],
    totalVisits: 2,
    uniqueVisits: 2
  },
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
    visitorID: [],
    totalVisits: 0,
    uniqueVisits: 0,
  }
};

// To store and access users
const users = {
  aJ48lW: {
    id: "aJ48lW",
    email: "user1@gmail.com",
    password: bcrypt.hashSync("test123", 10),
  },
  oA10iQ: {
    id: "oA10iQ",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10),
  },
};

module.exports = { urlDatabase, users }