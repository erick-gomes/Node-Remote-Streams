"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var path_1 = __importDefault(require("path"));
var createWindow = function () {
    var win = new electron_1.BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path_1.default.resolve(__dirname, 'client.js'),
        },
        /* frame: false,
        transparent: true */
    });
    win.loadFile('src/index.html');
    // win.show()
    win.on('close', function (event) {
        event.preventDefault();
        win.hide();
    });
};
electron_1.app.whenReady().then(function () {
    createWindow();
});
