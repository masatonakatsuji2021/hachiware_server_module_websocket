/**
 * ===================================================================================================
 * Hachiware_Server_module_websocket
 * 
 * Module for webSocket of web server package "hachiware_server".
 * 
 * License : MIT License. 
 * Since   : 2022.01.15
 * Author  : Nakatsuji Masato 
 * Email   : nakatsuji@teastalk.jp
 * HP URL  : https://hachiware-js.com/
 * GitHub  : https://github.com/masatonakatsuji2021/hachiware_server_module_webroot
 * npm     : https://www.npmjs.com/package/hachiware_server_module_webroot
 * ===================================================================================================
 */

const { WebSocketServer } = require("ws");

module.exports = function(conf, context){

    if(!conf.webSockets){
        conf.webSockets = ["*"];
    }

    var wsss = {};
    for(var n = 0 ; n < conf.webSockets.length ; n++){
        var row = conf.webSockets[n];
        
        if(typeof row == "string"){
            row = { url: row };
        }

        var ws_ = new WebSocketServer({noServer:true});

        ws_.on("connection", function(socket){

            if(row.open){
                row.open(socket, ws_);
            }

           context.loadFookModule(conf, "socket", [ws_, socket]);

            ws_.on("close", function(){
                if(row.close){
                    row.close(socket, ws_);
                }
            });

            ws_.on("data", function(data){
                console.log(data);
                if(row.data){
                    row.data(socket, data, ws_);
                }
            });

            ws_.on("error", function(exception){
                if(row.error){
                    row.error(socket, exception, ws_);
                }
            });
            
        });

        wsss[row.url] = ws_;
    }

    /**
     * fookUpgrade
     * @param {*} req 
     * @param {*} socket 
     * @param {*} head 
     * @returns 
     */
    this.fookUpgrade = function(req, socket, head){

        var decisionWss = null;

        var colums = Object.keys(wsss);

        for(var n = 0 ; n < colums.length; n++){
            var url = colums[n];
            var wss = wsss[url];

            if(url == "*"){
                decisionWss = wss;
            }

            if(req.url == url){
                decisionWss = wss;
                break;
            }
        }

        if(!decisionWss){
            return;
        }

        decisionWss.handleUpgrade(req, socket, head, function done(ws) {
            decisionWss.url = req.url;
            decisionWss.emit('connection', ws, req);
        });
    };
};