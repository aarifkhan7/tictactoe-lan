const net = require('node:net');
const term = require('terminal-kit').terminal;

const srv = new net.Server();

srv.maxConnections = 1;

srv.on('listening', () => {
    printWaitingScreen();
})

srv.on('connection', (socket) => {
    console.log('Client Connected');
    console.log(`Connected to ${socket.remoteAddress}:${socket.remotePort}`);
    client_obj = socket;

    socket.on('data', (data) => {
        data = JSON.parse(data);
        if(data.msg === "START"){
            gameState = getInitGameState();
            yourChance = data.yourChance;
            state = "in_game";
            refreshGameBoard();
        }else if(data.msg === 'OK'){
            state = "in_game";
            const x = data.X, y = data.Y;
            if(validCoor(x, y)){
                gameState[x][y] = -1;
                yourChance = !yourChance;
                refreshGameBoard();
            }else{
                protoError();
            }
        }else{
            protoError();
        }
    })
});

srv.on('error', (error) => {
    console.log('Some error occured');
    console.log(error.message);
})

srv.listen({
    host: 'localhost',
    port: '4999',
    exclusive: true
});

let gameState = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]
]

let yourChance = null;

function getInitGameState(){
    return [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]
    ];
}

function validCoor(x, y){
    return (0 <= x && x <= 2) && (0 <= y && y <= 2); 
}

function protoError(){
    term.red.bold.inverse('PROTOCOL ERROR, ABORTING!\n');
    process.exit();
}

// 0 means empty
// 1 means O (self)
// -1 means X (other)

let client_obj = null;
let state = "server";

function handleConnect(ip_addr){
    gameState = getInitGameState();

    client_obj = new net.Socket({
        allowHalfOpen: true,
        readable: true,
        writeable: true
    });

    client_obj.on('connect', () => {
        yourChance = false;
        const dataObj = {
            msg: 'START',
            yourChance: !yourChance
        }
        client_obj.write(JSON.stringify(dataObj));
        refreshGameBoard();
    })
    
    client_obj.on('data', (data) => {
        data = JSON.parse(data);
        if(data.msg === 'START'){
            gameState = getInitGameState();
            state = "in_game";
        }else if(data.msg === 'OK'){
            state = "in_game";
            const x = data.X, y = data.Y;
            if(validCoor(x, y)){
                gameState[x][y] = -1;
                yourChance = !yourChance;
                refreshGameBoard();
            }else{
                protoError();
            }
        }else{
            protoError();
        }
    })

    client_obj.connect({
        host: 'localhost',
        port: 4999
    });
}

// possible state values
// waiting - waiting for others to connect
// connection_options - choose from a list of connection options
// input_ipaddr - wait for the user to enter ip address

printWaitingScreen();

function validIp(ipaddress) {  
    if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ipaddress)) {  
        return (true)  
    } 
    return (false)  
} 

function win(){
    const flag = 1;
    const g = gameState;
    if(g[0][0] == g[0][1] && g[0][1] == g[0][2] && g[0][2] == flag){
        return true;
    }
    if(g[1][0] == g[1][1] && g[1][1] == g[1][2] && g[1][2] == flag){
        return true;
    }
    if(g[2][0] == g[2][1] && g[2][1] == g[2][2] && g[2][2] == flag){
        return true;
    }
    if(g[0][0] == g[1][0] && g[1][0] == g[2][0] && g[2][0] == flag){
        return true;
    }
    if(g[0][1] == g[1][1] && g[1][1] == g[2][1] && g[2][1] == flag){
        return true;
    }
    if(g[0][2] == g[1][2] && g[1][2] == g[2][2] && g[2][2] == flag){
        return true;
    }
    if(g[0][0] == g[1][1] && g[1][1] == g[2][2] && g[0][0] == flag){
        return true;
    }
    if(g[0][2] == g[1][1] && g[1][1] == g[2][0] && g[2][0] == flag){
        return true;
    }
    return false;
}

function lose(){
    const flag = -1;
    const g = gameState;
    if(g[0][0] == g[0][1] && g[0][1] == g[0][2] && g[0][2] == flag){
        return true;
    }
    if(g[1][0] == g[1][1] && g[1][1] == g[1][2] && g[1][2] == flag){
        return true;
    }
    if(g[2][0] == g[2][1] && g[2][1] == g[2][2] && g[2][2] == flag){
        return true;
    }
    if(g[0][0] == g[1][0] && g[1][0] == g[2][0] && g[2][0] == flag){
        return true;
    }
    if(g[0][1] == g[1][1] && g[1][1] == g[2][1] && g[2][1] == flag){
        return true;
    }
    if(g[0][2] == g[1][2] && g[1][2] == g[2][2] && g[2][2] == flag){
        return true;
    }
    if(g[0][0] == g[1][1] && g[1][1] == g[2][2] && g[0][0] == flag){
        return true;
    }
    if(g[0][2] == g[1][1] && g[1][1] == g[2][0] && g[2][0] == flag){
        return true;
    }
    return false;
}

