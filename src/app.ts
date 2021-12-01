import http from "http"
import serveStatic from "serve-static"
import { Server, WebSocket } from "ws"
import url from "url"
import finalhandler from "finalhandler"

const PORT = process.env.PORT || 8080;
const messageDeflate = process.env.MESSAGE_DEFLATE || false;
console.log(`copression is ${Boolean(messageDeflate) ? "on" : "off"}`)

const wsOpts = { 
  noServer: true, 
  perMessageDeflate: messageDeflate ? {
    zlibDeflateOptions: {
      // See zlib defaults.
      chunkSize: 1024,
      memLevel: 7,
      level: 3
    },
    zlibInflateOptions: {
      chunkSize: 10 * 1024
    },
    // Other options settable:
    clientNoContextTakeover: true, // Defaults to negotiated value.
    serverNoContextTakeover: true, // Defaults to negotiated value.
    serverMaxWindowBits: 10, // Defaults to negotiated value.
    // Below options specified as default values.
    concurrencyLimit: 10, // Limits zlib concurrency for perf.
    threshold: 1024 // Size (in bytes) below which messages
    // should not be compressed if context takeover is disabled.
  } : false
}

const server = new Server(wsOpts)


const clients = new Set<WebSocket>();
const serve = serveStatic('public/', { 'index': ['index.html', 'index.htm'] })

http.createServer((req, res) => {
  if (req.url) {
    const parsedUrl = url.parse(req.url, false) 

    if (parsedUrl.path === "/chat") {
      return upgrade(req, res)
    }
  }

  return serve(req, res, createdone(req, res, undefined)) 
}).listen(PORT, () => console.log(`server started on port ${PORT}...`));

const createdone = (req: http.IncomingMessage, res: http.ServerResponse, err: any) => {
  return () => {
    finalhandler(req, res)(err)
  } 
}

function upgrade(req: http.IncomingMessage, _: http.ServerResponse) : void {
  server.handleUpgrade(req,req.socket, Buffer.alloc(0), (ws) => {
    console.log("upgrading to WebSocket...") 
    clients.add(ws)
    ws.on("message", function(message) {
      message = message.slice(0, 50);

      for (let client of Array.from(clients.values())) {
        client.send(message)
      }
    })

    ws.on("close", function() {
      clients.delete(ws)
    })
  })
}
