"use strict";

function initMap(container) {
    let params = {};

    params.container = !container || container === undefined ? container : null;

    for (var p of new URLSearchParams(document.location.search).entries()) {
        params[p[0]] = p[1];
    }

    return new SpatialComponent(params);
}

var oMapa = initMap('Mapa');

oMapa.Actions.ZoomToWorkExtent ? oMapa.Actions.ZoomToWorkExtent() : oMapa.Actions.ZoomToFullExtent();
if (oMapa.Status.editable) {
    oMapa.Actions.setEditableLayer(oMapa.Status.editable);
}
oMapa.Actions.UpdateUI();

