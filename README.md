<!--
 * @Author: xuan
 * @LastEditors: xuan
 * @Description: 
 * @Date: 2023-03-01 10:17:38
 * @LastEditTime: 2023-03-02 20:35:17
-->
# 基于leaflet-trackplayback的openlayers回放插件

## API reference

`map` is the ol.map instance.

`data` is like

```
 [
    {
    coordinates: [ [lng, lat],... ],
    time: [],
    info: {}
    }
]
```
`callback`  time callback

`options` can be:
```javascript
options: {
    speed: 1,
    mouseOverCallback: null,
    clickCallback: null,
    track: {
        show: true,
        color: 'red',
        width: 3
    },
    target: (info) => ({ src: '',size: [20, 20], scale: 1})
}
```

- TODO

* [x] 目标使用ol的point
~~+ [ ] 目标point样式/支持style Funciton;~~ 不利于多元化控制
- [x] 轨迹线/轨迹颜色支持callback控制
- [x] 目标方向修正
- [x] 输入数据格式优化
+ [x] 轨迹支持显示/隐藏控制
- [x] 支持回放时间callback

- dicfficult TODO

~~- [ ] 事件驱动使用postcompose~~
- [] 实时添加轨迹数据
