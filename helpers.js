
const getUserByEmail = function (email, userDatabase) {
  let foundUser;
  for (const userId in userDatabase) {
    const user = userDatabase[userId];
    if (user.email === email) {
      foundUser = user;
    }
  }
  return foundUser;
};

module.exports = { getUserByEmail };