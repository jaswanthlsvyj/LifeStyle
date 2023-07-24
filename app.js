var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var multer = require('multer');
var session = require('express-session');
var flash = require('connect-flash');

var upload = multer();
var app = express();

// ===== used to select the table in database ======
var usernameTable = '';
var last_row_id = -1;

// ====== Mysql connection part ======
var mysql = require('mysql');
const { create } = require('domain');
var con = mysql.createConnection({
    host: "localhost",
    user: "root" ,
    password: "" ,
    database: 'ecommerce'
});
con.connect(function(err){
    if (err) throw err ;
    console.log('Database Connected to ecommerce!');
});

// ====== view engine setup ======
app.set('view engine','ejs');
app.set('views',path.join(__dirname, 'views'));

// ====== app configuration ======
app.use(express.static(path.join(__dirname,'public')));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(upload.array()); 
// Middleware setup
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge : 60000}
  }));
  app.use(flash());


// ====== To use pages & to show the webpages ======
// ============================================ index page ============================================
app.get('/', function(req,res){
    console.log("============================================In index Page============================================");
    req.flash('success', 'Signup successful');
    // res.sendFile(__dirname + '/views/index.html');
    res.render("index.ejs", {name: usernameTable});
});

// ====== to get signup newsletters ======
app.post('/newsletter', function(req,res){
    var sql1 = "select * from newsletters where email='"+req.body.email+"'";
    var sql = "insert into newsletters values('"+ req.body.email+"')";
    con.query(sql1 , function(err,result){
        if (err) throw err;
        if( result.length == 0 ){
            con.query(sql, function(err,result){
                if (err) throw err;
                console.log(req.body.email+" have been inserted to newsletters");
                req.flash('success', 'Signup successful');
                res.redirect('/newsletteralert');
            });
        }
        else{
            console.log(req.body.email+" ,Already exists!");
            req.flash('Signup', 'Signup Already');
        }
    });
    res.end();
});


// ============================================ shop page ============================================
app.get('/shop', function(req,res){
    console.log("============================================In shop Page============================================");
    res.render("shop.ejs");
});

// ============================================ sproduct page ============================================
app.get('/sproduct', function(req,res){
    console.log("============================================In sproduct Page============================================");
    res.render("sproduct.ejs");
});

app.post('/addtocart', function(req,res){
    var imageURL = "img/products/f1.jpg";
    var productprice = "1200";
    var product = "Cartoon Astronaut T-Shirts";
    console.log(imageURL,productprice,product);
    var last_id = "SELECT MAX(id) AS last_id FROM "+ usernameTable+"" ;
    con.query(last_id, function(err,last){
        if(err) throw err ;
        last_row_id = last[0].last_id;
        var sql = 'insert into '+usernameTable+' values("'+(last_row_id+1)+'","'+imageURL+'","'
        +product+'","'+req.body.size+'",'+req.body.qty+','+productprice+')';
        con.query(sql,function(err){
            if(err) throw err ;
            console.log('Items inserted into table '+usernameTable);
        })
    });

    res.redirect('/sproduct');
});

// ============================================ blog page ============================================
app.get('/blog', function(req,res){
    console.log("============================================In blog Page============================================");
    res.render("blog.ejs");
});
 
// ============================================ about page ============================================
app.get('/about', function(req,res){
    console.log("============================================In about Page============================================");
    res.render("about.ejs");
});
 
// ============================================ contact page ============================================
app.get('/contact', function(req,res){
    console.log("============================================In contact Page============================================");
    res.render("contact.ejs");
});
 
// ============================================ cart page ============================================
app.get('/cart', function(req,res){
    console.log("============================================In Cart Page============================================");
    var sql = "select *from "+usernameTable+";" ;
    var subtotalsql = "SELECT SUM(qty * price) AS subtotal_cost FROM "+usernameTable +";";
    con.query(sql, function(err, result){
        if(err) throw err;
        con.query(subtotalsql, function(err, subtotal){
            if(err) throw err;
            console.log(subtotal);
            res.render('cart.ejs', {data : result, totalcost: subtotal[0].subtotal_cost});
        });
        
    });
});

app.post('/delete', function(req,res){
    var sql = "delete from "+usernameTable+" where id = '"+req.body.id+"'";
    con.query(sql, function(err,result){
        if(err) throw err; 
        console.log(req.body.id+' row deleted')
        res.redirect('/cart');
    })
});


 
// ============================================ login page ============================================
app.get('/login', function(req,res){
    console.log("============================================In login Page============================================");
    res.render("login.ejs");
});

app.post('/loginsave', function(req, res){
    var sql = "select * from userdata where username='"+req.body.username+"' and password='"+req.body.password+"'";
      con.query(sql, function (err, result) {
        if (err) throw err;
        console.log(req.body+" data is entered!");
        if(result.length>0){
            res.render('index.ejs', {name: req.body.username});
        }
        else{
            res.render('error.ejs');
        }
    });
    
    usernameTable = req.body.username;
});
 

// ============================================ signup page ============================================
app.get('/signup', function(req,res){
    console.log("============================================In signup Page============================================");
    res.render("signup.ejs");
});

app.post('/signupsave', function(req, res){
    var sql = "insert into userdata values('"+req.body.name+"','"
    +req.body.username+"','"+req.body.email+"','"+req.body.password+"','"+req.body.phone+"')";
   con.query(sql, function (err, result) {
     if (err) throw err;
     console.log(req.body+" record is inserted!");
     res.render('index.ejs', {name: req.body.username});
   });

   var createTable = "create table "+req.body.username+
   "(img varchar(255), product varchar(255),size varchar(255), qty int(255), price int(255) )";
   con.query(createTable, function(err){
    if(err) throw err;
    console.log('Table '+req.body.username+' created!');
   });

   usernameTable = req.body.username;
 });

app.listen(3000);