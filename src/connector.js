CON.child;

CON.resolver = {};

CON.initconnector = function() {
    CON.child = document.querySelector("#lxnframe").contentWindow;
    window.addEventListener('message',(event) => {
        // console.log("msg: " + event.data);
    
        if(event.data[0] == "getVar") {
            // console.log("getting " + event.data[1] + " - " + eval(event.data[1]));
            setVar(event.data[1], eval(event.data[1]));
        }
    
        if(event.data[0] == "getSimVar") {
            setVar(event.data[1], SimVar.GetSimVarValue(event.data[2], event.data[3]));
            // console.log("retrieving Simvar " + event.data[2]);
        }
    
        if(event.data[0] == "setVar") {
            window[event.data[1]] = event.data[2]
            if(CON.resolver[event.data[1]]) {
                CON.resolver[event.data[1]]();
                delete CON.resolver[event.data[1]];
            }
        }

        if(event.data[0] == "callfunction") {
            // console.log("calling function " + event.data[1] + " - " + typeof(event.data[1]));
            if(typeof(event.data[1] == "function")) {
                let param = typeof(event.data[2]) == "object" ? event.data[2].join() : event.data[2];
                let returnvalue = eval(event.data[1])(param);

                setVar(event.data[1],returnvalue);
            }
            
        }
    })
}


CON.setVar = function(key,value) {
    // console.log("setting " + key + " - " + value);
    CON.child.postMessage(["setVar", key, value],'*');
}

CON.setObject = function(key,ob) {
    // console.log("setting object " + key)+ " - " + ob;
    CON.child.postMessage(["setObject", key, JSON.stringify(ob)],'*');
}

CON.getVar = function(varname) {
    return new Promise(function(resolve,reject) {
        CON.child.postMessage(["getVar", varname],'*');
        CON.resolver[varname] = function() { resolve(varname) }
    })   
}

CON.callfunction = function(remotefunction,param) {
    return new Promise(function(resolve,reject) {
        CON.child.postMessage(["callfunction", remotefunction, param],'*');
        CON.resolver[remotefunction] = function(returnvalue) { resolve(returnvalue) }
    }) 
}

