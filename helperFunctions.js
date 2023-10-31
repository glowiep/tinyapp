// Returns a string of 6 random alphanumeric characters
const generateRandomString = function() {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let count = 0; count < 6; count++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// Return user object based on email, retun null if not found
const getUserByEmail = function(email, userDatabase) {
  for (let user in userDatabase) {
    if (userDatabase[user].email === email) {
      return userDatabase[user];
    }
  }
  return null;
};

// Makes a copy of the database, returning only urlID objects with the userID specified
const urlsForUser = function(id, urlDatabase) {
  let urls = {};
  for (let urlID in urlDatabase) {
    if (id === urlDatabase[urlID].userID) {
      urls[urlID] = urlDatabase[urlID];
    }
  }
  return urls;
};

module.exports = { generateRandomString, getUserByEmail, urlsForUser };