/**
 * Random string generator
 * @returns a string of 6 random alphanumeric characters
 */
const generateRandomString = function() {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let count = 0; count < 6; count++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};


/**
 * Find the user object based on email
 *
 * @param {string} email - user email
 * @param {object} userDatabase - user database object
 * @returns {object} user object based on email, return null if not found
 */
const getUserByEmail = function(email, userDatabase) {
  for (let user in userDatabase) {
    if (userDatabase[user].email === email) {
      return userDatabase[user];
    }
  }
  return null;
};


/**
 * Make a copy of the database with only urlID objects for the userID specified
 *
 * @param {string} userID - user ID
 * @param {object} urlDatabase - user database object
 * @returns {object} copy of the urlDatabase containing only the url ID objects of the userID specified
 */
const urlsForUser = function(userID, urlDatabase) {
  let urls = {};
  for (let urlID in urlDatabase) {
    if (userID === urlDatabase[urlID].userID) {
      urls[urlID] = urlDatabase[urlID];
    }
  }
  return urls;
};


/**
 * Check if the user owns the TinyURL
 *
 * @param {string} urlID - TinyURL identifier
 * @param {string} userID - user ID of the user session
 * @param {object} urlDatabase - user database object
 * @returns {boolean} Returns true if the urlID exists for the userID specified
 */
const checkUrlId = function(urlID, userID, urlDatabase) {
  const userDatabase = urlsForUser(userID, urlDatabase);  // the copy of database for the specified userID
  if (Object.keys(userDatabase).includes(urlID)) {
    return true;
  }
  return false;
};

/**
 * Get the number of unique visitors, based on the visitor IDs in a visitor list.
 *
 * @param {Object[]} visitorList - Array of arrays where the inner array contains 2 items, the visitor ID and timestamp
 * @returns {number} Returns the number of unique visitors
 */
const getUniqueVisitorCount = function(visitorList) {
  let uniqueList = [];
  let count = 0;
  if (!Array.isArray(visitorList)) {
    return;
  }
  for (let visit of visitorList) {
    const visitorID = visit[0];
    if (!uniqueList.includes(visitorID)) {  // The visitor ID is on index 0
      uniqueList.push(visitorID);
    }
  }
  count = uniqueList.length;
  return count;
};

module.exports = { generateRandomString, getUserByEmail, urlsForUser, checkUrlId, getUniqueVisitorCount };