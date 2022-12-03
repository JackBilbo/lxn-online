const { handleKeybinds } = require("./keybinds");

var wsserver = document.location.search.replace(/\?/,"");
if(wsserver == '') { wsserver = '127.0.0.1:2048' }

const initWS = (vars, keybindstates) => {

    WS = new WebSocket('ws://' + wsserver + '/fsuipc/', "fsuipc");

    WS.addEventListener("close", function() {
        console.log("---------------REOPEN---------------")
        initWS(vars, keybindstates);
    })

    var declare_vars = {
        command: 'offsets.declare',
        name: 'variableoffsets',
        offsets: [
            {name: 'atc_model', address: 0x3500, type: 'string', size: 23 },
            {name: 'simulation_paused', address: 0x0264, type: 'int', size: 2},
            {name: 'ias', address: 0x02BC, type: 'int', size: 4 },
            {name: 'hdg', address: 0x0580, type: 'int', size: 4 },
            {name: 'magvar', address: 0x6028, type: 'float', size: 8 },
            {name: 'trk', address: 0x6040, type: 'float', size: 8 },
            {name: 'alt', address: 0x6020 , type: 'float', size: 8 },
            {name: 'alt_agl', address: 0x0B4C , type: 'int', size: 2 },
            {name: 'lat', address: 0x6010, type: 'float', size: 8 },
            {name: 'lng', address: 0x6018, type: 'float', size: 8 },
            {name: 'windspeed', address: 0x0E90, type: 'int', size: 2 },
            {name: 'verticalwind', address: 0x2DD0, type: 'float', size: 8 },
            {name: 'winddirection', address: 0x0E92, type: 'int', size: 2 },
            {name: 'localtime_hrs', address: 0x0238, type: 'int', size: 1 },
            {name: 'localtime_min', address: 0x0239, type: 'int', size: 1 },
            {name: 'localtime_sec', address: 0x023A, type: 'int', size: 1 },
            {name: 'totalweight', address: 0x30C0, type: 'float', size: 8 }
        ]
    }

    var declare_keybinds = {
        command: 'offsets.declare',
        name: 'keybindoffsets',
        offsets: [
            {name: 'transponder', address: 0x0354 , type: 'int', size: 2 }
        ]
    }

    var declare_Lvars = {
        command: 'vars.declare',
        name: 'LVars',
        vars: [
            { name: 'BEZEL_CAL'}
        ]
    }

    var request_vars = {
        command: 'offsets.read',
        name: 'variableoffsets',
        changesOnly: true,
        interval: 100
    }

    var request_keybinds = {
        command: 'offsets.read',
        name: 'keybindoffsets',
        changesOnly: true,
        interval: 100
    }

    var request_Lvars = {
        command: 'vars.read',
        name: 'LVars',
        changesOnly: true,
        interval: 100
    }

    WS.onopen = function() {
        WS.send(JSON.stringify(declare_vars));
        WS.send(JSON.stringify(declare_keybinds));
        WS.send(JSON.stringify(request_vars));
        WS.send(JSON.stringify(request_keybinds));
        WS.send(JSON.stringify(declare_Lvars));
        WS.send(JSON.stringify(request_Lvars));
    };

    WS.onmessage = function(msg) {
        let response = JSON.parse(msg.data);
        
        if(response.name == "variableoffsets") {   
            
            for(let v in response.data) {
                if(v == "simulation_paused") { V.isPaused = response.data.simulation_paused; } else
                if(v == "localtime_hrs") { V.localtime_h = response.data.localtime_hrs; } else
                if(v == "localtime_min") { V.localtime_m = response.data.localtime_min; } else
                if(v == "localtime_sec") { V.localtime_s = response.data.localtime_sec; } else
                if(v == "winddirection") { V.winddirection.set(response.data.winddirection * 360 / 65536 ) } else 
                if(v == "magvar") {  V.magvar.set((response.data.magvar * 180 / 3.14159) ) } else 
                if(v == "trk") { V.trk.set((response.data.trk * 180 / 3.14159) + V.magvar.getrawvalue()) } else 
                if(v == "atc_model") { V.atc_model = response.data.atc_model; } else 
                if(v == "alt_agl") { V.alt_agl.set(V.alt.getrawvalue() - response.data.alt_agl) } else 
                if(v == "verticalwind") { V.verticalwind.set(response.data.verticalwind,'fs') } else 
                {
                    try {
                        V[v].set(response.data[v],"fsuipc")
                    } catch(e) {
                        console.error(e);
                    }
                    
                }
                
            }
        }

        if(response.name == "keybindoffsets" && response.command == "offsets.read") {
            handleKeybinds(response.data,keybindstates);
        }

        if(response.name == "LVars" && response.command == "vars.read") {
            if(response.data) {
                if(response.data['BEZEL_CAL']) { console.log(response.data['BEZEL_CAL']); V.maccready.set( ( response.data['BEZEL_CAL'] > 1 ? response.data['BEZEL_CAL'] * 0.05 : 0 ) ,'ms') }
            }
        }
    }

}

module.exports = {initWS}