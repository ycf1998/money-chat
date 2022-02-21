const router = require('express').Router();
const path = require('path');
const fs = require('fs')
const template = require('art-template')

router.get('/index', (req, res) => {
	res.sendFile(path.resolve(__dirname, '../views/index.html'));
});

router.get('/driver/1.0.0', (req, res) => {
	let htmlStr = fs.readFileSync(path.resolve(__dirname, '../views/index-template.html')).toString();
	let html = template.render(htmlStr, {
		path: `http://localhost:3001`
	})
	let jsStr = fs.readFileSync(path.resolve(__dirname, '../public/core/jsDriver.js')).toString();
	let js = template.render(jsStr, {
		path: `http://localhost:3001`,
		socketPath: `http://localhost:3001`
	})
	res.send({
		html,
		js
	});
});

router.get('/driver/2.0.0', (req, res) => {
	let htmlStr = fs.readFileSync(path.resolve(__dirname, '../views/index-template.html')).toString();
	let html = template.render(htmlStr, {
		path: `https://shahow.top/money/money-chat`
	})
	let jsStr = fs.readFileSync(path.resolve(__dirname, '../public/core/jsDriver.js')).toString();
	let js = template.render(jsStr, {
		path: `https://shahow.top/money/money-chat`,
		socketPath: `https://shahow.top`
	})
	res.send({
		html,
		js
	});
});

module.exports = router