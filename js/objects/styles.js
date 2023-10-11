var getDrawFeatureStyle = function () {
    return new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'rgba(0, 0, 0, 0.5)',
            lineDash: [10, 10],
            width: 2
        }),
        image: new ol.style.Circle({
            radius: 5,
            stroke: new ol.style.Stroke({
                color: 'rgba(0, 0, 0, 0.7)'
            }),
            fill: new ol.style.Fill({
                color: 'rgba(255, 255, 255, 0.2)'
            })
        })
    });
};

var getHighlightFeatureStyle = function (id) {
    return new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(0, 0, 0, 0.5)'
        }),
        stroke: new ol.style.Stroke({
            color: '#C5FF00',
            width: 5
        }),
        image: new ol.style.Circle({
            radius: 7,
            fill: new ol.style.Fill({
                color: '#C5FF00'
            }),
            stroke: new ol.style.Stroke({
                color: '#4286f4',
                width: 2
            })
        }),
        text: new ol.style.Text({
            font: "bold 16px Calibri",
            offsetY: -20,
            text: id,
            fill: new ol.style.Fill({
                color: '#ff0000'
            }),
            overflow: false,
            stroke: new ol.style.Stroke({
                color: '#f59393',
                width: 2
            })
        })
    });
};

var CutStyle = function () {
    return [
        new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: '#C5FF00',
                width: 5
            })
        }),
        new ol.style.Style({
            stroke: new ol.style.Stroke({
                width: 3, color: '#000',
                lineDash: [10]
            })
        })];
};

var styleDelete = function (id) {
    return new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: '#b5b5b5',
            width: 0.5
        }),
        image: new ol.style.Circle({
            radius: 7,
            fill: new ol.style.Fill({
                color: 'rgb(255,0,0)'
            })
        }),
        text: new ol.style.Text({
            font: "bold 16px Calibri",
            text: (id ? id : '').toString(),
            fill: new ol.style.Fill({
                color: '#ff0000'
            }),
            placement: 'point',
            overflow: false,
            stroke: new ol.style.Stroke({
                color: '#ffffff',
                width: 3
            }),
        })
    });
};

var styleNull = function () {
    return new ol.style.Style({
        fill: null,
        stroke: null,
        image: null,
        text: null
    });
};

var stylePredio = function (id) {
    return new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(0,0,0,0.001)'
        }),
        stroke: new ol.style.Stroke({
            color: '#00ff00',
            width: 2
        }),
        text: new ol.style.Text({
            offsetY: 15,
            font: "bold 14px Calibri",
            text: id,
            fill: new ol.style.Fill({
                color: '#000000'
            }),
            placement: 'point',
            overflow: false,
            stroke: new ol.style.Stroke({
                color: '#ffffff',
                width: 2
            }),
        })
    });
};