import { Overlay } from 'ol';
import { fromLonLat } from 'ol/proj';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Style, Icon, Stroke, Circle, Fill } from 'ol/style';

import { isFunction } from './Util';

const defaultStyle = new Style({
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
})

export const Track = function (layer, geoJSON, options) {
    this.options = options || {};
    this.popup = options.popup;
    var tickLen = options.tickLen || 250;
    this._staleTime = options.staleTime || 60 * 60 * 1000;
    this._fadeMarkersWhenStale = options.fadeMarkersWhenStale || false;
    this._tickLen = tickLen;
    this._ticks = [];
    this._marker = null;
    this._orientations = [];
    this._info = geoJSON.info;
    this._layer = layer;
    this.currentPosition;
    var sampleTimes = geoJSON.time;
    this._orientIcon = options.orientIcons;
    var previousOrientation;
    var samples = geoJSON.coordinates;
    var currSample = samples[0];
    var nextSample = samples[1];

    var currSampleTime = sampleTimes[0];
    var t = currSampleTime;  // t is used to iterate through tick times
    var nextSampleTime = sampleTimes[1];
    var tmod = t % tickLen; // ms past a tick time
    var rem, ratio;

    // handle edge case of only one t sample
    if (sampleTimes.length === 1) {
        if (tmod !== 0)
            t += tickLen - tmod;
        this._ticks[t] = samples[0];
        this._orientations[t] = 0;
        this._startTime = t;
        this._endTime = t;
        return;
    }

    // interpolate first tick if t not a tick time
    if (tmod !== 0) {
        rem = tickLen - tmod;
        ratio = rem / (nextSampleTime - currSampleTime);
        t += rem;
        this._ticks[t] = this._interpolatePoint(currSample, nextSample, ratio);
        this._orientations[t] = this._directionOfPoint(currSample, nextSample);
        previousOrientation = this._orientations[t];
    } else {
        this._ticks[t] = currSample;
        this._orientations[t] = this._directionOfPoint(currSample, nextSample);
        previousOrientation = this._orientations[t];
    }

    this._startTime = t;
    t += tickLen;
    while (t < nextSampleTime) {
        ratio = (t - currSampleTime) / (nextSampleTime - currSampleTime);
        this._ticks[t] = this._interpolatePoint(currSample, nextSample, ratio);
        this._orientations[t] = this._directionOfPoint(currSample, nextSample);
        previousOrientation = this._orientations[t];
        t += tickLen;
    }

    // iterating through the rest of the samples
    for (var i = 1, len = samples.length; i < len; i++) {
        currSample = samples[i];
        nextSample = samples[i + 1];
        t = currSampleTime = sampleTimes[i];
        nextSampleTime = sampleTimes[i + 1];

        tmod = t % tickLen;
        if (tmod !== 0 && nextSampleTime) {
            rem = tickLen - tmod;
            ratio = rem / (nextSampleTime - currSampleTime);
            t += rem;
            this._ticks[t] = this._interpolatePoint(currSample, nextSample, ratio);
            if (nextSample) {
                this._orientations[t] = this._directionOfPoint(currSample, nextSample);
                previousOrientation = this._orientations[t];
            } else {
                this._orientations[t] = previousOrientation;
            }
        } else {
            this._ticks[t] = currSample;
            if (nextSample) {
                this._orientations[t] = this._directionOfPoint(currSample, nextSample);
                previousOrientation = this._orientations[t];
            } else {
                this._orientations[t] = previousOrientation;
            }
        }

        t += tickLen;
        while (t < nextSampleTime) {
            ratio = (t - currSampleTime) / (nextSampleTime - currSampleTime);

            if (nextSampleTime - currSampleTime > options.maxInterpolationTime) {
                this._ticks[t] = currSample;

                if (nextSample) {
                    this._orientations[t] = this._directionOfPoint(currSample, nextSample);
                    previousOrientation = this._orientations[t];
                } else {
                    this._orientations[t] = previousOrientation;
                }
            }
            else {
                this._ticks[t] = this._interpolatePoint(currSample, nextSample, ratio);
                if (nextSample) {
                    this._orientations[t] = this._directionOfPoint(currSample, nextSample);
                    previousOrientation = this._orientations[t];
                } else {
                    this._orientations[t] = previousOrientation;
                }
            }

            t += tickLen;
        }
    }
    // the last t in the while would be past bounds
    this._endTime = t - tickLen;
    this._lastTick = this._ticks[this._endTime];
};



Track.prototype._interpolatePoint = function (start, end, ratio) {
    try {
        var delta = [end[0] - start[0], end[1] - start[1]];
        var offset = [delta[0] * ratio, delta[1] * ratio];
        return [start[0] + offset[0], start[1] + offset[1]];
    } catch (e) {
        console.log('err: cant interpolate a point');
        console.log(['start', start]);
        console.log(['end', end]);
        console.log(['ratio', ratio]);
    }
};

