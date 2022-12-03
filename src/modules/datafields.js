import { vars, units } from './vars.js';
import { GridStack } from 'gridstack';

var editedDatafield;
var editmode = false;
var datafields = [
    { w:3, h:2, content: '<div class="datafield" data-display="windspeed" data-textcolor="#ffffff" data-background="#000000" data-opacity="0.5" data-color="#ffffff"><span class="label">Wind</span><span class="value"><span class="number"></span><span class="unit"></span></span></div>' },
    { w:3, h:2, content: '<div class="datafield" data-display="ias" data-textcolor="#ffffff" data-background="#000000" data-opacity="0.5" data-color="#ffffff"><span class="label">IAS</span><span class="value"><span class="number"></span><span class="unit"></span></span></div>'},
    { w:3, h:2, content: '<div class="datafield" data-display="alt" data-textcolor="#ffffff" data-background="#000000" data-opacity="0.5" data-color="#ffffff"><span class="label">ALT</span><span class="value"><span class="number"></span><span class="unit"></span></span></div>'},
    { w:3, h:2, content: '<div class="datafield" data-display="wp_arr_agl" data-textcolor="#ffffff" data-background="#000000" data-opacity="0.5" data-color="#ffffff"><span class="label">WP ARR (AGL)</span><span class="value"><span class="number"></span><span class="unit"></span></span></div>'}

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
    } catch(e) {
        console.error(e);
        grid.load(datafields);
    } 
} else {
    grid.load(datafields);
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
    }
})

document.getElementById('resetlayout').addEventListener("click", (e) => {
    resetLayout();
})

document.getElementById('newdatafield').addEventListener("click", (e) => {
    addDatafield();
})

document.getElementById('savelayout').addEventListener("click", (e) => {
    saveLayout();
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
    alert("Layout saved");
}

const addDatafield = function() {
    let newDatafield = grid.addWidget('<div class="grid-stack-item"><div class="grid-stack-item-content"><div class="datafield" data-display="alt" data-textcolor="#ffffff" data-background="#000000" data-opacity="0.5" data-color="#ffffff"><span class="label"></span><span class="value"><span class="number"></span><span class="unit"></span></span></div></div></div>', {x: 4, y: 10, w: 4, h:2});
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
    let currentdata = datafield.getAttribute('data-display');

    // populate the form
    document.getElementById("source").innerHTML = "";
    document.getElementById("conditionvar").innerHTML = "";

    for (let v in vars) {
        let opt = document.createElement('option');
        opt.value = v;
        opt.innerText = vars[v].longlabel;
        if(currentdata == v) {
            opt.setAttribute("selected","selected");
        }

        document.getElementById("source").appendChild(opt);
        let opt2 = opt.cloneNode();
        opt2.innerText = vars[v].longlabel;
        document.getElementById("conditionvar").appendChild(opt2);
    }

    editor.style.display = "block";
    document.getElementById("textcolor").value = datafield.getAttribute('data-textcolor');
    document.getElementById("bgcolor").value = datafield.getAttribute('data-background');
    document.getElementById("opacity").value = parseFloat(datafield.getAttribute('data-opacity'));
    document.getElementById("condbgcolor").value = datafield.getAttribute('data-condbgcolor');
    document.getElementById("conditionvar").value = datafield.getAttribute('data-conditionvar');
    document.getElementById("forceunit").value = datafield.getAttribute('data-forceunit');


    buildUnitSelect(currentdata);

    
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
    editedDatafield.setAttribute("data-display",document.getElementById("source").value);

    editedDatafield.querySelector(".label").innerText = vars[document.getElementById("source").value].label;

    editedDatafield.setAttribute('data-textcolor', document.getElementById("textcolor").value);
    editedDatafield.style.color = document.getElementById("textcolor").value;

    let backgroundcolor = document.getElementById("bgcolor").value;
    let backgroundOpacity = document.getElementById("opacity").value;

    let r = parseInt(backgroundcolor.substr(1,2), 16)
    let g = parseInt(backgroundcolor.substr(3,2), 16)
    let b = parseInt(backgroundcolor.substr(5,2), 16)

    editedDatafield.setAttribute("data-background", document.getElementById("bgcolor").value);
    editedDatafield.style.background = "rgba(" + r + "," + g + "," + b + "," + backgroundOpacity +")";

    editedDatafield.setAttribute('data-condbgcolor', document.getElementById("condbgcolor").value);
    editedDatafield.setAttribute('data-opacity', backgroundOpacity);
    editedDatafield.setAttribute('data-conditionvar', document.getElementById("conditionvar").value);
    editedDatafield.setAttribute('data-conditionvalue', document.getElementById("conditionvalue").value);
    editedDatafield.setAttribute('data-forceunit', document.getElementById("forceunit").value);



    editor.style.display = 'none';
}



