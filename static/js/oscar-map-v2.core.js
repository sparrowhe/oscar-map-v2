let map;
mdui.mutation();
let player = [];

function init() {
    map = L.map('map').setView([34, 110], 5);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a>, <a>鲁ICP备2021029425号</a>',
        maxZoom: 18,
        id: 'your.mapbox.project.id',
        accessToken: 'your.mapbox.public.access.token'
    }).addTo(map);
}

function updMap() {
    $.ajax({
        url: "https://fly.xnatc.ink/data.php",
        success: function (data) {
            let n = data.split("\n");
            n.pop();
            for (let i = 0; i < n.length; i++) {
                let t = n[i].split(":");
                // console.log(t);
                for (let j = 0; j < t.length; j++) t[j] = t[j].trim();
                let d = {};
                d.type = t[0];
                d.id = t[1];
                d.callsign = t[2];
                d.freq = parseFloat(t[3]);
                d.lat = parseFloat(t[4]);
                d.lng = parseFloat(t[5]);
                d.alt = parseFloat(t[6]);
                d.gs = parseFloat(t[7]);
                d.heading = t[8];
                d.dep = t[9];
                d.arr = t[10];
                d.route = t[11];
                d.radarRange = parseFloat(t[12]);
                d.form = t[13];
                d.ydj = t[14];
                d.type = t[15];
                player.push(d);
                // console.log(d);
            }
            addMark();
        }
    })
}

function addMark() {
    for (let i = 0; i < player.length; i++) {
        let d = player[i];
        let marker = L.marker([d.lat, d.lng]).addTo(map);
        marker.bindPopup(d.callsign);
    }
}