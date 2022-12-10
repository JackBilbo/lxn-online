import mapboxgl from 'mapbox-gl'; 

mapboxgl.accessToken = 'pk.eyJ1IjoiamFja2JpbGJvIiwiYSI6ImNsOGRoY2Z5bDBzNzczdXBoZDBhbGc1dm8ifQ.HzGoRkiWAznVnF7f5WLuaA';

class navmap {
    constructor() {
        this.islocked = false;
        this.isPlaneCentered = true;
        this.mapRotation = "trackup";

        this.TASK_LINE_WIDTH = 4;
        this.TASK_LINE_DASH_SIZE = 30;
        this.TASK_LINE_CURRENT_COLOR = "#FF9D1E";     // colors just for the current leg
        this.TASK_LINE_CURRENT_COLOR_ALT = "#44273F"; // darker orange?
        this.TASK_LINE_COLOR = "#C60AC6";       // for all task legs except current
        this.TASK_LINE_COLOR_ALT = "#C60AC6";

        this.WAYPOINT_CIRCLE_COLOR = "#FF9D1E";
        this.WAYPOINT_CIRCLE_COLOR_ALT = "#44273F";
        this.WAYPOINT_CIRCLE_WIDTH = 4;

        this.taskgeojson = {
            'type': 'FeatureCollection',
            'features': []
        };

        this.liftmarkertimer = 0;
        this.liftmarkerdelay = 3;
        this.liftmarkercount = 50;
        this.liftmarkerJson = {
            "type": "FeatureCollection",
            "features": []
        }
    }

    init() {
        this.buildMap();

        document.getElementById("mapcenter").addEventListener("click", () => {
            NAVMAP.isPlaneCentered = !NAVMAP.isPlaneCentered;
        })

        document.getElementById("maprotation").addEventListener("click", () => {
            NAVMAP.isPlaneCentered = true;
            NAVMAP.toggleMapRotation();
        })

    }

    update() {
        document.getElementById("rotate").style.transform = "rotate(" + (V.hdg.getrawvalue() - this.map.getBearing()) + "deg)";
        document.getElementById("tilt").style.transform = "rotate3D(1,0,0," + this.map.getPitch() + "deg)";
        document.getElementById("ac_trk").style.transform = "rotate(" + (V.trk.display() - V.hdg.display()) + "deg)"; 

        this.glider.setLngLat([ V.lng.getrawvalue(), V.lat.getrawvalue() ]);

        if(B21_SOARING_ENGINE.current_wp() != null) {
            this.updateCourseline();
        }
        
        if(this.taskgeojson.features.length > 0) {
            this.updateTaskline();
        }

        if(this.isPlaneCentered) {
            document.getElementById("mapcenter").classList.add("active");

            this.map.setCenter([ V.lng.getrawvalue(), V.lat.getrawvalue() ])
            this.isPlaneCentered = true;
            if(this.mapRotation == "northup") {
                this.map.setBearing(0);
                document.getElementById("Map").classList.remove("trackup");
            } else {
                this.map.setBearing(V.hdg.getrawvalue());
                document.getElementById("Map").classList.add("trackup");
            }
            this.isPlaneCentered = true;
        } else {
            document.getElementById("mapcenter").classList.remove("active");
        }

        if(V.sim_time_s - this.liftmarkertimer > this.liftmarkerdelay && V.ias.getrawvalue() > 40) {
            this.liftmarkertimer = V.sim_time_s;
            this.updateLiftMarkers();
        }
    }

    zoom_in() {
        // this.map.zoomIn();
        this.map.setZoom(this.map.getZoom() + 1)
    }

    zoom_out() {
        // this.map.zoomOut();
        this.map.setZoom(this.map.getZoom() - 1)
    }

    toggleMapRotation() {
        if(NAVMAP.mapRotation == "trackup") {
            NAVMAP.mapRotation = "northup";
            document.getElementById("maprotation").innerText = "Northup";
        } else {
            NAVMAP.mapRotation = "trackup";
            document.getElementById("maprotation").innerText = "Trackup";
        }
    }

