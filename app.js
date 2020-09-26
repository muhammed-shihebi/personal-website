// =========================================================== Init

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const ejs = require ("ejs"); 
app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.listen(3000, function() {console.log("Server Started successfully");});

// =========================================================== 

app.get("/", function(req, res){
	res.render("home")
});
app.get("/about-me", function(req, res){
	res.render("about-me")
});
app.get("/projects", function(req, res){
	res.render("cards")
});
app.get("/contact-me", function(req, res){
	res.render("contact-me")
});
app.get("/blog", function(req, res){
	res.render("cards")
});
app.get("/cv", function(req, res){
	res.render("cv")
}); 
app.get("/post", function(req, res){
	res.render("post")
}); 