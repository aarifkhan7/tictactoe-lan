const createServer = require('./src/createServer.js');

const srv = createServer();

srv.listen({
    host: 'localhost',
    port: '4999',
    exclusive: true
});

console.log( '\x1b[31m\x1b[1mWarning:\x1b[22m \x1b[93mthe error \x1b[4m#105\x1b[24m just happened!\x1b[0m' ) ;
