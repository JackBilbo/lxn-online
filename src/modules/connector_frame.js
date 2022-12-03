let resolver = {}

function testMessage(msg) {
    parent.postMessage(msg,'*')
}

function getVar(varname) {
    return new Promise(function(resolve,reject) {
        parent.postMessage(["getVar", varname],'*');
        resolver[varname] = function(returnvalue) { resolve(returnvalue) }
    })
}

function getSimVar(varname, SimVar,units) {
    // console.log("retrieving simvar " + SimVar);
    return new Promise(function(resolve,reject) {
        console.log("Promise created " + SimVar);
        parent.postMessage(["getSimVar", varname, SimVar, units],'*');
        resolver[varname] = function(returnvalue) { resolve(returnvalue) }
    })
}

function callfunction(remotefunction,param) {
    return new Promise(function(resolve,reject) {
        parent.postMessage(["callfunction", remotefunction, param],'*');
        resolver[remotefunction] = function(returnvalue) { resolve(returnvalue) }
    }) 
}

function setVar(key,value) {
    parent.postMessage(["setVar", key, value],"*");
}

window.addEventListener('message',(event) => {
    console.log("msg: " + event.data);

    if(event.data[0] == "getVar") {
        setVar(event.data[1], window[event.data[1]]);
    }

    if(event.data[0] == "setVar") {
        console.log("setting var: " + event.data[1] + " = " + event.data[2]);
        eval(event.data[1] + "='" + event.data[2] + "'");
        if(resolver[event.data[1]]) {
            resolver[event.data[1]](event.data[2]);
            delete resolver[event.data[1]];
        }
    }

    if(event.data[0] == "setObject") {
        console.log("setting Object: " + event.data[1] + " = " + event.data[2]);
        // eval(event.data[1] + "=" + event.data[2]);
        window[event.data[1]] = JSON.parse(event.data[2]);
    }

    if(event.data[0] == "callfunction") {
        if(typeof(event.data[1] == "function")) {
            let returnvalue = eval(event.data[1])(event.data[2]);

            setVar(event.data[1],returnvalue);
        }
    }
})