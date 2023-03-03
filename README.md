<!--
 * @Author: xuan
 * @LastEditors: xuan
 * @Description: 
 * @Date: 2023-03-01 10:17:38
 * @LastEditTime: 2023-03-03 22:45:52
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
        style: (info) => ({ color: 'red', width: 1 })
    },
    trackPoint: {
        show: true,
        style: (info, trackIndex, latlng) => ({
            color: 'red',
            radius: 3
        })
    },
    target: (info) => ({ src: '',size: [20, 20], scale: 1})
}
```
- bugs
- [x] 播放到最后时间点时，定时器未停止

- TODO

* [x] 目标使用ol的point
~~ 目标point样式/支持style Funciton;~~ 不利于多元化控制
- [x] 轨迹线/轨迹颜色支持callback控制
- [x] 目标方向修正
- [x] 输入数据格式优化
+ [x] 轨迹支持显示/隐藏控制
- [x] 支持回放时间callback
- [x] 支持轨迹点颜色/大小/显示控制
- [ ] 事件驱动使用setTimeout和requestAnimationFrame
- [ ] 轨迹，目标走到哪画到哪而不是一开始全画完
- [ ] 目标标牌显示与文字定制

- dicfficult TODO

~~-事件驱动使用postcompose~~
- [ ] 实时添加轨迹数据
- [ ] webpack打包
