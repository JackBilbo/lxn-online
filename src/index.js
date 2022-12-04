import './styles.scss';
import { vars,VAR,keybindstates,aircraft,units } from './modules/vars';
import { initWS } from './modules/connection.js';
import { handleKeybinds } from './modules/keybinds.js';
import { Hawk } from './modules/hawk.js';
import { Taskhandler } from './modules/taskpage.js';
import { Interface } from './modules/interface.js';
import { Configpanel } from './modules/configpage.js';
import { msg } from './modules/modalmessages.js';
import './modules/datafields.js';

var allvars = []
var current_aircraft = {}
V.sim_time_s = 0;
V.sim_time_delta = 0;
V.isPaused = 1;
V.localtime_h = 0;
V.localtime_m = 0;
V.localtime_s = 0;
V.te = { v: 0, h: 0, t: 0, te: 0}

V.units = units;

for(let v in vars) {
    V[v] = new VAR(vars[v].value,vars[v].label,vars[v].longlabel,vars[v].category,vars[v].baseunit);
    allvars.push(V[v]);
}

initWS(vars,keybindstates);

if(webGLavailable) {
    import('./modules/navmap_gl.js').then((e) => {
    })
} else {
    // todo Non-GL Fallback for Map
}


const ui = new Interface();
const hawk = new Hawk( 'rotate' );
const taskpage = new Taskhandler(ui);
const configpage = new Configpanel(ui,aircraft);

// ui.showModal(null,msg.loading);

const heartbeat100 = window.setInterval(update100, 100);
const heartbeat200 = window.setInterval(update200, 200);

function update100() {
    NAVMAP.update();
    hawk.update();
    update_sim_time();
}

function update200() {
    if(V.atc_model && V.atc_model != current_aircraft.atc_model) {
        current_aircraft = {};
        aircraft.forEach((ac) => {
            if(V.atc_model == ac.atc_model) {  
                current_aircraft = ac;
                calc_polar();
                document.getElementById("acselector").value = ac.atc_model;
                document.getElementById("selected_aircraft").innerText = "Aircraft: " + current_aircraft.name;
            }
        })
        if(!current_aircraft.name) {
            document.getElementById("selected_aircraft").innerText = "Aircraft unrecognized. Please select manually.";
        }
    }

    if(current_aircraft.atc_model) { 
        update_stf();
        V.ballast.set(V.totalweight.display('lbs') - current_aircraft.reference_weight_lbs,'lbs');
    }

    if(B21_SOARING_ENGINE.task_active()) {   B21_SOARING_ENGINE.Update();  }
    V.localtime.set((V.localtime_h * 3600 + V.localtime_m * 60 + V.localtime_s));

    V.current_polar_sink.set(getPolarSink_kts(V.display(V.ias.getrawvalue(),'kmh','speed','imperial')),'kts');
    V.total_energy.set(getTotalEnergy(),'ms');
    V.current_netto.set(V.total_energy.getrawvalue() + Math.abs(V.current_polar_sink.getrawvalue()));
    V.smoothed_netto.set( (V.smoothed_netto.getrawvalue() * 0.9) + (V.current_netto.getrawvalue() * 0.1)  )

    document.querySelectorAll(".datafield").forEach((el) => {
        let conf = JSON.parse(el.getAttribute("data-config"));
        if(conf.conditionvar != null && conf.conditionvar != '') {
            let newcolor;

            if(parseFloat(V[conf.conditionvar].display()) <= conf.conditionvalue) {
                newcolor = conf.condbgcolor;
            } else {
                newcolor = conf.background;
            }

            let r = parseInt(newcolor.substr(1,2), 16)
            let g = parseInt(newcolor.substr(3,2), 16)
            let b = parseInt(newcolor.substr(5,2), 16)

            el.style.background = "rgba(" + r + "," + g + "," + b + "," + conf.opacity +")";
        }

        
        el.querySelector(".number").innerText = V[conf.display].display();
        el.querySelector(".unit").innerText = V[conf.display].unit();
    })  
    
    taskpage.update();
}

