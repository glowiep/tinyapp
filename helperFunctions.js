// Returns a string of 6 random alphanumeric characters
function generateRandomString() {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let count = 0; count < 6; count++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}


module.exports = { generateRandomString }