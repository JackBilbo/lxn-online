import { b21_soaring_engine_class, Geo } from './b21_soaring_engine.js';

const GEO = new Geo;
B21_SOARING_ENGINE = new b21_soaring_engine_class();
B21_SOARING_ENGINE.init();

export class Taskhandler {
    constructor(ui) {
        this.ui = ui;
        this.task = "";
        this.init();
    }

    init() {
        let parent = this;

        document.getElementById('taskpageswitch').addEventListener("click", (e) => {
            if(this.ui.activepanel == "taskpage") {
                this.ui.closePanels();
                e.target.classList.remove("active");
            } else {
                this.ui.openPanel('taskpage');
                document.querySelectorAll(".panels button").forEach((el) => { el.classList.remove("active") });
                e.target.classList.add("active");
            }
        })

        document.getElementById('planupload').addEventListener("change", () => {
            parent.handleUpload(parent,document.getElementById('planupload').files);
        })
    }

    update() {
        if(B21_SOARING_ENGINE.task_active()) {
            if(!this.taskpage_built) { this.build_taskpage(); }
            
            if(this.ui.activepanel == "taskpage") {
                this.update_task_page();
            }

        }
    }

    update_task_page() {
        let taskheader = document.querySelector("#tasklist header"); 

        if(B21_SOARING_ENGINE.task_finished()) {
            taskheader.querySelector("h1").innerText = "Task finished";
            taskheader.querySelector(".task-state .task-timer .number").innerHTML =  V.display(B21_SOARING_ENGINE.task.finish_time_s - B21_SOARING_ENGINE.task.start_time_s,'s','time_of_day');
            taskheader.querySelector(".task-state .task-average .number").innerHTML = V.display(B21_SOARING_ENGINE.finish_speed_ms(),'ms','speed');           
        } else if (B21_SOARING_ENGINE.task_started()) {
            taskheader.querySelector("h1").innerText = "Task started";
            taskheader.querySelector(".task-state .task-timer .number").innerHTML = V.display(B21_SOARING_ENGINE.task_time_s(),'s','time_of_day');
        } else {
            taskheader.querySelector("h1").innerText = "Pre Start";
            taskheader.querySelector(".task-state .task-timer .number").innerHTML = V.display(B21_SOARING_ENGINE.task_time_s(),'s','time_of_day');
        }

        taskheader.querySelector(".task-state .task-totaldistance .number").innerHTML = V.display(B21_SOARING_ENGINE.task.distance_m(),'m','dist');
        taskheader.querySelector(".task-state .task-totaldistance .unit").innerHTML = V.units['dist']['pref'];
	    taskheader.querySelector(".task-state .task-distanceleft .number").innerHTML = (B21_SOARING_ENGINE.task.remaining_distance_m() / 1000).toFixed(0);
        taskheader.querySelector(".task-state .task-distanceleft .unit").innerHTML = V.units['dist']['pref'];        
        taskheader.querySelector(".task-state .task-arrivalheight .number").innerHTML = V.display(B21_SOARING_ENGINE.task.finish_wp().arrival_height_msl_m - (B21_SOARING_ENGINE.task.finish_wp().min_alt_m != null? B21_SOARING_ENGINE.task.finish_wp().min_alt_m : B21_SOARING_ENGINE.task.finish_wp().alt_m),'m','alt'); 
        taskheader.querySelector(".task-state .task-arrivalheight .unit").innerHTML = V.units['alt']['pref'];

        if(B21_SOARING_ENGINE.task.finish_wp().arrival_height_msl_m -  (B21_SOARING_ENGINE.task.finish_wp().min_alt_m != null? B21_SOARING_ENGINE.task.finish_wp().min_alt_m : B21_SOARING_ENGINE.task.finish_wp().alt_m) > 0) {
            taskheader.querySelector(".task-state .task-arrivalheight").classList.add("finishalt_ok");
        } else {
            taskheader.querySelector(".task-state .task-arrivalheight").classList.remove("finishalt_ok");
        } 

        if(B21_SOARING_ENGINE.task_started()) {
            document.getElementById("tasklist").setAttribute("class","task_started hasScrollbars");
        } 
        
        if (B21_SOARING_ENGINE.task_finished()) {
            document.getElementById("tasklist").setAttribute("class","task_finished hasScrollbars");
        }



        for (let wp_index=0; wp_index<B21_SOARING_ENGINE.task_length(); wp_index++) {
            let wp_el = document.getElementById("wp_" + wp_index);
            let wp = B21_SOARING_ENGINE.task.waypoints[wp_index];

            if (wp_index == B21_SOARING_ENGINE.task_index()) {
                wp_el.classList.add("iscurrentwp")
            } else {
                wp_el.classList.remove("iscurrentwp")
            }

            if(wp_index >= B21_SOARING_ENGINE.task.start_index && wp_index <= B21_SOARING_ENGINE.task.finish_index) {
                if (wp.leg_is_completed) {
                    if(!wp_el.classList.contains("wp-ok")) {
                        document.getElementById("waypoints").appendChild(wp_el);
                        wp_el.classList.add("wp-ok");
                    }
                }
            
                wp_el.querySelector(".wp-name").innerHTML = wp.name + " (" + wp.alt_m.toFixed(0) + "m)"; 
                wp_el.querySelector(".bearing .number").innerHTML = wp.leg_bearing_deg.toFixed(0);
                
                if(wp_index == B21_SOARING_ENGINE.task_index()) {
                    wp_el.querySelector(".dist .number").innerHTML = V.display(B21_SOARING_ENGINE.current_wp().distance_m,'m','dist');
                } else {
                    wp_el.querySelector(".dist .number").innerHTML = V.display(wp.leg_distance_m,'m','dist');
                }
                
                wp_el.querySelector(".dist .unit").innerHTML = V.units['dist']['pref'];
                wp_el.querySelector(".ete .number").innerHTML = (wp.ete_s / 60).toFixed(0);
                wp_el.querySelector(".ete .unit").innerHTML = "min";
                wp_el.querySelector(".wind .number").innerHTML = V.display(wp.tailwind_ms,'ms','windspeed');
                wp_el.querySelector(".wind .unit").innerHTML = V.units['windspeed']['pref'];
                wp_el.querySelector(".arr_msl .number").innerHTML = V.display(wp.arrival_height_msl_m,'m','alt');
                wp_el.querySelector(".arr_msl .unit").innerHTML = V.units['alt']['pref'];
		        wp_el.querySelector(".arr_agl .number").innerHTML = V.display(wp.arrival_height_msl_m - (wp.min_alt_m != null? wp.min_alt_m : wp.alt_m),'m','alt');
                wp_el.querySelector(".arr_agl .unit").innerHTML = V.units['alt']['pref'];    

		        if( wp.arrival_height_msl_m - (wp.min_alt_m != null? wp.min_alt_m : wp.alt_m) < 0 ) { 
                    wp_el.querySelector(".arr_agl").classList.add("alert") 
                } else { 
                    wp_el.querySelector(".arr_agl").classList.remove("alert")
                }   
		    
                if(wp.min_alt_m != null) {
                    wp_el.querySelector(".wp-min").innerHTML = "Min: " + wp.min_alt_m.toFixed(0) + "m";
                        
                    if( wp.arrival_height_msl_m < wp.min_alt_m ) { 
                        wp_el.querySelector(".arr_msl").classList.add("alert");
                        wp_el.querySelector(".wp-min").classList.add("alert");
                    } else { 
                        wp_el.querySelector(".arr_msl").classList.remove("alert");	
                        wp_el.querySelector(".wp-min").classList.remove("alert");
                    }
                }
		
                if(wp.max_alt_m != null) {
                    wp_el.querySelector(".wp-max").innerHTML = "Max: " + wp.max_alt_m.toFixed(0) + "m";
                        
                    if( wp.arrival_height_msl_m > wp.max_alt_m ) { 
                        wp_el.querySelector(".arr_msl").classList.add("alert");
                        wp_el.querySelector(".wp-max").classList.add("alert");
                    } else { 
                        wp_el.querySelector(".arr_msl").classList.remove("alert")
                        wp_el.querySelector(".wp-max").classList.remove("alert");
                    }
                }	    

            } else {
                wp_el.style.display = "none";
            } 
        }  
    }

