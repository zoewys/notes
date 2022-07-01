const http = require('http')
const fs = require('fs')
const url = require("url")

const log = console.log.bind(this)

const route = {
    '/': './index.html',
    '/worker': './worker.html',
    '/1080': './1080.html',
    '/webgl': './webgl.html',
    '/long': './long.html',
    // '/index.js': './index.js',
    // '/ffmpeg.min.js': './ffmpeg.min.js',
    // '/ffmpeg-core.js': './ffmpeg-core.js',
    // '/ffmpeg-core.worker.js': './ffmpeg-core.worker.js',
    // '/ffmpeg-core.wasm': './ffmpeg-core.wasm',
    // '/ffmpeg.dev.js': './ffmpeg.dev.js',
}

const resVideo = (req, res) => {
    const url = `.${req.url}`
    fs.stat(url,function(err,stat){
        if (err) {
            res.writeHead(404,{'Content-Type':'text/html'});
            res.end('Your requested URI('+req.url+') wasn\'t found on our server');
        } else {
            const fileSize = stat.size;
            const range = req.headers.range;
            if (range) {
                const parts = range.replace(/bytes=/, "").split("-");
                const start = parseInt(parts[0], 10);
                const end = parts[1] ? parseInt(parts[1], 10) : fileSize-1;
                const chunksize = (end-start)+1;
                const file = fs.createReadStream(url, {start, end});
                const head = {
                    'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                    'Accept-Ranges': 'bytes',
                    'Content-Length': chunksize,
                    // 'Content-Type': type
                }
                res.writeHead(206, head);
                file.pipe(res);
            } else {
                const head = {
                    'Content-Length': fileSize,
                    // 'Content-Type': type
                }
                res.writeHead(200, head);
                fs.createReadStream(url).pipe(res);
            }
        }
    });
}

const resFile = (req, res) => {
    const parsed = url.parse(req.url, true)
    const reqUrl = parsed.pathname
    const path = route[reqUrl]
    fs.readFile(path, 'utf-8', (err, data) => {
        res.end(data)
    })
}

const server = http.createServer((req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin")
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin")
    res.setHeader("Cross-Origin-Embedder-Policy", "require-corp")

    if (req.method === "GET") {
        console.log('url', req.url)
        if(req.url.indexOf('src') > -1) {
            const url = `.${req.url}`
            res.setHeader("content-type", "application/javascript; charset=utf-8")
            fs.readFile(url, 'utf-8', (err, data) => {
                res.end(data)
            })
        }else if (req.url.indexOf('video') > -1) {
            resVideo(req, res)
        } else if (route[req.url]) {
            resFile(req, res)
        }  else {
            res.statusCode = 404
            res.end('404: File Not Found');
        }
    }
})

server.listen(1085)

// 终端打印如下信息
console.log('Server running at http://127.0.0.1:1085/');

