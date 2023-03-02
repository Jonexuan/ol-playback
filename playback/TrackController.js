
export const TrackController = function (map, tracks, options) {
    this.options = options || {};

    this._map = map;

    this._tracks = [];
    // initialize tick points
    this.setTracks(tracks);
}

TrackController.prototype.clearTracks = function () {
    while (this._tracks.length > 0) {
        var track = this._tracks.pop();
        var marker = track.getMarker();

        if (marker) {
            this._map.removeOverlay(marker);
        }
    }
}

TrackController.prototype.setTracks = function (tracks) {
    // reset current tracks
    this.clearTracks();

    this.addTracks(tracks);
}

TrackController.prototype.addTracks = function (tracks) {
    // return if nothing is set
    if (!tracks) {
        return;
    }

    if (tracks instanceof Array) {
        for (var i = 0, len = tracks.length; i < len; i++) {
            this.addTrack(tracks[i]);
        }
    } else {
        this.addTrack(tracks);
    }
}

// add single track
TrackController.prototype.addTrack = function (track, timestamp) {
    // return if nothing is set
    if (!track) {
        return;
    }

    var marker = track.setMarker(timestamp, this.options);

    if (marker) {
        // this._map.addOverlay(marker);
        this._tracks.push(track);
    }
}

TrackController.prototype.tock = function (timestamp, transitionTime) {
    for (var i = 0, len = this._tracks.length; i < len; i++) {
        this._tracks[i].moveMarker(transitionTime, timestamp);
    }
}

TrackController.prototype.getStartTime = function () {
    var earliestTime = 0;

    if (this._tracks.length > 0) {
        earliestTime = this._tracks[0].getStartTime();
        for (var i = 1, len = this._tracks.length; i < len; i++) {
            var t = this._tracks[i].getStartTime();
            if (t < earliestTime) {
                earliestTime = t;
            }
        }
    }

    return earliestTime;
}

TrackController.prototype.getEndTime = function () {
    var latestTime = 0;

    if (this._tracks.length > 0) {
        latestTime = this._tracks[0].getEndTime();
        for (var i = 1, len = this._tracks.length; i < len; i++) {
            var t = this._tracks[i].getEndTime();
            if (t > latestTime) {
                latestTime = t;
            }
        }
    }

    return latestTime;
}

TrackController.prototype.getTracks = function () {
    return this._tracks;
};
