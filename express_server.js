const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
var cookieParser = require('cookie-parser')

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

function generateRandomString() {
  const a = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = '';
  for (let x = 0; x < 6; x++) {
    let b = a.charAt(Math.floor(Math.random() * a.length));
    result += b;
  }
  return result;

}

//  const urlDatabase = {
//    "b2xVn2": "http://www.lighthouselabs.ca",
//    "9sm5xK": "http://www.google.com"
//  };


const urlDatabase = {
  'b2xVn2': { longURL: "http://www.lighthouselabs.ca", userID: "aJ48lW" },
  '9sm5xK': { longURL: "http://www.google.com", userID: "aJ48lW" }
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
}

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.get("/", (req, res) => {
  res.send("Hello!");

});

function emailHelper(usersObject, email) {

  for (const key in usersObject) {

    if (usersObject[key]['email'] === email) {

      return false;
    }
  }
  return true;

}


////////////////////////////////////////////////////////POST URLS 
app.post("/urls", (req, res) => {

  console.log('from create New URLs//after submit');

  let long = req.body.longURL
  let short = generateRandomString();
  urlDatabase[short] = {longURL:long, userID: req.cookies.user_id};

  res.redirect(`/urls/${short}`);
});

////////////////////////////////////////////Delete  POST /articles/:id/delete
app.post('/urls/:id/delete', (req, res) => {
  const idToBeDeleted = req.params.id;

  delete urlDatabase[idToBeDeleted];


  res.redirect('/urls');
});

///////////////////////////////////////////////////////POST EDIT URLS
app.post('/urls/:id', (req, res) => {
  let shortURL = req.params.id;   //short URL

  ///EDIT 
  console.log('WHen submit button under edit URLS page');

  if (urlDatabase[shortURL] && req.body.newURL) {
    urlDatabase[shortURL]['longURL'] = req.body.newURL;
    console.log(urlDatabase);
    res.redirect('/urls');

  } else {

    console.log('if blank NEW URL is entered redirected the same page ?');


    const templateVars = {
      shortURL: shortURL,
      longURL: urlDatabase[shortURL]['longURL'],
      user: req.cookies.user_id
    };
    console.log(templateVars);
    res.redirect('/urls'); //redirect to index page
    //res.render("urls_show", templateVars); ///stay at teh same page

  }

});
//////////////////////////////////////////////////////POST LOGout
app.post('/logout', (req, res) => {
  console.log('before press logout', users);

  res.clearCookie('user_id');
  res.redirect('/urls');

});

//////////////////////////////////////////////////////POST LOGIN

app.post('/login', (req, res) => {

  const email = req.body.email
  const Password = req.body.Password

  let emailVariable;

  for (const key in users) {  //checking if matched password and emails.

    if (users[key]['email'] === email) {
      emailVariable = key;

      if (users[key]['Password'] == Password) {
        res.cookie('user_id', emailVariable);
        res.redirect('/urls');
        return;
      } else {
        return res.status(403).send(' email Match but not password')
      }

    }
  }
  return res.status(403).send('user email cannot be found')

});



//////////////////////////////////////////////////////////POST REGISTER 
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


  users[id] = { id, email, Password }

  res.cookie('user_id', id);

  res.redirect('/urls');
});

//////////////////////////////////////////////////GET///////



//////////////////////////////////////////////////create new URL////

app.get("/urls/new", (req, res) => {

  let checkOnline = req.cookies.user_id;

  console.log('checking if user is signed in is cookies ID defined', checkOnline);

  const id = req.cookies.user_id;
  // console.log(id);
   const user = users[id];
   console.log(user);

  if (checkOnline) {

    const templateVars = {
      urls: urlDatabase,
      user: user,
    };

    console.log('after i press the create new url', templateVars);

    res.render("urls_new", templateVars);
    return;

  } else {
    res.redirect('/login');
    return;
  }


});
///////////////////////////////////////////////being redirected URLS
app.get("/urls", (req, res) => {

  console.log('being redirected from  URLS');

  console.log('shortURL', req.body.shortURL)

  let shortURL = req.params.shortURL;

  console.log('WHEN EDIT being redirected IS PRESSED, ', shortURL );




  const id = req.cookies.user_id;

  const user = users[id];
  console.log(user);

  console.log('url data base here is,', urlDatabase);


  const templateVars = {
    urls: urlDatabase,
    user: user
  }
  console.log(templateVars)

  res.render("urls_index", templateVars); //render earch under views for the specific " file name",

});



/////////////////////////////////////////////////////////////////new route
app.get("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;

  console.log('WHEN EDIT IS PRESSED, ', shortURL );


  const longURL = urlDatabase[shortURL ]['longURL'];


  
  const id = req.cookies.user_id;

  const user = users[id];

  const templateVars = {
    shortURL: shortURL,
    longURL: longURL,
    user: user
  };


  res.render("urls_show", templateVars);
  //res.redirect(longURL);  //goign to the acutal website
})


/////////////////////////////////////////////////////////////////Register 
app.get("/register", (req, res) => {
  const id = req.cookies.user_id;
  const user = users[id];


  const templateVars = {
    user: user
  }

  console.log(templateVars);
  res.render('register', templateVars);
  //res.redirect(longURL);  //goign to the acutal website
})

app.get("/login", (req, res) => {
  const id = req.cookies.user_id;
  const user = users[id];


  const templateVars = {
    user: user
  }

  res.render('login', templateVars);
});



app.get("/hello", (req, res) => {
  res.send(`<html><body>Hello <b>World</b></body></html>\n`);

});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});