    updateLiftMarkers() {
        let radius = Math.abs(V.smoothed_netto.display('kts')) * 2;
        let color = V.smoothed_netto.display('kts') >= 0 ? "#14852c" : "#cc0000";

        let newdot = {
            'type': 'Feature',
            'geometry': {
            'type': 'Point',
            'coordinates': [ V.lng.getrawvalue(), V.lat.getrawvalue() ]
            },
            "properties":{ 'radius': radius, 'color': color, 'opacity': 1 }
        }

        this.liftmarkerJson.features.unshift(newdot);

        for(let i = 0; i < this.liftmarkerJson.features.length; i++) {
            this.liftmarkerJson.features[i].properties.opacity = (this.liftmarkercount-i)/this.liftmarkercount;
            if(i > this.liftmarkercount) {
                this.liftmarkerJson.features.pop();
            }
        }

        this.map.getSource('lift').setData(this.liftmarkerJson);
    }

    updateCourseline() {
        var waypointline = {
            "type": "Feature",
            "geometry": {
                "type": "LineString",
                "coordinates": [
                    [ V.lng.getrawvalue(), V.lat.getrawvalue() ],
                    [B21_SOARING_ENGINE.current_wp()["position"].long,B21_SOARING_ENGINE.current_wp()["position"].lat]
                ]
            }
        };

        this.map.getSource('courseline').setData(waypointline);
    }

    updateTaskline() {
        this.taskgeojson.features.forEach((taskline) => {
            if(taskline.properties["id"] == B21_SOARING_ENGINE.task_index() ) {
                taskline.properties.color = NAVMAP.TASK_LINE_CURRENT_COLOR;
            } else {
                taskline.properties.color = NAVMAP.TASK_LINE_COLOR;
            }
        })

        this.map.getSource('task').setData(this.taskgeojson);
    }

    draw_task() {
        this.taskgeojson = {
            'type': 'FeatureCollection',
            'features': []
        };        

        for (let wp_index = 0; wp_index < B21_SOARING_ENGINE.task_length(); wp_index++) {

            // Draw line p1 -> p2 (solid for current leg, dashed for other legs)
            this.add_task_line(wp_index);

            if (wp_index == B21_SOARING_ENGINE.task.start_index && B21_SOARING_ENGINE.task_index() <= B21_SOARING_ENGINE.task.start_index) {
                this.add_start_line(wp_index);
            } else if (wp_index == B21_SOARING_ENGINE.task.finish_index) {
                this.add_finish_line(wp_index);
            } else if (wp_index > B21_SOARING_ENGINE.task.start_index && wp_index < B21_SOARING_ENGINE.task.finish_index) {
                // Draw WP radius
                this.add_wp_radius(wp_index);
            }
        }

        console.log(this.taskgeojson);
        this.map.getSource('task').setData(this.taskgeojson);
        this.taskispainted = true;
    }

    add_task_line(wp_index) {
        // Cannot add a task line for the first waypoint in the task
        if (wp_index==0) { //B21_SOARING_ENGINE.task_length()-1) {
            return;
        }

        // Don't add a task line before the start
        if (B21_SOARING_ENGINE.task.start_index != null && wp_index <= B21_SOARING_ENGINE.task.start_index) {
            return;
        }

        // Don't add task line after the finish line
        if(B21_SOARING_ENGINE.task.finish_index != null && wp_index > B21_SOARING_ENGINE.task.finish_index) {
            return;
        }

        let wp = B21_SOARING_ENGINE.task.waypoints[wp_index];
        
        // Check if we want to HIGHLIGHT this task line,
        // i.e. the line to the current waypoint (will choose color) or current WP is start and this is NEXT leg
        const current_task_line = wp_index == B21_SOARING_ENGINE.task_index() ||
                                (wp_index - 1 == B21_SOARING_ENGINE.task_index() && B21_SOARING_ENGINE.task.start_index == B21_SOARING_ENGINE.task_index()) ;

        const line_color = current_task_line ? this.TASK_LINE_CURRENT_COLOR : this.TASK_LINE_COLOR;

        var waypointline = {
            "type": "Feature",
            "geometry": {
                "type": "LineString",
                "coordinates": [
                    [wp.position.long, wp.position.lat],
                    [B21_SOARING_ENGINE.task.waypoints[wp_index-1]["position"].long,B21_SOARING_ENGINE.task.waypoints[wp_index-1]["position"].lat]
                ]
            },
            "properties":{"id": wp_index,"weight": this.TASK_LINE_WIDTH, "color":line_color, "fillColor":line_color }
        };

        
        this.taskgeojson.features.push(waypointline);
    }

