# Oscar Map V2 航迹航路接口

为Oscar Map V2定做的航路航迹接口以及定时任务
 

# 安装教程
##导入表1
需要两个数据库来搭建 sql1.sql 对应的是适用于地图的航路航迹模块
在task文件中的db_connect_xnatc函数所连接的数据库是此表
在json文件中的db_connect_xnatc函数所连接的数据库是此表

##导入表2
sql2.sql对应的是更加详细的航行数据记录
在task文件中的db_connect_flight_track函数所连接的数据库是此表

##导航数据
导航数据使用的是PMDG的导航数据，范例详见sql3.sql
在json文件中的db_connect函数所连接的数据库是此表


不保证上述源码能否正常工作。
