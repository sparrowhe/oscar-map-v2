let map;
let player = [];
let openCallsign
let inst = null;

function init() {
    mdui.mutation();
    inst = new mdui.Tab("#tab");
    inst.show(0);
    console.log('%cOscar Map', 'color: black; font-size: 24px; font-weight: bold;');
    console.log('%c版权所有：Sparrow He', 'color: black; font-size: 15px;');
    console.log('%c禁止一切侵权行为，购买使用授权请联系QQ：1441373096', 'color: black; font-size: 15px;');
    map = L.map('map').setView([34, 110], 5);
    let atcB = L.tileLayer("https://tiles.flightradar24.com/atc_boundaries/{z}/{x}/{y}/tile.png", {
        attribution: '<a href="https://www.flightradar24.com/">Flightradar24</a>',
    });
    let hRTE = L.tileLayer("https://tiles.flightradar24.com/navdata_ha/{z}/{x}/{y}/tile.png", {
        attribution: '<a href="https://www.flightradar24.com/">Flightradar24</a>',
    })
    let lRTE = L.tileLayer("https://tiles.flightradar24.com/navdata_la/{z}/{x}/{y}/tile.png", {
        attribution: '<a href="https://www.flightradar24.com/">Flightradar24</a>',
    })
    L.control.layers.tree({}, {
        label: '附加图层',
        children: [
            { label: '管制边界', layer: atcB },
            { label: '全球高空航路', layer: hRTE },
            { label: '全球低空航路', layer: lRTE }
        ]}).addTo(map);
    if (localStorage.getItem("map") == null || localStorage.getItem("map") == "osm") {
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a>, <a>鲁ICP备2021029425号</a>',
            maxZoom: 18,
        }).addTo(map);
    } else if (localStorage.getItem("map") == "google") {
        L.tileLayer('https://www.google.cn/maps/vt?lyrs=s@189&x={x}&y={y}&z={z}', {
            attribution: 'Map data © <a href="https://map.google.cn">Google</a>, <a>鲁ICP备2021029425号</a>',
            maxZoom: 18,
        }).addTo(map);
    } else if (localStorage.getItem("map") == "tianditu") {
        //map.options.crs = L.CRS.EPSG4326;
        map.setView([34, 110], 5);
        $.ajax({
            url: "static/config.json",
            dataType: "json",
            success: function (data) {
                L.tileLayer(`https://t0.tianditu.gov.cn/img_w/wmts?layer=img&style=default&tilematrixset=w&Service=WMTS&Request=GetTile&Version=1.0.0&Format=tiles&TileMatrix={z}&TileCol={x}&TileRow={y}&tk=${data.token.tianditu}`, {
                    maxZoom: 18,
                    //zoomOffset: 1,
                    //tileSize: 256,
                    attribution: 'Map data © <a href="https://www.tianditu.gov.cn">天地图</a>, <a>鲁ICP备2021029425号</a>',
                }).addTo(map);
                
            }
        })
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
    if (localStorage.getItem("map") == "tianditu") {
        $("#tianditu").prop("checked", true);
    }
    // load tag setting
    if (localStorage.getItem("tag-icon") == "true") {
        $("#tag-callsign").prop("checked", true);
    }
    if (localStorage.getItem("tag-callsign") == "true") {
        $("#tag-callsign").prop("checked", true);
    }
    if (localStorage.getItem("tag-leg") == "true") {
        $("#tag-leg").prop("checked", true);
    }
    if (localStorage.getItem("tag-alt") == "true") {
        $("#tag-alt").prop("checked", true);
    }
    if (localStorage.getItem("tag-type") == "true") {
        $("#tag-type").prop("checked", true);
    }
    if (localStorage.getItem("pilot-track") == "false") {
        $("#pilot-track").prop("checked", false);
    }
    if (localStorage.getItem("pilot-plan") == "false") {
        $("#pilot-plan").prop("checked", false);
    }
    map.on('popupopen', function(e) {
        let marker = e.popup._source;
        let callsign = marker.options.alt;
        if (player[checkDumpCallsign(callsign)].type == "PILOT") {
            player[checkDumpCallsign(callsign)].polyline.addTo(map);
            player[checkDumpCallsign(callsign)].plan.addTo(map);
        }
        let d = player[checkDumpCallsign(callsign)];
        let detailDOM = $(`#detail-body`);
        if (d.type == "PILOT") detailDOM.html(`<div id=${d.callsign}>
                                                <div class="detail-icon">
                                                <img class="detail-img" onerror=src="" src="static/image/airlines/${d.callsign.substring(0,3)}.png" />
                                                </div>
                                                <table class="mdui-table">
                                                <thead><tr><th style="width: 35%">项目</th><th>信息</th></tr></thead>
                                                <tbody><tr><td>起飞/降落</td><td>${d.dep}/${d.arr}</td></tr>
                                                <tr><td>高度：</td><td>${d.alt}</td></tr>
                                                <tr><td>航向：</td><td>${d.heading}</td></tr>
                                                <tr><td>航路：</td><td>${d.route}</td></tr>
                                                <tr><td>飞行员：</td><td>${d.id}</td></tr>
                                                <tr><td>机型：</td><td>${d.actype}</td></tr>
                                                <tr><td>应答机：</td><td>${d.squawk}</td></tr>
                                                </tbody></table></div>`);
        else if (d.type == "ATC") detailDOM.html(`<div id=${d.callsign}><b>${d.callsign}</b><br>频率：${d.freq}<br>管制员：${d.id}</div>`);
        inst.show(2);
    });
    map.on('popupclose', function(e) {
        let marker = e.popup._source;
        let callsign = marker.options.alt;
        if (checkDumpCallsign(callsign) != -1) {
            if (player[checkDumpCallsign(callsign)].type == "PILOT") {
                map.removeLayer(player[checkDumpCallsign(callsign)].polyline);
                map.removeLayer(player[checkDumpCallsign(callsign)].plan);
            }
        }
        let detailDOM = $(`#detail-body`);
        detailDOM.html("<p>请先选中一个机组或管制员</p>");
        inst.show(0);
    });
    updMap();
    setInterval(updMap, 5000);
    setUTCTime();
    setInterval(setUTCTime, 1000);
}

