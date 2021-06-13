const express = require("express");
const app = express();
const PORT = 8080;
const { getUserByEmail } = require('./helpers');
const cookieSession = require('cookie-session');
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'whateverWeWant',
  keys: ['aouishefohbasodfhn', 'key2']
}));

const bcrypt = require('bcryptjs');


/// Generate random strings for User ID
function generateRandomString() {
  const a = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  let result = '';

  for (let x = 0; x < 6; x++) {

    let b = a.charAt(Math.floor(Math.random() * a.length));
    result += b;
    
  };

  return result;

}

const urlDatabase = {
  'b2xVn2': { longURL: "http://www.lighthouselabs.ca", userID: "aJ41W8" },
  '9sm5xK': { longURL: "http://www.google.com", userID: "aJ41W8" }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    Password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    Password: "dishwasher-funk"
  }
};

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello!");
});


/// function to determine if an emial exists in the data base
function emailHelper(usersObject, email) {

  for (const key in usersObject) {

    if (usersObject[key]['email'] === email) {
      return false;
    }
  }
  return true;
};


//creat a new url if the user is logged in, or output an erro.

app.post("/urls", (req, res) => {

  if (!users[req.session.user_id]){
    const errorMessage = 'you have to be logged in';
    res.status(401).send(errorMessage);
    return;
  };

  let long = req.body.longURL

  let short = generateRandomString();

  urlDatabase[short] = { longURL: long, userID: req.session.user_id };

  res.redirect(`/urls/${short}`);
});

// delete urls in the index page
app.post('/urls/:id/delete', (req, res) => {

  const idToBeDeleted = req.params.id;

  const user = req.session.user_id;

  for (const key in urlDatabase) {

    if (user === urlDatabase[key]['userID']) {

      delete urlDatabase[idToBeDeleted];

      res.redirect('/urls');

      return;
    }
  }
  res.redirect('/urls');
});


//editing Long urls infomation 

app.post('/urls/:id', (req, res) => {


  let shortURL = req.params.id;

  if (urlDatabase[shortURL] && req.body.newURL) {

    urlDatabase[shortURL]['longURL'] = req.body.newURL;

    res.redirect('/urls');

  } else {
    
    const templateVars = {
      shortURL: shortURL,
      longURL: urlDatabase[shortURL]['longURL'],
      user: req.session.user_id
    };
    res.redirect('/urls');
  }

});


//logout for the user and redirect back to urls page
app.post('/logout', (req, res) => {

  req.session = null;

  let keys = Object.keys(users);

  res.redirect('/urls');
});


//login page for user, outputs an error if user not found or incorerct information 
app.post('/login', (req, res) => {

  const email = req.body.email;

  const Password = req.body.Password;

  let emailVariable;

  let foundUser = getUserByEmail(email, users);

  if (!foundUser) {
    return res.status(401).send('could not find user');
  }

  bcrypt.compare(Password, foundUser.Password, (err, result) => {

    if (!result) {

      return res.status(401).send('password is not correct');
    }

    req.session.user_id = foundUser.id;

    res.redirect('/urls');

    return
  });

});


//register page for the user and redirect back to urls page
app.post('/register', (req, res) => {

  let id = generateRandomString();

  let email = req.body.email;

  if (!emailHelper(users, email)) {

    return res.status(400).send('this email is registered')
  }

  let Password = req.body.Password;


  if (!Password || !email) {

    return res.status(400).send('you must enter an email AND a password');
  }


  bcrypt.genSalt(10, (err, salt) => {

    bcrypt.hash(Password, salt, (err, hash) => {

      const newUser = {
        id: id,
        email: req.body.email,
        Password: hash
      };

      users[id] = newUser;
  
      req.session.user_id = id;
   
      res.redirect('/urls');
    
    });
  });

});

// creating new urls if user is login or it redirects user to login page
app.get("/urls/new", (req, res) => {
 
  let currentSession = req.session.user_id;

  const id = req.session.user_id;

  const user = users[id];

  if (currentSession) {

    const templateVars = {

      urls: urlDatabase,
      user: user,
    };

    res.render("urls_new", templateVars);

    return;

  } else {

    res.redirect('/login');
    return;
  }

});

const urlsForUser = (id) => {
  let filter = {};

  for (const key in urlDatabase) {

    if (urlDatabase[key].userID === id) {
      
      filter[key] = { 
        longURL: urlDatabase[key].longURL, 
        userID: urlDatabase[key].userID 
      }
    }
  };
  return filter;
}


//display the my urls index page
app.get("/urls", (req, res) => { 


  const id = req.session.user_id;

  const user = users[id];

  let filter = urlsForUser(id);

  const templateVars = {

    urls: filter,
    user: user
  }


  res.render("urls_index", templateVars);

});


//editing the urls if it belongs to the user

app.get("/urls/:shortURL", (req, res) => {

  let currentSession  = req.session.user_id;

  let shortURL = req.params.shortURL;

  for (key in urlDatabase) {

    if (shortURL === key) {

      if (urlDatabase[shortURL]['userID'] !== currentSession){

        return res.status(404).send('not your account');

      }
    }
  }

  let urlEntry = urlDatabase[shortURL];

  if (!urlEntry) {

    return res.status(404).send('URLS not found');

  }

  if (currentSession  === undefined) {

    return res.status(404).send('you are not login');

  }

  const longURL = urlEntry['longURL'];

  const id = req.session.user_id;

  const user = users[id];

  const templateVars = {
    shortURL: shortURL,
    longURL: longURL,
    user: user
  };

  res.render("urls_show", templateVars);

})


//show the register page
app.get("/register", (req, res) => {

  const id = req.session.user_id;

  const user = users[id];
  
  const templateVars = {
    user: user
  };

  res.render('register', templateVars);
})


//shows the login page
app.get("/login", (req, res) => {

  const id = req.session.user_id;

  const user = users[id];

  const templateVars = {
    user: user
  };

  res.render('login', templateVars);
});

//redirect user to the correct long url website
app.get('/u/:id', (req, res) => {

  let id = req.params.id;

  if (id.includes('.')) {

    id = 'http://' + id;

    res.redirect(id);

    return;
  } else {

    let longURL = urlDatabase[id]['longURL'];

    res.redirect(longURL);

    return;
  }
})

app.get("/", (req, res) => {
  //res.send(`<html><body>Hello <b>World</b></body></html>\n`);
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});