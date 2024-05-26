const http = require('http');
const url = require('url'); //permite "resolver" e fazer parser de uma url
const fs = require('fs'); //interação com sistemas de arquivos
const path = require('path'); //lidar com caminho de arquivos, extensões

const HOSTNAME = '127.0.0.1';
const PORT = 3000;
const CONTENT_TYPE = 'Content-Type';
const TEXT_PLAIN = 'text/plain';
const LOCATION = 'location';
const DEFAULT_LOCATION = 'index.html';
const RESPONSE_MESSAGE = "OK!";
const RESPONSE_MESSAGE_NOT_FOUND = `404: Arquivo não encontrado!`;
const RESPONSE_MESSAGE_INTERNAL_SERVER_ERROR = `500: Erro interno do servidor!`;
const SERVER_RUNNING_MESSAGE = `O servidor está sendo executado em http://${HOSTNAME}:${PORT}/`;

const mimeTypes = {
    html: "text/html",
    css: "text/css",
    js: "text/javascript",
    png: "image/png",
    jpeg: "image/jpeg",
    jpg: "image/jpg",
    woff: "font/woof",
};

http.createServer((req, res) => {
    let acesso_uri = url.parse(req.url).pathname;
    let caminho_completo_recurso = path.join(process.cwd(), decodeURI(acesso_uri));
    console.log(caminho_completo_recurso);

    let recurso_carregado;
    try {
        recurso_carregado = fs.lstatSync(caminho_completo_recurso);
    } catch (error) {
        res.writeHead(404, {
            [CONTENT_TYPE]: TEXT_PLAIN
        });
        res.write(RESPONSE_MESSAGE_NOT_FOUND);
        res.end();    
    }

    if (recurso_carregado.isFile()) {
        let mimeType = mimeTypes[path.extname(caminho_completo_recurso).substring(1)];

        res.writeHead(200, {
            [CONTENT_TYPE]: mimeType
        });
        let fluxo_arquivo = fs.createReadStream(caminho_completo_recurso);
        fluxo_arquivo.pipe(res); 
    } else if (recurso_carregado.isDirectory()) {
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
}).listen(PORT, HOSTNAME, () => {
    console.log(SERVER_RUNNING_MESSAGE);
});