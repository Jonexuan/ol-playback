import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Style, Stroke, Circle, Fill } from 'ol/style';
import { fromLonLat } from 'ol/proj';
import Feature from 'ol/Feature';
import LineString from 'ol/geom/LineString';
import Point from 'ol/geom/Point';

import { Clock } from './Clock';
import { Track } from './Track';
import { TrackController } from './TrackController';
import { isFunction } from './Util';

const defaultPointStyle = {
    color: 'red',
    radius: 3
}

const defaultTrackStyle = {
    color: 'red',
    width: 1
}

export const Playback = function (map, geoJSON, callback, options) {

    this.options = {
        tickLen: 250,
        speed: 1,
        maxInterpolationTime: 5 * 60 * 1000, // 5 minutes
        playControl: false,
        dateControl: false,
        sliderControl: false,
        mouseOverCallback: options.mouseOverCallback,
        clickCallback: options.clickCallback,
        track: {
            show: true,
            color: 'red',
            width: 3
        },
        trackPoint: {
            show: true,
            style: {
                color: 'red',
                radius: 3
            }
        },
        target: null,
        ...options
    };
    this._trackController = new TrackController(map, null, this.options);
    this._trackFeature = null;// 轨迹线实体
    this._trackPointsFeature = null;// 轨迹点实体
    this._geoJSON = null;
    Clock.call(this, this._trackController, callback, this.options);
    this._map = map;

    if (this.hasLayerInMap(this._layer)) {
        this._map.removeLayer(this._layer);
    }
    this._layer = new VectorLayer({
        source: new VectorSource({
            wrapX: false
        })
    });
    this._map.addLayer(this._layer);
    this.setData(geoJSON);//设置gps数据
};

Playback.prototype = new Clock();

Playback.prototype.clearData = function () {
    this._trackController.clearTracks();
    this.hideTrack();
    this.hideTrackPoint();
};

Playback.prototype.setData = function (geoJSON) {
    this.clearData();
    this.addData(geoJSON, this.getTime());
    this.setCursor(this.getStartTime());
};

// bad implementation
Playback.prototype.addData = function (geoJSON, ms) {
    // return if data not set
    if (!geoJSON) {
        return;
    }

    for (var i = 0, len = geoJSON.length; i < len; i++) {
        this._trackController.addTrack(new Track(this._layer, geoJSON[i], this.options), ms);
    }

    this._geoJSON = geoJSON;
    this.drawTrack()
    this.drawTrackPoint()
};

Playback.prototype.drawTrack = function () {
    if (this.options.track.show && (!this._trackFeature || !this._trackFeature.length)) {
        this._trackFeature = this._geoJSON.map(item => {
            const coordinates = item.coordinates.map(i => fromLonLat(i))
            const feature = new Feature({
                geometry: new LineString(coordinates),
                params: { type: 'track' }
            })
            let sty = isFunction(this.options.track.style) ? this.options.track.style(item.info) : this.options.track.style;
            sty = sty || defaultTrackStyle;
            feature.setStyle(new Style({
                stroke: new Stroke({
                    color: sty.color,
                    width: sty.width,
                }),
                zIndex: 1
            }))
            return feature;
        })
        this._layer.getSource().addFeatures(this._trackFeature);
    }
}

Playback.prototype.hideTrack = function () {
    if (this._layer && this._trackFeature && this._trackFeature.length) {
        this._trackFeature.forEach((feature) => {
            this._layer.getSource().removeFeature(feature)
        })
    }
    this._trackFeature = null;
}

Playback.prototype.drawTrackPoint = function () {
    if (this.options.trackPoint.show && (!this._trackPointsFeature || !this._trackPointsFeature.length)) {
        this._trackPointsFeature = [];
        this._geoJSON.forEach(item => {
            item.coordinates.forEach((i, index) => {
                const coord = fromLonLat(i);
                const feature = new Feature({
                    geometry: new Point(coord),
                    params: {
                        ...item.info,
                        type: 'trackPoint'
                    }
                })
                let sty = isFunction(this.options.trackPoint.style) ? this.options.trackPoint.style(item.info, index, i) : this.options.trackPoint.style;
                sty = sty || defaultPointStyle;
                feature.setStyle(new Style({
                    image: new Circle({
                        radius: sty.radius,
                        fill: new Fill({
                            color: sty.color,
                        }),
                        stroke: new Stroke({
                            color: sty.color,
                            width: 1
                        }),
                        zIndex: 2
                    })
                }))
                this._trackPointsFeature.push(feature)
            })
        })
        this._layer.getSource().addFeatures(this._trackPointsFeature);
    }
}

Playback.prototype.hideTrackPoint = function () {
    if (this._layer && this._trackPointsFeature && this._trackPointsFeature.length) {
        this._trackPointsFeature.forEach((feature) => {
            this._layer.getSource().removeFeature(feature)
        })
    }
    this._trackPointsFeature = null;
}


Playback.prototype.destroy = function () {
    this.clearData();
    if (this.playControl) {
        this._map.removeControl(this.playControl);
    }
    if (this.sliderControl) {
        this._map.removeControl(this.sliderControl);
    }
    if (this.dateControl) {
        this._map.removeControl(this.dateControl);
    }
    this._map.removeLayer(this._layer);
}

Playback.prototype.hasLayerInMap = function (layer) {
    var layers = this._map.getLayers();
    for (var i = 0; i < layers.getLength(); i++) {
        var item = layers.item(i);
        if (item === layer)
            return true;
    }
    return false;
}

Playback.prototype.getLayer = function () {
    return this._layer
}
