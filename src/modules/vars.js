const vars = {
    ias: { value: 0, label: "IAS", longlabel: "Indicated Airspeed", category: "speed", baseunit: "kmh"},
    hdg: { value: 0, label: "HDG", longlabel: "Plane Heading", category: "direction", baseunit: "deg"},
    trk: { value: 0, label: "TRK", longlabel: "GPS Groundtrack", category: "direction", baseunit: "deg"},
    magvar: { value: 0, label: "MAGVAR", longlabel: "Magnetic Variation", category: "direction", baseunit: "deg"},
    alt: { value: 0, label: "ALT", longlabel: "Altitude", category: "alt", baseunit: "m"},
    gnd_alt: { value: 0, label: "GND ALT", longlabel: "Ground Elevation", category: "alt", baseunit: "m"},
    alt_agl: { value: 0, label: "ALT AGL", longlabel: "Altitude above Ground", category: "alt", baseunit: "m"},
    lat: { value: 53.51470278, label: "LAT", longlabel: "Plane Latitude", category: "plaintext", baseunit: ""},
    lng: { value: 10.14423889, label: "LNG", longlabel: "Plane Longitude", category: "plaintext", baseunit: ""}, 
    winddirection: { value: 0, label: "Wind", longlabel: "Wind Direction", category: "direction", baseunit: "deg" },
    windspeed: { value: 0, label: "Wind", longlabel: "Windspeed", category: "windspeed", baseunit: "ms" },
    verticalwind: { value: 0, label: "V. Wind", longlabel: "VerticalWindspeed", category: "windspeed", baseunit: "ms" },
    maccready: { value: 0, label: "MC", longlabel: "MacCready Value", category: "windspeed", baseunit: "ms" },
    stf: { value: 0, label: "STF", longlabel: "Speed to fly", category: "speed", baseunit: "kmh" },
    sink_stf: { value: 0, label: "SINK STF", longlabel: "Sink at speed to fly", category: "verticalspeed", baseunit: "ms" },
    ballast: { value: 52, label: "Ballast", longlabel: "Ballast", category: "weight", baseunit: "kg" },
    totalweight: { value: 0, label: "T. Weight", longlabel: "Total Weight", category: "weight", baseunit: "kg" },
    localtime: { value: 0, label: "Local", longlabel: "Local Time", category: "time_of_day", baseunit: "hms24" },
    tasktime: { value: 0, label: "Task", longlabel: "Task Time", category: "time_of_day", baseunit: "hms24" },
    wp_name: { value: "", label: "WP", longlabel: "Waypoint Name", category: "plaintext", baseunit: "none" },
    wp_alt: { value: 0, label: "WP ALT", longlabel: "Waypoint Altitude", category: "alt", baseunit: "m" },
    wp_bearing: { value: 0, label: "WP BRG", longlabel: "Waypoint Bearing", category: "direction", baseunit: "deg" },
    wp_dist: { value: 0, label: "WP DIST", longlabel: "Waypoint Distance", category: "dist", baseunit: "km" },
    wp_arr_agl: { value: 0, label: "WP ARR (AGL)", longlabel: "Waypoint Arrival AGL (WP-Height)", category: "alt", baseunit: "m" },
    wp_arr_wpmin: { value: 0, label: "WP &#916; MIN", longlabel: "Waypoint Arrival (WP) incl. min-height", category: "alt", baseunit: "m" },
    wp_arr_msl: { value: 0, label: "WP ARR (MSL)", longlabel: "Waypoint Arrival (MSL)", category: "alt", baseunit: "m" },
    wp_ete: { value: 0, label: "WP ETE", longlabel: "Waypoint Time Enroute", category: "time", baseunit: "min" },
    task_arr_agl: { value: 0, label: "TSK FIN (AGL)", longlabel: "Task Finish Altitude (AGL)", category: "alt", baseunit: "m" },
    task_arr_msl: { value: 0, label: "TSK FIN (MSL)", longlabel: "Task Finish Altitude (MSL)", category: "alt", baseunit: "m" },
    task_spd: { value: 0, label: "TSK SPD", longlabel: "Task Speed", category: "speed", baseunit: "kmh"},
    current_polar_sink: { value: 0, label: "POLAR SINK", longlabel: "Current Polar Sink", category: "verticalspeed", baseunit: "ms"},
    total_energy: { value: 0, label: "TE", longlabel: "Totel Energy", category: "verticalspeed", baseunit: "ms" },
    current_netto: { value: 0, label: "NETTO", longlabel: "Current Netto", category: "verticalspeed", baseunit: "ms" },
    smoothed_netto: { value: 0, label: "NETTO", longlabel: "Smoothed Netto", category: "verticalspeed", baseunit: "ms" },
    oat: { value: 0, label: "OAT", longlabel: "Outside Air Temperature",category:"temperature", baseunit: "C"},
}

