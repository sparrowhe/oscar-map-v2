let map;
mdui.mutation();
let player = [];

function init() {
    map = L.map('map').setView([34, 110], 5);
    if (localStorage.getItem("map") == null || localStorage.getItem("map") == "osm") {
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a>, <a>鲁ICP备2021029425号</a>',
            maxZoom: 18,
        }).addTo(map);
    } else if (localStorage.getItem("map") == "google") {
        L.tileLayer('https://www.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}', {
            attribution: 'Map data © <a href="https://map.google.cn">Google</a>, <a>鲁ICP备2021029425号</a>',
            maxZoom: 18,
        }).addTo(map);
    }
    if (localStorage.getItem("show-pilot") == "false") {
        $("#show-pilot").prop("checked", false);
    }
    if (localStorage.getItem("show-atc") == "false") {
        $("#show-atc").prop("checked", false);
    }
    if (localStorage.getItem("show-range") == "false") {
        $("#show-range").prop("checked", false);
    }
    if (localStorage.getItem("show-obs") == "false") {
        $("#show-obs").prop("checked", false);
    }
    if (localStorage.getItem("map") == "google") {
        $("#google").prop("checked", true);
    }
    updMap();
    setInterval(updMap, 1000);
    setUTCTime();
    setInterval(setUTCTime, 1000);
}

function searchCallsignInPlayerAndSelect() {
    let callsign = $("#callsign-search").val();
    for (let i = 0; i < player.length; i++) {
        if (player[i].callsign == callsign) {
            let latlng = [player[i].lat, player[i].lng];
            map.setView(latlng, 10);
            if (player[i].marker) {
                player[i].marker.openPopup();
            }
            break;
        }
    }
}

function milesToMetar(miles) {
    return miles * 1.609344;
}

function setUTCTime() {
    let d = new Date();
    let utc = d.toUTCString().split(" ")[4].split(":");
    $("#time").text(`${utc[0]}:${utc[1]}:${utc[2]} UTC`);
}

function checkShowPilot() {
    let obj = $("#show-pilot");
    if (obj.prop("checked")) {
        localStorage.setItem("show-pilot", "true");
        return true;
    } else {
        localStorage.setItem("show-pilot", "false");
        return false;
    }
}

function checkShowATC() {
    let obj = $("#show-atc");
    if (obj.prop("checked")) {
        localStorage.setItem("show-atc", "true");
        return true;
    } else {
        localStorage.setItem("show-atc", "false");
        return false;
    }
}

function checkShowRange() {
    let obj = $("#show-range");
    if (obj.prop("checked")) {
        localStorage.setItem("show-range", "true");
        return true;
    } else {
        localStorage.setItem("show-range", "false");
        return false;
    }
}

function checkShowObs() {
    let obj = $("#show-obs");
    if (obj.prop("checked")) {
        localStorage.setItem("show-obs", "true");
        return true;
    } else {
        localStorage.setItem("show-obs", "false");
        return false;
    }
}

function checkDumpCallsign(callsign) {
    for (let j = 0; j < player.length; j++) {
        if (player[j].callsign == callsign) {
            return j;
        }
    }
    return -1;
}

function clickPlayerInList(obj) {
    let callsign = $(obj).attr("id");
    let d = player[checkDumpCallsign(callsign)];
    let latlng = [d.lat, d.lng];
    map.setView(latlng, 10);
    if (d.marker) {
        d.marker.openPopup();
    }
}

function checkMapSeleted() {
    let obj = $("input[name='map-select']:checked");
    if (obj.length == 0) {
        return "";
    } else {
        localStorage.setItem("map", obj.attr("id"));
        return obj.attr("id");
    }
}

function clickSettingSave() {
    checkShowATC();
    checkShowObs();
    checkShowPilot();
    checkShowRange();
    checkMapSeleted();
}

function updMap() {
    $.ajax({
        url: "https://map.xnatc.ink/data.php",
        success: function (data) {
            let n = data.split("\n");
            n.pop();
            for (let i = 0; i < player.length; i++) {
                let d = player[i];
                let flag = false;
                for (let j = 0; j < n.length; j++) {
                    let k = n[j].split(":");
                    if (k[2] == d.callsign) {
                        flag = true;
                        break;
                    }
                }
                if (!flag) {
                    map.removeLayer(d.marker);
                    map.removeLayer(d.circle);
                    $(`#${d.type.toLowerCase()}-body tr#${d.callsign}`).remove();
                    player.splice(i, 1);
                    i--;
                    mdui.updateTables();
                }
            }
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
                d.radarRange = milesToMetar(parseFloat(t[12]));
                d.form = t[13];
                d.squawk = t[14];
                d.actype = t[15];
                checkDumpCallsign(d.callsign) == -1 ? d.marker = null : d.marker = player[checkDumpCallsign(d.callsign)].marker;
                checkDumpCallsign(d.callsign) == -1 ? d.circle = null : d.circle = player[checkDumpCallsign(d.callsign)].circle;
                checkDumpCallsign(d.callsign) == -1 ? player.push(d) : player[checkDumpCallsign(d.callsign)] = d;
                // console.log(d);
            }
            addMark();
        }
    })
}

