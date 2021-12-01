import http from "http"
import serveStatic from "serve-static"
import { Server, WebSocket } from "ws"
import url from "url"
import finalhandler from "finalhandler"

const PORT = process.env.PORT || 8080;
const server = new Server({ noServer: true })
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
      console.log(message.toString("utf8"))
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
