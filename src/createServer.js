const net = require('node:net');

function createServer() {
    const srv = new net.Server();

    srv.maxConnections = 1;
    
    srv.on('connection', (socket) => {
        console.log('Client Connected');
        console.log(`Connected to ${socket.remoteAddress}:${socket.remotePort}`);
    
        socket.on('data', (data) => {
            console.log(`RECV: ${data}`);
            socket.write("Pong");
        })
    });
    
    srv.on('error', (error) => {
        console.log('Some error occured');
        console.log(error.message);
    })
    
    srv.on('listening', (data) => {
        console.log('Server is listening');
    });

    return srv;
}

module.exports = createServer;