function addMark() {
    for (let i = 0; i < player.length; i++) {
        let d = player[i];
        // console.log(d);
        // console.log(d.marker);
        if (d.marker == null) {
            if (d.type == "ATC") {
                // set icon to ATC and add marker
                let icon = L.icon({
                    iconUrl: 'static/image/headset_mic.png',
                    iconSize: [20, 20],
                    iconAnchor: [10, 10],
                    popupAnchor: [0, -15]
                });
                let marker = L.marker([d.lat, d.lng], {
                    icon: icon
                });
                let circle = L.circle([d.lat, d.lng], {
                    color: '#ff0000',
                    fillColor: '#ff0000',
                    fillOpacity: 0.3,
                    radius: d.radarRange
                })
                if (d.callsign.indexOf("OBS") == -1 && d.callsign.indexOf("SUP") == -1) {
                    checkShowATC() ? marker.addTo(map) : null;
                    checkShowRange() ? circle.addTo(map) : null;
                } else {
                    checkShowObs() ? marker.addTo(map) : null;
                    checkShowRange() ? circle.addTo(map) : null;
                }
                // set pop up
                circle.bindPopup(`<b>${d.callsign}</b>`);
                marker.bindPopup(`<b>${d.callsign}</b><br>频率：${d.freq}<br>管制员：${d.id}`);
                $("#atc-body").html($("#atc-body").html() +`<tr id=${d.callsign} onclick="clickPlayerInList(this)"><td>${d.callsign}</td><td>${d.freq}</td></tr>`)
                player[i].marker = marker;
                player[i].circle = circle;
            } else if (d.type == "PILOT") {
                let icon = L.icon({
                    iconUrl: 'static/image/airplane.png',
                    iconSize: [20, 20],
                    iconAnchor: [10, 10],
                    popupAnchor: [0, -15]
                });
                let marker = L.marker([d.lat, d.lng], {
                    icon: icon,
                    rotationAngle: d.heading
                });
                checkShowPilot() ? marker.addTo(map) : null;
                // set pop up
                marker.bindPopup(`<b>${d.callsign}</b><br>起飞/降落：${d.dep}/${d.arr}<br>高度：${d.alt}<br>航向：${d.heading}<br>航路：${d.route}<br>飞行员：${d.id}<br>机型：${d.actype}<br>应答机：${d.squawk}`);
                $("#pilot-body").html($("#pilot-body").html() +`<tr id=${d.callsign} onclick="clickPlayerInList(this)"><td>${d.callsign}</td><td>${d.dep}</td><td>${d.arr}</td></tr>`)
                player[i].marker = marker;
            }
        } else {
            d.marker.setLatLng([d.lat, d.lng]);
            if (d.type == "ATC") {
                if (d.callsign.indexOf("OBS") == -1 && d.callsign.indexOf("SUP") == -1) {
                    !checkShowATC() ? map.removeLayer(d.marker) : d.marker.addTo(map);
                    !checkShowRange() ? map.removeLayer(d.circle) : d.circle.addTo(map);
                } else {
                    !checkShowATC() ? map.removeLayer(d.marker) : d.marker.addTo(map);
                    !checkShowRange() ? map.removeLayer(d.circle) : d.circle.addTo(map);
                }
                d.marker.bindPopup(`<b>${d.callsign}</b><br>频率：${d.freq}<br>管制员：${d.id}`);
                $(`#atc-body tr#${d.callsign}`).html(`<td>${d.callsign}</td><td>${d.freq}</td>`);
            } else if (d.type == "PILOT") {
                !checkShowPilot() ? map.removeLayer(d.marker) : d.marker.addTo(map);
                d.marker.bindPopup(`<b>${d.callsign}</b><br>起飞/降落：${d.dep}/${d.arr}<br>高度：${d.alt}<br>航向：${d.heading}<br>航路：${d.route}<br>飞行员：${d.id}<br>机型：${d.actype}<br>应答机：${d.squawk}`);
                $(`#pilot-body tr#${d.callsign}`).html(`<td>${d.callsign}</td><td>${d.dep}</td><td>${d.arr}</td>`);
            }
        }
    }
    mdui.updateTables();
}