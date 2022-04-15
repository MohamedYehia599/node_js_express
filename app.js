


let express = require('express');
let app = express();
let body_parser = require('body-parser');
let fs = require('fs');



let urlEncodedparser=body_parser.urlencoded({extended:false});
let json_parser = body_parser.json();




app.set('view engine','ejs');
app.use(urlEncodedparser);
app.use(json_parser);
app.use('/',(req,res,next)=>{
  console.log(req.url);
  if(req.url ==='/' || req.url ==='/login' || req.url ==='/signup' ){

  next();

  }else{
    res.status(404);
    res.send("404 page not found");}

})


app.get('/',(req,res)=>{

res.render('homepage');


})



app.get('/login',(req,res)=>{
  res.render('loginpage',{err:""});

})

app.get('/signup',(req,res)=>{
  res.render('signuppage',{err:""});
})


app.post('/login',(req,res)=>{
login_validate(res,req.body);

})

app.post('/signup',(req,res)=>{

  let bool =  check_db_file(req.body);
  if(bool>0){

    res.status(200);
    res.render('userprofile', {name : req.body.name , email : req.body.email});
  }
  else{
    print_error(res,400,"email you entered already exists","signuppage");
  }
})




function check_db_file(user) {
    let data = fs.readFileSync('./database.json', 'utf8');
    if (data.length == 0) {
      dataObj = {
        "users": []
      }
    } else {
      dataObj = JSON.parse(data);
    }
    if (user.email) {

      console.log(user.email);
      let foundUser = check_email(user.email)
      if (foundUser) {
        // console.log('email you entered already exists');

        return -1;
      } else {
        enter_new_user(user, dataObj);

        return 1;

      }
    }
  }


function check_email(email) {
  let data = fs.readFileSync('./database.json', 'utf8');
  if (data) {
    let dataObj = JSON.parse(data);
    for (let i = 0; i < dataObj.users.length; i++) {

      if (dataObj.users[i].email === email) {
        return dataObj.users[i];
      }
    }
  } else {
    console.log('no data found in file');
  }
}

function check_password(password) {
  let data = fs.readFileSync('./database.json', 'utf8');
  if (data) {
    let dataObj = JSON.parse(data);
    for (let i = 0; i < dataObj.users.length; i++) {
      if (dataObj.users[i].password === password) {
        return dataObj.users[i];
      }
    }
  }
  console.log('no data found in file');
}
function enter_new_user(user, dataObj) {
  let userObj = {
    "name": user.name,
    "email": user.email,
    "password": user.password

  }
  dataObj.users.push(userObj);

  fs.writeFile('./database.json', JSON.stringify(dataObj), (err) => {
    if (err) throw err;
  });
  console.log(dataObj.users);
}


  function login_validate(res,user) {
    console.log(user);

    let email = user.email;
    let password = user.password;
    let foundUser = check_email(email);
    if (foundUser) {

      if (password === foundUser.password) {
          res.status(200);
        res.render('userprofile',{name : foundUser.name , email : email});
        console.log("you logged in successfully");

      } else {
        console.log("wrong password")
        print_error(res,400,"you entered wrong password","loginpage")
      }
    } else {
      let foundUserPass = check_password(password);
      if (foundUserPass) {
        console.log("wrong email");
        print_error(res,400,"you entered wrong email","loginpage");
      } else {
        console.log('email doesnt exist');
        print_error(res,400,"email you entered doesnt exist. signup!!","loginpage")
      }
    }

  }



  function print_error(res,status,error,page) {
      res.status(status);
      res.render(page,{err:error});
       res.end();
    }



app.listen(3000);
