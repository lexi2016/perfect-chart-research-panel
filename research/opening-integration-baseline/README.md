# 本地面板开盘接入源码基线

本分支基于 main 的固定提交 3c9a53b54d3a382efa416fe5eddb74c17db92d8c，更新 site/daily.html、site/daily.js、site/research28-daily.js、site/research-days.css 四个本地已验证源码文件。其余既有文件保留。日历与研报脚本沿用 main 字节。SOURCE_MANIFEST.json 记录完整身份、来源和检查范围。

当前分组保留85、41、242的历史入口和研报组件，强调末端关键K相对昨收约±2%的缩量平衡观察；这些是研究提示和复核入口，不是已确认的自动形态命中。

源码同步不等于部署：不含本地行情JSON、股票清单、原图/PDF、业务数据或运行配置。本地55408为静态服务，研报API此前返回404，V4开盘接入尚未实现。此前既有页面行为验收范围不扩展为全股票或研报API验收。

RESEARCH_ONLY=true；production_allowed=false；buy_gate_updated=false；orders_sent=false。