function update_sim_time() {
    let now = new Date().getTime();
    let diff = now - V.sim_time_delta;
    if(V.isPaused == 0) {
        V.sim_time_s += diff / 1000;
    }
    V.sim_time_delta = now;
}

function calc_polar() {

    let c4 = current_aircraft.minimum_sink.speed_kts;
    let d4 = current_aircraft.minimum_sink.sink_kts;

    // Speed and sink in knots at best glide
    let c5 = current_aircraft.best_glide.speed_kts;
    let d5 = current_aircraft.best_glide.sink_kts;

    // Speed and sink in knots at "fast speed" - around 92kts/170kmh
    let c6 = current_aircraft.fast.speed_kts;
    let d6 = current_aircraft.fast.sink_kts;

    let atop = (c6-c5) * (d4-d5) + (c5-c4) * (d6-d5);
    let abottom = c4 * c4 * (c6 -c5) + c6 * c6 * (c5-c4) + c5 * c5 * (c4-c6);
    current_aircraft.a = atop/abottom;

    let btop = d6 - d5 - current_aircraft.a * (c6 * c6 - c5 * c5);
    let bbottom = c6 - c5;

    current_aircraft.b = btop/bbottom;

    current_aircraft.c = d5 - current_aircraft.a * c5 * c5 - current_aircraft.b * c5;
}

function update_stf() {
    let bugs = 100;
    
    // let ballast = V.ballast.display('lbs');
    // let wf = Math.sqrt(eval(current_aircraft.reference_weight_lbs + parseFloat(ballast)) / current_aircraft.reference_weight_lbs);
    let wf = Math.sqrt(V.totalweight.display('lbs') / current_aircraft.reference_weight_lbs );

    let aa = current_aircraft.a / wf * 100 / bugs;
    let bb = current_aircraft.b * 100 / bugs;
    let cc = current_aircraft.c * wf * 100 / bugs;
    
    let mccready = V.maccready.display('kts');
   
    // temporarily shift mccready to give higher speed in netto sink and slower in climbs. Does that make sense??
    // this.jbb_smoothed_netto = (this.jbb_smoothed_netto * 0.9) + (SimVar.GetSimVarValue("L:NETTO", "meters per second").toFixed(2) * 0.1);
    // let mccready_shifted = mccready - this.vars.current_netto.value;
    // if (mccready_shifted < 0) { mccready_shifted = 0; }

    let stf = Math.sqrt((cc - mccready) / aa);

    V.sink_stf.set((aa * stf * stf) + (bb * stf) + cc, 'kts');
    V.stf.set(stf, 'kts');
}

function getPolarSink_kts(spd) {
    let bugs = 100;
    let wf = Math.sqrt(V.totalweight.display('lbs') / current_aircraft.reference_weight_lbs );

    let aa = current_aircraft.a / wf * 100 / bugs;
    let bb = current_aircraft.b * 100 / bugs;
    let cc = current_aircraft.c * wf * 100 / bugs;

    return (aa * spd * spd) + (bb * spd) + cc;
}

function getTotalEnergy() {
    let now = new Date().getTime();
    let h = V.alt.getrawvalue();
    let v = V.ias.getrawvalue() / 3.6; 
    let t = (now - V.te.t) / 1000;

    let te = ( (h - V.te.h) + (Math.pow(v,2) - Math.pow(V.te.v,2)) / (2 * 9.81) )  / t;

    V.te.te = (V.te.te * 0.9) + (te * 0.1);

    V.te.h = h;
    V.te.v = v;
    V.te.t = now;

    return V.te.te;
}

function webGLavailable () {
    // Create canvas element. The canvas is not added to the
    // document itself, so it is never displayed in the
    // browser window.
    const canvas = document.createElement("canvas");

    // Get WebGLRenderingContext from canvas element.
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

    // Report the result.
    return gl instanceof WebGLRenderingContext
      ? true
      : false;
  }


