const { assert } = require('chai');

const { getUserByEmail, urlsForUser, checkUrlId, checkUrlIdExists } = require('../helpers.js');

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
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
  p2ap12: {
    longURL: "https://www.cbc.ca",
    userID: "z0s0as",
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
      },
      i3BoGr: {
        longURL: "https://www.google.ca",
        userID: "aJ48lW",
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


describe('checkUrlIdExists', function() {
  it('should return true if the URL ID exists in the entire database', function() {
    const urlCheck = checkUrlIdExists("p2ap12", testUrlDatabase);
    assert.isTrue(urlCheck);
  });

  it('should return false if the URL ID exists in the entire database', function() {
    const urlCheck = checkUrlIdExists("test12", testUrlDatabase);
    assert.isFalse(urlCheck);
  });
});