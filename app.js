// =========================================================== Init

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const ejs = require("ejs");
const contentful = require('contentful');
const richTextRender = require('@contentful/rich-text-html-renderer');
const nodemailer = require("nodemailer");
require('dotenv').config();
app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function () { console.log("Server Started successfully"); });

// =========================================================== 

var client = contentful.createClient({
	space: process.env.SPACE,
	accessToken: process.env.ACCESSTOKEN
});

let transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: process.env.EMAIL,
		pass: process.env.PASSWORD
	}
});

var projectDateOptions = {year: 'numeric', month: 'short'};
var cardDateOptions = {year: 'numeric', month: 'short', day:'numeric'};

// ===========================================================

app.get("/", function (req, res) {
	let posts = []
	let projects = []
	client.getEntries({
		content_type: 'project',
		limit: 3,
		order: "sys.createdAt"
	}).then(function (entries) {
		entries.items.forEach(function (entry) {
			if (entry.fields) {
				var date = new Date(entry.fields.projectCreationDate);
				var project = {
					title: entry.fields.title,
					imageUrl: entry.fields.titleImage.fields.file.url,
					id: entry.sys.id,
					creationDate: date.toLocaleDateString("en-US", projectDateOptions)
				};
				projects.push(project);
			}
		})

		client.getEntries({
			content_type: 'post',
			limit: 3,
			order: "-sys.updatedAt"
		}).then(function (entries) {
			
			entries.items.forEach(function (entry) {
				if (entry.fields) {
					var date = new Date(entry.sys.updatedAt);
					var post = {
						title: entry.fields.title,
						imageUrl: entry.fields.titleImage.fields.file.url,
						id: entry.sys.id,
						updateDate: date.toLocaleDateString("en-US", cardDateOptions)
					};
					posts.push(post);
				}
			});
			// console.log(projects);
			// console.log(posts);
			res.render("home", {
				projects: projects,
				posts: posts
			});
		});

	});
});
app.get("/about-me", function (req, res) {
	res.render("about-me")
});
app.get("/projects", function (req, res) {
	let projects = [];
	client.getEntries({ content_type: 'project' }).then(function (entries) {
		entries.items.forEach(function (entry) {
			var date = new Date(entry.sys.updatedAt);
			if (entry.fields) {
				var project = {
					title: entry.fields.title,
					imageUrl: entry.fields.titleImage.fields.file.url,
					id: entry.sys.id, 
					updateDate: date.toLocaleDateString("en-US", cardDateOptions)
				};
				projects.push(project);
			}
		});
		res.render('cards', {
			cards: projects,
			type: "PROJECTS"
		})
	});
});
app.get("/contact-me", function (req, res) {
	res.render("contact-me")
});
app.get("/blog", function (req, res) {
	let posts = []
	client.getEntries({ content_type: 'post' }).then(function (entries) {
		entries.items.forEach(function (entry) {
			if (entry.fields) {
				var date = new Date(entry.sys.updatedAt);
				var post = {
					title: entry.fields.title,
					imageUrl: entry.fields.titleImage.fields.file.url,
					id: entry.sys.id, 
					updateDate: date.toLocaleDateString("en-US", cardDateOptions)
				};
				posts.push(post);
			}
		});
		res.render('cards', {
			cards: posts,
			type: "BLOG"
		})
	});
});
app.get("/cv", function (req, res) {
	res.render("cv")
});


app.get("/cards/:cardId", function (req, res) {
	var outerEntry;
	client.getEntry(req.params.cardId).then(function (entry) {
		outerEntry = entry
		const rawRichTextField = entry.fields.content;
		return richTextRender.documentToHtmlString(rawRichTextField);
	}).then(renderedHtml => {
		const contentType = outerEntry.sys.contentType.sys.id
		if(contentType === "project"){
			console.log(renderedHtml);
			var date = new Date(outerEntry.fields.projectCreationDate);
			res.render("card", {
				title: outerEntry.fields.title,
				imageUrl: outerEntry.fields.titleImage.fields.file.url,
				content: renderedHtml,
				creationDate: date.toLocaleDateString("en-US", cardDateOptions), 
				pageUrl: "https://www.sehebi.com/cards/" + req.params.cardId, 
				pageIdentifier: req.params.cardId
			}); 
		}else{
			res.render("card", {
				title: outerEntry.fields.title,
				imageUrl: outerEntry.fields.titleImage.fields.file.url,
				content: renderedHtml, 
				creationDate: "", 
				pageUrl: "https://www.sehebi.com/cards/" + req.params.cardId, 
				pageIdentifier: req.params.cardId
			}); 
		}

	}).catch(error => console.log(error));
});


// =========================================================== Posts 

app.post("/contact-me", function (req, res) {
	let mailOptions = {
		from: process.env.EMAIL,
		to: "muhammednurpro@gmail.com",
		subject: req.body.subject,
		text: "From: " + req.body.name + "\nEmail: " + req.body.email + "\n\n" + req.body.message
	};

	transporter.sendMail(mailOptions, function (err, data) {
		if (err) {
			console.log(err);
		} else {
			console.log("Email was sent successfully");
			res.redirect("contact-me");
		}
	});

});