class Hawk {
    constructor(el) {
        this.htmlhook = document.getElementById(el);
        this.init();
    }

    init() {
        this.htmlhook.appendChild(this.render());
    }

    render() {
        const template = `<div class="arrow" id="arrow_avg">
                                <svg id="triangle" viewBox="0 0 100 100">
                                    <polygon points="50 100, 100 15, 0 15"/>
                                </svg>
                            </div>
                            <div class="arrow" id="arrow_current">
                                <svg id="triangle" viewBox="0 0 100 100">
                                    <polygon points="50 100, 100 15, 0 15"/>
                                </svg>
                            </div>
                            <div id="vertical_indicator">
                                <div id="hawkbar">
                                    <svg id="triangle" viewBox="0 0 100 100">
                                        <polygon points="50 100, 100 15, 0 15"/>
                                    </svg>
                                    <span class="value livedata" data-value="wind_vertical" showunit="no"></span>
                                </div>
                            </div>`;
        
        const hawkhtml = document.createElement("div");
        hawkhtml.setAttribute("id","hawk");
        hawkhtml.setAttribute("class", "active");
        hawkhtml.innerHTML = template;
        return hawkhtml;
    }
    
    update() {
        let current_wind_direction = V.winddirection.display();
        this.hawkwinddir = this.hawkwinddir != null ? (0.9 * this.hawkwinddir) + (0.1 * current_wind_direction) : current_wind_direction;
        this.jbb_avg_wind_direction = this.jbb_avg_wind_direction != null ? ((0.99 * this.jbb_avg_wind_direction) + (0.01 * this.hawkwinddir)) : this.hawkwinddir;

        let averageindicator = this.jbb_avg_wind_direction;
       
        let current_wind_speed = V.windspeed.display();
        this.hawkwindspeed = this.hawkwindspeed != null ? (0.9 * this.hawkwindspeed) + (0.1 * current_wind_speed) : current_wind_speed; 
        this.jbb_avg_wind_speed = this.jbb_avg_wind_speed != null ? ((0.99 * this.jbb_avg_wind_speed) + (0.01 * this.hawkwindspeed)) : this.hawkwindspeed;

        document.querySelector("#hawk #arrow_avg").style.transform = "rotate(" + (averageindicator - V.hdg.display()) + "deg)";
        document.querySelector("#hawk #arrow_current").style.transform = "rotate(" + (this.hawkwinddir - V.hdg.display()) + "deg)";

        let wv = Math.min(600, this.hawkwindspeed * 10 + 100);
        document.querySelector("#hawk #arrow_current").style.height = wv +"px";
        document.querySelector("#hawk #arrow_current").style.top = -wv/2 +"px";

        let wvavg = Math.min(600, this.jbb_avg_wind_speed * 10 + 100);
        document.querySelector("#hawk #arrow_avg").style.height = wvavg +"px";
        document.querySelector("#hawk #arrow_avg").style.top = -wvavg/2 +"px";
        

        // Vertical wind indication

        // if(this.vars.wind_vertical.value < 0) {
        //    this.querySelector("#hawkbar").classList.add("negative");
        // } else {
        //    this.querySelector("#hawkbar").classList.remove("negative");
        // }

        // this.querySelector("#hawkbar").style.height =  Math.abs(this.vars.wind_vertical.value * 18) + "px";
    }
}

module.exports = { Hawk }