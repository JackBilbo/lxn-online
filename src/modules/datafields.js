import { vars, units } from './vars.js';
import { GridStack } from 'gridstack';

var editedDatafield;
var editmode = false;
var datafields = [
    { w:3, h:2, content: '<div class="datafield" data-config=\'{\"display\": \"windspeed\", \"textcolor\": \"#ffffff\", \"background\":\"#000000\", \"opacity\":\"0.5\"}\'><span class="label">Wind</span><span class="value"><span class="number"></span><span class="unit"></span></span></div>' },
    { w:3, h:2, content: '<div class="datafield" data-config=\'{\"display\": \"ias\", \"textcolor\": \"#ffffff\", \"background\":\"#000000\", \"opacity\":\"0.5\"}\'><span class="label">IAS</span><span class="value"><span class="number"></span><span class="unit"></span></span></div>'},
    { w:3, h:2, content: '<div class="datafield" data-config=\'{\"display\": \"alt\", \"textcolor\": \"#ffffff\", \"background\":\"#000000\", \"opacity\":\"0.5\"}\'><span class="label">ALT</span><span class="value"><span class="number"></span><span class="unit"></span></span></div>'},
    { w:3, h:2, content: '<div class="datafield" data-config=\'{\"display\": \"wp_arr_agl\", \"textcolor\": \"#ffffff\", \"background\":\"#000000\", \"opacity\":\"0.5\"}\'><span class="label">WP ARR (AGL)</span><span class="value"><span class="number"></span><span class="unit"></span></span></div>'}

]

var grid = GridStack.init({
    float: true,
    margin: 0,
    disableOneColumnMode: true,
    cellHeight: '50px',
    removable: '#trash'
});

if(localStorage.getItem("gridlayout")) {
    let savedlayout = JSON.parse(localStorage.getItem("gridlayout"))
    try {
        grid.load(savedlayout); 
        D.log("Layout loaded from storage.")
    } catch(e) {
        console.error(e);
        grid.load(datafields);
        D.log("Loading layout failed. Using default. Please 'reset' your layout");
    } 
} else {
    grid.load(datafields);
    D.log("Default layout loaded.")
}

grid.on('resizestop', function(event, el) {
    let height = parseInt(el.getAttribute('gs-h')) * 50 || 0;
    // or all values...
    let node = el.gridstackNode; // {x, y, width, height, id, ....}
    if(height < 100) {
        el.querySelector(".datafield").classList.add("minimode");
        el.querySelector(".number").style.fontSize = "30px";
        el.querySelector(".number").style.lineHeight = "30px";
    } else {
        el.querySelector(".datafield").classList.remove("minimode");
        el.querySelector(".number").style.fontSize = height-50 + "px";
        el.querySelector(".number").style.lineHeight = height-50 + "px";
    }
});

document.querySelectorAll(".datafield").forEach((el) => {
    el.addEventListener("click", (e) => {
        if(editmode) {
            openDatafieldeditor(el)
        }        
    })
});

document.getElementById('editmodeswitch').addEventListener("click", (e) => {
    if(!editmode) {
        editmode = true;
        e.target.classList.add("active");
        document.body.classList.add("editmode");
        grid.setStatic(false);
    } else {
        editmode = false;
        document.body.classList.remove("editmode");
        e.target.classList.remove("active");
        grid.setStatic(true);
        saveLayout();
    }
})

document.getElementById('resetlayout').addEventListener("click", (e) => {
    resetLayout();
})

document.getElementById('newdatafield').addEventListener("click", (e) => {
    addDatafield();
})


document.getElementById('savedataflield').addEventListener("click", (e) => {
    saveDataField();
})

document.getElementById('canceleditor').addEventListener("click", (e) => {
    document.getElementById("datafieldeditor").style.display = "none";
})

document.getElementById('source').addEventListener("change", (e) => {
    let selvar = e.target.value;
    document.getElementById('conditionvar').value = selvar;
    buildUnitSelect(selvar);
})


