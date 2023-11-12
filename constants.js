const PORT = 8080; // default port 8080

const logInLink = `<a href='http://localhost:${PORT}/login'>log in</a>`;
const registerLink = `<a href='http://localhost:${PORT}/register'>register</a>`;

// Canned messages
const logInPrompt = `Please ${logInLink} to view your TinyURLs page.\n`;
const logInRegisterPrompt = `Please ${logInLink} or ${registerLink} to view your TinyURL page.\n`;

const urlDoesNotExistMsg = `The TinyURL does not exist.\n`;
const doesNotOwnURLMsg = `Unauthorized request. This user does not own the TinyURL.\n`;
const unauthorizedDeleteMsg = `Unauthorized request. Please ${logInLink} to delete your TinyURL.\n`;
const unauthorizedUpdateMsg = `Unauthorized request. Please ${logInLink} to view, add or modify your TinyURL.\n`;

const emptyFieldsLoginMsg = `The Email and Password fields must not be empty. Try to ${logInLink} again.\n`;
const emptyFieldsRegisterMsg = `The Email and Password field must not be empty. Try to ${registerLink} again.\n`;
const invalidEmailMsg = `The user with this email address is not found. Please ${registerLink} to log in.\n`;
const invalidPasswordMsg = `The password is incorrect. Please ${logInLink} and try again.\n`;
const emailExistsMsg = `An account with this email already exists.\n`;


module.exports = {
  PORT,
  logInPrompt,
  logInRegisterPrompt,
  
  urlDoesNotExistMsg,
  doesNotOwnURLMsg,
  unauthorizedDeleteMsg,
  unauthorizedUpdateMsg,

  emptyFieldsLoginMsg,
  emptyFieldsRegisterMsg,
  invalidEmailMsg,
  invalidPasswordMsg,
  emailExistsMsg };