function draw(){
    for(let i = 0; i < 3; i++){
        for(let j = 0; j < 3; j++){
            if(gameState[i][j] == 0)
                return false;
        }
    }
    return true;
}

let cur_x = 0;
let cur_y = 0;

function refreshGameBoard(){
    term.clear();

    let curFound = false;

    if(win()){
        term.green.bold.inverse("you won :)\n");
        state = "game_over";
    }else if(lose()){
        term.red.bold.inverse("you lost the game :(\n");
        state = "game_over";
    }else if(draw()){
        term.yellow.bold.inverse("game draw :|\n");
    }

    if(state != "game_over"){
        if(yourChance){
            term.green.bold.inverse('Your Chance...\n');
        }else{
            term.blue.bold.inverse('Waiting for the other player...\n');
        }
    }

    for(let i = 0; i < 3; i++){
        for(let j = 0; j < 3; j++){
            if(gameState[i][j] == 0){
                if(cur_x == i && cur_y == j){
                    term.bold.underline.inverse(' . ');
                }else{
                    term.bold(' . ');
                }
            }else if(gameState[i][j] == 1){
                if(cur_x == i && cur_y == j){
                    term.bold.underline.inverse(' O ');
                }else{
                    term.bold.green(' O ');
                }
            }else if(gameState[i][j] == -1){
                if(cur_x == i && cur_y == j){
                    term.bold.underline.inverse(' X ');
                }else{
                    term.bold.red(' X ');
                }
            }else{
                protoError();
            }
            if(j != 2){
                term.bold(' | ');
            }
        }
        term('\n');
    }
    if(state == 'game_over'){
        term.blue.bold.inverse("Press ESC to go to main menu");
        state = "server";
    }
}

function printWaitingScreen(){
    term.clear();
    if(srv.listening){
        term.green('Waiting for player to connect on port 4999...\n');
    }
    term.blue('Press C to connect to a friend online...\n');
}

function printConnectOptionsList(){
    term.clear();
    term.blue.bold('I: IP Address\n');
    term.blue.bold('L: List of available players on local lan\n');
    term.blue.bold('Esc: Back to waiting mode\n');
}

function printInputIpAddr(){
    term.clear();
    term.yellow.bold('Enter IP Address: ');
    waitForIpInput();
}

function waitForIpInput(){
    term.inputField((error, input) => {
        if(validIp(input)){
            term.green.bold('\nConnecting to ' + input + '...\n');
            handleConnect(input);
        }else{
            term.red.bold('\nIP is invalid');
            printInputIpAddr();
        }
    });
}

term.grabInput()

term.on('key', (name, matches, data) => {
    if(state == "server"){
        if(name === 'C' || name === 'c'){
            printConnectOptionsList();
            state = "connection_options";
        }
    }

    if(state == "connection_options"){
        if(name === 'ESCAPE'){
            printWaitingScreen();
            state = "server";
        }else if(name === 'I' || name === 'i'){
            printInputIpAddr();
            state = "input_ipaddr";
        }
    }

    if(state == "in_game"){
        if(name === 'LEFT'){
            cur_y = (cur_y - 1 + 3) % 3;
        }else if(name === 'RIGHT'){
            cur_y = (cur_y + 1 + 3) % 3;
        }else if(name === 'UP'){
            cur_x = (cur_x - 1 + 3) % 3;
        }else if(name === 'DOWN'){
            cur_x = (cur_x + 1 + 3) % 3;
        }else if(name === 'ENTER' && gameState[cur_x][cur_y] == 0 && yourChance){
            gameState[cur_x][cur_y] = 1;
            const dataObj = {
                msg: 'OK',
                X: cur_x,
                Y: cur_y
            }
            client_obj.write(JSON.stringify(dataObj));
            yourChance = !yourChance;
        }
        refreshGameBoard();
    }

    if(name === 'ESCAPE'){
        state = "server";
        printWaitingScreen();
    }

    if(name === 'CTRL_C'){
        process.exit();
    }
});