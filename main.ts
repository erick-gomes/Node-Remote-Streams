import { app, BrowserWindow } from 'electron'
import path from 'path'

const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.resolve(__dirname, 'client.js'),
        },
        /* frame: false,
        transparent: true */
    })

    win.loadFile('src/index.html')
    // win.show()
    win.on('close', event => {
        event.preventDefault()
        win.hide()
    })
}

app.whenReady().then(() => {
    createWindow()
})