const units = {
    speed: { pref: "kmh", imperial: "kts", metric: "kmh", options: ["kts","kmh","ms","mph"], label: "Speed" },
    dist: { pref: "km", imperial: "nm", metric: "km", options: ["nm","ml","km","m"], label: "Distance" },
    alt: { pref: "m", imperial: "ft", metric: "m", options: ["ft","m"], label: "Altitude" },
    windspeed: { pref: "ms", imperial: "kts", metric: "ms", options: ["kts","kmh","ms","fs"], label: "Windspeed" },
    verticalspeed: { pref: "ms", imperial: "kts", metric: "ms", options: ["kts","kmh","ms","fs"], label: "Vert. Speed" },
    direction: { pref: "deg", imperial: "deg", metric: "deg", options: ["deg"], label: "Direction" },
    weight: {  pref: "kg", imperial: "lbs", metric: "kg", options: ["lbs", "kg"], label: "Weight" },
    temperature: {  pref: "C", imperial: "F", metric: "C", options: ["F", "C"], label: "Temperature" },
    time: { pref: "min", imperial: "min", metric: "min", options: ["min","sec"], label: "Time" },
    time_of_day:  { pref: "hms24", imperial: "hms12", metric: "hms24", options: ["hms12","hms24"], label: "Time of Day" },
    plaintext:  { pref: "none", imperial: "none", metric: "none", options: ["none"], label: "Plain Text" },
    percent:  { pref: "%", imperial: "%", metric: "%", options: ["%"], label: "Percentage" }
}

units.direction.format = (val) => {
    return val < 0 ? (val+360).toFixed(0) : val.toFixed(0)
}

units.windspeed.format = (val) => {
    return val.toFixed(1);
}

units.verticalspeed.format = (val) => {
    return val.toFixed(1);
}

units.speed.format = (val) => {
    return val.toFixed(0);
}

units.temperature.format = (val) => {
    return val.toFixed(1);
}

units.alt.format = (val) => {
    let result;
    if(Math.abs(val) > 9999) {
        result = (val/1000).toFixed(1) + "k";
    } else if (Math.abs(val) < 100) {
        result = val.toFixed(1);
    } else {
        result = val.toFixed(0);
    }
    return result;
}

units.dist.format = (val) => {
    let result;
    if(Math.abs(val) > 9999) {
        result = (val/1000).toFixed(1) + "k";
    } else if (Math.abs(val) < 100) {
        result = val.toFixed(1);
    } else {
        result = val.toFixed(0);
    }
    return result;
}

units.time_of_day.format = (val) => {
    val = parseInt(val);
    let prefix = val < 0 ? "-" : "";
    let time = Math.abs(val);
    let seconds = Math.floor(time % 60);
    let minutes = Math.floor((time / 60) % 60);
    let hours = Math.floor(Math.min(time / 3600, 99));
    return prefix + hours + ":" + ("0" + minutes).substr(-2) + ":" + ("0" + seconds).substr(-2);
}

const factors = {
    speed: {
        kmh : 1,
        kts : 0.539957,
        mph : 0.621371,
        ms : 0.277778,
        fsuipc: (1 / 0.014468)
    },
    dist: {
        km: 1,
        nm : 0.539957,
        ml : 0.621371,
        m  : 1000,
        fsuipc: 1

    },
    direction: {
        deg: 1,
        fsuipc: 1 / (360/(65536*65536))
    },
    windspeed: {
        ms: 1,
        kts : 1.94384,
        kmh : 0.277778,
        mph : 0.44704,
        fs: 3.28084,
        fsuipc: 1.94384
    },
    verticalspeed: {
        ms: 1,
        kts : 1.94384,
        kmh : 3.6,
        mph : 2.23694,
        fs: 3.28084,
        fsuipc: 1
    },
    alt: {
        m: 1,
        ft: 3.28084,
        fsuipc: 1
    },
    weight: {
        kg: 1,
        lbs: 2.20462,
        fsuipc: 1 / 0.453592
    },
    temperature: {
        C: 1,
        F: 0.55555555,
        fsuipc: 1
    },
    time: {
        s: 1,
        min: 60,
        fsuipc: 1  
    },
    time_of_day: {
        hms24: 1,
        hms12: 1,
        fsuipc: 1,
        s:1
    },
    percent: {
        "%": 1,
        fsuipc: 1
    },
    plaintext: {
        "-": 1,
        fsuipc: 1
    }
}

