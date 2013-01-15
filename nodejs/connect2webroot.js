var connect = require('connect'),
	webroot = process.argv[2] || "webroot";

connect.createServer(
    connect.static(webroot)
).listen(80);