function searchCallsignInPlayerAndSelect() {
    let callsign = $("#callsign-search").val();
    for (let i = 0; i < player.length; i++) {
        if (player[i].callsign == callsign) {
            let latlng = [player[i].lat, player[i].lng];
            map.setView(latlng, 8);
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
    map.setView(latlng, 8);
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

function savePilotSetting() {
    let track = $("#pilot-track");
    if (track.prop("checked")) {
        localStorage.setItem("pilot-track", "true");
    } else {
        localStorage.setItem("pilot-track", "false");
    }
    let plan = $("#pilot-plan");
    if (plan.prop("checked")) {
        localStorage.setItem("pilot-plan", "true");
    } else {
        localStorage.setItem("pilot-plan", "false");
    }
}

function saveTagSetting() {
    let icon = $("input[id='tag-icon']:checked");
    if (icon.length == 0) {
        localStorage.setItem("tag-icon", "false");
    } else {
        localStorage.setItem("tag-icon", "true");
    }
    let callsign = $("input[id='tag-callsign']:checked");
    if (callsign.length == 0) {
        localStorage.setItem("tag-callsign", "false");
    } else {
        localStorage.setItem("tag-callsign", "true");
    }
    let leg = $("input[id='tag-leg']:checked");
    if (leg.length == 0) {
        localStorage.setItem("tag-leg", "false");
    } else {
        localStorage.setItem("tag-leg", "true");
    }
    let alt = $("input[id='tag-alt']:checked");
    if (alt.length == 0) {
        localStorage.setItem("tag-alt", "false");
    } else {
        localStorage.setItem("tag-alt", "true");
    }
    let type = $("input[id='tag-type']:checked");
    if (type.length == 0) {
        localStorage.setItem("tag-type", "false");
    } else {
        localStorage.setItem("tag-type", "true");
    }
}

function clickSettingSave() {
    checkShowATC();
    checkShowObs();
    checkShowPilot();
    checkShowRange();
    checkMapSeleted();
    saveTagSetting();
    savePilotSetting();
}

function updMap() {
    $.ajax({
        url: "https://map.xnatc.ink/data.php",
        success: function (data) {
            let n = data.split("\n");
            n.pop();
            if (n[0] == "::::::::0::::0:XNATC::" && player.length == 0) return;
            for (let i = 0; i < n.length; i++) {
                let d = n[i].split(":");
                if (d[0] != "ATC" || d[0] != "PILOT") {
                    n.splice(i, 1);
                    i--;
                }
            }
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
                if (!flag && d.callsign != "") {
                    if (d.marker != null) map.removeLayer(d.marker);
                    if (d.circle != null) map.removeLayer(d.circle);
                    if (d.polyline != undefined || d.polyline != null) map.removeLayer(d.polyline);
                    if (d.plan != undefined || d.plan != null) map.removeLayer(d.plan);
                    $(`#${d.type.toLowerCase()}-body tr#${d.callsign}`).remove();
                    player.splice(i, 1);
                    i--;
                    mdui.updateTables();
                }
            }
            for(let i = 0; i < player.length; i++) {
                if(player[i].callsign == "") {
                    player.splice(i, 1);
                    i--;
                    continue;
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
                d.circle = null;
                d.marker = null;
                if (d.lat == NaN || d.lng == NaN) continue;
                if (d.callsign == NaN) continue;
                checkDumpCallsign(d.callsign) == -1 ? d.marker = null : d.marker = player[checkDumpCallsign(d.callsign)].marker;
                checkDumpCallsign(d.callsign) == -1 ? d.circle = null : d.circle = player[checkDumpCallsign(d.callsign)].circle;
                checkDumpCallsign(d.callsign) == -1 ? d.tooltip = null : d.tooltip = player[checkDumpCallsign(d.callsign)].tooltip;
                checkDumpCallsign(d.callsign) == -1 ? d.polyline = L.featureGroup() : d.polyline = player[checkDumpCallsign(d.callsign)].polyline;
                checkDumpCallsign(d.callsign) == -1 ? d.plan = L.polyline([], { color: "grey", weight: 6, opacity: 0.5}) : d.plan = player[checkDumpCallsign(d.callsign)].plan;
                checkDumpCallsign(d.callsign) == -1 ? d.planMarkerList = L.featureGroup() : d.planMarkerList = player[checkDumpCallsign(d.callsign)].planMarkerList;
                checkDumpCallsign(d.callsign) == -1 ? player.push(d) : player[checkDumpCallsign(d.callsign)] = d;
                // console.log(d);
            }
            addMark();
        }
    })
}

function addPath() {
    $.ajax({
        url: "https://fly.xnatc.ink/fly/json",
        success: function (data) {
            for(let i = 0; i < data.length; i++) {
                let d = data[i];
                let callsign = d.callsign;
                if (d.callsign == callsign && checkDumpCallsign(callsign) != -1) {
                    let route = d.route;
                    let points = [];
                    let plan = d.route_f;
                    if (localStorage.getItem("pilot-track") == "true") {
                        for (let i = 0; i < route.length; i++) {
                            points.push(L.latLng(route[i][0], route[i][1], route[i][2]));
                        }
                        let polyline = L.multiOptionsPolyline(points, {
                            multiOptions: {
                                optionIdxFn: function (latLng) {
                                    altThresholds = [1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 11000, 12000, 13000, 14000, 15000, 16000, 17000, 18000, 19000, 20000, 21000, 22000, 23000, 24000, 25000, 26000, 27000, 28000, 29000, 30000, 31000, 32000, 33000, 34000, 35000, 36000, 37000, 38000, 39000, 40000, 41000, 42000, 43000, 44000, 45000, 46000, 47000, 48000, 49000, 50000, 51000, 52000, 53000, 90000, 100000];
                                    for (let i = 0; i < altThresholds.length; ++i) {
                                        if (latLng.alt <= altThresholds[i]) {
                                            return i;
                                        }
                                    }
                                    return altThresholds.length;
                                },
                                options: [{color: '#0046a9'}, {color: '#004cad'}, {color: '#0054b3'},
                                {color: '#005ebb'}, {color: '#0068c3'}, {color: '#0072cb'},
                                {color: '#007ed5'}, {color: '#008bdd'}, {color: '#0097e6'},
                                {color: '#00a1ed'}, {color: '#01adf3'}, {color: '#01b7f9'},
                                {color: '#00befd'}, {color: '#00c9ff'}, {color: '#00cfff'},
                                {color: '#00d5ff'}, {color: '#00d9fb'}, {color: '#00dbed'},
                                {color: '#01dbe3'}, {color: '#00dbd9'}, {color: '#00dbcb'},
                                {color: '#00dbc1'}, {color: '#00dbb3'}, {color: '#01dba5'},
                                {color: '#00db99'}, {color: '#00db8b'}, {color: '#00db7e'},
                                {color: '#01db72'}, {color: '#00db68'}, {color: '#00db5e'},
                                {color: '#06db56'}, {color: '#11dd4e'}, {color: '#20df46'},
                                {color: '#30df40'}, {color: '#42e138'}, {color: '#56e330'},
                                {color: '#6ae32a'}, {color: '#81e524'}, {color: '#95e51e'},
                                {color: '#a9e518'}, {color: '#bde512'}, {color: '#cfe50e'},
                                {color: '#dfe50a'}, {color: '#eee506'}, {color: '#f9e502'},
                                {color: '#ffe300'}, {color: '#ffe000'}, {color: '#ffdb01'},
                                {color: '#ffd900'}, {color: '#ffd500'}, {color: '#ffd100'},
                                {color: '#ffcb00'}, {color: '#ffc700'}, {color: '#ffc300'},
                                {color: '#757b85'}]
                            },
                            weight: 5,
                            lineCap: 'round',
                            opacity: 1,
                            smoothFactor: 1
                        }).addTo(player[checkDumpCallsign(callsign)].polyline);
                        let featureGroup = player[checkDumpCallsign(callsign)].polyline;
                        // only stay last 100 features in this group
                        featureGroup.eachLayer(function (layer) {
                            if (featureGroup.getLayers().length > 5){
                                featureGroup.removeLayer(layer);
                            }
                        });
                    } else {
                        let featureGroup = player[checkDumpCallsign(callsign)].polyline;
                        featureGroup.eachLayer(function (layer) {
                            featureGroup.removeLayer(layer);
                        });
                    }
                    if (localStorage.getItem("pilot-plan") == "true") {
                        let planPoints = [];
                        for (let i = 0; i < plan.length; i++) {
                            planPoints.push(L.latLng(plan[i][1], plan[i][2]));
                        }
                        // player[checkDumpCallsign(callsign)].planMarkerList.eachLayer(function (layer) {
                        //     player[checkDumpCallsign(callsign)].planMarkerList.removeLayer(layer);
                        // });
                        // for (let i = 0; i < plan.length; i++) {
                        //     L.marker(planPoints[i])
                        //     .bindPopup(plan[i][0])
                        //     .addTo(player[checkDumpCallsign(callsign)].planMarkerList);
                        // }
                        
                        checkDumpCallsign(callsign) != -1 ? player[checkDumpCallsign(callsign)].plan.setLatLngs(planPoints) : null;
                    } else {
                        player[checkDumpCallsign(callsign)].plan.setLatLngs([]);
                    }
                }
            }
        }
    })
}

function addMark() {
    for (let i = 0; i < player.length; i++) {
        let d = player[i];
        // console.log(d);
        // console.log(d.marker);
        if (d.marker == null) {
            if (d.type == "ATC" && d.lat && d.lng) {
                // set icon to ATC and add marker
                let icon = L.icon({
                    iconUrl: 'static/image/headset_mic.png',
                    iconSize: [25, 25],
                    iconAnchor: [12.5, 12.5],
                    popupAnchor: [0, -15]
                });
                let marker = L.marker([d.lat, d.lng], {
                    icon: icon,
                    alt: d.callsign
                });
                let circle = L.circle([d.lat, d.lng], {
                    color: '#ff0000',
                    fillColor: '#ff0000',
                    fillOpacity: 0.3,
                    radius: d.radarRange,
                    alt: d.callsign
                })
                if (d.callsign.indexOf("OBS") == -1 && d.callsign.indexOf("SUP") == -1) {
                    checkShowATC() ? marker.addTo(map) : null;
                    checkShowRange() ? circle.addTo(map) : null;
                } else {
                    checkShowObs() ? marker.addTo(map) : null;
                    checkShowRange() ? circle.addTo(map) : null;
                }
                // set pop up
                circle.bindPopup(`<b>${d.callsign}</b>`, {
                    className: "popup"
                });
                marker.bindPopup(`<b>${d.callsign}</b><br>频率：${d.freq}<br>管制员：${d.id}`, {
                    className: "popup"
                });
                let detailDOM = $(`#detail-body div[id=${d.callsign}]`);
                if (detailDOM.length != 0) {
                    detailDOM.html(`<div id=${d.callsign}><b>${d.callsign}</b><br>频率：${d.freq}<br>管制员：${d.id}</div>`);
                }
                $("#atc-body").html($("#atc-body").html() +`<tr id=${d.callsign} onclick="clickPlayerInList(this)"><td>${d.callsign}</td><td>${d.freq}</td></tr>`)
                player[i].marker = marker;
                player[i].circle = circle;
            } else if (d.type == "PILOT" && d.lat && d.lng) {
                let icon = L.icon({
                    iconUrl: 'static/image/airplane.png',
                    iconSize: [50, 50],
                    iconAnchor: [25, 25],
                    popupAnchor: [0, -15]
                });
                let marker = L.marker([d.lat, d.lng], {
                    icon: icon,
                    rotationAngle: d.heading,
                    alt: d.callsign
                });
                player[i].tooltip = "";
                if (localStorage.getItem("tag-icon") == "true") {
                    player[i].tooltip += `<img class="tag-icon" onerror=src="" src="static/image/airlines/${d.callsign.substring(0,3)}.png"></img><br>`;
                }
                if (localStorage.getItem("tag-callsign") == "true"){
                    player[i].tooltip += `<b>${d.callsign}</b><br>`;
                }
                if (localStorage.getItem("tag-leg") == "true") {
                    if (d.dep != "" && d.arr != "") {
                        player[i].tooltip += `${d.dep} - ${d.arr}<br>`;
                    }
                }
                if (localStorage.getItem("tag-alt") == "true") {
                    player[i].tooltip += `${d.alt} ft<br>`;
                }
                if (localStorage.getItem("tag-type") == "true") {
                    if (d.actype != "") {
                        player[i].tooltip += `${d.actype}<br>`;
                    }
                }
                if (player[i].tooltip != "") {
                    marker.bindTooltip(player[i].tooltip, {
                        permanent: true,
                        className: "tag",
                        direction: "right",
                        offset: [15, 0],
                        opacity: 0.8
                    }).openTooltip();
                }
                checkShowPilot() ? marker.addTo(map) : null;
                // set pop up
                marker.bindPopup(`<b>${d.callsign}</b><br>起飞/降落：${d.dep}/${d.arr}<br>高度：${d.alt}<br>航向：${d.heading}<br>航路：${d.route}<br>飞行员：${d.id}<br>机型：${d.actype}<br>应答机：${d.squawk}`, {
                    className: "popup"
                });
                let detailDOM = $(`#detail-body div[id=${d.callsign}]`);
                if (detailDOM.length != 0) {
                    if (d.type == "PILOT") detailDOM.html(`
                                                <div class="detail-icon">
                                                <img class="detail-img" onerror=src="" src="static/image/airlines/${d.callsign.substring(0,3)}.png" />
                                                </div>
                                                <table class="mdui-table">
                                                <thead><tr><th style="width: 35%">项目</th><th>信息</th></tr></thead>
                                                <tbody><tr><td>起飞/降落</td><td>${d.dep}/${d.arr}</td></tr>
                                                <tr><td>高度：</td><td>${d.alt}</td></tr>
                                                <tr><td>航向：</td><td>${d.heading}</td></tr>
                                                <tr><td>航路：</td><td>${d.route}</td></tr>
                                                <tr><td>飞行员：</td><td>${d.id}</td></tr>
                                                <tr><td>机型：</td><td>${d.actype}</td></tr>
                                                <tr><td>应答机：</td><td>${d.squawk}</td></tr>
                                                </tbody></table>`);
                }
                $("#pilot-body").html($("#pilot-body").html() +`<tr id=${d.callsign} onclick="clickPlayerInList(this)"><td>${d.callsign}</td><td>${d.dep}</td><td>${d.arr}</td></tr>`)
                player[i].marker = marker;
            }
        } else {
            if (d.lat && d.lng) d.marker.setLatLng([d.lat, d.lng]);
            if (d.type == "ATC") {
                if (d.callsign.indexOf("OBS") == -1 && d.callsign.indexOf("SUP") == -1) {
                    !checkShowATC() ? map.removeLayer(d.marker) : d.marker.addTo(map);
                    !checkShowRange() ? map.removeLayer(d.circle) : d.circle.addTo(map);
                } else {
                    !checkShowATC() ? map.removeLayer(d.marker) : d.marker.addTo(map);
                    !checkShowRange() ? map.removeLayer(d.circle) : d.circle.addTo(map);
                }
                player[i].marker.bindPopup(`<b>${d.callsign}</b><br>频率：${d.freq}<br>管制员：${d.id}`, {
                    className: "popup"
                });
                let detailDOM = $(`#detail-body div[id=${d.callsign}]`);
                if (detailDOM.length != 0) {
                    detailDOM.html(`<b>${d.callsign}</b><br>频率：${d.freq}<br>管制员：${d.id}`);
                }
                $(`#atc-body tr#${d.callsign}`).html(`<td>${d.callsign}</td><td>${d.freq}</td>`);
            } else if (d.type == "PILOT") {
                !checkShowPilot() ? map.removeLayer(d.marker) : d.marker.addTo(map);
                player[i].tooltip = "";
                d.marker.closeTooltip();
                if (localStorage.getItem("tag-icon") == "true") {
                    player[i].tooltip += `<img class="tag-icon" onerror=src="" src="static/image/airlines/${d.callsign.substring(0,3)}.png"></img><br>`;
                }
                if (localStorage.getItem("tag-callsign") == "true"){
                    player[i].tooltip += `<b>${d.callsign}</b><br>`;
                }
                if (localStorage.getItem("tag-leg") == "true") {
                    if (d.dep != "" && d.arr != "") {
                        player[i].tooltip += `${d.dep} - ${d.arr}<br>`;
                    }
                }
                if (localStorage.getItem("tag-alt") == "true") {
                    player[i].tooltip += `${d.alt} ft<br>`;
                }
                if (localStorage.getItem("tag-type") == "true") {
                    if (d.actype != "") {
                        player[i].tooltip += `${d.actype}<br>`;
                    }
                }
                if (player[i].tooltip != "") {
                    d.marker.bindTooltip(`<small>${player[i].tooltip}</small>`, {
                        permanent: true,
                        className: "tag",
                        direction: "right",
                        offset: [15, 0],
                        opacity: 0.8
                    }).openTooltip();
                }
                player[i].marker.options.alt = d.callsign;
                player[i].marker.bindPopup(`<b>${d.callsign}</b><br>起飞/降落：${d.dep}/${d.arr}<br>高度：${d.alt}<br>航向：${d.heading}<br>航路：${d.route}<br>飞行员：${d.id}<br>机型：${d.actype}<br>应答机：${d.squawk}`, {
                    className: "popup"
                });
                let detailDOM = $(`#detail-body div[id=${d.callsign}]`);
                if (detailDOM.length != 0) {
                    if (d.type == "PILOT") detailDOM.html(`
                                                <div class="detail-icon">
                                                <img class="detail-img" onerror=src="" src="static/image/airlines/${d.callsign.substring(0,3)}.png" />
                                                </div>
                                                <table class="mdui-table">
                                                <thead><tr><th style="width: 35%">项目</th><th>信息</th></tr></thead>
                                                <tbody><tr><td>起飞/降落</td><td>${d.dep}/${d.arr}</td></tr>
                                                <tr><td>高度：</td><td>${d.alt}</td></tr>
                                                <tr><td>航向：</td><td>${d.heading}</td></tr>
                                                <tr><td>航路：</td><td>${d.route}</td></tr>
                                                <tr><td>飞行员：</td><td>${d.id}</td></tr>
                                                <tr><td>机型：</td><td>${d.actype}</td></tr>
                                                <tr><td>应答机：</td><td>${d.squawk}</td></tr>
                                                </tbody></table>`);    
                }
                d.marker.options.rotationAngle = d.heading;
                $(`#pilot-body tr#${d.callsign}`).html(`<td>${d.callsign}</td><td>${d.dep}</td><td>${d.arr}</td>`);
            }
        }
    }
    addPath();
    mdui.updateTables();
}