const resetLayout = function() {
    grid.removeAll();
    grid.load(datafields);
    document.querySelectorAll(".datafield").forEach((el) => {
        el.addEventListener("click", (e) => {
            if(editmode) {
                openDatafieldeditor(el)
            }        
        })
    });
}

const saveLayout = function() {
    let datastring = grid.save();
    localStorage.setItem("gridlayout", JSON.stringify(datastring));
}

const addDatafield = function() {
    let newDatafield = grid.addWidget('<div class="grid-stack-item"><div class="grid-stack-item-content"><div class="datafield" data-config=\'{\"display\": \"alt\", \"textcolor\": \"#ffffff\", \"background\":\"#000000\", \"opacity\":\"0.5\"}\'><span class="label">ALT</span><span class="value"><span class="number"></span><span class="unit"></span></span></div></div></div>', {x: 4, y: 10, w: 4, h:2});
    let el = newDatafield.querySelector(".datafield");
    el.addEventListener("click", (e) => {
        if(editmode) {
            openDatafieldeditor(el)
        }        
    })
}


const openDatafieldeditor = function(datafield) {
    const editor = document.getElementById("datafieldeditor");
    editedDatafield = datafield;
    let currentconfig = JSON.parse(datafield.getAttribute('data-config'));

    // populate the form
    document.getElementById("source").innerHTML = "";
    document.getElementById("conditionvar").innerHTML = "";

    for (let v in vars) {
        let opt = document.createElement('option');
        opt.value = v;
        opt.innerText = vars[v].longlabel;
        if(currentconfig.display == v) {
            opt.setAttribute("selected","selected");
        }

        document.getElementById("source").appendChild(opt);
        let opt2 = opt.cloneNode();
        opt2.innerText = vars[v].longlabel;
        document.getElementById("conditionvar").appendChild(opt2);
    }

    editor.style.display = "block";
    document.getElementById("textcolor").value = currentconfig.textcolor;
    document.getElementById("bgcolor").value = currentconfig.background;
    document.getElementById("opacity").value = parseFloat(currentconfig.opacity);
    document.getElementById("condbgcolor").value = currentconfig.condbgcolor;
    document.getElementById("conditionvar").value = currentconfig.conditionvar;
    document.getElementById("forceunit").value = currentconfig.forceunit;


    buildUnitSelect(currentconfig.display);
    
}

const buildUnitSelect = function(variable) {
    let available_units = units[vars[variable].category].options
    document.getElementById("forceunit").innerHTML = "<option value=''>Use global Preference</option>";

    available_units.forEach((u) => {
        let opt = document.createElement('option');
        opt.value = u;
        opt.innerText = u;
        document.getElementById("forceunit").appendChild(opt);
    })
}

const saveDataField = function() {
    const editor = document.getElementById("datafieldeditor");
    let newconfig = {}

    newconfig.display = document.getElementById("source").value;

    editedDatafield.querySelector(".label").innerText = vars[document.getElementById("source").value].label;

    newconfig.textcolor = document.getElementById("textcolor").value;
    editedDatafield.style.color = document.getElementById("textcolor").value;

    let backgroundcolor = document.getElementById("bgcolor").value;
    let backgroundOpacity = document.getElementById("opacity").value;

    let r = parseInt(backgroundcolor.substr(1,2), 16)
    let g = parseInt(backgroundcolor.substr(3,2), 16)
    let b = parseInt(backgroundcolor.substr(5,2), 16)

    newconfig.background = document.getElementById("bgcolor").value;
    editedDatafield.style.background = "rgba(" + r + "," + g + "," + b + "," + backgroundOpacity +")";

    newconfig.condbgcolor = document.getElementById("condbgcolor").value;
    newconfig.opacity =  backgroundOpacity;
    newconfig.conditionvar = document.getElementById("conditionvar").value;
    newconfig.conditionvalue = document.getElementById("conditionvalue").value;
    newconfig.forceunit = document.getElementById("forceunit").value;

    editedDatafield.setAttribute("data-config", JSON.stringify(newconfig));


    editor.style.display = 'none';
}