    add_wp_radius(wp_index) {
        let wp = B21_SOARING_ENGINE.task.waypoints[wp_index];
        let wp_LL = wp.position;
        let radius_m = wp.radius_m;

        var waypoint = this.createGeoJSONCircle([ wp.position.long, wp.position.lat],(wp.radius_m / 1000))
        waypoint.properties = {"id": wp_index,"weight": this.TASK_LINE_WIDTH, "color": this.TASK_LINE_COLOR, "fillColor": this.TASK_LINE_COLOR, "fillOpacity": 0.3 }

        this.taskgeojson.features.push(waypoint);
    }

    // Draw a line perpendicular to the leg to the NEXT waypoint
    add_start_line(wp_index) {
        // Cannot draw a start line on last waypoint
        if (wp_index >= B21_SOARING_ENGINE.task_length() - 1) {
            return;
        }

        let wp = B21_SOARING_ENGINE.task.waypoints[wp_index];

        var waypointline = {
            "type": "Feature",
            "geometry": {
                "type": "LineString",
                "coordinates": [
                    [wp["leg_start_p1"].long, wp["leg_start_p1"].lat],
                    [wp["leg_start_p2"].long,wp["leg_start_p2"].lat]
                ]
            },
            "properties":{"id": wp_index,"weight": this.TASK_LINE_WIDTH, "color": this.TASK_LINE_COLOR, "fillColor": this.TASK_LINE_COLOR }
        };

        // this.taskgeojson.addData(waypointline);
        this.taskgeojson.features.push(waypointline);
    }

    // Draw a line perpendicular to the leg from the PREVIOUS waypoint
    add_finish_line(wp_index) {
        // Cannot draw a finish line on the first waypoint
        if (wp_index==0) {
            return;
        }

        let wp = B21_SOARING_ENGINE.task.waypoints[wp_index];

        var waypointline = {
            "type": "Feature",
            "geometry": {
                "type": "LineString",
                "coordinates": [
                    [wp["leg_finish_p1"].long, wp["leg_finish_p1"].lat],
                    [wp["leg_finish_p2"].long,wp["leg_finish_p2"].lat]
                ]
            },
            "properties":{"id": wp_index,"weight": this.TASK_LINE_WIDTH, "color": this.TASK_LINE_COLOR, "fillColor": this.TASK_LINE_COLOR }
        };

        this.taskgeojson.features.push(waypointline);
        // this.taskgeojson.addData(waypointline);
    }

