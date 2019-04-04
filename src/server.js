const http = require('http')
const opn = require('opn')
const WebSocketServer = require('websocket').server;
const {spawn} = require('child_process')

const fs = require('fs')
const port = 3000

let wsServer;

module.exports = function(namespace) {
  function extractData(data) {
    let index = data.search(/App Summary/)
    if (index == -1) {
      return null
    }
    let cut = data.substring(index)
    let endIndex = cut.search(/Objects/)
    let relevantPiece = cut.substring(0, endIndex)

    let out = {}
    try {
    out['java_heap'] = relevantPiece.match(/Java\s+Heap:\s+(\d+)/)[1]
    out['native_heap'] = relevantPiece.match(/Native\s+Heap:\s+(\d+)/)[1]
    out['code'] = relevantPiece.match(/Code:\s+(\d+)/)[1]
    out['stack'] = relevantPiece.match(/Stack:\s+(\d+)/)[1]
    out['graphics'] = relevantPiece.match(/Graphics:\s+(\d+)/)[1]
    out['private_other'] = relevantPiece.match(/Private\s+Other:\s+(\d+)/)[1]
    out['system'] = relevantPiece.match(/System:\s+(\d+)/)[1]
    out['total'] = relevantPiece.match(/TOTAL:\s+(\d+)/)[1]
    out['total_swap_pss'] = relevantPiece.match(/TOTAL\s+SWAP\s+PSS:\s+(\d+)/)[1]
    } catch (e) {
      return null
    }
    return out
  }

  function mainLoop(connection, done) {
    const ls = spawn('adb', ['shell', 'dumpsys', 'meminfo', namespace]);
    ls.stdout.setEncoding('utf8')
    ls.stdout.on('data', (data) => {
      let output = extractData(data)
      if (output != null) {
        connection.sendUTF(JSON.stringify(output));
      }
    });

    ls.stderr.on('data', (data) => {
      console.log(`stderr: ${data}`);
    });

    ls.on('close', (code) => {
      done()
    });
  }

  fs.readFile(__dirname + '/index.html', function(err, html) {
    const server = http.createServer(function(request, response) {
      response.writeHeader(200, {"Content-Type": "text/html"});
      response.write(html);
      response.end();
    })

    server.listen(port, (err) => {
      if (err) {
        return console.log('something bad happened', err)
      }

      console.log(`server is listening on ${port}`)
      opn('http://localhost:3000')
    })

    wsServer = new WebSocketServer({httpServer: server})

    wsServer.on('request', function(request) {
      const connection = request.accept(null, request.origin)
      console.log("Connection..")

      const out = {buffer: []};

      const done = () => {
        setTimeout(() => mainLoop(connection, done), 1000)
      }

      mainLoop(connection, done)
    })
  })
}