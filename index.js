var Omegle = require('omegle-node');
const cleverbot = require("cleverbot-free");
const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');
var fs = require('fs');
const downloadsFolder = require('downloads-folder');
var keypress = require('keypress');
 
// make `process.stdin` begin emitting "keypress" events
keypress(process.stdin);
var txtFile;
clear();

console.log(
  chalk.yellow(
    figlet.textSync('Cleverbot  + Omegle', { horizontalLayout: 'full' })
  )
);

var om = new Omegle(); //create an instance of `Omegle`
var ref = ["hello"];
var txt = ""

//This will print any errors that might get thrown by functions
om.on('omerror',function(err){
    console.log('error: ' + err);
});
 
//gotID is emitted when you're connected to Omegle 
om.on('gotID',function(id){
    console.log('connected to the server as: ' + chalk.yellow(id));
    txt += 'connected to the server as: ' + id + "\n"
    txtFile = downloadsFolder() + "/" + id.replace(":", "") + ".txt";
});
 
//waiting is emitted when you're waiting to connect to a stranger
om.on('waiting', function(){
    console.log(chalk.yellow('waiting for a stranger.'))
    txt += 'waiting for a stranger.' + "\n"
});
 
//emitted when you're connected to a stranger
om.on('connected',function(){
    console.log(chalk.green('connected'))
    console.log(chalk.bgRed("press ESC to disconnect"))
    txt += 'connected' + "\n";
});
 
//emitted when you get a message
om.on('gotMessage',function(msg){
    console.log(chalk.red('Stranger: ') + msg);
    txt += 'Stranger: ' + msg + "\n"
    om.startTyping()
    cleverbot(msg, ref).then(response => wait(response));
    ref.push(msg)

});
 
om.on('connectionDied',function(){
    console.log('CONNECTION DIED');
});

om.on('disconnected',function(){
    console.log(chalk.red('Disconnected.'))
    txt += 'Disconnected.' + "\n"
    console.log(chalk.bgRed("SPACE → Find new person  \nS → Save conversation to downloads \nQ → Quit program"))
});

function wait(msg){
    var timer =  Math.floor(Math.random() * 7001);
    setTimeout(() => {send(msg)}, timer);
}

function send(msg){
    if(om.connected()){
        om.stopTyping();
        console.log(chalk.blue('Cleverbot: ') + msg)
        txt += "Cleverbot: " + msg + "\n"
        om.send(msg)
    }
}

function reconnect(){
    if(om.connected() == false){
        txt = "";
        ref = [];
        om.connect();
        clear();

    console.log(
        chalk.yellow(
            figlet.textSync('Cleverbot  + Omegle', { horizontalLayout: 'full' })
        )
    );
    }
}

process.stdin.on('keypress', function (ch, key) {
    if(key == null){
        return;
    }
    if(key.name == "escape"){
        if(om.connected()){
            om.disconnect()
        }
    }
    else if(key.name == "space"){
        if(om.connected() == false){
            reconnect();
        }
    }
    else if(key.name == "s"){
        if(om.connected() == false){
            fs.writeFile(txtFile, txt, function (err) {
                if (err) throw err;
                console.log("Saved convo to:"  + chalk.yellow(txtFile)) 
            })
            reconnect();
        }
    }
    else if(key.name == "q"){
        if(om.connected() == false){
            process.exit()
        }
    }
    else{
        return;
    }
});

process.stdin.setRawMode(true);
process.stdin.resume();

om.connect();