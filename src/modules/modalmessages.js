export const msg = {
    loading: {
        headline: 'Welcome, Sailor',
        text: `This is a very early, pre-pre alpha version of a little nav helper for flying gliders in MSFS.<br>
            <p>To get things started, you need - obviously - MSFS and a current version of <a href="http://www.fsuipc.com/" target="_blank">FSUIPC</a> by Pete and John Dowson.</p>
            <p>When FSUIPC is running, start the included "Web Socket Server", have it listen to the IP Address 127.0.0.1 and leave the default port at 2048. Thats it. This page should now display data from MSFS.</p>
            <p>If you want to use this page on a different device from your flightsim-PC, you can use any local IP for the Socket Server and add that IP to the url of this page, making it
            "https://lxn2.web.app/?192.168.X.X:2048" and allow the browser to load "insecure content" (click on the lock symbol in the address bar).</p>
            <p>For questions and support, contact me on the Sim Soaring Club Discord Server.</p> `
    },
    nav: {
        headline: 'Manual Navigation',
        text: `<p>New experiment: Click on the map to set a markpoint. Those Markpoints are listed on the nav panel and can be clicked, to make the marker
        your current waypoint, inlcuding distance and arrival height tracking.</p> `
    }

}