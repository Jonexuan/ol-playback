/*
 * @Author: xuan
 * @LastEditors: xuan
 * @Description: 
 * @Date: 2023-02-28 22:42:16
 * @LastEditTime: 2023-03-02 20:11:32
 */

import { useEffect } from 'react';
import { Style, Fill, Circle, Stroke, Icon } from 'ol/style';

import Map from '@/utils/MapConfig'
import { demoTracks } from './demo-tracks';
import Playback from './playback';


export default () => {

    useEffect(() => {
        window.map = new Map();
        initPlay(window.map);
    }, [])

    function initPlay(map) {
        var playback = new Playback(map, demoTracks, onTime1, {
            speed: 16,
            track: {
                show: true,
                color: 'red',
                width: 5
            },
            target: computeTargetStyle,
            mouseOverCallback: function (a, b) {
                console.log('我被鼠标滑过了', a, b);
            },
            clickCallback: function (a, b) {
                console.log('我被点击了', a, b);
            },
        });
        playback.start()
        playback.setSpeed(32)
        console.log(playback)
    }

    const targetTypeObj = {
        'ship': {
            src: 'assets/ps.png',
            width: 200,
            height: 200,
            scale: 0.2,
        },
        'flight': {
            src: 'assets/airplan.png',
            width: 200,
            height: 200,
            scale: 0.2,
        }
    }

    function computeTargetStyle(info) {
        return targetTypeObj[info.type] || targetTypeObj[info.flight]
    }

    function computeStyle(feature, resolution) {
        const params = feature.get('params');
        console.log(params)
        switch (params.type) {
            case 'ship':
                return new Style({
                    image: new Icon({
                        src: 'assets/ps.png',
                        width: 200,
                        height: 200,
                        scale: 0.2,
                    }),
                    zIndex: 2
                })
            case 'flight':
                return new Style({
                    image: new Icon({
                        src: 'assets/airplan.png',
                        width: 200,
                        height: 200,
                        scale: 0.2,
                    }),
                    zIndex: 2
                })
            default:
                return new Style({
                    stroke: new Stroke({
                        color: '#00FF00',
                        width: 5,
                    }),
                    image: new Circle({
                        radius: 5,
                        fill: new Fill({
                            color: '#00FF00'
                        })
                    }),
                    zIndex: 1
                });
                break;
        }
    }

    function onTime1(time) {
        // console.log(time)
    }

    return (
        <>
            <div id='map' style={{ width: '100%', height: 900 }}></div>
        </>
    )
}
