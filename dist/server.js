"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var net_1 = require("net");
var http_1 = __importDefault(require("http"));
var express_1 = __importDefault(require("express"));
var path_1 = __importDefault(require("path"));
var socket_io_1 = require("socket.io");
var fs_1 = __importDefault(require("fs"));
var file_type_1 = require("file-type");
var app = express_1.default();
app.get('/stream', function (req, res) {
    var range = req.headers.range;
    var caminho = path_1.default.resolve(__dirname, 'canetaazul.mp4');
    var videoSize = fs_1.default.statSync(caminho).size;
    if (!range)
        return console.log('range indefinido');
    var start = parseInt(range.replace(/\D/g, ''));
    var CHUNK_SIZE = 10000;
    var end = Math.min(start + CHUNK_SIZE, videoSize - 1);
    var headers = {
        'Content-Range': "bytes " + start + "-" + end + "/" + videoSize,
        'Content-Type': 'video/mp4',
        'Accept-Ranges': 'bytes'
    };
    res.writeHead(206, headers);
    var videoParts = fs_1.default.createReadStream(caminho, { start: start, end: end });
    videoParts.pipe(res);
});
app.get('/', function (req, res) {
    res.sendFile(path_1.default.resolve(__dirname, 'src', 'server.html'));
});
var httpServer = http_1.default.createServer(app);
var io = new socket_io_1.Server(httpServer);
var tcpServer = net_1.createServer();
var httpPort = 3000;
var portTcp = 8080;
httpServer.listen(httpPort);
tcpServer.listen(portTcp);
tcpServer.on('connection', function (socket) {
    var buf = [];
    var accept = false;
    socket.on('data', function (data) {
        if (!accept) {
            if (data.toString() === 'client-node-rat') {
                accept = true;
            }
            else {
                return socket.end();
            }
        }
        else {
            buf.push(data);
        }
    });
    socket.on('end', function () { return __awaiter(void 0, void 0, void 0, function () {
        var bufConcat, type;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!accept)
                        return [2 /*return*/, console.log('Conexão desconhecida detectada')];
                    bufConcat = Buffer.concat(buf);
                    return [4 /*yield*/, file_type_1.fromBuffer(bufConcat)
                        // console.log(type?.mime)
                    ];
                case 1:
                    type = _a.sent();
                    // console.log(type?.mime)
                    if ((type === null || type === void 0 ? void 0 : type.mime) === 'image/png') {
                        io.emit('image', bufConcat.toString('base64'));
                    }
                    buf.splice(0, buf.length);
                    return [2 /*return*/];
            }
        });
    }); });
    socket.on('close', function (data) {
        // conexão fechada
    });
});
tcpServer.on('error', function (err) {
    console.error(err);
});
tcpServer.on('listening', function () {
    console.log('listening');
});
tcpServer.on('close', function () {
    console.log('server closed');
});
