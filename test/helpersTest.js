const { assert } = require('chai');

const { getUserByEmail, urlsForUser, checkUrlId, getUniqueVisitorCount } = require('../helpers.js');

const testUsers = {
  "aJ48lW": {
    id: "aJ48lW",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "z0s0as": {
    id: "z0s0as",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const testUrlDatabase = {
  b6UTxQ: {
    longURL: "https://www.youtube.com",
    userID: "aJ48lW",
    visitorID: [
      ["newvisitor1", 'Sat Nov 04 2023 01:17:07 GMT-0400 (Eastern Daylight Time)'],
      ["newvisitor2", 'Sat Nov 04 2023 01:30:00 GMT-0400 (Eastern Daylight Time)']
    ],
    totalVisits: 2,
    uniqueVisits: 2
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
    visitorID: [
      ["newvisit1", 'Sat Nov 04 2023 01:17:00 GMT-0400 (Eastern Daylight Time)'],
      ["newvisit2", 'Sat Nov 04 2023 02:30:00 GMT-0400 (Eastern Daylight Time)'],
      ["newvisit2", 'Sat Nov 04 2023 12:30:00 GMT-0400 (Eastern Daylight Time)']
    ],
    totalVisits: 3,
    uniqueVisits: 2
  },
  p2ap12: {
    longURL: "https://www.cbc.ca",
    userID: "z0s0as",
    visitorID: [
      ["visitor1", 'Sat Nov 04 2023 04:20:00 GMT-0400 (Eastern Daylight Time)'],
      ["visitor2", 'Sat Nov 04 2023 04:30:00 GMT-0400 (Eastern Daylight Time)']
    ],
    totalVisits: 2,
    uniqueVisits: 2
  }
};


describe('getUserByEmail', function() {
  it('should return a user object for a valid email', function() {
    const userObject = getUserByEmail("user@example.com", testUsers);
    const expectedUserObject = {
      id: "aJ48lW",
      email: "user@example.com",
      password: "purple-monkey-dinosaur"
    };
    assert.deepStrictEqual(userObject, expectedUserObject);
  });
  
  it('should return an accessible user ID for a valid email', function() {
    const userObject = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "aJ48lW";
    assert.strictEqual(userObject.id, expectedUserID);
  });

  it('should return null when provided an email that does not exist in the database', function() {
    const user = getUserByEmail("user123@gmail.com", testUsers);
    assert.isNull(user);
  });
});


describe('urlsForUser', function() {
  it('should return a copy of the database based on the user specified', function() {
    const userDatabaseCopy = urlsForUser("aJ48lW", testUrlDatabase);
    const expectedOutput = {
      b6UTxQ: {
        longURL: "https://www.youtube.com",
        userID: "aJ48lW",
        visitorID: [
          ["newvisitor1", 'Sat Nov 04 2023 01:17:07 GMT-0400 (Eastern Daylight Time)'],
          ["newvisitor2", 'Sat Nov 04 2023 01:30:00 GMT-0400 (Eastern Daylight Time)']
        ],
        totalVisits: 2,
        uniqueVisits: 2
      },
      i3BoGr: {
        longURL: "https://www.google.ca",
        userID: "aJ48lW",
        visitorID: [
          ["newvisit1", 'Sat Nov 04 2023 01:17:00 GMT-0400 (Eastern Daylight Time)'],
          ["newvisit2", 'Sat Nov 04 2023 02:30:00 GMT-0400 (Eastern Daylight Time)'],
          ["newvisit2", 'Sat Nov 04 2023 12:30:00 GMT-0400 (Eastern Daylight Time)']
        ],
        totalVisits: 3,
        uniqueVisits: 2
      }
    };
    assert.deepStrictEqual(userDatabaseCopy, expectedOutput);
  });

  it('should return an empty object when provided an email that does not exist in the database', function() {
    const userDatabaseCopy = urlsForUser("user123@gmail.com", testUrlDatabase);
    const expectedOutput = {};
    assert.deepStrictEqual(userDatabaseCopy, expectedOutput);
  });
});


describe('checkUrlId', function() {
  it('should return true if the urlID belongs to the user', function() {
    const verifyUserUrlID = checkUrlId("i3BoGr", "aJ48lW", testUrlDatabase);
    assert.isTrue(verifyUserUrlID);
  });

  it('should return false if the urlID does not belong to the user', function() {
    const verifyUserUrlID = checkUrlId("p2ap12", "aJ48lW", testUrlDatabase);
    assert.isFalse(verifyUserUrlID);
  });

  it('should return false if the urlID does not exist at all', function() {
    const verifyUserUrlID = checkUrlId("test12", "aJ48lW", testUrlDatabase);
    assert.isFalse(verifyUserUrlID);
  });
});


describe('getUniqueVisitorCount', function() {
  it('should return 2 if there are two unique visitors in the log list', function() {
    const visitorList = testUrlDatabase["b6UTxQ"].visitorID;
    const visitorCount = getUniqueVisitorCount(visitorList);
    const expectedCount = 2;
    assert.strictEqual(visitorCount, expectedCount);
  });
  
  it('should return 2 if there are two unique visitors in the log list where one visitor is logged twice', function() {
    const visitorList = testUrlDatabase["i3BoGr"].visitorID;
    const visitorCount = getUniqueVisitorCount(visitorList);
    const expectedCount = 2;
    assert.strictEqual(visitorCount, expectedCount);
  });
});