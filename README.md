# 自由人的英雄榜

## To do list
1. [x] 点赞功能
2. [x] 添加新人物功能
3. [x] 首页按赞数排序
4. [x] 供友站鏡像的頁面和方法
4. [ ] 网页艺术设计 css样式设计 
5. [x] Github用户可参加的 ~~匿名~~ 讨论区
6. [ ] 基于repo的后台管理功能

## 镜像本英雄榜的方法
**方法一** 将[mirror.html](/mirror.html)文件中的html代码复制或嵌入到您的网页 ~~需要删除顶部的以下内容~~ (更新: 已经从文件中删除)
```yaml
---
layout: default
---
```
参考[官方镜像](https://hero-form.vercel.app)

**方法二** 用iframe将官方镜像嵌入你的网页
```html
<iframe src="https://hero-form.vercel.app"></iframe>
```

## 相關讨论组
- https://2047.name/t/7158
- 本專案[issue](https://github.com/NodeBE4/hero/issues/1)

## 榜单排名数据说明

| 名字  | keyword |Google  | Twitter  | Youtube  | Reddit  | Matters  | Vote  |
|---|---|---|---|---|---|---|---|
| 许章润 | 教授  | 1,860,000  | 8,750  |   |   |   | 1 |
| 李文亮  | 医生  |   |   |   |   |   | |
| 王全璋  | 律师  |   |   |   |   |   | |
| 蔡伟  | 端点星  |   |   |   |   |   | |
| 陈玫  | 端点星  |   |   |   |   |   | |


表格说明
- keyword 用于Google搜索时帮助筛选相关项
- Google数字为搜索`名字+keyword`时返回的条目数量
- Twitter, Google 搜索 `名字 site:twitter.com` 返回的条目数量，其余类似
- Vote, 本站投票数量
- 表格数据可存储在`index.json` 文件中


榜單採用[bootstrap sortable table](https://datatables.net/examples/styling/bootstrap4)

