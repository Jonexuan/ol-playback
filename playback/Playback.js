import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Style, Stroke } from 'ol/style';
import { fromLonLat } from 'ol/proj';
import Feature from 'ol/Feature';
import LineString from 'ol/geom/LineString';

import { Clock } from './Clock';
import { Track } from './Track';
import { TrackController } from './TrackController';

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
        target: null,
        ...options
    };
    this._trackController = new TrackController(map, null, this.options);
    this._trakFeature = null;// 轨迹线实体
    this._geoJSON = null;
    Clock.call(this, this._trackController, callback, this.options);
    this._map = map;
    this._layer = new VectorLayer({
        source: new VectorSource(),
    })
    this._map.addLayer(this._layer);
    this.setData(geoJSON);//设置gps数据

};

Playback.prototype = new Clock();

Playback.prototype.clearData = function () {
    this._trackController.clearTracks();
    this.hideTrack();
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
};

Playback.prototype.drawTrack = function () {
    if (this.options.track.show && (!this._trakFeature || !this._trakFeature.length)) {
        this._trakFeature = this._geoJSON.map(item => {
            const coordinates = item.coordinates.map(i => fromLonLat(i))
            const feature = new Feature({
                geometry: new LineString(coordinates),
                params: { type: 'track' }
            })
            feature.setStyle(new Style({
                stroke: new Stroke({
                    color: this.options.track.color,
                    width: this.options.track.width,
                }),
                zIndex: 1
            }))
            return feature;
        })
        this._layer.getSource().addFeatures(this._trakFeature);
    }
}

Playback.prototype.hideTrack = function () {
    if (this._layer && this._trakFeature && this._trakFeature.length) {
        this._trakFeature.forEach((feature) => {
            this._layer.getSource().removeFeature(feature)
        })
    }
    this._trakFeature = null;
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
