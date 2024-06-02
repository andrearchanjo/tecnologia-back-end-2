const http = require('http');
const url = require('url'); // Permite "resolver" e fazer parser de uma URL
const fs = require('fs'); // Interação com sistemas de arquivos
const path = require('path'); // Lidar com caminho de arquivos, extensões

const HOSTNAME = '127.0.0.1';
const PORT = 3000;
const CONTENT_TYPE = 'Content-Type';
const TEXT_PLAIN = 'text/plain; charset=utf-8';
const LOCATION = 'Location';
const DEFAULT_LOCATION = 'index.html';
const NOT_FOUND_LOCATION = '/pages/not-found.html';
const RESPONSE_MESSAGE_INTERNAL_SERVER_ERROR = '500: Erro interno do servidor!';
const SERVER_RUNNING_MESSAGE = `O servidor está sendo executado em http://${HOSTNAME}:${PORT}/`;

const mimeTypes = {
    html: "text/html",
    css: "text/css",
    js: "text/javascript",
    png: "image/png",
    jpeg: "image/jpeg",
    jpg: "image/jpeg",
    woff: "font/woff",
    pdf: "application/pdf",
    mp4: "video/mp4"
};

http.createServer((req, res) => {
    let acesso_uri = url.parse(req.url).pathname;
    let caminho_completo_recurso = path.join(process.cwd(), decodeURI(acesso_uri));
    console.log(caminho_completo_recurso);

    // Assíncrono ao invés de síncrono
    fs.lstat(caminho_completo_recurso, (err, stats) => {
        if (err) {
            // Recurso não encontrado
            if (err.code === 'ENOENT') {
                // Redirecionamento temporário
                res.writeHead(302, {
                    [LOCATION]: NOT_FOUND_LOCATION
                });
            } else {
                res.writeHead(500, {
                    [CONTENT_TYPE]: TEXT_PLAIN
                });
                res.write(RESPONSE_MESSAGE_INTERNAL_SERVER_ERROR);
            }
            res.end();
            return;
        }

        if (stats.isFile()) {
            let mimeType = mimeTypes[path.extname(caminho_completo_recurso).substring(1)] || TEXT_PLAIN;
            res.writeHead(200, {
                [CONTENT_TYPE]: mimeType
            });
            let fluxo_arquivo = fs.createReadStream(caminho_completo_recurso);
            fluxo_arquivo.pipe(res);
        } else if (stats.isDirectory()) {
            res.writeHead(302, {
                [LOCATION]: DEFAULT_LOCATION
            });
            res.end();
        } else {
            res.writeHead(500, {
                [CONTENT_TYPE]: TEXT_PLAIN
            });
            res.write(RESPONSE_MESSAGE_INTERNAL_SERVER_ERROR);
            res.end();
        }
    });
}).listen(PORT, HOSTNAME, () => {
    console.log(SERVER_RUNNING_MESSAGE);
});