    createGeoJSONCircle = function(center, radiusInKm, points) {
        if(!points) points = 64;
    
        var coords = {
            latitude: center[1],
            longitude: center[0]
        };
    
        var km = radiusInKm;
    
        var ret = [];
        var distanceX = km/(111.320*Math.cos(coords.latitude*Math.PI/180));
        var distanceY = km/110.574;
    
        var theta, x, y;
        for(var i=0; i<points; i++) {
            theta = (i/points)*(2*Math.PI);
            x = distanceX*Math.cos(theta);
            y = distanceY*Math.sin(theta);
    
            ret.push([coords.longitude+x, coords.latitude+y]);
        }
        ret.push(ret[0]);
    
        return {"type": "Feature",
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [ret]
                    }
                }
    };

    buildMap() {
        let lat = V.lat.getrawvalue();
        let lng = V.lng.getrawvalue();

        
        this.map = new mapboxgl.Map({
        container: 'Map',
        zoom: 14,
        center: [lng, lat],
        pitch: 0,
        bearing: 0,
        // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
        style: 'mapbox://styles/mapbox/satellite-streets-v12'
        });

        this.map.on('load', () => {
            this.map_addLayers();
            
            function switchLayer(layer) {
                // addMaineLayer fn will be called once on layer switched
                NAVMAP.map.once("styledata", NAVMAP.map_addLayers);
                
                NAVMAP.map.setStyle(layer);
            }

            document.getElementById("mapsat").addEventListener("click", () => {
                switchLayer('mapbox://styles/mapbox/satellite-streets-v12');
            })
    
            document.getElementById("mapoutdoors").addEventListener("click", () => {
                switchLayer('mapbox://styles/mapbox/outdoors-v12');
            })
        })
        

        this.map.on("dragstart", () => {
            NAVMAP.isPlaneCentered = false;
        })
        
        this.glider = new mapboxgl.Marker({
            color: "#FFFFFF",
            element: document.getElementById("glidericon")
            }).setLngLat([lng, lat])
            .addTo(NAVMAP.map);

        this.map.on("click", (e) => {
            let coordinates = e.lngLat;

            new mapboxgl.Popup()
                .setLngLat(coordinates)
                .setHTML('<p>clicked on ' + coordinates.lng + '</p>')
                .addTo(NAVMAP.map);
        })    
    }

    map_addLayers() {
        NAVMAP.map.addSource('lift', {
            'type': 'geojson',
            'data': NAVMAP.liftmarkerJson
        });

        NAVMAP.map.addSource('courseline', {
            'type': 'geojson',
            'data': {
                'type': 'FeatureCollection',
                'features': []
            }
        });

        NAVMAP.map.addSource('task', {
            'type': 'geojson',
            'data': {
                'type': 'FeatureCollection',
                'features': []
            }
        });

        NAVMAP.map.addSource('mapbox-dem', {
            'type': 'raster-dem',
            'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
            'tileSize': 512,
            'maxzoom': 14
        });

        

        if(NAVMAP.map.getStyle().name == "Mapbox Outdoors") {
            NAVMAP.map.addLayer(
                {
                'id': 'hillshading',
                'source': 'mapbox-dem',
                'type': 'hillshade'
                },
                // Insert below land-structure-polygon layer,
                // where hillshading sits in the Mapbox Streets style.
                'land-structure-polygon'
                );
        } else {
            NAVMAP.map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1 });
        }
        
        NAVMAP.map.addLayer({
            'id': 'liftmarkers',
            'type': 'circle',
            'source': 'lift',
            'paint': {
                'circle-radius': ['get','radius'],
                'circle-color': ['get','color'],
                'circle-opacity': ['get','opacity']
            }
        })

        NAVMAP.map.addLayer({
            'id': 'courselinelayer',
            'type': 'line',
            'source': 'courseline',
            'paint': {
                'line-color': NAVMAP.TASK_LINE_CURRENT_COLOR,
                'line-width': NAVMAP.TASK_LINE_WIDTH
            }
        })

        NAVMAP.map.addLayer({
            'id': 'tasklayer',
            'type': 'line',
            'source': 'task',
            'layout': {},
            'paint': {
                'line-color': ['get','color'],
                'line-width': ['get','weight']
            },
            'filter': ['==', '$type', 'LineString']
        })

        NAVMAP.map.addLayer({
            'id': 'waypointlayer',
            'type': 'fill',
            'source': 'task',
            'paint': {
                'fill-color': ['get','color'],
                'fill-opacity': ['get','fillOpacity']
            },
            'filter': ['==', '$type', 'Polygon']
        })

        NAVMAP.map.addLayer({
            'id': 'waypointborderlayer',
            'type': 'line',
            'source': 'task',
            'paint': {
                'line-color': ['get','color'],
                'line-width': ['get','weight']
            },
            'filter': ['==', '$type', 'Polygon']
        })

        
    }

}

NAVMAP = new navmap(); NAVMAP.init();

