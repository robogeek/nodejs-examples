// This is a simple HTTP server that delivers static files from a directory
// It uses Streams2 to deliver content to the client

var http = require('http');
var url  = require('url');
var mime = require('mime');
var fs   = require('fs');
var path = require('path');

var wwwroot = "/path/to/website";

http.createServer(function (request, res) {
        request.addListener('end', function () {
            var requrl = url.parse(request.url, true);
            if (request.method === "GET") {
                var fname = path.join(wwwroot, requrl.pathname);
                fs.stat(fname, function(err, status) {
                    if (err) {
                        showError(res, 404, "file "+ fname +" not found "+ err);
                    } else {
                        var nofurther = false;
                        if (status.isDirectory()) {
                            fname = path.join(fname, "index.html");
                            if (!fs.existsSync(fname)) {
                                showError(res, 404, "file "+ fname +" not found "+ err);
                                nofurther = true;
                            }
                        }
                        if (!nofurther) {
                            res.writeHead(200, {
                                'Content-Type': mime.lookup(fname) ,
                                'Content-Length': status.size
                            });
                            var readStream = fs.createReadStream(fname);
                            readStream.on('error', function(err) {
                                res.end();
                            });
                            readStream.pipe(res);
                        }
                    }
                });
            }
        });
    }).listen(8140);

var showError = function(res, code, message) {
    res.writeHead(code, {
        'Content-Type': 'text/plain'
    });
    res.end(message);
};
