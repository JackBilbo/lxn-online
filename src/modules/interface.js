
export class Interface {

    constructor() {
        this.selectedunits = 'metric';
    
        this.init();
    }

    init() {
        this.activepanel = ""
        let ui = this;

        document.querySelector("#wp_next").addEventListener("click", (e) => {
            if(B21_SOARING_ENGINE.task_index() < B21_SOARING_ENGINE.task_length() -1 ) {
                B21_SOARING_ENGINE.change_wp(1);
            }
        })

        document.querySelector("#prev_wp").addEventListener("click", (e) => {
            if(B21_SOARING_ENGINE.task_index() > 0) {
                B21_SOARING_ENGINE.change_wp(-1);
            }
        })

        document.querySelector("#mcslider").value = V.maccready.display();
        document.querySelector("#mcslider").addEventListener("input", (e) => {
            V.maccready.set(e.target.value);
            document.querySelector("#maccready span").innerText = parseFloat(e.target.value).toFixed(1);
        })

        document.getElementById("closemodal").addEventListener("click",(e) => {
            ui.closeModal()
        })

        document.getElementById("mapmenu").addEventListener("click", (e) => { document.querySelector(".buttons.mapbuttons").classList.toggle("active"); })
        document.getElementById("pagemenu").addEventListener("click", (e) => { document.querySelector(".buttons.panels").classList.toggle("active"); })

    }
    update() {

    }


    openPanel(id) {
        document.querySelectorAll(".panel").forEach((el) => { el.style.display = "none"; })
        document.getElementsByTagName("main")[0].classList.add("showpanels");
        document.getElementsByTagName("aside")[0].classList.add("showpanels");
        document.getElementById(id).style.display = "block";
        this.activepanel = id;
        window.setTimeout(() => {NAVMAP.map.resize() },250);
    }

    closePanels() {
        document.getElementsByTagName("main")[0].classList.remove("showpanels");
        document.getElementsByTagName("aside")[0].classList.remove("showpanels");
        document.querySelectorAll(".panel").forEach((el) => { el.style.display = "none"; })
        this.activepanel = ""; 
        window.setTimeout(() => {NAVMAP.map.resize() },250);
    }

    popalert(headline,text,dur,col) {
        let d = dur != null ? dur : 5;
        let c = col != null ? col : "#ff0000";
        let pop = document.getElementById("alert");
        pop.querySelector("h2").innerHTML = headline;
        pop.querySelector("p").innerHTML = text;
        pop.style.backgroundColor = c;

        pop.style.display = "block";
        window.setTimeout(function() { pop.style.display = "none"; }, d * 1000);
        
    }

    showModal(id, content, buttontext = 'Got it') {
        let messageid = id; // avoid multiple messages later 
        let modalcontainer = document.getElementById("modal");
        modalcontainer.querySelector("h1").innerText = content.headline;
        modalcontainer.querySelector("section").innerHTML = content.text;
        modalcontainer.querySelector("button").innerText = buttontext;
        modalcontainer.style.display = "block";
    }

    closeModal() {
        let modalcontainer = document.getElementById("modal");
        modalcontainer.style.display = "none";
    }
}
