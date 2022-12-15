import { Geo } from './b21_soaring_engine.js';
import { msg } from './modalmessages.js';

export class Navpage {
    constructor(ui) {
        this.ui = ui;
        V.markpoints = [];
        this.markpointlist = document.getElementById("markpointlist").querySelector("tbody");
        this.modalshown = false;

        this.init();
    }

    init() {

        document.getElementById('navpageswitch').addEventListener("click", (e) => {
            if(this.ui.activepanel == "navpage") {
                this.ui.closePanels();
                e.target.classList.remove("active");
            } else {
                this.ui.openPanel('navpage');
                document.querySelectorAll(".panels button").forEach((el) => { el.classList.remove("active") });
                e.target.classList.add("active");

                if(!this.modalshown) {
                    this.ui.showModal(null,msg.nav);
                    this.modalshown = true;
                }
                
            }
        })

        this.markpointlist.addEventListener("click", (e) => {
            if(e.target.classList.contains("rem-markpoint")) {
                this.removeMarkpoint(e.target);
            } else {
                this.selectMarkpoint(e.target);
            }
        })

        document.getElementById("save_markpoints").addEventListener("click", (e) => {
            this.save_markpoints();
        })

        document.getElementById('load_markpoints').addEventListener("change", () => {
            this.handleUpload(document.getElementById('load_markpoints').files);
        })
    }

    update() {

        if(this.markpointcount != V.markpoints.length) {
            this.buildmarkpointlist();
            this.markpointcount = V.markpoints.length;
        }

        if(this.ui.activepanel == "navpage") {
            this.updateMarkpoints();
        }

        
    }

    selectMarkpoint(el) {
        let idx = el.getAttribute("data-markpoint");

        if(!V.markpoints[idx].isActive) {
            V.markpoints.forEach((mp) => { mp.isActive = false; })
            V.markpoints[idx].isActive = true;
            document.querySelectorAll("#markpointlist tbody tr").forEach((row) => {
                row.classList.remove("active");
            })
            el.parentNode.classList.add("active");
            B21_SOARING_ENGINE.task.load({ waypoints: [V.markpoints[idx]] });
            NAVMAP.paintmarkpoints();
        } else {
            V.markpoints[idx].isActive = false;
            el.parentNode.classList.remove("active");
            B21_SOARING_ENGINE.init_task_complete = null;
            B21_SOARING_ENGINE.init_task_load();
            NAVMAP.paintmarkpoints();
            NAVMAP.removecourseline();
        }
    }

    removeMarkpoint(el) {
            let idx = el.getAttribute("data-markpoint");
            V.markpoints.splice(idx,1);
            this.buildmarkpointlist();
            NAVMAP.paintmarkpoints();
    }

    buildmarkpointlist() {
        this.markpointlist.innerHTML = "";
        V.markpoints.forEach((mp,index) => {
            let listpoint = document.createElement('tr');
            listpoint.setAttribute("data-name", mp.ident);
            if(mp.isActive) { listpoint.setAttribute("class","active") }
            listpoint.innerHTML = '<td class="mp_name">' + mp.ident + '</td><td class="mp_dist"></td><td class="mp_arr"></td><a href="#" class="select-markpoint" data-markpoint="' + index + '"></a>';
            if(mp.isOwner) { listpoint.innerHTML += '<a href="#" class="rem-markpoint" data-markpoint="' + index + '">X</a>' }
            listpoint.setAttribute("data-markpoint", index);
            this.markpointlist.append(listpoint);

        });
        if(V.markpoints.length > 0) {
            NAVMAP.paintmarkpoints();
        }
        
    }

    updateMarkpoints() {
        let p1 = B21_SOARING_ENGINE.get_position();

        for (let wp_index = 0; wp_index < V.markpoints.length; wp_index++) {
            

            let wp = V.markpoints[wp_index];

            // *******************************************************************
            // Update bearing & distance to current WP
            // *******************************************************************

            wp.bearing_deg = Geo.get_bearing_deg(p1, wp.lla);

            wp.distance_m = Geo.get_distance_m(p1, wp.lla);

            // Delta is angle between wind and waypoint
            let delta_radians = Geo.DEG_TO_RAD(V.winddirection.display() - wp.bearing_deg - 180);

            // wind_x_mps is wind speed along line to waypoint (+ve is a tailwind)
            let wind_x_ms = Math.cos(delta_radians) * V.windspeed.display('ms');

            // wind_y_ms is wind speed perpendicular to line to waypoint (the sign is irrelevant)
            let wind_y_ms = Math.sin(delta_radians) *  V.windspeed.display('ms');

            // vmg also used for arrival height
            let velocity_made_good_ms;
            if ( V.stf.display('ms') <= Math.abs(wind_y_ms)) {
                velocity_made_good_ms = 1;
            } else {
                velocity_made_good_ms = wind_x_ms + Math.sqrt(Math.pow(V.stf.display('ms'), 2) - Math.pow(wind_y_ms,
                    2));
            }

            wp.tailwind_ms = velocity_made_good_ms - V.stf.display('ms'); // tailwind is +ve


            let time_to_wp_s;
            let height_needed_m;

            time_to_wp_s = wp.distance_m / velocity_made_good_ms;
            height_needed_m = time_to_wp_s * Math.abs(V.sink_stf.getrawvalue('ms')); // Sink is negative
            wp.arrival_height_msl_m = V.alt.display('m') - height_needed_m;

            wp.ete_s = time_to_wp_s;

            let mp_row = document.querySelector("tr[data-name='" + wp.ident + "']");
            mp_row.querySelector(".mp_dist").innerHTML = V.display(wp.distance_m,'m','dist') + ' ' + V.units.dist.pref;
            mp_row.querySelector(".mp_arr").innerHTML = V.display((wp.arrival_height_msl_m - wp.lla.alt),'m','alt') + ' ' + V.units.alt.pref
        }    


    }

    save_markpoints() {
        let now = new Date();
        let filename = "lxn_markpoints-" + (now.getMonth() + 1) + "-" + now.getDate() +  ".json";
        let text = JSON.stringify(V.markpoints);

        let element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    }

    handleUpload(upload) {
        let reader = new FileReader();
        reader.addEventListener("load", (e) => {
            let decoder = new TextDecoder();
            let rawfile = decoder.decode(e.target.result);
            try {
                let mp_collection = JSON.parse(rawfile);
                mp_collection.forEach((mp) => {
                    V.markpoints.push(mp);
                })
            } catch(e) {
                console.log("upload failed: " + e);
            }       
        });
        reader.addEventListener('error', (e) => {
            alert('Error : Failed to read file');
        });
        reader.readAsArrayBuffer(upload[0]);
    }
}