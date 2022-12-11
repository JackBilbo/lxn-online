/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/connector.js":
/*!**************************!*\
  !*** ./src/connector.js ***!
  \**************************/
/***/ (() => {

eval("CON.child;\r\n\r\nCON.resolver = {};\r\n\r\nCON.initconnector = function() {\r\n    CON.child = document.querySelector(\"#lxnframe\").contentWindow;\r\n    window.addEventListener('message',(event) => {\r\n        // console.log(\"msg: \" + event.data);\r\n    \r\n        if(event.data[0] == \"getVar\") {\r\n            // console.log(\"getting \" + event.data[1] + \" - \" + eval(event.data[1]));\r\n            setVar(event.data[1], eval(event.data[1]));\r\n        }\r\n    \r\n        if(event.data[0] == \"getSimVar\") {\r\n            setVar(event.data[1], SimVar.GetSimVarValue(event.data[2], event.data[3]));\r\n            // console.log(\"retrieving Simvar \" + event.data[2]);\r\n        }\r\n    \r\n        if(event.data[0] == \"setVar\") {\r\n            window[event.data[1]] = event.data[2]\r\n            if(CON.resolver[event.data[1]]) {\r\n                CON.resolver[event.data[1]]();\r\n                delete CON.resolver[event.data[1]];\r\n            }\r\n        }\r\n\r\n        if(event.data[0] == \"callfunction\") {\r\n            // console.log(\"calling function \" + event.data[1] + \" - \" + typeof(event.data[1]));\r\n            if(typeof(event.data[1] == \"function\")) {\r\n                let param = typeof(event.data[2]) == \"object\" ? event.data[2].join() : event.data[2];\r\n                let returnvalue = eval(event.data[1])(param);\r\n\r\n                setVar(event.data[1],returnvalue);\r\n            }\r\n            \r\n        }\r\n    })\r\n}\r\n\r\n\r\nCON.setVar = function(key,value) {\r\n    // console.log(\"setting \" + key + \" - \" + value);\r\n    CON.child.postMessage([\"setVar\", key, value],'*');\r\n}\r\n\r\nCON.setObject = function(key,ob) {\r\n    // console.log(\"setting object \" + key)+ \" - \" + ob;\r\n    CON.child.postMessage([\"setObject\", key, JSON.stringify(ob)],'*');\r\n}\r\n\r\nCON.getVar = function(varname) {\r\n    return new Promise(function(resolve,reject) {\r\n        CON.child.postMessage([\"getVar\", varname],'*');\r\n        CON.resolver[varname] = function() { resolve(varname) }\r\n    })   \r\n}\r\n\r\nCON.callfunction = function(remotefunction,param) {\r\n    return new Promise(function(resolve,reject) {\r\n        CON.child.postMessage([\"callfunction\", remotefunction, param],'*');\r\n        CON.resolver[remotefunction] = function(returnvalue) { resolve(returnvalue) }\r\n    }) \r\n}\r\n\r\n\n\n//# sourceURL=webpack://lxn-online/./src/connector.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/connector.js"]();
/******/ 	
/******/ })()
;