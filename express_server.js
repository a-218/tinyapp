const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

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

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  
  console.log(req.body);    // Log the POST request body to the consol
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});


app.get("/urls/:id", (req, res) => {
  let a = req.params.id;   /////
  console.log(a);
  res.render("urls_news", templateVars);/////
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase};
  //res.json(urlDatabase);
  res.render("urls_index", templateVars);
  
});

//new route
app.get("/urls/:shortURL", (req, res) => {
  let a = req.params.shortURL;
  const templateVars ={ shortURL: req.params.shortURL, longURL: urlDatabase[a]};
  //console.log(req.params)
  //console.log(templateVars);
  res.render("urls_show", templateVars);
})

app.get("/hello", (req, res) => {
  res.send(`<html><body>Hello <b>World</b></body></html>\n`);

});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});