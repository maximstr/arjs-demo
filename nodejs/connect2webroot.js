/*
 * HTTP
 */

var connect = require('connect'),
	webroot = process.argv[2] || "webroot";

connect.createServer(
    connect.static(webroot)
).listen(80);

/*
 * HTTPS
 */
// var https = require('https');
// var fs = require('fs');
// var options = {
//   cert: fs.readFileSync('cert/certificate.pem').toString(),
//   key: fs.readFileSync('cert/privatekey.pem').toString()
// };
// https.createServer(options, function (req, res) {
//   res.writeHead(200);
//   res.end(fs.readFileSync('webroot/index.html').toString()+"\n");
// }).listen(443);

