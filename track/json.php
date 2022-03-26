<?php
//针对oscar-map-v2写的航路航迹接口文件
header("Content-type: application/json");
header('Access-Control-Allow-Origin:*');
function db_connect_xnatc()
{

    $result = new mysqli('localhost', '用户名', '密码', '库');

    if (!$result) {

        throw new Exception('不能连接到数据库！');
    } else {

        return $result;
    }
}

function db_connect()
{

    $result = new mysqli('localhost', '用户名', '密码', '库');

    if (!$result) {

        throw new Exception('不能连接到数据库！');
    } else {

        return $result;
    }
}
function get_r($dep, $arr, $route)
{

    $data = [];
    $conn = db_connect();
    mysqli_query($conn, "set names utf8");
    $resultd = $conn->query("SELECT  * from airports where ident='" . $dep . "' ");
    if (!$resultd) {
        printf("Error: %s\n", mysqli_error($conn));
        exit();
    }
    while ($rowd = mysqli_fetch_array($resultd, MYSQLI_ASSOC)) {
        $p = [];
        $jindu = (float)$rowd["longitude_deg"];
        $weidu = (float)$rowd["latitude_deg"];
        $p[] = $dep;
        $p[] = $weidu;
        $p[] = $jindu;
        $data[] = $p;
    }
    mysqli_close($conn);

    //$route = "NIVEM R473 BEMAG V5 CON W6 NLG V19 UDUTI V20 BIGRO G221 UPRIS";
    $route_arr = explode(' ', $route);
    //print_r($route_arr);
    //$dep = array_shift($route_arr);
    //echo $dep;
    //$arr = array_pop($route_arr);
    //echo $arr;
    //print_r($route_arr);
    $num = count($route_arr);
    $wp_arr = [];
    $wr_arr = [];
    for ($i = 0; $i <= $num - 1; $i = $i + 2) {

        $wp_arr[] = $route_arr[$i];
    }
    for ($i = 1; $i <= $num - 1; $i = $i + 2) {

        $wr_arr[] = $route_arr[$i];
    }
    $numk = count($wr_arr);

    for ($i = 0; $i <= $numk - 1; $i++) {
        $p = 0;
        if ($i == 0) {
            $wp1 = 0;
            $wp2 = 1;
        } else {
            $wp1 = $i;
            $wp2 = $i  + 1;
        }
        $conn = db_connect();
        mysqli_query($conn, "set names utf8");
        $result1 = $conn->query("SELECT  r_id from wr where route='" . $wr_arr[$i] . "'  and waypoint='" . $wp_arr[$wp1] . "' ");
        if (!$result1) {
            printf("Error: %s\n", mysqli_error($conn));
            exit();
        }
        while ($row1 = mysqli_fetch_array($result1, MYSQLI_ASSOC)) {
            $wp1_id = (int)$row1["r_id"];
        }
        mysqli_close($conn);
        $conn = db_connect();
        mysqli_query($conn, "set names utf8");
        $result2 = $conn->query("SELECT  r_id from wr where route='" . $wr_arr[$i] . "'  and waypoint='" . $wp_arr[$wp2] . "' ");
        if (!$result2) {
            printf("Error: %s\n", mysqli_error($conn));
            exit();
        }
        while ($row2 = mysqli_fetch_array($result2, MYSQLI_ASSOC)) {
            $wp2_id = (int)$row2["r_id"];
        }
        mysqli_close($conn);
        //$wpmin = min($wp1_id, $wp2_id);
        //$wpmax = max($wp1_id, $wp2_id);


        if ($wp1_id <= $wp2_id) {
            $conn = db_connect();
            mysqli_query($conn, "set names utf8");
            $result3 = $conn->query("SELECT  * from wr where route='" . $wr_arr[$i] . "'  and r_id>='" . $wp1_id . "' and  r_id<='" . $wp2_id . "' order by r_id asc");

            if (!$result3) {
                printf("Error: %s\n", mysqli_error($conn));
                exit();
            }
            while ($row3 = mysqli_fetch_array($result3, MYSQLI_ASSOC)) {
                $p = [];
                $p[] = $row3["waypoint"];
                $p[] = (float)$row3["weidu"];
                $p[] = (float)$row3["jindu"];
                if (!in_array($p, $data)) {
                    $data[] = $p;
                }
            }
            mysqli_close($conn);
        } else {
            $conn = db_connect();
            mysqli_query($conn, "set names utf8");
            $result4 = $conn->query("SELECT  * from wr where route='" . $wr_arr[$i] . "'  and  r_id>='" . $wp2_id . "'  and r_id<='" . $wp1_id . "' order by r_id desc");

            if (!$result4) {
                printf("Error: %s\n", mysqli_error($conn));
                exit();
            }
            while ($row4 = mysqli_fetch_array($result4, MYSQLI_ASSOC)) {
                $p = [];
                $p[] = $row4["waypoint"];
                $p[] = (float)$row4["weidu"];
                $p[] = (float)$row4["jindu"];
                if (!in_array($p, $data)) {
                    $data[] = $p;
                }
            }
            mysqli_close($conn);
        }
    }
    //$data = array_unique($data);
    $conn = db_connect();
    mysqli_query($conn, "set names utf8");
    $resulta = $conn->query("SELECT  * from airports where ident='" . $arr . "' ");
    if (!$resulta) {
        printf("Error: %s\n", mysqli_error($conn));
        exit();
    }
    while ($rowa = mysqli_fetch_array($resulta, MYSQLI_ASSOC)) {
        $p = [];
        $jindu = (float)$rowa["longitude_deg"];
        $weidu = (float)$rowa["latitude_deg"];
        $p[] = $arr;
        $p[] = $weidu;
        $p[] = $jindu;
        $data[] = $p;
    }
    mysqli_close($conn);
    return $data;
}


$yysql = [];
$conn = db_connect_xnatc();
mysqli_query($conn, "set names utf8");

$result = $conn->query("SELECT DISTINCT flight from flight_route order by id asc");
while ($row = mysqli_fetch_array($result, MYSQLI_ASSOC)) {
    $tmparray = array();
    $tmparray['callsign'] = $row['flight'];
    $tmproute = [];
    $tmph = [];
    $tmpflight = $row['flight'];
    $resultb = $conn->query("SELECT DISTINCT lat,lng,flightid,dep,arr,route from flight_route where flight='" . $row['flight'] . "' order by id asc");

    while ($rowb = mysqli_fetch_array($resultb, MYSQLI_ASSOC)) {

        $latlon = [];

        $lat = (float)$rowb['lat'];
        $lng = (float)$rowb['lng'];
        $h = (int)$rowb['flightid'];
        $dep = $rowb['dep'];
        $arr = $rowb['arr'];
        $route = $rowb['route'];
        if ((float)$lat == 0 and (float)$lng == 0) {
        } else {
            array_push($latlon, $lat, $lng, $h);
            array_push($tmproute, $latlon);
        }
    }

    $tmparray['route'] = $tmproute;
    $tmparray['route_f'] = get_r($dep, $arr, $route);
    //$tmparray['height'] = $tmph;
    array_push($yysql, $tmparray);
}
mysqli_close($conn);
echo json_encode($yysql);
