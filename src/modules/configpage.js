

export class Configpanel  {

    constructor(ui,aircraft) {
        this.ui = ui;
        this.aircraft = aircraft;
        this.init()
    }

    init() {
        let config = this;
        let unitprefs = localStorage.getItem("unitprefs");
        
        if(unitprefs == "imperial" || unitprefs == "metric") {
            config.setUnitprefs(unitprefs);
        }

        document.getElementById('configpageswitch').addEventListener("click", (e) => {
            if(this.ui.activepanel == "configpage") {
                this.ui.closePanels();
                e.target.classList.remove("active");
            } else {
                this.ui.openPanel('configpage');
                document.querySelectorAll(".panels button").forEach((el) => { el.classList.remove("active") });
                e.target.classList.add("active");
            }
        })

        document.querySelectorAll(".lxconfigbtn").forEach((el)=> {
            el.addEventListener("click", function(e) {
                e.stopPropagation();
                let target = this.getAttribute("aria-controls");
                document.getElementById(target).classList.add("active");
            })
        });

        document.querySelectorAll(".configpanel_close").forEach((el)=> {
            el.addEventListener("click", function(e) {
                document.querySelectorAll(".configpanel").forEach((el)=>{
                    el.classList.remove("active");
                })
            })
        });

        document.getElementById("acselector").addEventListener("change", (e) => {
            V.atc_model = e.target.value;
        })

        this.aircraft.forEach((ac) => {
            let opt = document.createElement('option');
            opt.value = ac.atc_model;
            opt.innerText = ac.name;
            document.getElementById("acselector").appendChild(opt);
        })

        document.getElementById("conf_units_imperial").addEventListener("click", function(e) {
            config.setUnitprefs("imperial");
        })
    
        document.getElementById("conf_units_metric").addEventListener("click", function(e) {
            config.setUnitprefs("metric");
        })
    }

    setUnitprefs(unitpref) {
        for(var cat in V.units) {
            V.units[cat].pref = V.units[cat][unitpref];
        }

        if(unitpref == "imperial") {
            document.getElementById("conf_units_imperial").classList.add("highlighted");
            document.getElementById("conf_units_metric").classList.remove("highlighted");
            localStorage.setItem("unitprefs","imperial");
        } else {
            document.getElementById("conf_units_metric").classList.add("highlighted");
            document.getElementById("conf_units_imperial").classList.remove("highlighted");
            localStorage.setItem("unitprefs","metric");
        }
    }
}