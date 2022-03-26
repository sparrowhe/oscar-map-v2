//这是针对oscar-map-v2的航迹定时任务文件
<?php
$shuzudcount = array();
function db_connect_xnatc()
{

    $result = new mysqli('localhost', '账户', '密码', '库');

    if (!$result) {

        throw new Exception('不能连接到数据库！');
    } else {

        return $result;
    }
}
function db_connect_flight_track()
{

    $result = new mysqli('localhost', '账户', '密码', '库');

    if (!$result) {

        throw new Exception('不能连接到数据库！');
    } else {

        return $result;
    }
}
ignore_user_abort();
set_time_limit(0);

while (true) {
    $data = file_get_contents("http://map.xnatc.ink/data.php");
    //echo $data;
    $var = explode("\n", $data);

    echo "\n开始读取数据：\n";
    array_pop($var);
    $num = count($var);
    //print_r($var);
    $shuzuhuhao = array();



    //建立一个数组，写入数据库存在的在线航班数据
    $yysql = array();
    $conn = db_connect_xnatc();
    mysqli_query($conn, "set names utf8");
    $result = $conn->query("SELECT flight from flight_route ");
    while ($row = mysqli_fetch_array($result, MYSQLI_ASSOC)) {
        if (in_array($row['flight'], $yysql)) {
        } else {
            $yysql[] = $row['flight'];
        }
    }
    mysqli_close($conn);

    //循环whazzup文件，分割数组，写入当前存在的航班数据
    for ($i = 0; $i <= $num - 1; $i++) {

        $k = (string)$var[$i];
        $ki = explode(":", $k);
        array_pop($ki);
        //print_r($ki);

        //判断用户类型，防止读入ATC数据
        if ($ki[0] == "PILOT") {
            $shuzuhuhao[] = $ki[2];
            //写入用户的经纬度数据
            $conn = db_connect_xnatc();
            echo "添加航班：" . $ki[2] . " \n";
            $sql3 = "INSERT INTO `xnatc`.`flight_route` (`id`, `flight`, `flightid`, `lat`, `lng`, `data`, `dep`, `arr`, `route`) VALUES (NULL, '" . $ki[2] . "', '" . $ki[6] . "', '" . $ki[4] . "',  '" . $ki[5] . "', now(),'" . $ki[9] . "','" . $ki[10] . "','" . $ki[11] . "');";
            //echo $sql3;
            $result = $conn->query($sql3);
            mysqli_close($conn);
            $conn_track = db_connect_flight_track();
            //6速度
            //7航向
            $sql3_t = "INSERT INTO `xnatc_b`.`flight_route` (`id`, `flight`, `flightid`, `lat`, `lng`, `data`, `dep`, `arr`, `route`, `callsign`, `speed`, `heading`) VALUES (NULL, '" . $ki[2] . "', '" . $ki[6] . "', '" . $ki[4] . "',  '" . $ki[5] . "', now(),'" . $ki[9] . "','" . $ki[10] . "','" . $ki[11] . "','" . $ki[1] . "','" . $ki[7] . "','" . $ki[8] . "');";
            $result_track = $conn_track->query($sql3_t);
            mysqli_close($conn_track);
        }
    }


    //建立一个数组2，写入数据库存在的在线航班数据(为了更为方便比较不同)

    $conn = db_connect_xnatc();
    mysqli_query($conn, "set names utf8");
    $result = $conn->query("SELECT flight from flight_route ");
    while ($row = mysqli_fetch_array($result, MYSQLI_ASSOC)) {
        if (in_array($row['flight'], $yysql)) {
        } else {
            $yysql[] = $row['flight'];
        }
    }
    mysqli_close($conn);

    //比较两个数组，取不同
    echo "\n数据库的机组：";
    print_r($yysql);
    echo "\nWHAZZUP中的机组：";
    print_r($shuzuhuhao);

    $resultb = array_merge(array_diff($yysql, $shuzuhuhao), array_diff($shuzuhuhao, $yysql));
    echo "\n不同的机组：";
    print_r($resultb);
    $numb = count($resultb);
    //echo $numb;
    for ($ib = 0; $ib <= $numb - 1; $ib++) {
        //echo $ib;
        if (!isset($shuzudcount[$resultb[$ib]])) {
            $shuzudcount[$resultb[$ib]] = 1;
        } else {
            $shuzudcount[$resultb[$ib]] += 1;
        }
        if ($shuzudcount[$resultb[$ib]] >= 30) {
            $conn = db_connect_xnatc();
            echo "\n删除五分钟未响应机组：" . $resultb[$ib] . "\n";
            $sql4 = "delete from flight_route  where flight='" . $resultb[$ib] . "'";
            //echo $sql4;
            //echo $sql3;
            $result = $conn->query($sql4);
            mysqli_close($conn);
            //UPDATE `xnatc_b`.`flight_route` SET `flight` = NULL, `flightid` = NULL, `lat` = NULL, `lng` = NULL, `data` = NULL, `dep` = NULL, `arr` = NULL, `route` = NULL WHERE `id` IS NULL;
            $conn_track = db_connect_flight_track();
            $timenow = time();
            $timenow = (int)$timenow;
            $sql4_t = "UPDATE `flight_route` SET `flight` = '" . $timenow . $resultb[$ib] . "' WHERE  flight='" . $resultb[$ib] . "'";
            //echo $sql4;
            //echo $sql3;
            $result_t = $conn_track->query($sql4_t);
            mysqli_close($conn_track);

            unset($shuzudcount[$resultb[$ib]]);
        }
    }
    //mysqli_close($conn);
    echo "\nSLEEP状态。。。";
    sleep(10);
}
