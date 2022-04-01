# Oscar Map V2 航迹航路接口

为Oscar Map V2定做的航路航迹接口以及定时任务
 

# 安装教程
## 1.导入表1
需要两个数据库来搭建 sql1.sql 对应的是适用于地图的航路航迹模块
在task.php文件中第5行的db_connect_xnatc函数所连接的数据库是此表
```
db_connect_xnatc()
{

    $result = new mysqli('localhost', '用户名', '密码', '库');

```
在json文件中第5行的db_connect_xnatc函数所连接的数据库是此表
```
db_connect_xnatc()
{

    $result = new mysqli('localhost', '用户名', '密码', '库');

```

## 2.导入表2
sql2.sql对应的是更加详细的航行数据记录
在task文件中第十八行的db_connect_flight_track函数所连接的数据库是此表
```
function db_connect_flight_track()
{

    $result = new mysqli('localhost', '账户', '密码', '库');
```

## 3.导入导航数据表
导航数据使用的是PMDG的导航数据，结构详见sql3.sql
请参照PMDG导航数据进行导入
在json文件中第19行的db_connect函数所连接的数据库是此表
```
function db_connect()
{

    $result = new mysqli('localhost', '用户名', '密码', '库');
```

## 4.运行task.php
请在终端内输入以下代码即可运行，请确保保护该程序的运行
```
php task.php
```
# 特别注意！！！
如果服务器性能不够、机组很多、数据库性能不够，请将json.php中的get_r函数中内容清空，换成return '';
 这将会去除计划航路模块

# 其他说明
作者本人原并不想开源，且非科班出生、写代码习惯不好，所写代码多有乱命名、无注释，请谅解！
如有不适，请放弃使用航路航迹模块！
不保证上述源码能否正常工作。
有问题联系QQ：1730583774
本模块于oscar-map-v2同一开源标准