    handleUpload(parent,upload) {
        let reader = new FileReader();
        reader.addEventListener("load", (e) => {
                parent.parsePlan(parent, Date.now(), e.target.result, upload[0].name);
        });
        reader.addEventListener('error', (e) => {
            alert('Error : Failed to read file');
        });
        reader.readAsArrayBuffer(upload[0]);
    }

    parsePlan(parent,now,upload, filename) {
        let decoder = new TextDecoder();
        let plan = decoder.decode(upload);
        let flightplandata = {
            waypoints: []
        };

        const parser = new DOMParser();
        const dom = parser.parseFromString(plan, "application/xml");

        console.log(dom);

        let dom_waypoints = dom.getElementsByTagName("ATCWaypoint"); //XMLNodeList
        for (let i = 0; i < dom_waypoints.length; i++) {
            let dom_wp = dom_waypoints[i];

            let name = dom_wp.getAttribute("id");
            console.log("New WP from dom:", name);
            if (name == "TIMECRUIS" || name == "TIMECLIMB" || name == "TIMEVERT") {
                // Skip this waypoint, & tell the caller (Task) via an exception
                throw "SKIP_WAYPOINT";
            }
            console.log("New WP from dom OK:", name);
            // <WorldPosition>N40° 40' 38.62",W77° 37' 36.71",+000813.00</WorldPosition>
            let world_position = dom_wp.getElementsByTagName("WorldPosition")[0].childNodes[0].nodeValue;
            let world_pos_elements = world_position.split(","); // lat, lng, alt
            let lat_elements = world_pos_elements[0].split(" ");
            let lat = parseInt(lat_elements[0].slice(1)) + parseFloat(lat_elements[1]) / 60 + parseFloat(lat_elements[2]) / 3600;
            lat = lat_elements[0][0] == "N" ? lat : -1 * lat;
            let lng_elements = world_pos_elements[1].split(" ");
            let lng = parseInt(lng_elements[0].slice(1)) + parseFloat(lng_elements[1]) / 60 + parseFloat(lng_elements[2]) / 3600;
            lng = lng_elements[0][0] == "E" ? lng : -1 * lng;

            let alt = parseFloat(world_pos_elements[2])

            flightplandata.waypoints.push({ident: name, lla: { lat: lat, long: lng, alt: alt }})
        }

        B21_SOARING_ENGINE.task.load(flightplandata);
        this.taskpage_built = false;

        let fprequest = {
            command: 'vars.write',
            name: 'Lvars',
            vars: [
                { name: 'LXN_Flightplan', value: "TESTTESTTEST" }
            ],
            allowCreate: true
        }
        if(WS) {
            WS.send(JSON.stringify(fprequest));
        }
        

    }

    build_taskpage() {
        let template = document.getElementById("wp-template");
        let templateContent = template.innerHTML;
        let check = 1;
        let waypointcontainer = document.getElementById("waypoints");
        waypointcontainer.innerHTML = "";
        
        for (let wp_index=0; wp_index<B21_SOARING_ENGINE.task_length(); wp_index++) {
            let wp_el = template.cloneNode();
            wp_el.innerHTML = templateContent;
            wp_el.setAttribute("id","wp_" + wp_index);
		
            waypointcontainer.appendChild(wp_el);
            check++;
        }
        console.log("Task page built. Number of WP: " + check);
        this.taskpage_built = true;
    }
}
