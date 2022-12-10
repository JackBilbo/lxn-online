import { Geo } from './b21_soaring_engine.js';

export class Navpage {
    constructor(ui) {
        this.ui = ui;
        V.markpoints = [];
        this.markpointlist = document.getElementById("markpointlist").querySelector("tbody");

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
            }
        })

        this.markpointlist.addEventListener("click", (e) => {
            console.log(e.target);
            let idx = e.target.parentNode.getAttribute("data-markpoint");
            V.markpoints[idx].isActive = true;
            B21_SOARING_ENGINE.task.load({ waypoints: [V.markpoints[idx]] });
        })
    }

    update() {
        
        if(V.isConnected && !this.startpointset) {
            V.markpoints.push({
                ident: "Startposition",
                isActive: false,
                lla: {
                    lat: V.lat.getrawvalue(),
                    long: V.lng.getrawvalue(),
                    alt: V.alt.getrawvalue()
                }
            })
            this.startpointset = true;

            
        }

        if(this.ui.activepanel == "navpage") {
            this.updateMarkpoints();
            this.buildmarkpointlist();
        }

    }

    buildmarkpointlist() {
        this.markpointlist.innerHTML = "";
        V.markpoints.forEach((mp,index) => {
            let listpoint = document.createElement('tr');
            let distance = V.display(mp.distance_m / 1000, 'km', 'dist');
            
            listpoint.innerHTML = '<td class="mp_name">' + mp.ident + '</td><td class="mp_dist">' + distance + ' ' + V.units.dist.pref + '</td><td class="mp_arr">' + V.display((mp.arrival_height_msl_m - mp.lla.alt),'m','alt') + ' ' + V.units.alt.pref + '</td>';
            listpoint.setAttribute("data-markpoint", index);
            if(mp.isActive == true) { listpoint.setAttribute('class','active'); }
            this.markpointlist.append(listpoint);
        });
  
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
        }    


    }
}