Track.prototype._directionOfPoint = function (start, end) {
    return this._getBearing(start[1], start[0], end[1], end[0]);
};
Track.prototype._getBearing = function (startLat, startLong, endLat, endLong) {
    startLat = this._radians(startLat);
    startLong = this._radians(startLong);
    endLat = this._radians(endLat);
    endLong = this._radians(endLong);

    var dLong = endLong - startLong;

    var dPhi = Math.log(Math.tan(endLat / 2.0 + Math.PI / 4.0) / Math.tan(startLat / 2.0 + Math.PI / 4.0));
    if (Math.abs(dLong) > Math.PI) {
        if (dLong > 0.0)
            dLong = -(2.0 * Math.PI - dLong);
        else
            dLong = (2.0 * Math.PI + dLong);
    }

    return (this._degrees(Math.atan2(dLong, dPhi)) + 360.0) % 360.0;
};

Track.prototype._radians = function (n) {
    return n * (Math.PI / 180);
};
Track.prototype._degrees = function (n) {
    return n * (180 / Math.PI);
};
Track.prototype.uuid = function () {
    var s = [];
    var hexDigits = "0123456789abcdef";
    for (var i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the
    // clock_seq_hi_and_reserved
    // to 01
    s[8] = s[13] = s[18] = s[23] = "";

    var uuid = s.join("");
    return uuid;
}
Track.prototype.getFirstTick = function () {
    return this._ticks[this._startTime];
};

Track.prototype.getFirstCourse = function () {
    return this._orientations[this._startTime];
};

Track.prototype.getLastTick = function () {
    return this._ticks[this._endTime];
};

Track.prototype.getStartTime = function () {
    return this._startTime;
};

Track.prototype.getEndTime = function () {
    return this._endTime;
};

Track.prototype.getTickMultiPoint = function () {
    var t = this.getStartTime();
    var endT = this.getEndTime();
    var coordinates = [];
    var time = [];
    while (t <= endT) {
        time.push(t);
        coordinates.push(this.tick(t));
        t += this._tickLen;
    }

    return {
        type: 'Feature',
        geometry: {
            type: 'MultiPoint',
            coordinates: coordinates
        },
        properties: {
            time: time
        }
    };
};

Track.prototype.trackPresentAtTick = function (timestamp) {
    return (timestamp >= this._startTime);
};

Track.prototype.trackStaleAtTick = function (timestamp) {
    return ((this._endTime + this._staleTime) <= timestamp);
};

Track.prototype.tick = function (timestamp) {
    if (timestamp > this._endTime)
        timestamp = this._endTime;
    if (timestamp < this._startTime)
        timestamp = this._startTime;
    return this._ticks[timestamp];
};

Track.prototype.courseAtTime = function (timestamp) {
    //return 90;
    if (timestamp > this._endTime)
        timestamp = this._endTime;
    if (timestamp < this._startTime)
        timestamp = this._startTime;
    return this._orientations[timestamp];
};

Track.prototype.getCourseAndLnglat = function (timestamp) {
    let [rotation, lngLat] = [null, null]

    // if time stamp is not set, then get first tick
    if (timestamp) {
        lngLat = this.tick(timestamp);
        rotation = this.courseAtTime(timestamp);
    } else {
        lngLat = this.getFirstTick();
        rotation = this.getFirstCourse(timestamp);
    }
    return { rotation, lngLat }
}

Track.prototype.setMarker = function (timestamp, options) {

    const { rotation, lngLat } = this.getCourseAndLnglat(timestamp)

    if (lngLat) {
        const feature = new Feature({
            geometry: new Point(fromLonLat(lngLat)),
            params: this._info
        });
        let sty = isFunction(this.options.target) ? this.options.target(this._info) : this.options.target;
        sty = sty || defaultStyle;

        const style = new Style({
            image: new Icon({
                ...sty,
                rotation: this._radians(rotation)
            }),
            zIndex: 2
        });
        feature.setStyle(style);
        this._layer.getSource().addFeature(feature);
        this._marker = feature;
    }

    return this._marker;
};

Track.prototype.moveMarker = function (transitionTime, timestamp) {
    const { rotation, lngLat } = this.getCourseAndLnglat(timestamp)

    if (this._marker) {
        const coord = fromLonLat(lngLat);
        this.currentPosition = coord;
        this._marker.getGeometry().setCoordinates(coord);
        this._marker.getStyle()?.getImage()?.setRotation(this._radians(rotation))
    }
};

Track.prototype.getMarker = function () {
    return this._marker;
};
