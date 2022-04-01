<?php
header('Access-Control-Allow-Origin:*');
function getSubstr($str, $leftStr, $rightStr) { 
    $left = strpos($str, $leftStr); 
    $right = strpos($str, $rightStr,$left); 
    if($left < 0 or $right < $left) return ''; 
    return substr($str, $left + strlen($leftStr), $right-$left-strlen($leftStr)); 
}
function fsd(){
    $fsd = file_get_contents("http://www.sparrowhe.top/whazzup.txt");
    $str = getSubstr($fsd,"!CLIENTS","!SERVERS");
    $str = trim($str);
    $data = explode("\n",$str);
    foreach ($data as $key => $value){
        $value = trim($value); 
        $arr = explode(":",$value); 
        $heading =  (($arr[38] & 4092) >> 2) / 1024 * 360 ; 
        $heading = round($heading); 
        $radar_radius = 1852 * $arr[19] / 2 ;   
        echo $arr[3].":".$arr[1].":".$arr[0].":".$arr[4].":".$arr[5].":".$arr[6].":".$arr[7].":".$arr[8].":".$heading.":".$arr[11].":".$arr[13].":".$arr[30].":".$radar_radius.":XNATC:".$arr[17].":".$arr[9];
        echo "\n";
    }
}
fsd();