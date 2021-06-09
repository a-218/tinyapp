const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
var cookieParser = require('cookie-parser')

app.set("view engine", "ejs");
app.use(express.urlencoded({extended : true}));
app.use(cookieParser());

function generateRandomString() {
  const a = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = '';
  for (let x = 0 ; x < 6; x++) {
    let b = a.charAt(Math.floor(Math.random() * a.length));
    result += b;
  }
  return result;

}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};




const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.get("/", (req, res) => {
  res.send("Hello!");

});
///this is create new URL////
app.get("/urls/new", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    Username: req.cookies.Username};
  console.log('after i press the create new url',templateVars)
  res.render("urls_new",templateVars);
  
});

// app.get("/urls/:id", (req, res) => {
//   let a = req.params.id;   /////
//   console.log(a);
//   res.render("urls_new");///// 
// });




////post URLS


app.post("/urls", (req, res) => {
  let long = req.body.longURL
  let short = generateRandomString();
  urlDatabase[short] = long;
  console.log(req.body); 
  console.log(short, long);
  console.log(urlDatabase);
     // Log the POST request body to the consol
  //res.send("Ok");         // Respond with 'Ok' (we will replace this)

  res.redirect (`/urls/${short}`);
});

// Delete  POST /articles/:id/delete
app.post('/urls/:id/delete', (req, res) => {
  const idToBeDeleted = req.params.id;
  console.log('Id to be deleted', idToBeDeleted);
  delete urlDatabase[idToBeDeleted];
  console.log(urlDatabase);

  res.redirect('/urls');
});

/// POST EDIt URLS
app.post('/urls/:id', (req, res) => {
  let a = req.params.id;
  console.log('red body',   req.body.newURL);
  console.log( 'EDIT checking return values omething;, ', a)

  if(urlDatabase[a] && req.body.newURL) { 
    urlDatabase[a] = req.body.newURL;
    res.redirect('/urls');
  } else { 
   //about error  templateVars ={ shortURL: a, longURL: urlDatabase[a]};
    const templateVars ={ shortURL: a, longURL: 'sdfds'};
    res.render("urls_show", templateVars); 
  }
      // render edit page with an error message 
  //const longURL = urlDatabase[a];
  //const shortURL = a;
  
  //const templateVars ={ shortURL: shortURL, longURL: urlDatabase[a]};  
});

app.post('/logout', (req,res) => {

  res.clearCookie('Username');
  res.redirect('/urls');
});

///POST LOGIn  
app.post('/login', (req,res) => {
  //console.log(req.body.Username);
  const Username = req.body.Username

  console.log('username is,', Username);
  res.cookie('Username', Username) ///accessible across all using req.cookies.Username
  
  // const templateVars = {
  //   username: Username
  //   // ... any other vars
  // };

  // console.log(templateVars)
 
  //const name = res.cookies('Username');

  //console.log(name);
  //res.render('partials/_header', Username)
  //res.render('partials/_header')
  res.redirect('/urls')
});



 ////////GET???t

 app.get("/urls", (req, res) => {
   const templateVars = { 
   urls: urlDatabase,
   Username: req.cookies.Username};
   //res.json(urlDatabase);
   console.log('asdsadsad',req.cookies.Username)
   console.log('template vagr', templateVars )
   res.render("urls_index", templateVars); //render earch under views for the specific " file name",
  
 });


// app.get("/urls", (req, res) => {
//   const templateVars = { urls: urlDatabase,
//   username: res.cookies(username)};

//   console.log( 'asdsadsadsad',templateVars)
//   //res.json(urlDatabase);
//   res.render("urls_index", templateVars); //render earch under views for the specific " file name",
  
// });


//new route
app.get("/urls/:shortURL", (req, res) => {
  let a = req.params.shortURL;
  console.log('a is something;, ', a)
  const longURL = urlDatabase[a];
  console.log('longUL', longURL);
  const templateVars ={ 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[a],
    Username: req.cookies.Username
  };
  //console.log(req.params)
  //console.log(templateVars);
  res.render("urls_show", templateVars);  //jump to the tiny URL page

  //res.redirect(longURL);   //goign to the acutal website
})

app.get("/hello", (req, res) => {
  res.send(`<html><body>Hello <b>World</b></body></html>\n`);

});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});