const keybindstates = {
    last_tc: null
}

V.display = function(val,baseunit,category,forceunit) {
    /* generic conversion function for values not stored in full-monty-var-classes */
    val = parseFloat(val); // better make sure, it's a number

    if(forceunit && units[category][forceunit]) {
            selected_unit = units[category][forceunit];
    } else {
            selected_unit = units[category].pref;
    }
    let result = 0;

    if(factors[category][baseunit] == 1) {
            let factor = factors[category][selected_unit];
            result = val * factor;
    } else {
            let interim = val / factors[category][baseunit];
            let factor = factors[category][selected_unit];
            result = interim * factor;
    }

    if(typeof(units[category].format) == 'function') {
        result = units[category].format(result);
    }

    return result;
}

class VAR {
    constructor(value,label,longlabel,category,baseunit) {
        this.value = value;
        this.label = label;
        this.longlabel = longlabel;
        this.category = category;
        this.baseunit = baseunit;
    }

    set(val, unit = this.baseunit) {
        if(this.category == 'plaintext') {
            this.value = val;
        } else {
            this.value = val / factors[this.category][unit];
        }
        
    }

    getrawvalue() {
        return this.value;
    }

    display(unit = units[this.category].pref) {
        let returnvalue;
        if(this.category == 'plaintext') {
            return this.value;
        }

        if(this.category == 'temperature' && unit == 'F') {
            return ((this.value * 9/5) +32).toFixed(1);
        }

        if(factors[this.category][unit] == 1) {
            returnvalue = this.value;
        } else {
            returnvalue = parseFloat(this.value) * factors[this.category][unit];
        }
        
        if(typeof(units[this.category].format) == 'function') {
            return units[this.category].format(returnvalue);
        } else {
            return returnvalue.toFixed(0);
        }
    }

    unit() {
        if(this.category == 'time' || this.category == 'time_of_day' ||this.category == 'percent' || this.category == 'plaintext') {
            return "";
        } else {
            return units[this.category].pref;
        }
        
    }

    shortlabel() {
        return this.label;
    }

}

const aircraft = [
    {
        name: "Gotfriends Discus 2C FES",
        atc_model: "Discus-2c FES",
        minimum_sink: {
            speed_kts: 43,
            sink_kts: -0.933
        },
        best_glide: {
            speed_kts: 59,
            sink_kts: -1.1857
        },
        fast: {
            speed_kts: 92,
            sink_kts: -2.5075
        },
        reference_weight_lbs: 924
    },
    {
        name: "Gotfriends Discus 2C",
        atc_model: "Discus-2c",
        minimum_sink: {
            speed_kts: 43,
            sink_kts: -0.933
        },
        best_glide: {
            speed_kts: 59,
            sink_kts: -1.1857
        },
        fast: {
            speed_kts: 92,
            sink_kts: -2.5075
        },
        reference_weight_lbs: 787
    },
    {
        name: "Touchingcloud DG808S",
        atc_model: "808S",
        minimum_sink: {
            speed_kts: 48,
            sink_kts: -0.83585
        },
        best_glide: {
            speed_kts: 57,
            sink_kts: -0.9136
        },
        fast: {
            speed_kts: 92,
            sink_kts: -1.94384
        },
        reference_weight_lbs: 773
    },
    {
        name: "Asobo LS 8",
        atc_model: "LS8_18",
        minimum_sink: {
            speed_kts: 40.5,
            sink_kts: -0.97192
        },
        best_glide: {
            speed_kts: 50.21,
            sink_kts: -0.9816392
        },
        fast: {
            speed_kts: 108,
            sink_kts: -5.928712
        },
        reference_weight_lbs: 770
    },
    {
        name: "Asobo DG1001E Neo",
        atc_model: "DG 1001 e Neo",
        minimum_sink: {
            speed_kts: 55.615571,
            sink_kts: -1.2440576
        },
        best_glide: {
            speed_kts: 63.714,
            sink_kts: -1.3412495
        },
        fast: {
            speed_kts: 108,
            sink_kts: -4.8790384
        },
        reference_weight_lbs: 1501
    },
    {
        name: "Madolo/B21 AS33",
        atc_model: "AS-33me",
        minimum_sink: {
            speed_kts: 49,
            sink_kts: -0.9136048
        },
        best_glide: {
            speed_kts: 59,
            sink_kts: -1.0885504
        },
        fast: {
            speed_kts: 113,
            sink_kts: -4.082064
        },
        reference_weight_lbs: 843
    }
]


module.exports = {vars,units,factors,keybindstates,aircraft,VAR}