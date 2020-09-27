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
				var project = {
					title: entry.fields.title,
					imageUrl: entry.fields.titleImage.fields.file.url,
					id: entry.sys.id
				};
				projects.push(project);
			}
		})

		client.getEntries({
			content_type: 'post',
			limit: 3,
			order: "sys.createdAt"
		}).then(function (entries) {
			entries.items.forEach(function (entry) {
				if (entry.fields) {
					var post = {
						title: entry.fields.title,
						imageUrl: entry.fields.titleImage.fields.file.url,
						id: entry.sys.id
					};
					posts.push(post);
				}
			});
			// console.log(projects);
			// console.log(posts);
			  res.render("home", {
				  project: projects, 
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
			console.log(entry.sys.id);
			if (entry.fields) {
				var project = {
					title: entry.fields.title,
					imageUrl: entry.fields.titleImage.fields.file.url,
					id: entry.sys.id
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
			console.log(entry.sys.id);
			if (entry.fields) {
				var post = {
					title: entry.fields.title,
					imageUrl: entry.fields.titleImage.fields.file.url,
					id: entry.sys.id
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
	console.log(req.params.cardId);
	client.getEntry(req.params.cardId).then(function (entry) {
		outerEntry = entry
		const rawRichTextField = entry.fields.content;
		return richTextRender.documentToHtmlString(rawRichTextField);
	}).then(renderedHtml => {
		res.render("card", {
			title: outerEntry.fields.title,
			imageUrl: outerEntry.fields.titleImage.fields.file.url,
			content: renderedHtml
		})
	}).catch(error => console.log(error));
}); 
