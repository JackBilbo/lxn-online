export const msg = {
    loading: {
        headline: 'Welcome, Sailor',
        text: `<p>This is a work in progress of a little nav helper for flying gliders in MSFS.</p>
            <p>To get things started, you need - obviously - MSFS and a current version of <a href="http://www.fsuipc.com/" target="_blank">FSUIPC</a> by Pete and John Dowson.</p>
            <p>When FSUIPC is running, start the included "Web Socket Server", have it listen to the IP Address 127.0.0.1 and leave the default port at 2048. Thats it. This page should now display data from MSFS.</p>
            <p>If you want to use this page on a different device from your flightsim-PC, you can use any local IP for the Socket Server and enter that address under Config/Connection.</p>
            <p>In that case you also need to allow your browser to use "insecure content" from this url, since the local server can not use ssl-encryption. Also make sure, that your network setup and firewall allow local connections.</p>
            <p>For questions and support, contact me on the Sim Soaring Club Discord Server.</p> `
    },
    nav: {
        headline: 'Manual Navigation',
        text: `<p>New experiment: Click on the map to set a markpoint. Those Markpoints are listed on the nav panel and can be clicked, to make the marker
        your current waypoint, inlcuding distance and arrival height tracking.</p> `
    }

}