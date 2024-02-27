const net = require('node:net');

const socket = new net.Socket({
    allowHalfOpen: true,
    readable: true,
    writeable: true
});

let writeInterval = null;

socket.on('connect', () => {
    console.log(`Connected successfully to ${socket.remoteAddress}:${socket.remotePort}!`);
    writeInterval = setInterval(() => {
        socket.write('Ping');
    }, 1000)
})

socket.on('close', (hadError) => {
    if(!hadError){
        console.log('Connection closed gracefully :)');
    }else{
        console.log('Connection closed with error :(');
    }
})

socket.on('error', (error) => {
    console.log('Some error occured');
    console.log(error.message);
})

socket.on('connectionAttempt', (ip, port, family) => {
    console.log(`Connecting to TCP ${ip}:${port}`);
})

socket.on('connectionAttemptFailed', (ip, port, family) => {
    console.log(`Could not connect to TCP ${ip}:${port}`);
})

socket.on('connectionAttemptTimeout', (ip, port, family) => {
    console.log(`Connection timed out when connecting to TCP ${ip}:${port}`);
})

socket.on('data', (data) => {
    console.log('Recv: ' + data);
})

socket.connect({
    host: 'localhost',
    port: 4999
});