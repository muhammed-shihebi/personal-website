// =========================================================== Init

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const ejs = require("ejs");
const contentful = require('contentful');
const richTextRender = require('@contentful/rich-text-html-renderer');
app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.listen(3000, function () { console.log("Server Started successfully"); });

// =========================================================== 

var client = contentful.createClient({
	space: 'su42bjsoz92f',
	accessToken: 'v5DXJtoxn3T2jeR4ez8br7PQGFDTNKHlIBbabMFOfY0'
});

let blog = [];

// ===========================================================

app.get("/", function (req, res) {
	res.render("home")
});
app.get("/about-me", function (req, res) {
	res.render("about-me")
});
app.get("/projects", function (req, res) {
	res.render("cards")
});
app.get("/contact-me", function (req, res) {
	res.render("contact-me")
});
app.get("/blog", function (req, res) {

	blog = []
	client.getEntries({ content_type: 'post' }).then(function (entries) {
		entries.items.forEach(function (entry) {
			if (entry.fields) {
				const rawRichTextField = entry.fields.content;
				const htmlContent = richTextRender.documentToHtmlString(rawRichTextField);
				var post = {
					title: entry.fields.title,
					imageUrl: entry.fields.postImage.fields.file.url,
					content: htmlContent
				};
				blog.push(post);
			}
		});
		console.log(blog);
	});
	res.render("cards")
});
app.get("/cv", function (req, res) {
	res.render("cv")
});
app.get("/post", function (req, res) {
	res.render("post")
}); 