# Oscar Map V2

一个连飞地图。

# 开源协议
本项目基于 Phosphorus Public License 开源。  
允许个人用户不受限制直接使用 Ocsar Map V2 。  
非个人用户（包括但不限于社区、营利性组织）需要购买必要的商业许可  
若您对源码做出修改，同样需要以 Phosphorus Public License 开源。  
如果您对以上条目感到不适，建议您停止使用本项目。  

# 安装教程
将本项目放到网站目录下，将 `static/config.example.json` 重命名为 `config.json`，写入自己的天地图apikey，阅读 `data.php` 源码自行修改必要参数。  
航向显示需要修改 `fsd` 源码，可自行探索。

有关源码 [fsd/fsd.cpp#L165](https://github.com/kuroneko/fsd/blob/master/fsd/fsd.cpp#L165)

原 `fsd.cpp` 对应 165 行改为：

```
sprintf(dataseg7,"::::::%s:%s", sprintgmt(tempclient->starttime,s), tempclient->pbh);
```

不保证上述源码能否正常工作。