const net = require("net");
const axios = require("axios");
const config = require("./config");
const express = require("express");

const app = express()
const port = 3000

const fsd = config.fsd;
const cid = config.cid;
const pwd = config.pwd;

let client = net.createConnection({host: fsd, port: 6809})
let rdm = Math.floor(Math.random()*10);
client.write(`#AARO_${rdm}_OBS:SERVER:Robot For Map:${cid}:${pwd}:1:9\r\n`);

app.use(function(req, res, next) {
    req.setTimeout(5000);
    res.setTimeout(5000);
    next();
});

app.get('/', (req, res) => {
    res.send('ATIS Bot is running.');
});

app.get('/get/:callsign', async (req, res) => {
    let callsign = req.params.callsign;
    let atis = "";
    let count = 0;
    let flag = false;
    let online = await axios.get('https://map.xnatc.ink/data.php')
    let data = online.data.split("\n");
    for (let i = 0; i < data.length; i++) {
        if (data[i].split(":")[2] == callsign) {
            flag = true;
            break;
        } else {
            continue;
        }
    }
    if (flag) {
        client.write(`$CQRO_${rdm}_OBS:${callsign}:ATIS\r\n`);
        client.on("data", (r) => {
            let response = r.toString();
            console.log(1+ response);
            if (response.startsWith("$ER")) {
                res.end(response);
            }
            if (response.startsWith(`#TM${callsign}`)) {
                //response.replace("\r\n").split(":")[2];
                let a = response.split("\r\n");
                for (i in a) {
                    if (a[i].startsWith("#TM")) {
                        atis += a[i].split(":")[2] + "\r\n";
                    }
                }
                count += 1;
            }
            if(count == 2) {
                //client.end();
                res.end(atis);
            }
        })
    } else {
        res.end("No such callsign.");
    }
});

app.listen(port, () => {
    console.log(`ATIS Bot listening on port ${port}`)
});
  