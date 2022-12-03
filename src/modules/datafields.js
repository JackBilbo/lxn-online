import { vars, units } from './vars.js'

document.querySelectorAll(".datafield").forEach((el) => {
    el.addEventListener("click", (e) => {
        openDatafieldeditor(el)
    })
})

document.getElementById('savedataflield').addEventListener("click", (e) => {
    saveDataField();
})

document.getElementById('source').addEventListener("change", (e) => {
    let selvar = e.target.value;
    document.getElementById('conditionsource').value = selvar;
    buildUnitSelect(selvar);
})






const openDatafieldeditor = function(datafield) {
    const editor = document.getElementById("datafieldeditor");
    let currentdata = datafield.getAttribute('data-display');

    // populate the form
    document.getElementById("source").innerHTML = "";
    document.getElementById("conditionsource").innerHTML = "";

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
        document.getElementById("conditionsource").appendChild(opt2);
    }

    buildUnitSelect(currentdata);

    editor.style.display = "block";
}

const buildUnitSelect = function(variable) {
    let available_units = units[vars[variable].category].options
    document.getElementById("unit").innerHTML = "<option value=''>Use global Preference</option>";

    available_units.forEach((u) => {
        let opt = document.createElement('option');
        opt.value = u;
        opt.innerText = u;
        document.getElementById("unit").appendChild(opt);
    })
}

const saveDataField = function() {
    const editor = document.getElementById("datafieldeditor");

    console.log("stuff happening here");

    editor.style.display = 'none';
}