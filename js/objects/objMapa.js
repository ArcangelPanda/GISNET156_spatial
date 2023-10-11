"use strict";

var APIurl = "http://192.168.200.156:3000";
var cc_min_length_to_search = 6;

// sample: http://localhost:81/?type=Create&id=220918&id_tramite=3777


const sleep = ms => new Promise(r => setTimeout(r, ms));

var fnAddFeatureControl = function (feature) {

    let BaseContainer = oMapa.UI.IdentifyPannel;
    let Container = document.getElementById('Identify' + '_container_' + feature.layerName);
    let Counter;
    let accordeonList;

    if (!Container) {
        Container = document.createElement('div');
        Container.id = container + '_container_' + feature.layerName;
        Container.classList.add('no-space');
        Container.classList.add('theme-l5');
        BaseContainer.appendChild(Container);

        let accordeonSource = document.createElement('span');
        accordeonSource.id = container + 'accordeonSource' + feature.layerName;
        accordeonSource.className = 'w3-button caret w3-block theme-l4 w3-border-0 w3-bottombar w3-border-red';
        accordeonSource.innerHTML = feature.layerName;


        let att1 = document.createAttribute("data-accordionGroup");
        att1.value = feature.layerName;
        accordeonSource.setAttributeNode(att1);


        let att2 = document.createAttribute("data-accordionDestiny");
        att2.value = container + '_list_' + feature.layerName;
        accordeonSource.setAttributeNode(att2);

        accordeonSource.setAttribute('onclick', 'this.classList.toggle("caret-down");document.getElementById("' + container + '_list_' + feature.layerName + '").style.display = (document.getElementById("' + container + '_list_' + feature.layerName + '").style.display === "block") ? "none" : "block";');
        Container.appendChild(accordeonSource);

        Counter = document.createElement('span');
        Counter.id = container + '_counter_' + feature.layerName;
        Counter.classList.add('w3-badge');
        Counter.classList.add('w3-green');
        Counter.classList.add('w3-left');

        Counter.innerHTML = 0;
        accordeonSource.appendChild(Counter);

        accordeonList = document.createElement('ul');
        accordeonList.id = container + '_list_' + feature.layerName;
        accordeonList.classList.add('w3-ul');
        accordeonList.classList.add('no-space');
        accordeonList.style.display = 'none';
        Container.appendChild(accordeonList);
    } else {
        Counter = document.getElementById(container + '_counter_' + feature.layerName);
        accordeonList = document.getElementById(container + '_list_' + feature.layerName);
    }


    let element = document.getElementById(container + '_control_' + feature.layerName + "_" + feature.getId());
    if (!element) {
        element = document.createElement('li');
        element.id = container + '_control_' + feature.layerName + "_" + feature.getId();
        element.className = 'IdentifyControl no-space';

        let stringInnerBar = '<div class="no-space><div class="w3-bar theme-l2 no-space">' +
            '<button class="w3-bar-item caret theme-l4 w3-button w3-block" onclick="this.classList.toggle(' + "'caret-down'" + ');document.getElementById(' + "'" + container + '_properties_' + feature.layerName + "_" + feature.getId() + "'" + ').style.display = document.getElementById(' + "'" + container + '_properties_' + feature.layerName + "_" + feature.getId() + "'" + ').style.display === ' + "'block'" + ' ? ' + "'none'" + ' : ' + "'block'" + ';">' +
            '<span>' + feature.getId() + '</span>' +
            '</button>' +
            '</div></div>';


        element.innerHTML = stringInnerBar;

        let Properties = document.createElement('div');
        Properties.id = container + '_properties_' + feature.layerName + "_" + feature.getId();
        Properties.className = 'w3-row w3-border theme-d4';

        Properties.style.display = 'none';

        let p;
        for (p = 0; p < feature.getKeys().length; p++) {
            let tipoValor = typeof feature.get([feature.getKeys()[p]]);
            if (tipoValor === 'string' || tipoValor === 'number' || tipoValor === 'boolean') {
                if (feature.get([feature.getKeys()[p]]).length > 31) {
                    Properties.innerHTML += '<p style="width:100%;height:auto;max-height:100px;border:2px solid #000000;overflow-y:auto;"><b>' + feature.getKeys()[p] + ':</b><br />' + feature.get([feature.getKeys()[p]]) + '</p>';
                } else {
                    Properties.innerHTML += '<label class="w3-half">' + feature.getKeys()[p] + '</label><label class="w3-half">' + feature.get([feature.getKeys()[p]]) + '</label>';
                }
            }
        }

        element.appendChild(Properties);
        accordeonList.appendChild(element);

        Counter.innerHTML = accordeonList.childElementCount;

    }
};

class SpatialComponent {
    constructor(params){
        const Mapa = this;

        Mapa.Params = params;
        Mapa.Params.type = params.type !== null && params.type !== undefined ? params.type : 'default';

        Mapa.Map={};
        Mapa.Projections={};
        Mapa.Layers = {};
        Mapa.Actions = {};
        Mapa.Work={};
        Mapa.Status = {};
        Mapa.Status.MemorySketch = {}
        Mapa.UI = {};
        Mapa.UI.Function = 'Normal';
        Mapa.UI.Controls = {};
        Mapa.Errors = [];
        Mapa.Interactions = {
            evtKeys : {},
            interactions : {},
            snaps : []
        };
        Mapa.Math = {};

        Mapa.JSONConfig = httpGet("/json/" + Mapa.Params.type + "/map.json", "JSON");
        Mapa.UI.JSONConfig = httpGet("/json/" + Mapa.Params.type + "/UI.json", "JSON");
        
        Mapa.Layers.JSONConfig = httpGet("/json/" + Mapa.Params.type + "/Layers.json", "JSON");
        Mapa.Projections.JSONConfig = httpGet("/json/projections.json", "JSON");

        Mapa.JSONConfig.Parameters.forEach(function(p){
            if (!params[p] || params[p] === undefined) {
                Mapa.Errors.push("Falta el parametro requerido: " + p);
                throw "Falta el parametro requerido: " + p
            }
        })

        Mapa.initProjections();

        return Mapa.initMap();
    }
    
    initProjections() {
        let Mapa = this;

        for(let i = 0; i<Mapa.Projections.JSONConfig.projections.length;i++){
            const p = Mapa.Projections.JSONConfig.projections[i];
            proj4.defs(Object.keys(p)[0], p[Object.keys(p)[0]]);
        }
        
        ol.proj.proj4.register(proj4);

        Mapa.Projections.Default = ol.proj.get(Mapa.JSONConfig.SpatialReference.SRID);

        Mapa.Projections.getCurrent = function() {
            const currentView = Mapa.Map.getView();
            return currentView.getProjection();
        }

        return;
    };

    initActions(){
        const Mapa = this;

        document.getElementById('Radio').onchange = function(){
            Mapa.Status.MemorySketch.geometry.setRadius(parseFloat(this.value)); 
            Mapa.Status.MemorySketch.radio = parseFloat(this.value); 
            if (Mapa.Interactions.interactions.draw) {
                Mapa.Interactions.interactions.draw.finishDrawing(); 
            }; 
            this.value = 0; 
            Mapa.Status.MemorySketch.radio = 0;
        }

        Mapa.Actions.ClearTemp = function() {

            Mapa.Layers.Auxiliar.getSource().clear();
            Mapa.Layers.Temp.getSource().clear();
            
            Mapa.Actions.ClearInteractions();
        }

        Mapa.Actions.ShowShpImport = function() {
            document.getElementById('CargaShapefileContainer').style.display = document.getElementById('CargaShapefileContainer').style.display === 'block' ? 'none' : 'block';
        }

        Mapa.Actions.changeFile = function (evt) {
            Mapa.file = evt.target.files[0];
            var reader = new FileReader();
            if (Mapa.file) {
                reader.readAsDataURL(Mapa.file);
            }
        
            reader.onloadend = function () {
                //preview.src = reader.result;
            };
        };

        Mapa.Actions.exportShp = function() {
            let draw = new ol.interaction.Draw({
                source: Mapa.Layers.Temp.getSource(),
                type: 'Polygon',
            });

            draw.on('drawend', function (e) {
                let formatWKT = new ol.format.WKT();

                let data = {
                    wkt: formatWKT.writeGeometry(e.feature.getGeometry())
                };

                let url = ""
                if(Mapa.Status.WorkLayer.id === 'VectorPredio') {
                    url = APIurl +'/Predio/export';
                } else if(Mapa.Status.WorkLayer.id === 'VectorConstruccion') {
                    url = APIurl + '/Construccion/export';
                } else {
                    return;
                }

                var xmlHttp = new XMLHttpRequest();
                xmlHttp.open("POST", url, false); // false for synchronous request
                xmlHttp.setRequestHeader("Content-type", "application/json");
                xmlHttp.send(JSON.stringify(data));

                if(xmlHttp.responseText !== "") {
                    window.open('/shp/' + xmlHttp.responseText);
                }

                Mapa.Layers.Temp.getSource().removeFeature(e.feature);
                Mapa.Map.removeInteraction(Mapa.Interactions.interactions.export);
                delete Mapa.Interactions.interactions.export;
            });

            Mapa.Interactions.interactions.export = draw;
            Mapa.Map.addInteraction(draw);
        };


        Mapa.Actions.ImportShp = function () {
            let epsg = Mapa.JSONConfig.SRID;
            let encoding = 'UTF-8';
        
            if (!Mapa.file) {
                return null;
            }
        
            loadshp({
                url: Mapa.file,
                encoding: encoding,
                EPSG: epsg
            }, function (data) {
                let URL = window.URL || window.webkitURL || window.mozURL || window.msURL,
                    url = URL.createObjectURL(new Blob([JSON.stringify(data)], { type: "application/json" }));
        
                let format = new ol.format.GeoJSON();
                let features = format.readFeatures(data);
                let registros ={}

                if(Mapa.Status.WorkLayer.id === 'VectorPredio') {
                    registros = httpGet(APIurl + '/predio/Predios_x_Tramite/' + Mapa.Params.id_tramite,'JSON')

                    Mapa.Status.WorkLayer.getSource().clear();
    
                    registros.forEach(function(r){
                        features.forEach(function(f){
                            if (r.clave_catastral === f.get('CCAT') || r.clave_catastral === f.get('ccat' )){
                                f.setId(r.id);
                                f.set('id', r.id);
                                Mapa.Status.WorkLayer.getSource().addFeature(f);
                            }
                        })
                    });
    
                    Mapa.Map.renderSync();
            
                    let extent = Mapa.Status.WorkLayer.getSource().getExtent();
                    Mapa.Map.getView().fit(extent, Mapa.Map.getSize());

                    Mapa.Actions.ShowShpImport()
                    
                } else if (Mapa.Status.WorkLayer.id === 'VectorConstruccion'){
                    registros = httpGet(APIurl + '/construccion/construcciones_x_tramite/' + Mapa.Params.id_tramite,'JSON')

                    Mapa.Status.WorkLayer.getSource().clear();
    
                    registros.forEach(function(r){
                        features.forEach(function(f){
                            if (r.clave_catastral === f.get('cc')){
                                if(!f.getId() || f.getId() === 0 || r.id === f.get('id')) {
                                    Mapa.Status.WorkLayer.getSource().addFeature(f);    
                                }
                            }
                        })
                    });
    
                    Mapa.Map.renderSync();
                    Mapa.Actions.ShowShpImport()
                }
            });
        };


        Mapa.Actions.SearchClaveCatastral = function(cc) {
            if(cc.length < cc_min_length_to_search) {
                return;
            }

            Mapa.IdentifyLayer.getSource().clear();

            Mapa.UI.TOCPannel.style.display = 'none';
            Mapa.UI.IdentifyPannel.style.display = 'none';
            Mapa.UI.SearchPannel.style.display = '';
            let SearchResults = document.getElementById('SearchResults');

            SearchResults.innerHTML = '';
            let result = httpGet(APIurl + '/predio/searchClaveCatastral/' + cc, 'JSON');

            if(result.length && result.length > 0) {
                let format = new ol.format.WKT();
                result.forEach(function(r){
                    let div = document.createElement('div');
                    div.className = "w3-small w3-light-gray";

                    let rButton = document.createElement('div');
                    rButton.className = 'w3-button w3-blue w3-block';
                    rButton.innerHTML = r.clave_catastral;

                    let Geometry = format.readGeometry(r.geom)

                    let feature = new ol.Feature({
                        geometry: Geometry,
                        style: getHighlightFeatureStyle(r.clave_catastral)
                    })

                    let tabla = document.createElement('table');
                    tabla.style.display = 'none';

                    for(let f in r) {
                        if (f!=='geom' && f!=='id') {
                            let value = r[f] ? r[f].toString() : '';
                            let row = "<tr><td class='w3-grey'>" + f.replace(/_/g,' ').toUpperCase() + "</td><td>" + value + "</td></tr>";
                            tabla.innerHTML += row;
                        }
                    };

                    div.addEventListener("mouseover", function () {
                        oMapa.IdentifyLayer.getSource().addFeature(feature);
                    });

                    div.addEventListener("mouseout", function () {
                        oMapa.IdentifyLayer.getSource().removeFeature(feature);
                    });

                    rButton.onclick = function(){
                        tabla.style.display = tabla.style.display === 'none' ? '' : 'none';
                        Mapa.Map.getView().fit(new ol.extent.buffer(feature.getGeometry().getExtent(), 50), Mapa.Map.getSize());
                    }

                    div.appendChild(rButton);
                    div.appendChild(tabla);
                    SearchResults.appendChild(div);

                });
            }

        }

        Mapa.Actions.setId = function(id) {
            Mapa.Status.Select.features.getArray()[0].setId(id);
            Mapa.Status.Select.features.getArray()[0].set('id',id);
        }

        Mapa.Actions.setPrincipal = function(layerList){
            layerList.forEach(function(lyr) {
                const layer = Mapa.Layers[lyr];
                if(layer.geometry.detaillsLayers) {
                    layer.getSource().forEachFeature(function(feature){
                        if(layer.geometry.order && feature.getGeometry().getType() === 'Polygon'){
                            Mapa.Actions.orderVertex(feature,layer.geometry.order,layer.geometry.clockwise);
                        }
                        if (feature.getGeometry().getType() === 'Polygon'){
                            let cs = feature.getGeometry().getCoordinates()[0]
                            Mapa.Status.MemorySketch.geometry = feature.getGeometry();

                            let cx1 = Math.round(cs[0][0] * 100) / 100;
                            let cy1 = Math.round(cs[0][1] * 100) / 100;
                            let cx2, cy2, ca, cd;
        
                            document.getElementById('CCVertices').innerHTML = "<tr style='background-color:grey;'><td style='width:60px;'></td><td style='text-align:right;width:65px;'>1</td><td style='text-align:right;width:65px;'></td><td style='text-align:right;width:115px;'></td><td style='text-align:right;width:115px;'>" + cx1.toFixed(2) + "</td><td style='text-align:right;width:115px;'>" + cy1.toFixed(2) + "</td></tr>";

                            for(let i = 1; i<cs.length-1;i++){
                                cx2 = Math.round(cs[i][0] * 100) / 100;
                                cy2 = Math.round(cs[i][1] * 100) / 100;
                                
                                ca = Math.round((Mapa.Math.A(Mapa.Math.M(cx1, cy1, cx2, cy2), cx1, cy1, cx2, cy2) * 100)) / 100;
                                cd = Math.round((Mapa.Math.D(cx1, cy1, cx2, cy2) * 100)) /100;

                                document.getElementById('CCVertices').innerHTML += "<tr style='background-color:" + ((i % 2 === 0) ? 'grey' : 'lightgrey') + ";'><td style='width:60px;'></td><td style='text-align:right;width:65px;'>" + (i+1) + "</td><td style='text-align:right;width:65px;'>" + ca + "</td><td style='text-align:right;width:115px;'>" + cd.toFixed(2) + "</td><td style='text-align:right;width:115px;'>" + cx2.toFixed(2) + "</td><td style='text-align:right;width:115px;'>" + cy2.toFixed(2) + "</td></tr>";

                                cx1 = cx2;
                                cy1 = cy2;
                            };

                            let tools = document.getElementsByClassName('CCs');

                            for (let i = 0; i < tools.length;i++){
                                if(tools[i].className.indexOf('Polygon') === -1 ){
                                    tools[i].style.display='none';
                                } else {
                                    tools[i].style.display='';
                                }   
                            }
                        }
                        Mapa.Actions.drawNodes(feature.getGeometry(),true,layer);
                   });
                };
            });
        }

        Mapa.Actions.Save = function() {
            for (let key in Mapa.Layers){
                if(Mapa.Layers[key].Save) {
                    Mapa.Layers[key].Save();
                    sleep(10);
                }
            }
        }

        Mapa.Actions.UpdateUI = function(){
            for(let ctlId in Mapa.UI.Controls){
                if(Mapa.UI.Controls[ctlId].update){
                    Mapa.UI.Controls[ctlId].update();
                }
            }
        }

        Mapa.Actions.Identify = function(){
            Mapa.Actions.ClearInteractions();

            let identifyResults = document.getElementById('IdentifyResults');
        
            let evtKey = Mapa.Map.on('singleclick', function (evt) {
                Mapa.UI.TOCPannel.style.display = 'none'
                Mapa.UI.IdentifyPannel.style.display = '';

                let view = Mapa.Map.getView();
                let viewResolution = view.getResolution();
        
                let conShift = ol.events.condition.shiftKeyOnly(evt);
        
                if (!conShift) {
                    identifyResults.innerHTML = '';
                    Mapa.IdentifyLayer.getSource().clear();
                }

                var url = Mapa.Layers.WMSPredios.getSource().getFeatureInfoUrl(
                    evt.coordinate, viewResolution, view.getProjection(),
                    {
                        'INFO_FORMAT': 'application/json', 'FEATURE_COUNT': 10
                    }
                );

                $.ajax({
                    url: url,
                    type: 'GET',
                    async: false,
                    crossDomain: true,
                    dataType: 'json',
                    success: function (data) {
                        if (data.features.length > 0) {

                            data.features.forEach(function (r) {
                                let div = document.createElement('div');
                                div.className = "w3-small w3-light-gray";
                                let html = '<table>';
            
                                for(let f in r.properties){
                                    if (f!=='geom' && f!=='id') {
                                        let value = r.properties[f] ? r.properties[f].toString() : '';
                                        let row = "<tr><td class='w3-grey'>" + f.replace(/_/g,' ').toUpperCase() + "</td><td>" + value + "</td></tr>";
                                        html += row;
                                    }
                                }

                                html += "</table>";
                                
                                identifyResults.innerHTML = identifyResults.innerHTML + html;
                            });
                        }
                    }
                });
            });
            Mapa.Interactions.evtKeys.identifyEvent = evtKey;
        }

        Mapa.Actions.getEditableLayers = function(){
            let lista = [];
            for (let key in Mapa.Layers){
                if (Mapa.Layers[key].editable){
                    lista.push(Mapa.Layers[key]);
                }
            }
            return lista;
        }

        Mapa.Actions.ZoomToFullExtent = function () {
            Mapa.Map.getView().setCenter([Mapa.JSONConfig.DefaultView.X, Mapa.JSONConfig.DefaultView.Y]);
            Mapa.Map.getView().setZoom(Mapa.JSONConfig.DefaultView.DefaultZoom);
        };

        Mapa.Actions.ShowHideTOC = function(){
            Mapa.UI.TOCPannel.style.display = (Mapa.UI.TOCPannel.style.display === 'none' ? '' : 'none');
            Mapa.UI.IdentifyPannel.style.display = 'none';
            Mapa.UI.SearchPannel.style.display = 'none';
        }

        Mapa.Actions.ShowHideCC = function(){
            Mapa.UI.Left.style.display = (Mapa.UI.Left.style.display === 'none' ? '' : 'none');
        }

        Mapa.Actions.ExportMap = function(guardar){
                document.body.style.cursor = 'progress';

                let format = 'a4';
                let resolution = 150;
                let dim = [297, 210];
                let width = Math.round(dim[0] * resolution / 25.4);
                let height = Math.round(dim[1] * resolution / 25.4);
                let size = Mapa.Map.getSize();
                let viewResolution = Mapa.Map.getView().getResolution();
            
                Mapa.Map.once('rendercomplete', function () {
                    let mapCanvas = document.createElement('canvas');
                    mapCanvas.width = width;
                    mapCanvas.height = height;
                    let mapContext = mapCanvas.getContext('2d');
            
                    Array.prototype.forEach.call(document.querySelectorAll('.ol-layer canvas'), function (canvas) {
                        if (canvas.width > 0) {
                            let opacity = canvas.parentNode.style.opacity;
                            mapContext.globalAlpha = opacity === '' ? 1 : Number(opacity);
                            let transform = canvas.style.transform;
                            // Get the transform parameters from the style's transform matrix
                            let matrix = transform.match(/^matrix\(([^\(]*)\)$/)[1].split(',').map(Number);
                            // Apply the transform to the export map context
                            CanvasRenderingContext2D.prototype.setTransform.apply(mapContext, matrix);
                            mapContext.drawImage(canvas, 0, 0);
                        }
                    });
                    //let pdf = new jsPDF('landscape', undefined, format);
                    let imagen = mapCanvas.toDataURL();
            
                    // Reset original map size
                    Mapa.Map.setSize(size);
                    Mapa.Map.getView().setResolution(viewResolution);

                    document.body.style.cursor = 'default';

                    if(guardar) {
			let cc = [];
            		if(Mapa.Status.MemorySketch.geometry){
                        let cs = Mapa.Status.MemorySketch.geometry.getCoordinates()[0];

                        let cx1 = Math.round(cs[0][0] * 100) / 100;
                        let cy1 = Math.round(cs[0][1] * 100) / 100;
                        let cx2, cy2, ca, cd;

                        cc = [{
                            'vertice':1,
                            'angulo':0,
                            'distancia' : 0,
                            'x': cx1.toFixed(2),
                            'y': cy1.toFixed(2)
                        }];

                        for(let i = 1; i<cs.length;i++){
                            cx2 = Math.round(cs[i][0] * 100) / 100;
                            cy2 = Math.round(cs[i][1] * 100) / 100;
                            
                            ca = Math.round(Mapa.Math.A(Mapa.Math.M(cx1, cy1, cx2, cy2), cx1, cy1, cx2, cy2) * 100) / 100;
                            cd = Math.round(Mapa.Math.D(cx1, cy1, cx2, cy2) * 100) /100;

                            cc.push({
                                'vertice':i+1,
                                'angulo':ca,
                                'distancia' : cd.toFixed(2),
                                'x': cx2.toFixed(2),
                                'y': cy2.toFixed(2)
                            });

                            cx1 = cx2;
                            cy1 = cy2;
                        }
			}
                        let data = {
                            id: Mapa.Params.id,
                            id_tramite: Mapa.Params.id_tramite,
                            img: imagen,
                            cc: cc
                        };
			
                        let url = APIurl + '/predio/save_image';

                        var xmlHttp = new XMLHttpRequest();
                        xmlHttp.open("POST", url, false); // false for synchronous request
                        xmlHttp.setRequestHeader("Content-type", "application/json");
                        xmlHttp.send(JSON.stringify(data));
			let respuesta = xmlHttp.responseText;
			console.log(respuesta);
                    } else {
                        if(document.getElementById('btnDownloadImage')) {
                            document.getElementById('btnDownloadImage').setAttribute('download','map.png');
                            document.getElementById('btnDownloadImage').href = imagen;
                            document.getElementById('btnDownloadImage').click();
                        } else {
                            return imagen;
                        }
                    }
                });
            
                Mapa.Map.renderSync();
            
                // Set print size
                var printSize = [width, height];
                Mapa.Map.setSize(printSize);
                var scaling = Math.min(width / size[0], height / size[1]);
                Mapa.Map.getView().setResolution(viewResolution / scaling);
        }

        Mapa.Actions.ClearInteractions = function(){
            for (let key in Mapa.Interactions.evtKeys) {
                ol.Observable.unByKey(Mapa.Interactions.evtKeys[key]);
                delete Mapa.Interactions.evtKeys[key];
            }
        
            for (let key in Mapa.Interactions.interactions) {
                Mapa.Map.removeInteraction(Mapa.Interactions.interactions[key]);
                delete Mapa.Interactions.interactions[key];
            }

            Mapa.Actions.clearSketch();

            Mapa.UI.MapViewContainer.style.cursor = 'default';
        }

        Mapa.Actions.ActiveSnaps = function(){
            Mapa.Interactions.snaps.forEach(function(snap){
                try {
                    Mapa.Map.removeInteraction(snap);
                } catch(e){
                    console.log(e)
                }
            });

            Mapa.Interactions.snaps = [];

            for(let key in Mapa.Layers){
                let l = Mapa.Layers[key];
                if (l.type==='MVC' || l.type === 'Vector'){
                    if (l.getVisible() === true) {
                        let snap = new ol.interaction.Snap({
                            source:l.getSource()
                        });

                        Mapa.Interactions.snaps.push(snap);
                        Mapa.Map.addInteraction(snap);
                    }
                }
            }
        }

        Mapa.Actions.GoogleMapsLink = function(){
            Mapa.Actions.ClearInteractions();

            let evtKey = Mapa.Map.on('singleclick', function (evt) {
                const lonlat = ol.proj.transform(evt.coordinate, Mapa.Projections.getCurrent().et, 'EPSG:4326');
                const url = 'https://www.google.com.gt/maps/@' + lonlat[1] + ',' + lonlat[0] + ',20z';
                window.open(url, '_blank');
            });

            Mapa.Interactions.evtKeys.googleMaps = evtKey;
        }

        Mapa.Actions.setEditableLayer = function(layerId){
            Mapa.Actions.ClearInteractions();

            Mapa.Status.WorkLayer = Mapa.Layers[layerId];

            if(Mapa.Status.WorkLayer.getSource().getFeatures().length > 0){
               Mapa.Actions.seleccionar();
            }

            Mapa.Actions.UpdateUI();
        }

        Mapa.Actions.orderVertex = function (feature,order,clockwise) {
            let y = 0;
            let x = 0;
            let pos = 0;
    
            feature.getGeometry().getCoordinates()[0].forEach(function (c, index) {
                switch (order) {
                    case 'north':
                        if (c[1] > y) {
                            y = c[1];
                            pos = index;
                        }
                        break;
                    case 'south':
                        if (c[1] < y) {
                            y = c[1];
                            pos = index;
                        }
                        break;
                    case 'east':
                        if (c[0] > x) {
                            x = c[0];
                            pos = index;
                        }
                        break;
                    case 'west':
                        if (c[0] < x) {
                            x = c[0];
                            pos = index;
                        }
                        break;
                }
            });
    
            let arr1 = [];
            let arr2 = [];
    
            feature.getGeometry().getCoordinates()[0].forEach(function (c, index) {
                if (index >= pos) {
                    arr1.push(c);
                } else {
                    arr2.push(c);
                }
            });
    
            arr2.forEach(function (c, index) {
                arr1.push(c);
            });
    
            let clockwiseDirection = arr1[0][0] < arr1[1][0] ? true : false;
    
            if (clockwise && !clockwiseDirection) {
                arr2 = [arr1[0]];
    
                for (let i = arr1.length - 1; i > 0; i--) {
                    arr2.push(arr1[i]);
                }
    
                arr1 = arr2;
            }
    
    
            if (arr1[0][0] !== arr1[arr1.length - 1][0] || arr1[0][1] !== arr1[arr1.length - 1][1]) {
                arr1.push(arr1[0]);
            }
    
            let coordenadas = [];
            for (let i = 0; i < arr1.length; i++) {
                if (i > 0) {
                    if (arr1[i][0] !== arr1[i - 1][0] || arr1[i][1] !== arr1[i - 1][1]) {
                        coordenadas.push(arr1[i]);
                    }
                } else {
                    coordenadas.push(arr1[i]);
                }
            }
    
            feature.getGeometry().setCoordinates([coordenadas]);

            return feature;
        };

        Mapa.Actions.drawNodes = function (g, keep, layer) {
            let Cotas = layer && layer.geometry && layer.geometry.detaillsLayers && layer.geometry.detaillsLayers.dimension ? Mapa.Layers[layer.geometry.detaillsLayers.dimension] : Mapa.Layers.Temp;
            let Vertices = layer && layer.geometry && layer.geometry.detaillsLayers && layer.geometry.detaillsLayers.vertex ? Mapa.Layers[layer.geometry.detaillsLayers.vertex] : Mapa.Layers.Temp;
            let Areas = layer && layer.geometry && layer.geometry.detaillsLayers && layer.geometry.detaillsLayers.area ? Mapa.Layers[layer.geometry.detaillsLayers.area] : Mapa.Layers.Temp;
        
            if (!keep) {
                Vertices.getSource().clear();
                Cotas.getSource().clear();
                Areas.getSource().clear();

                Vertices.getSource().forEachFeature(function (feature) {
                    if (feature.idPadre === g.id && feature.get('identifySrc') === 'drawNodes') {
                        Vertices.getSource().removeFeature(feature);
                    }
                });
        
                Cotas.getSource().forEachFeature(function (feature) {
                    if (feature.idPadre === g.id && feature.get('identifySrc') === 'drawNodes') {
                        Cotas.getSource().removeFeature(feature);
                    }
                });
        
                Areas.getSource().forEachFeature(function (feature) {
                    if (feature.idPadre === g.id && feature.get('identifySrc') === 'drawNodes') {
                        Areas.getSource().removeFeature(feature);
                    }
                });
            }
        
            let textStyle = function (id, placement) {
                return new ol.style.Text({
                    font: "bold 20px Calibri",
                    text: id.toString(),
                    fill: new ol.style.Fill({
                        color: '#000000'
                    }),
                    placement: placement,
                    overflow: false,
                    stroke: new ol.style.Stroke({
                        color: '#ffffff',
                        width: 2
                    }),
                });
            };
        
            let cordenadas;
        
            if (g.getType() === 'Polygon') {
                cordenadas = g.getCoordinates()[0];
            } else if (g.getType() === 'Circle') {
                cordenadas = [];
        
                cordenadas.push(g.getCenter());
                let ca = 45;
                let cd = g.getRadius();
        
                let cx2 = Math.round((g.getCenter()[0] + Mapa.Math.X(cd, ca) * 100) / 100);
                let cy2 = Math.round((g.getCenter()[1] + Mapa.Math.Y(cd, ca) * 100) / 100);
        
                cordenadas.push([cx2, cy2]);
            }
            else {
                cordenadas = g.getCoordinates();
            }
        
            if (g.getType() === 'Point') {
                let feature = new ol.Feature({
                    identifySrc: 'drawNodes',
                    geometry: new ol.geom.Point(cordenadas)
                });
        
                feature.idPadre = g.id;
        
                feature.setStyle(
                    new ol.style.Style({
                        stroke: new ol.style.Stroke({
                            color: 'rgba(255,255,255,0.5)',
                            width: 2
                        }),
                        image: new ol.style.Circle({
                            radius: 7,
                            fill: new ol.style.Fill({
                                color: 'rgba(255,255,255,0.1)'
                            })
                        }),
                        text: textStyle(g.label ? g.label : g.etiqueta ? g.etiqueta : g.id ? g.id : '', 'point')
                    }));
        
                Vertices.getSource().addFeature(feature);
            }
        
        
            if (g.getType() === 'Polygon' || g.getType() === 'LineString') {
                for (let i = 0; i < cordenadas.length - 1; i++) {
                    let feature = new ol.Feature({
                        identifySrc: 'drawNodes',
                        geometry: new ol.geom.Point(cordenadas[i])
                    });
        
                    feature.idPadre = g.id;
        
                    feature.setStyle(
                        new ol.style.Style({
                            stroke: new ol.style.Stroke({
                                color: 'rgba(255,255,255,0.1)',
                                width: 2
                            }),
                            image: new ol.style.Circle({
                                radius: 7,
                                fill: new ol.style.Fill({
                                    color: 'rgba(255,255,255,0.1)'
                                })
                            }),
                            text: textStyle((i + 1), 'point')
                        }));
        
                    Vertices.getSource().addFeature(feature);
                }
            }
        
            if (g.getType() === 'LineString') {
                for (let i = 0; i < cordenadas.length; i++) {
                    let feature = new ol.Feature({
                        identifySrc: 'drawNodes',
                        geometry: new ol.geom.Point(cordenadas[i])
                    });
        
                    feature.idPadre = g.id;
        
                    feature.setStyle(
                        new ol.style.Style({
                            stroke: new ol.style.Stroke({
                                color: 'rgba(255,255,255,0.1)',
                                width: 2
                            }),
                            image: new ol.style.Circle({
                                radius: 7,
                                fill: new ol.style.Fill({
                                    color: 'rgba(255,255,255,0.1)'
                                })
                            }),
                            text: textStyle((i + 1), 'point')
                        }));
        
                    Vertices.getSource().addFeature(feature);
                }
            }
        
            if (g.getType() !== 'Point') {
                let lastca = 0;
                let coordLine = [];
        
                for (let i = 0; i < cordenadas.length; i++) {
                    if (i < (cordenadas.length - 1)) {
                        let ca = Mapa.Math.A(Mapa.Math.M(cordenadas[i][0], cordenadas[i][1], cordenadas[i + 1][0], cordenadas[i + 1][1]), cordenadas[i][0], cordenadas[i][1], cordenadas[i + 1][0], cordenadas[i + 1][1]);
        
                        coordLine.push(cordenadas[i]);
                        if (Math.abs(lastca - ca) > 10 && i > 0) {
                            let feature = new ol.Feature({
                                identifySrc: 'drawNodes',
                                geometry: new ol.geom.LineString(coordLine)
                            });
        
                            feature.idPadre = g.id;
        
                            feature.setStyle(
                                new ol.style.Style({
                                    stroke: new ol.style.Stroke({
                                        color: 'rgba(255,255,255,0)',
                                        width: 2
                                    }),
                                    text: textStyle(Mapa.Math.formatLength(feature.getGeometry()), 'line')
                                }));
                            Cotas.getSource().addFeature(feature);
        
                            coordLine = [];
                            coordLine.push(cordenadas[i]);
        
                        }
                        lastca = ca;
                    } else {
        
                        coordLine.push(cordenadas[i]);
                        let feature = new ol.Feature({
                            identifySrc: 'drawNodes',
                            geometry: new ol.geom.LineString(coordLine)
                        });
        
                        feature.idPadre = g.id;
        
                        feature.setStyle(
                            new ol.style.Style({
                                stroke: new ol.style.Stroke({
                                    color: 'rgba(255,255,255,0.1)',
                                    width: 2
                                }),
                                text: textStyle(Mapa.Math.formatLength(feature.getGeometry()), 'line')
                            }));
                        Cotas.getSource().addFeature(feature);
                    }
                }
            }
        
            if (g.getType() === 'Polygon') {
                let feature = new ol.Feature({
                    identifySrc: 'drawNodes',
                    geometry: g.getInteriorPoint().clone()
                });
        
                feature.idPadre = g.id;
        
                feature.setStyle(
                    new ol.style.Style({
                        stroke: new ol.style.Stroke({
                            color: 'rgba(255,255,255,0)',
                            width: 2
                        }),
                        image: new ol.style.Circle({
                            radius: 7,
                            fill: new ol.style.Fill({
                                color: 'rgba(255,255,255,0)'
                            })
                        }),
                        text: textStyle(Mapa.Math.formatNumber(Math.round(g.getArea() * 100) / 100, 2) + 'm2', 'point')
                    }));
        
                Areas.getSource().addFeature(feature);
            }
        
            if (g.getType() === 'LineString') {
                let feature = new ol.Feature({
                    identifySrc: 'drawNodes',
                    geometry: new ol.geom.Point(g.getLastCoordinate())
                });
        
                feature.idPadre = g.id;
        
                feature.setStyle(
                    new ol.style.Style({
                        stroke: new ol.style.Stroke({
                            color: 'rgba(255,255,255,0)',
                            width: 2
                        }),
                        image: new ol.style.Circle({
                            radius: 7,
                            fill: new ol.style.Fill({
                                color: 'rgba(255,255,255,0.1)'
                            })
                        }),
                        text: textStyle(Mapa.Math.formatLength(g), 'point')
                    }));
        
                Cotas.getSource().addFeature(feature);
        
            }
        
            if (g.getType() === 'Circle' || g.type === 'Circle') {
                let feature = new ol.Feature({
                    identifySrc: 'drawNodes',
                    geometry: new ol.geom.Point(g.getCenter())
                });
        
                feature.idPadre = g.id;
        
                feature.setStyle(
                    new ol.style.Style({
                        stroke: new ol.style.Stroke({
                            color: '#fa2a8f',
                            width: 2
                        }),
                        image: new ol.style.Circle({
                            radius: 7,
                            fill: new ol.style.Fill({
                                color: 'rgba(255,255,255,0.1)'
                            })
                        }),
                        text: textStyle(Mapa.Math.formatNumber(Math.round(Math.PI * (g.getRadius() * g.getRadius()) * 100) / 100, 2) + ' m2', 'point')
                    }));
        
                Cotas.getSource().addFeature(feature);
        
            }
        
            return;
        };

        Mapa.Actions.draw = function(type){
                Mapa.Actions.ClearInteractions();

                Mapa.Interactions.interactions.modify = new ol.interaction.Modify({
                    id: 'modify',
                    source: Mapa.Status.WorkLayer.getSource()
                });
            
                Mapa.Map.addInteraction(Mapa.Interactions.interactions.modify);
            
                Mapa.Interactions.interactions.draw = new ol.interaction.Draw({
                    id: 'draw',
                    source: Mapa.Status.WorkLayer.getSource(),
                    type: type,
                    freehandCondition: ol.events.condition.platformModifierKeyOnly,
                    stopClick: true,
                    style: new ol.style.Style({
                        fill: new ol.style.Fill({
                            color: 'rgba(0,0,0, 0.2)'
                        }),
                        stroke: new ol.style.Stroke({
                            color: '#ffcc33',
                            width: 2
                        }),
                        image: new ol.style.Circle({
                            radius: 7,
                            fill: new ol.style.Fill({
                                color: '#ffcc33'
                            })
                        })
                    }),
                    geometryFunction: function (c, g) {
                        
                        let tools = document.getElementsByClassName('CCs')

                        for (let i = 0; i < tools.length;i++){
                            if(tools[i].className.indexOf(type) === -1 ){
                                tools[i].style.display='none';
                            } else {
                                tools[i].style.display='';
                            }   
                        }

                        if (type === 'Circle') {
                            let center = c[0];
                            let last = c[1];
                            let dx = center[0] - last[0];
                            let dy = center[1] - last[1];
                            let radius = Mapa.Status.MemorySketch.radio && Mapa.Status.MemorySketch.radio > 0 ? Mapa.Status.MemorySketch.radio : Math.round(Math.sqrt(dx * dx + dy * dy),2);
                        
                            if (!g) {
                                g = new ol.geom.Circle(center, radius);
                                g.type = 'Circle';
                        
                                g.on('change', function () {
                                    Mapa.Actions.drawNodes(this, false, Mapa.Status.WorkLayer);
                                    if (document.getElementById('DrawTools').style.display === 'block') {
                                        document.getElementById('Radio').value = '';
                                        document.getElementById('Radio').focus();
                                    }
                                });
                        
                                Mapa.Status.MemorySketch.geometry = g;
                            } else {
                                g.setCenterAndRadius(center, radius);
                            }
                        } else {
                            if (g) {
                                if (type === 'LineString' || type === 'Polygon') {
                                    document.getElementById('CCVertices').innerHTML = '';
                                    let cs = type === 'LineString' ? c : c[0];
            
                                    if (type === 'Polygon') {
                                        if (Math.abs(Mapa.Status.MemorySketch.geometry.getCoordinates()[0].length - cs.length) > 1) {
                                            let clast = cs[cs.length - 1];
                                            cs = Mapa.Status.MemorySketch.geometry.getCoordinates()[0];
                                            g.setCoordinates(Mapa.Status.MemorySketch.geometry.getCoordinates()[0]);
                                            g.getCoordinates()[0].push(clast);
                                        }
                                    } else {
                                        if (Math.abs(Mapa.Status.MemorySketch.geometry.getCoordinates().length - cs.length) > 1) {
                                            let clast = cs[cs.length - 1];
                                            cs = Mapa.Status.MemorySketch.geometry.getCoordinates();
                                            g.setCoordinates(Mapa.Status.MemorySketch.geometry.getCoordinates());
                                            g.getCoordinates().push(clast);
                                        }
                                    }
            
                                    let cx1, cy1, cx2, cy2, ca, cd;
            
                                    if (Mapa.Status.MemorySketch.vertexCount !== cs.length) {
                                        g.setCoordinates(Mapa.Status.MemorySketch.geometry.getCoordinates());
                                        Mapa.Status.MemorySketch.v = null;
                                        Mapa.Status.MemorySketch.a = null;
                                        Mapa.Status.MemorySketch.d = null;
                                        Mapa.Status.MemorySketch.x = null;
                                        Mapa.Status.MemorySketch.y = null;
                                        Mapa.Status.MemorySketch.vertexCount = cs.length;
                                    }
            
                                    cs.forEach(function (coord, index) {
                                        let row = Mapa.addPolygonVertexRow(index);
                                        cx2 = coord[0];
                                        cy2 = coord[1];
            
                                        //let row = document.getElementById('V' + index);
            
                                        if (index > 0) {
                                            ca = Mapa.Math.A(Mapa.Math.M(cx1, cy1, cx2, cy2), cx1, cy1, cx2, cy2);
                                            cd = Mapa.Math.D(cx1, cy1, cx2, cy2);
                                        }
            
                                        if (Mapa.Status.MemorySketch.v && Mapa.Status.MemorySketch.v === index && (Mapa.Status.MemorySketch.x || Mapa.Status.MemorySketch.y || Mapa.Status.MemorySketch.a || Mapa.Status.MemorySketch.d)) {
            
                                            cx2 = Mapa.Status.MemorySketch.x ? Mapa.Status.MemorySketch.x : cs[cs.length - 1][0];
                                            cy2 = Mapa.Status.MemorySketch.y ? Mapa.Status.MemorySketch.y : cs[cs.length - 1][1];
            
                                            if (index > 0) {
            
                                                if (Mapa.Status.MemorySketch.a || Mapa.Status.MemorySketch.d) {
                                                    ca = Mapa.Status.MemorySketch.a ? Mapa.Status.MemorySketch.a : Mapa.Math.A(Mapa.Math.M(cx1, cy1, cx2, cy2), cx1, cy1, cx2, cy2);
                                                    cd = Mapa.Status.MemorySketch.d ? Mapa.Status.MemorySketch.d : Mapa.Math.D(cx1, cy1, cx2, cy2);
                                                }
            
                                                cx2 = cx1 + Mapa.Math.X(cd, ca);
                                                cy2 = cy1 + Mapa.Math.Y(cd, ca);
            
                                                cs[index] = [cx2, cy2];
                                            }
                                        }
            
                                        if (index > 0) {
                                            row.children[2].children[0].value = Math.round((ca * 100) / 100,2);
                                            row.children[3].children[0].value = Math.round((cd * 100) / 100,2);
                                        }
            
                                        row.children[4].children[0].value = Math.round((cx2 * 100) / 100,2);
                                        row.children[5].children[0].value = Math.round((cy2 * 100) / 100,2);
            
                                        cx1 = cx2;
                                        cy1 = cy2;
                                    });
            
                                    if (type === 'Polygon') {
                                        g.setCoordinates([cs]);
                                    } else {
                                        g.setCoordinates(cs);
                                    }
                                } else {
                                    g.setCoordinates(c);
                                }
                            } else {
                                g = eval('new ol.geom.' + type + '(c);');
                                Mapa.Status.MemorySketch.geometry = g;
            
                                if (type === 'LineString' || type === 'Polygon') {
            
                                    Mapa.Status.MemorySketch.v = null;
                                    Mapa.Status.MemorySketch.a = null;
                                    Mapa.Status.MemorySketch.d = null;
                                    Mapa.Status.MemorySketch.x = null;
                                    Mapa.Status.MemorySketch.y = null;
                                    Mapa.Status.MemorySketch.vertexCount = c.length;
            
                                    document.getElementById('CCVertices').innerHTML = '';
                                }
            
            
                                g.on('change', function () {
                                    Mapa.Actions.drawNodes(this, false, Mapa.Status.WorkLayer);
                                });
            
                            }
                        }
            
                        return g;
                    }
                });
            
                Mapa.Interactions.interactions.draw.on('drawstart', function () {
                    $(".CCs").each(function () {
                        this.style.display = 'none';
                    });
            
                    $("." + type).each(function () {
                        this.style.display = 'block';
                    });
                });

                Mapa.Interactions.interactions.draw.on('drawend', function (e) {
                    if (e.feature.getGeometry().getType() === 'Polygon' && Mapa.Status.WorkLayer.geometry.order) {
                        Mapa.Actions.orderVertex(e.feature,Mapa.Status.WorkLayer.geometry.order,Mapa.Status.WorkLayer.geometry.clockwise);
                    }
            
                    Mapa.Actions.drawNodes(e.feature.getGeometry(), false, Mapa.Status.WorkLayer);
            
                    if (e.feature.getGeometry().type === 'Circle') {
                        var parser = new jsts.io.OL3Parser();
                        let radio = parser.read(new ol.geom.Polygon.fromCircle(e.feature.getGeometry(), 360).getLinearRing(0));
                        //document.getElementById('Radio').value = radio;
            
                        Mapa.Status.WorkLayer.getSource().forEachFeature(function (feature) {
                            if (feature.getGeometry().type === 'Circle') {
                                let radio2 = parser.read(new ol.geom.Polygon.fromCircle(feature.getGeometry(), 360).getLinearRing(0));
                                let intersection = radio.intersection(radio2);
            
                                let nfeature = new ol.Feature();
                                nfeature.setGeometry(parser.write(intersection));
                                Mapa.Status.WorkLayer.getSource().addFeature(nfeature);
                            }
                        });
                    }
                });
            
                Mapa.Map.addInteraction(Mapa.Interactions.interactions.draw);

                Mapa.Actions.ActiveSnaps();
        }

        Mapa.Actions.seleccionar = function () {
            Mapa.UI.MapViewContainer.style.cursor = 'default';
            Mapa.Actions.ClearInteractions();
            Mapa.Interactions.interactions.select = new ol.interaction.Select({
                id: "select",
                layers: [Mapa.Status.WorkLayer],
                condition: ol.events.condition.click,
                multi: false,
                style: new ol.style.Style({
                    fill: new ol.style.Fill({
                        color: 'rgba(10, 10, 10, 0.1)'
                    }),
                    stroke: new ol.style.Stroke({
                        color: 'cyan',
                        width: 2
                    }),
                    image: new ol.style.Circle({
                        radius: 7,
                        fill: new ol.style.Fill({
                            color: 'cyan'
                        })
                    })
                })
            });
        
            Mapa.Interactions.interactions.select.on('select', function (e) {
                Mapa.Actions.clearSketch();

                Mapa.Status.Select = {};
                Mapa.Status.Select.target = e.target;
                Mapa.Status.Select.features = Mapa.Status.Select.target.getFeatures();

                Mapa.Interactions.interactions.select.getFeatures().getArray().forEach(function (feature,i) {
                    Mapa.Actions.drawNodes(feature.getGeometry(), true, Mapa.Status.WorkLayer);
                    if (i===0) {
                        Mapa.Status.Select.isPolygon = feature.getGeometry().getType() === 'Polygon';
                    } else {
                        Mapa.Status.Select.isPolygon = Mapa.Status.Select.isPolygon && feature.getGeometry().getType() === 'Polygon';
                    }
                });

                if(Mapa.Status.Select.features.getArray().length === 1) {
                    Mapa.Status.MemorySketch.geometry = Mapa.Status.Select.features.getArray()[0].getGeometry();
                    let tools = document.getElementsByClassName('CCs')

                    for (let i = 0; i < tools.length;i++){
                        if(tools[i].className.indexOf(Mapa.Status.MemorySketch.geometry.getType()) === -1 ){
                            tools[i].style.display='none';
                        } else {
                            tools[i].style.display='';
                        }   
                    }

                    Mapa.Actions.drawNodes(Mapa.Status.MemorySketch.geometry)
                    Mapa.setCCtoGeometry(Mapa.Status.MemorySketch.geometry,true);
                }

                Mapa.Actions.UpdateUI();
            });


            Mapa.Interactions.interactions.modifySelect = new ol.interaction.Modify({
                id: 'modify',
                features: Mapa.Interactions.interactions.select.getFeatures(),
                freehandCondition: ol.events.condition.platformModifierKeyOnly,
                stopClick: true
            });
        
            Mapa.Map.addInteraction(Mapa.Interactions.interactions.modifySelect);
            Mapa.Map.addInteraction(Mapa.Interactions.interactions.select);
        
            let snap = new ol.interaction.Snap({
                features: Mapa.Interactions.interactions.select.getFeatures()
            });
        
            Mapa.Interactions.snaps.push(snap);
            Mapa.Map.addInteraction(snap);
            Mapa.Actions.UpdateUI();
        };

        Mapa.Actions.clearSketch = function() {
            Mapa.Status.MemorySketch = {};
            Mapa.Status.MemorySketch.geometry = null;
            Mapa.Status.MemorySketch.v = null;
            Mapa.Status.MemorySketch.a = null;
            Mapa.Status.MemorySketch.d = null;
            Mapa.Status.MemorySketch.x = null;
            Mapa.Status.MemorySketch.y = null;
            Mapa.Status.MemorySketch.vertexCount = 0;
        }

        Mapa.Actions.updateFusionList = function(){

        }

        Mapa.Actions.canFusionSimple = function (features, getGeometry) {
            let lista = [];
        
            features.forEach(function(feature,i){
                let polygon = turf.polygon(feature.getGeometry().getCoordinates());
                lista.push(polygon);
            });

            let fs = turf.featureCollection(lista);
            let dissolve = turf.dissolve(fs);
        
            if (dissolve.features.length !== 1) {
                return false;
            } else {
                if (getGeometry) {
                    let format = new ol.format.GeoJSON();
                    let geometry = format.readFeature(dissolve.features[0]).getGeometry();
        
                    return geometry;
                } else {
                    return true;
                }
            }
        };
        
        Mapa.Actions.fussion = function () {
            Mapa.UI.MapViewContainer.style.cursor = 'default';
            Mapa.Status.Select.features.getArray().forEach(function (feature,i) {
                if(i===0){
                    let nuevo = Mapa.Actions.canFusionSimple(Mapa.Status.Select.features.getArray(), true);
                    feature.setGeometry(nuevo);
                } else {
                    Mapa.Status.WorkLayer.getSource().removeFeature(feature);
                }
            });
        };

        Mapa.Actions.dividir = function () {
            Mapa.UI.MapViewContainer.style.cursor = 'crosshair';

            Mapa.Interactions.interactions.cutLinesInteraction = new ol.interaction.Draw({
                features: [],
                stopClick: true,
                type: "LineString",
                style: CutStyle()
            });
        
            Mapa.Interactions.interactions.cutLinesInteraction.on('drawstart', function (event) {
                Mapa.Interactions.interactions.select.setActive(false);
            });
        
            Mapa.Interactions.interactions.cutLinesInteraction.on('drawend', function (event) {
                //Mapa.Layers.Auxiliar.getSource().addFeature(event.feature);

                let parser = new jsts.io.OL3Parser();
                let cutLine = parser.read(event.feature.getGeometry());
                let polygonizer = new jsts.operation.polygonize.Polygonizer();
        
                let lista = [];

                Mapa.Status.Select.features.forEach(function (feature) {
                    let poly1 = parser.read(feature.getGeometry()).getExteriorRing();
                    let g = poly1.union(cutLine);
        
                    polygonizer.add(g);
        
                    let polygons = polygonizer.getPolygons();
                    let iterator;
                    let asignado = false;
                    for (iterator = polygons.iterator(); iterator.hasNext();) {
                        let polygon = iterator.next();
        
                        let geometry = parser.write(polygon);
                        if(!asignado){
                            feature.getGeometry().setCoordinates(geometry.getCoordinates());
                            asignado = true;
                        } else {
                            let nfeature = new ol.Feature({
                                geometry: geometry
                            });
                            lista.push(nfeature);
                        }
                    }
                    Mapa.Status.WorkLayer.getSource().addFeatures(lista);
                });
        
                Mapa.Map.removeInteraction(Mapa.Interactions.interactions.cutLinesInteraction);
                Mapa.Interactions.interactions.cutLinesInteraction = null;
                Mapa.Interactions.interactions.select.setActive(true);
            });
        
            Mapa.Map.addInteraction(Mapa.Interactions.interactions.cutLinesInteraction);
        };

        Mapa.Actions.SetIDValidation = function(){

            let registros = httpGet(APIurl + '/predio/Predios_x_Tramite/' + Mapa.Params.id_tramite,'JSON')

            document.getElementById('selId').innerHTML = "";
            let noneOption =document.createElement('option');
            noneOption.selected = true;
            noneOption.disabled = true;
            noneOption.value="";
            noneOption.innerHTML = 'Seleccione el ID';

            document.getElementById('selId').appendChild(noneOption);

            registros.forEach(function(r,i){
                if (r.predio_estatus_id === "3") {
                    let option = document.createElement('option');
                    option.value = r.id;
                    option.innerHTML = r.clave_catastral;
                    document.getElementById('selId').appendChild(option)
                }
            })
        }
    }

    initMap() {
        const Mapa = this;

        Mapa.UI.Containter = null;

        if(document.getElementById('Mapa')){
            Mapa.UI.Containter = document.getElementById('Mapa');
        } else {
            Mapa.UI.Containter = document.createElement('div');
        }

        Mapa.UI.Containter.className = 'SpatialComponent';

        Mapa.UI.Top = document.createElement('div');
        Mapa.UI.Top.className = 'w3-display-top no-space Top';
        Mapa.UI.Middle = document.createElement('div');
        Mapa.UI.Middle.className = 'no-space Middle';
        Mapa.UI.Right = document.createElement('div');
        Mapa.UI.Right.className = 'w3-display-right no-space Right';
        //Mapa.UI.Right.style.display = 'none';
        Mapa.UI.Left = document.createElement('div');
        Mapa.UI.Left.className = 'w3-display-left no-space Left';
        Mapa.UI.Left.style.display = 'none';

        Mapa.UI.MenuBar = document.createElement('div');
        Mapa.UI.MenuBar.className = 'w3-bar no-space MenuBar'
        Mapa.UI.ButtonBar = document.createElement('div');
        Mapa.UI.ButtonBar.className = 'w3-bar no-space ButtonBar'
        Mapa.UI.ToolBar = document.createElement('div');
        Mapa.UI.ToolBar.className = 'w3-bar no-space ToolBar'

        Mapa.UI.MapViewContainer = document.createElement('div');
        Mapa.UI.MapViewContainer.className = 'no-space availableHeight MapViewContainer';
        Mapa.UI.RightContainer = document.createElement('div');
        Mapa.UI.RightContainer.className = 'no-space';

        Mapa.UI.RightBarIconsBar = document.createElement('div');
        Mapa.UI.RightBarIconsBar.className = 'w3-bar no-space';

        Mapa.UI.TOCPannel = document.createElement('div');
        Mapa.UI.TOCPannel.className = 'no-space container';
        Mapa.UI.TOCPannel.style.display='none';

        const TOCTitle = document.createElement('h4');
        TOCTitle.classList='no-space w3-center';
        TOCTitle.innerHTML = 'Capas de información';

        Mapa.UI.TOCPannel.appendChild(TOCTitle);

        Mapa.UI.IdentifyPannel = document.createElement('div');
        Mapa.UI.IdentifyPannel.className = 'no-space';
        Mapa.UI.IdentifyPannel.style.display='none';
        Mapa.UI.IdentifyPannel.maxHeight='900px';

        const IdentifyTitle = document.createElement('h4');
        IdentifyTitle.classList='no-space w3-center';
        IdentifyTitle.innerHTML = 'Identificación';

        let IdentifyResults = document.createElement('div');
        IdentifyResults.className = 'no-space w3-small container';
        IdentifyResults.id = 'IdentifyResults';

        Mapa.UI.IdentifyPannel.appendChild(IdentifyTitle);
        Mapa.UI.IdentifyPannel.appendChild(IdentifyResults);

        Mapa.UI.SearchPannel = document.createElement('div');
        Mapa.UI.SearchPannel.className = 'no-space';
        Mapa.UI.SearchPannel.style.display='none';
        Mapa.UI.SearchPannel.maxHeight='900px';

        let SearchResults = document.createElement('div');
        SearchResults.className = 'no-space w3-small container';
        SearchResults.style.overflow='auto';
        SearchResults.id = 'SearchResults';

        const SearchTitle = document.createElement('h4');
        SearchTitle.classList='no-space w3-center';
        SearchTitle.innerHTML = 'Resultados';

        Mapa.UI.SearchPannel.appendChild(SearchTitle);
        Mapa.UI.SearchPannel.appendChild(SearchResults);

        Mapa.UI.Top.appendChild(Mapa.UI.MenuBar);
        Mapa.UI.Top.appendChild(Mapa.UI.ButtonBar);
        Mapa.UI.Top.appendChild(Mapa.UI.ToolBar);

        
        
        

        Mapa.UI.Right.appendChild(Mapa.UI.RightBarIconsBar);
        Mapa.UI.RightContainer.appendChild(Mapa.UI.TOCPannel);
        Mapa.UI.RightContainer.appendChild(Mapa.UI.IdentifyPannel);
        Mapa.UI.RightContainer.appendChild(Mapa.UI.SearchPannel);

        Mapa.UI.Right.appendChild(Mapa.UI.RightContainer);

        Mapa.UI.Middle.appendChild(Mapa.UI.MapViewContainer);

        Mapa.UI.Containter.appendChild(Mapa.UI.Top);
        Mapa.UI.Containter.appendChild(Mapa.UI.Middle);
        Mapa.UI.Containter.appendChild(Mapa.UI.Right);
        Mapa.UI.Containter.appendChild(Mapa.UI.Left);

        const BackgroundContainer = document.createElement('div');
        BackgroundContainer.className = 'no-space BackgroundContainer';
        const BackgroundLabel = document.createElement('span');
        BackgroundLabel.innerHTML = 'Color de fondo ';
        const BackGroundControl = document.createElement('input');
        BackGroundControl.className ='w3-right';
        BackGroundControl.type = 'color';

        BackgroundContainer.appendChild(BackgroundLabel);
        BackgroundContainer.appendChild(BackGroundControl);
        Mapa.UI.TOCPannel.appendChild(BackgroundContainer);

        BackGroundControl.onchange = function () {
            Mapa.UI.MapViewContainer.style.backgroundColor = this.value;
        };
    
        BackGroundControl.value = '#ffffff'; //Mapa.UI.JSONConfig.MapView.BackgroundColor;
	//console.log(Mapa.UI.JSONConfig.MapView.BackgroundColor);
        BackGroundControl.onchange();

        Mapa.initUI();
        Mapa.MathTools();
        Mapa.initActions();

        let Layers = Mapa.initLayers();

        Mapa.Map = new ol.Map({
            controls: [],
            target: Mapa.UI.MapViewContainer,
            layers: Layers,
            view: new ol.View({
                projection: Mapa.Projections.Default,
                center: [Mapa.JSONConfig.DefaultView.X, Mapa.JSONConfig.DefaultView.Y],
                zoom: Mapa.JSONConfig.DefaultView.DefaultZoom
            })
        });

        if(Mapa.JSONConfig.Principal){
            Mapa.Actions.setPrincipal(Mapa.JSONConfig.Principal);
        }


        let source = new ol.source.Vector();
    
        /*
        source.on('change', function () {
            source.forEachFeature(function (feature) {
                if (!document.getElementById('Identify_control_' + feature.layerName + "_" + feature.getId())) {
                    fnAddFeatureControl(feature);
                }
            });
        });*/
    
        Mapa.IdentifyLayer = new ol.layer.Vector({
            id: 'Identify',
            source: source,
            style: getDrawFeatureStyle()
        });
    
        Mapa.Map.addLayer(Mapa.IdentifyLayer);

        return Mapa;
    }

    createGroup(GroupDef){
        const Mapa = this;

        let GroupContainer = document.createElement('div')
        GroupContainer.className = 'no-space GroupContainer';

        let LayerGroupContainer = document.createElement('div')
        LayerGroupContainer.className = 'w3-bar no-space LayerGroupContainer';
        LayerGroupContainer.style.display = GroupDef.status.expanded ? '' : 'none';

        let GroupControl = document.createElement('div')
        GroupControl.className = 'w3-bar no-space GroupControl';

        let GroupExpand = document.createElement('button');
        GroupExpand.className = 'w3-bar-item no-space GroupExpand';
        GroupExpand.innerHTML = GroupDef.status.expanded ? '<i class="far fa-minus-square no-space"></i>' : '<i class="far fa-plus-square no-space"></i>';
        GroupExpand.setAttribute('title', 'Expander/Contraer el grupo');
        //GroupExpand.style.display = GroupDef.status.expanded ? '' : 'none';

        let GroupVisible = document.createElement('input');
        GroupVisible.type = 'checkbox';
        GroupVisible.className = "w3-bar-item w3-check no-space GroupVisible";
        GroupVisible.checked = GroupDef.status.visible;
        GroupVisible.setAttribute('title', 'Apaga/Enciende el grupo de capas');

        let GroupTransparency = document.createElement('input');
        GroupTransparency.className = 'w3-bar-item no-space slider GroupTransparency';
        GroupTransparency.type = 'range';
        GroupTransparency.min = 0;
        GroupTransparency.max = 100;
        GroupTransparency.value = GroupDef.status.opacity * 100;
        GroupTransparency.step = 1;
        GroupTransparency.style.width ='50px';
        GroupTransparency.style.paddingLeft = '0px';
        GroupTransparency.style.paddingRight = '0px';
        GroupTransparency.setAttribute('title', 'Cambia la opacidad del grupo');
    
        let GroupLabel = document.createElement('div');
        GroupLabel.className = 'w3-bar-item GroupLabel';
        GroupLabel.style.width = '220px';
        GroupLabel.innerHTML = GroupDef.name;

        GroupControl.appendChild(GroupExpand);
        GroupControl.appendChild(GroupVisible);
        GroupControl.appendChild(GroupLabel);
        GroupControl.appendChild(GroupTransparency);

        GroupContainer.appendChild(GroupControl);
        GroupContainer.appendChild(LayerGroupContainer);

        let Layers = [];

        for(let layerDef in GroupDef.layers){
            let Layer = Mapa.createLayer(GroupDef.layers[layerDef]);
            Layers.push(Layer);
            if (!GroupDef.layers[layerDef].status.inTOC === undefined || GroupDef.layers[layerDef].status.inTOC !== false) {
                LayerGroupContainer.appendChild(Layer.Control);
            }
        }

        let Group = new ol.layer.Group({
            id: GroupDef.id,
            name: GroupDef.name,
            layers: Layers,
            visible: GroupDef.status.visible,
            opacity: GroupDef.status.opacity
        });

        GroupExpand.onclick = function () {
            LayerGroupContainer.style.display = LayerGroupContainer.style.display === 'none' ? '' : 'none';
            GroupExpand.innerHTML = LayerGroupContainer.style.display === 'none' ? '<i class="far fa-lg fa-plus-square no-space"></i>' : '<i class="far fa-lg fa-minus-square no-space"></i>';
        };

        GroupVisible.addEventListener('change',function () {
            Group.setVisible(!Group.getVisible());
        });

        GroupTransparency.addEventListener('change', function () {
            this.setAttribute('title', 'Opacidad: ' + this.value + '%');
            Group.setOpacity(this.value / 100);
        });

        Mapa.UI.TOCPannel.appendChild(GroupContainer);
        Group.Control = GroupContainer;

        return Group;
    }

    createLayer(LayerDef){
        const Mapa = this;

        let Layer = null;

        switch (LayerDef.source.type) {
            case 'OSM':
                Layer = new ol.layer.Tile({
                    source: new ol.source.OSM()
                  }); 

                break;
            case 'XYZ':
                Layer = new ol.layer.Tile({
                    source: new ol.source.XYZ({
                        crossOrigin: "Anonymous",
                        url: LayerDef.source.url //'https://server.arcgisonline.com/ArcGIS/rest/services/' + 'World_Imagery/MapServer/tile/{z}/{y}/{x}'
                    })
                });

                break;
            case 'WMS':
                if (LayerDef.source.subType) {
                    Layer = new ol.layer.Tile({
                        source: new ol.source.TileWMS({
                            crossOrigin: "Anonymous",
                            url: LayerDef.source.WMShost,
                            params: {
                                'FORMAT': LayerDef.source.format,
                                tiled: LayerDef.source.tiled,
                                "LAYERS": LayerDef.source.workspace + ':' + LayerDef.source.layer,
                                "exceptions": 'application/vnd.ogc.se_inimage'
                            }
                        })
                    });
                } else {
                    Layer = new ol.layer.Image({
                        source: new ol.source.ImageWMS({
                            crossOrigin: "Anonymous",
                            url: LayerDef.source.WMShost,
                            params: {
                                'FORMAT': LayerDef.source.format,
                                "LAYERS": LayerDef.source.workspace + ':' + LayerDef.source.layer,
                                "exceptions": 'application/vnd.ogc.se_inimage'
                            }
                        })
                    });
                }

                break;
            case 'Vector':
                let VecFeatures = [];
                if (LayerDef.actions.get){
                    let url = LayerDef.actions.get.url;

                    Layer.actions.get.params.forEach(function(p){
                        url = url.replace(p, Mapa.Params[p]);
                    });
    
                    VecFeatures = httpGet(url,'JSON');
                }
                

                Layer = new ol.layer.Vector({
			/*
                    style: function (feature) {
                        if(LayerDef.styles) {
                            if (LayerDef.styles.styles[LayerDef.styles.default].type === 'function') {
                                return window[JSONLayerDefinition.styles.default](feature);
                            } else {
                                return createStyle(JSONLayerDefinition.styles.default, oMapa);
                            }
                        }
                    },*/
                    source: new ol.source.Vector({
                        crossOrigin: "Anonymous",
                        features: VecFeatures
                    })
                });

                break;
            case 'MVC':
                let format = null;
                let MVCFeatures = [];
                let MVCSource = new ol.source.Vector({
                    crossOrigin: "Anonymous",
                    useSpatialIndex: true
                });

                if (LayerDef.actions.get) {
                    let url = LayerDef.actions.get.url;
                    LayerDef.actions.get.params.forEach(function(p){
                        url = url.replace(p,Mapa.Params[p]);
                    });
    
                    MVCFeatures = httpGet(url,'JSON');

                    switch (LayerDef.source.subType){
                        case ('WKT'):
                            format = new ol.format.WKT();

                            MVCFeatures.forEach(function(f){
                                
                                let Geometry = null;

                                if(LayerDef.source.SRID !== Mapa.JSONConfig.SpatialReference.SRID ) {
                                    Geometry = format.readGeometry(f.geom,{
                                        dataProjection: LayerDef.source.SRID,
                                        featureProjection: Mapa.JSONConfig.SpatialReference.SRID
                                    });
                                } else {
                                    Geometry = format.readGeometry(f.geom);
                                }

                                const id = f[LayerDef.actions.get.id];

                                let Feature = new ol.Feature({
                                    geometry: Geometry,
                                });

                                Feature.setId(id);

                                for(let key in f){
                                    if(key !== 'geom') {
                                        Feature.set(key,f[key]);
                                    }
                                }

                                MVCSource.addFeature(Feature);
                            });

                            break;
                        case ('GeoJSON'):


                            break;
                    }
                }

                Layer = new ol.layer.Vector({
			/*
                    style: function (feature) {
                        if(LayerDef.styles) {
                            if (LayerDef.styles.styles[LayerDef.styles.default].type === 'function') {
                                return window[JSONLayerDefinition.styles.default](feature);
                            } else {
                                return createStyle(JSONLayerDefinition.styles.default, oMapa);
                            }
                        }
                    },**/
                    source: MVCSource
                });

                if (LayerDef.editable && LayerDef.actions && LayerDef.actions.save) { 
                    if(Layer.id === 'VectorPredio') { 
                        if(!data.id) {
                            data.id = Mapa.Params.id;
                        }
                    }

                    if(Layer.id === 'VectorConstruccion'){
                        // Analisis de construcciones vs Predios
                        Layer.getSource().on('addfeature', function (c) {
                            let ConstruccionEnPredio = false;
                            Mapa.Layers.VectorPredio.getSource().forEachFeature(function (p) {
                                if (p.getGeometry().intersectsCoordinate(c.getGeometry().getInteriorPoint().getCoordinates())) {
                                    ConstruccionEnPredio = true;
                                    c.set('predio_id', p.id)
                                }
                            });
                            if (!ConstruccionEnPredio) {
                                c.Parent.tb_construcciones_shape_polygon.setStyle(styleError(''));
                            }
                        });
                    }

                    Layer.Save = function() {
			let url = LayerDef.actions.save.url;
                        let data = [];

                        LayerDef.actions.save.params.forEach(function(p){
                            url = url.replace(p, Mapa.Params[p]);
                        });

                        Layer.getSource().forEachFeature(function(feature){
                            let r = {}
                            for(let key in feature.getProperties()){
                                if(key === 'geometry') {
                                    r['wkt'] = format.writeGeometry(feature.getGeometry());
                                } else {
                                    r[key] = feature.get(key);
                                }
                                if(Layer.id === 'VectorPredio' && !r.id){
                                    r.id = Mapa.Params.id
                                }
                            }
                            data.push(r);
                        });
                       
			console.log(data);
			console.log(url);

                        const response = fetch(url,{
                            method:'POST',
                            data: data,
                            body: JSON.stringify(data),
                            headers:{
                                'Content-Type' : 'application/json'
                            }
                        });

                        if(response.status > 300) {
                            console.log(responseText);
                        }
                    }
                }

                if(LayerDef.actions.extent && MVCFeatures.length>0){
                    Mapa.Actions.ZoomToWorkExtent = function(){
                        Mapa.Map.getView().fit(Layer.getSource().getExtent(), Mapa.Map.getSize());
                    };
                }

                break;
        }

        Layer.id = LayerDef.id;
        Layer.name = LayerDef.name;
        Layer.search = LayerDef.actions && LayerDef.actions.search;
        Layer.type = LayerDef.source.type;
        Layer.identify = LayerDef.actions && LayerDef.actions.identify === true;
        Layer.editable = LayerDef.editable;
        Layer.extent = (LayerDef.source.type == 'Vector' || LayerDef.source.type === 'WMS') && LayerDef.actions.extent;
        Layer.geometry = LayerDef.source.geometry;
        Layer.setVisible(LayerDef.status.visible);

        let LayerContainer = document.createElement('div')
        LayerContainer.className = 'no-space LayerContainer';

        let LayerControl = document.createElement('div')
        LayerControl.className = 'w3-bar no-space LayerControl';

        let LayerVisible = document.createElement('input');
        LayerVisible.type='checkbox';
        LayerVisible.className = "w3-bar-item w3-check no-space LayerVisible";
        LayerVisible.setAttribute('title', 'Apaga/Enciende la capa');
        
        if(Layer.getVisible()) {
            LayerVisible.checked = 'checked';
        }

        LayerVisible.addEventListener('change', function () {
            Layer.setVisible(!Layer.getVisible());
        });

        let LayerTransparency = document.createElement('input');
        LayerTransparency.className = 'w3-bar-item no-space slider LayerTransparency';
        LayerTransparency.type = 'range';
        LayerTransparency.min = 0;
        LayerTransparency.max = 100;
        LayerTransparency.value = LayerDef.status.opacity * 100;
        LayerTransparency.step = 1;
        LayerTransparency.style.width ='50px';
        LayerTransparency.style.paddingLeft = '0px';
        LayerTransparency.style.paddingRight = '0px';
        LayerTransparency.setAttribute('title', 'Cambia la opacidad de la capa');
    
        LayerTransparency.onchange = function () {
            Layer.setOpacity(this.value / 100);
        };

        let LayerLabel = document.createElement('div');
        LayerLabel.className = 'w3-bar-item LayerLabel';
        LayerLabel.style.width = '200px';
        LayerLabel.innerHTML = LayerDef.name;

        LayerControl.appendChild(LayerVisible);
        LayerControl.appendChild(LayerLabel);
        LayerControl.appendChild(LayerTransparency);

        LayerContainer.appendChild(LayerControl);

        if(Mapa.UI.Controls.selEditLayers && Layer.editable){
            let optionEdit = document.createElement('option');
            optionEdit.innerHTML = Layer.name;
            optionEdit.setAttribute('value', Layer.id);
            optionEdit.selected = true;

            Mapa.UI.Controls.selEditLayers.html.appendChild(optionEdit);
            Mapa.Status.editable = LayerDef.id;

            Layer.import = LayerDef.import && LayerDef.import === true ? true : false;
            Layer.export = LayerDef.export && LayerDef.export === true ? true : false;
        }

        Layer.Control = LayerContainer;

        Mapa.Layers[Layer.id] = Layer;

        return Layer;
    } 

    initLayers(){
        const Mapa = this;

        let Groups = [];

        for (let groupDef in Mapa.Layers.JSONConfig){
            let Group = Mapa.createGroup(Mapa.Layers.JSONConfig[groupDef]);
            Groups.push(Group);
        }

        return Groups;

    }

    findLayer(layerId) {
        let lyr;
        env.oMapa.map.getLayers().forEach(function (group, index) {
            if (group.get('layers')) {
                group.getLayers().forEach(function (layer, index) {
                    if (layer.get('id') === layerId) {
                        lyr = layer;
                    }
                });
            }
        });
    
        return lyr;
    };
  
    initControl(def){
        const Mapa = this;

        let control = {};
        control.html = document.createElement(def.identity.type);
        control.html.className = "w3-bar-item " + def.style.className + " Control";
        control.html.id = def.identity.id;

        switch (def.identity.type) {
            case 'button':
                control.html.onclick = function(){
                    if(Mapa.UI.Function === 'Help'){
                        window.open(def.help.urlTechHelp,"_blank");
                    } else if (Mapa.UI.Function === 'Legal'){
                        window.open(def.help.legalHelp,"_blank");
                    } else {
                        if(def.actions.function){
                            eval(def.actions.function);
                        }
                    }
                }
                break;
            case 'select':
                control.html.onchange = function(){
                    eval(def.actions.function);
                }            
                break;
            case 'input':
                if(def.style.placeholder) {
                    control.html.placeholder = def.style.placeholder;
                }
                if(def.actions.function) {
                    control.html.onchange = function(){
                        eval(def.actions.function);
                    }            
                }
                break;
        }

        control.html.innerHTML += def.style.icon ? '<i class="' + def.style.icon + '"></i>': "";
        control.html.innerHTML += def.style.text ? def.style.Text : "";

        if(def.help.tip){
            control.html.setAttribute('title', def.help.tip);
        }
        

        if(def.validation){
            if(def.validation.conditionEnable || def.validation.conditionShow){
                control.update = function(){
                    if(def.validation.conditionShow){
                        control.html.style.display = eval(def.validation.conditionShow) === true ? '' : 'none';
                    }

                    
                    if(def.validation.conditionEnable){
                        control.html.disabled = !(eval(def.validation.conditionEnable) === true);

                        if(eval(def.validation.conditionEnable) === true) {
                            control.html.removeAttribute('disabled');
                        } else {
                            control.html.setAttribute('disabled',true);
                        }
                    }
                }
            }
    
        }

        return control;
    }

    initUI(){
        const Mapa = this;

        this.initMenuBar();
        this.initButtonBar();
        this.initToolBar();
    }

    initMenuBar(){

    }

    initButtonBar(){
        const Mapa = this;
        const ButtonBar = Mapa.UI.ButtonBar;

        if(Mapa.UI.JSONConfig.ButtonBar && Mapa.UI.JSONConfig.ButtonBar !== undefined){
            for(let ctl in Mapa.UI.JSONConfig.ButtonBar.Controls){
                let control = Mapa.initControl(Mapa.UI.JSONConfig.ButtonBar.Controls[ctl]);
                Mapa.UI.Controls[ctl] = control;
                ButtonBar.appendChild(Mapa.UI.Controls[ctl].html);
            }
        }
    }

    initToolBar(){
        const Mapa = this;
        const ToolBar = Mapa.UI.ToolBar;

        if(Mapa.UI.JSONConfig.ToolBar && Mapa.UI.JSONConfig.ToolBar !== undefined){
            for(let ctl in Mapa.UI.JSONConfig.ToolBar.Controls){
                let control = Mapa.initControl(Mapa.UI.JSONConfig.ToolBar.Controls[ctl]);
                Mapa.UI.Controls[ctl] = control;
                ToolBar.appendChild(Mapa.UI.Controls[ctl].html);
            }
        }
    }

    MathTools(){
        const Mapa = this;

        Mapa.Math.M = function (x1, y1, x2, y2) {
            var M = (y2 - y1) / (x2 - x1);
            return M;
        };
        
        Mapa.Math.G2R = function (G) {
            G = (Math.PI / 180) * G;
            return G;
        };
        
        Mapa.Math.R2G = function (R) {
            R = (R * 180) / Math.PI;
            return R;
        };
        
        Mapa.Math.A = function (m, x1, y1, x2, y2) {
            var A = Math.abs(Mapa.Math.R2G(Math.atan(m)));
            if (x2 < x1 & y2 > y1) {
                A = 180 - A;
            }
            else if (x2 < x1 & y2 < y1) {
                A = 180 + A;
            } else if (x2 > x1 & y2 < y1) {
                A = 360 - A;
            }
            return A;
        };
        
        Mapa.Math.D = function (x1, y1, x2, y2) {
            var D = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
            return D;
        };
        
        Mapa.Math.X = function (D, A) {
            var IX = D * (Math.cos(Mapa.Math.G2R(A)));
            return IX;
        };
        
        Mapa.Math.Y = function (D, A) {
            var IY = D * (Math.sin(Mapa.Math.G2R(A)));
            return IY;
        };

        Mapa.Math.formatNumber = function (number, decimals) {
            decimals = decimals ? decimals : 0;
        
            if ('string' === typeof number) {
                number = parseFloat(number);
            }
        
            if ('number' === typeof number) {
                return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            }
        };

        Mapa.Math.formatLength = function (line) {
            return Mapa.Math.formatNumber(parseFloat(Math.round(line.getLength() * 100) / 100), 2) + ' m';
        };
        
    }

    setCCtoGeometry(g,editable) {
        const Mapa = this;
        let type = g.getType();
        let c = g.getCoordinates();

        Mapa.UI.Left.innerHTML = '';
        document.getElementById('CCVertices').innerHTML = '';

        if (type === 'LineString' || type === 'Polygon') {

            let cs = type === 'LineString' ? c : c[0];
    
            let cx1, cy1, cx2, cy2, ca, cd;
    
            if (Mapa.Status.MemorySketch.vertexCount !== cs.length) {
                Mapa.Status.MemorySketch.v = null;
                Mapa.Status.MemorySketch.a = null;
                Mapa.Status.MemorySketch.d = null;
                Mapa.Status.MemorySketch.x = null;
                Mapa.Status.MemorySketch.y = null;
                Mapa.Status.MemorySketch.vertexCount = cs.length;
            }
    
            cs.forEach(function (coord, index) {
                let row = Mapa.addPolygonVertexRow(index, index === (cs.length - 1) ? true : false);

                cx2 = coord[0];
                cy2 = coord[1];
    
                if (index > 0) {
                    ca = Mapa.Math.A(Mapa.Math.M(cx1, cy1, cx2, cy2), cx1, cy1, cx2, cy2);
                    cd = Mapa.Math.D(cx1, cy1, cx2, cy2);
                }
    
    
                if (index > 0) {
                    if (editable) {
                        row.children[2].children[0].value = Math.round(ca * 100) / 100;
                        row.children[3].children[0].value = Math.round(cd * 100) / 100;
                    } else {
                        row.children[2].removeChild(row.children[2].children[0]);
                        row.children[2].innerHTML = Math.round(ca * 100) / 100;
                        row.children[3].removeChild(row.children[3].children[0]);
                        row.children[3].innerHTML = Math.round(cd * 100) / 100;
                    }
                }
    
                if (editable) {
                    row.children[4].children[0].value = Math.round(cx2 * 100) / 100;
                    row.children[5].children[0].value = Math.round(cy2 * 100) / 100;
                } else {
                    row.children[4].removeChild(row.children[4].children[0]);
                    row.children[4].innerHTML = Math.round(cx2 * 100) / 100;
                    row.children[5].removeChild(row.children[5].children[0]);
                    row.children[5].innerHTML = Math.round(cy2 * 100) / 100;
                }
    
                cx1 = cx2;
                cy1 = cy2;
            });

        } if (type === 'Circle') {
            let center = g.getCenter();
            let last = g.getLastCoordinate();
            let dx = center[0] - last[0];
            let dy = center[1] - last[1];
            let radius = Mapa.Status.MemorySketch.radio && Mapa.Status.MemorySketch.radio > 0 ? Mapa.Status.MemorySketch.radio : Math.sqrt(dx * dx + dy * dy);
            document.getElementById('Radio').value = Math.round(radius * 100) / 100;
        }
    };

    addPolygonVertexRow(i, fin) {
        const Mapa = this;

        let row = document.createElement('tr');
        row.id = 'V' + i;

        if (i % 2 === 0) {
            row.style.backgroundColor = 'grey';
        } else {
            row.style.backgroundColor = 'lightgrey';
        }
    
        let tdCommand = document.createElement('td');
        tdCommand.className = 'no-space';
        tdCommand.style.width = '50px';
    
        let DelVertex = document.createElement('button');
        DelVertex.className = 'w3-button no-space';
    
        DelVertex.setAttribute('data-toggle', 'tooltip');
        DelVertex.setAttribute('data-placement', 'top');
        DelVertex.setAttribute('title', 'Eliminar vertice ' + (i + 1));
        if (!Mapa.Status.WorkLayer) {
            DelVertex.disabled = true;
        } else {
            DelVertex.onclick = function () {
                let coords;
                if (Mapa.Status.MemorySketch.geometry.getType() === 'Polygon') {
                    coords = Mapa.Status.MemorySketch.geometry.getCoordinates()[0];
                    coords.splice(i, 1);
                    Mapa.Status.MemorySketch.geometry.setCoordinates([coords]);
                } else {
                    coords = Mapa.Status.MemorySketch.geometry.getCoordinates();
                    coords.splice(i, 1);
                    Mapa.Status.MemorySketch.geometry.setCoordinates(coords);
                }
    
                this.parentElement.parentElement.parentElement.removeChild(this.parentElement.parentElement);
                Mapa.setCCtoGeometry(Mapa.Status.MemorySketch.geometry);
                Mapa.Actions.drawNodes(Mapa.Status.MemorySketch.geometry, false, Mapa.Status.WorkLayer);
            };
        }
        DelVertex.innerHTML = '<i class="fas fa-times-circle"></i>';
    
        tdCommand.appendChild(DelVertex);
    
        row.appendChild(tdCommand);
    
        let tdVId = document.createElement('td');
        tdVId.className = 'w3-center';
        tdVId.style.width = '60px';
        tdVId.innerHTML = fin ? 1 : i + 1;
    
        row.appendChild(tdVId);
    
        let tdA = document.createElement('td');
    
        if (i > 0) {
            let setAngle = document.createElement('input');
            setAngle.className = 'w3-center';
            setAngle.style.width = '60px';
            setAngle.type = 'number';
            setAngle.min = 0;
            setAngle.max = 360;
            setAngle.step = 0.01;
            setAngle.setAttribute('data-toggle', 'tooltip');
            setAngle.setAttribute('data-placement', 'top');
            setAngle.setAttribute('title', 'Cambiar ángulo entre vertices: ' + i + ' - ' + (i + 1));
    
            if (!Mapa.Status.WorkLayer) {
                setAngle.disabled = true;
            } else {
                setAngle.addEventListener('change', function () {
                    Mapa.Status.MemorySketch.a = isNaN(this.value) ? null : this.value;
    
                    if (Mapa.Status.MemorySketch.a) {
                        Mapa.Status.MemorySketch.v = i;
                        Mapa.Status.MemorySketch.x = null;
                        Mapa.Status.MemorySketch.y = null;
    
                        let cx1, cy1, cx2, cy2, cd, ca;
    
                        if (Mapa.Status.MemorySketch.geometry.getType() === 'Polygon') {
                            cx1 = Mapa.Status.MemorySketch.geometry.getCoordinates()[0][i - 1][0];
                            cy1 = Mapa.Status.MemorySketch.geometry.getCoordinates()[0][i - 1][1];
                            cx2 = Mapa.Status.MemorySketch.geometry.getCoordinates()[0][i][0];
                            cy2 = Mapa.Status.MemorySketch.geometry.getCoordinates()[0][i][1];
                        } else {
                            cx1 = Mapa.Status.MemorySketch.geometry.getCoordinates()[i - 1][0];
                            cy1 = Mapa.Status.MemorySketch.geometry.getCoordinates()[i - 1][1];
                            cx2 = Mapa.Status.MemorySketch.geometry.getCoordinates()[i][0];
                            cy2 = Mapa.Status.MemorySketch.geometry.getCoordinates()[i][1];
                        }
    
                        ca = Mapa.Status.MemorySketch.a;
                        cd = Mapa.Status.MemorySketch.d ? Mapa.Status.MemorySketch.d : Math.round(Mapa.Math.D(cx1, cy1, cx2, cy2),2);

                        cx2 = Math.round((cx1 + Mapa.Math.X(cd, ca)) * 100 / 100, 2);
                        cy2 = Math.round((cy1 + Mapa.Math.Y(cd, ca)) * 100 / 100, 2);

                        let coords = Mapa.Status.MemorySketch.geometry.getCoordinates();

                        if (Mapa.Status.MemorySketch.geometry.getType() === 'Polygon') {
                            coords[0][i] = [cx2, cy2];
                            Mapa.Status.MemorySketch.geometry.setCoordinates(coords);
                        } else {
                            coords[i] = [cx2, cy2];
                            Mapa.Status.MemorySketch.geometry.setCoordinates(coords);
                        }
                    }
                });
            }
    
            tdA.appendChild(setAngle);
        }
    
        row.appendChild(tdA);
    
        let tdD = document.createElement('td');
    
        if (i > 0) {
            let setLength = document.createElement('input');
            setLength.className = 'w3-right-align';
            setLength.style.width = '100px';
            setLength.type = 'number';
            setLength.setAttribute('data-toggle', 'tooltip');
            setLength.setAttribute('data-placement', 'top');
            setLength.setAttribute('title', 'Cambiar distancia ángulo entre vertices: ' + i + ' - ' + (i + 1));
    
            if (!Mapa.Status.WorkLayer) {
                setLength.disabled = true;
            } else {
                setLength.addEventListener('change', function () {
                    Mapa.Status.MemorySketch.d = isNaN(this.value) ? null : this.value;
    
                    if (Mapa.Status.MemorySketch.d) {
                        Mapa.Status.MemorySketch.v = i;
                        Mapa.Status.MemorySketch.x = null;
                        Mapa.Status.MemorySketch.y = null;
    
                        let cx1, cy1, cx2, cy2, cd, ca;
    
                        if (Mapa.Status.MemorySketch.geometry.getType() === 'Polygon') {
                            cx1 = Mapa.Status.MemorySketch.geometry.getCoordinates()[0][i - 1][0];
                            cy1 = Mapa.Status.MemorySketch.geometry.getCoordinates()[0][i - 1][1];
                            cx2 = Mapa.Status.MemorySketch.geometry.getCoordinates()[0][i][0];
                            cy2 = Mapa.Status.MemorySketch.geometry.getCoordinates()[0][i][1];
                        } else {
                            cx1 = Mapa.Status.MemorySketch.geometry.getCoordinates()[i - 1][0];
                            cy1 = Mapa.Status.MemorySketch.geometry.getCoordinates()[i - 1][1];
                            cx2 = Mapa.Status.MemorySketch.geometry.getCoordinates()[i][0];
                            cy2 = Mapa.Status.MemorySketch.geometry.getCoordinates()[i][1];
                        }
    
                        cd = Mapa.Status.MemorySketch.d;
                        ca = Mapa.Status.MemorySketch.a ? Mapa.Status.MemorySketch.a : Mapa.Math.A(Mapa.Math.M(cx1, cy1, cx2, cy2), cx1, cy1, cx2, cy2);
    
                        cx2 = cx1 + Mapa.Math.X(cd, ca);
                        cy2 = cy1 + Mapa.Math.Y(cd, ca);
    
                        let coords = Mapa.Status.MemorySketch.geometry.getCoordinates();
    
                        if (Mapa.Status.MemorySketch.geometry.getType() === 'Polygon') {
                            coords[0][i] = [cx2, cy2];
                            Mapa.Status.MemorySketch.geometry.setCoordinates(coords);
                        } else {
                            coords[i] = [cx2, cy2];
                            Mapa.Status.MemorySketch.geometry.setCoordinates(coords);
                        }
                    }
                });
            }
            tdD.appendChild(setLength);
        }
        row.appendChild(tdD);
    
        let tdCX = document.createElement('td');
    
        let setCX = document.createElement('input');
        setCX.className = 'w3-right-align';
        setCX.style.width = '100px';
        setCX.type = 'number';
        setCX.setAttribute('data-toggle', 'tooltip');
        setCX.setAttribute('data-placement', 'top');
        setCX.setAttribute('title', 'Cambiar la coordendada X del vertice: ' + (i + 1));
    
        if (!Mapa.Status.WorkLayer) {
            setCX.disabled = true;
        } else {
            setCX.addEventListener('change', function () {
                Mapa.Status.MemorySketch.x = isNaN(this.value) ? null : this.value;
                if (Mapa.Status.MemorySketch.x) {
    
                    Mapa.Status.MemorySketch.v = i;
                    Mapa.Status.MemorySketch.d = null;
                    Mapa.Status.MemorySketch.a = null;
    
                    let cx1, cy1, cx2, cy2, cd, ca;
    
                    cx2 = Mapa.Status.MemorySketch.x;
                    cy2 = Mapa.Status.MemorySketch.geometry.getCoordinates()[0][i][1];
    
                    if (i > 0) {
                        if (Mapa.Status.MemorySketch.geometry.getType() === 'Polygon') {
                            cx1 = Mapa.Status.MemorySketch.geometry.getCoordinates()[0][i - 1][0];
                            cy1 = Mapa.Status.MemorySketch.geometry.getCoordinates()[0][i - 1][1];
                        } else {
                            cx1 = Mapa.Status.MemorySketch.geometry.getCoordinates()[i - 1][0];
                            cy1 = Mapa.Status.MemorySketch.geometry.getCoordinates()[i - 1][1];
                        }
    
                        cd = Mapa.Math.D(cx1, cy1, cx2, cy2);
                        ca = Mapa.Math.A(Mapa.Math.M(cx1, cy1, cx2, cy2), cx1, cy1, cx2, cy2);
    
                        this.parentElement.parentElement.children[2].children[0].value = Math.round(ca * 100) / 100;
                        this.parentElement.parentElement.children[3].children[0].value = Math.round(cd * 100) / 100;
                    }
    
                    let coords = Mapa.Status.MemorySketch.geometry.getCoordinates();
    
                    if (Mapa.Status.MemorySketch.geometry.getType() === 'Polygon') {
                        coords[0][i][0] = cx2;
                        Mapa.Status.MemorySketch.geometry.setCoordinates(coords);
                    } else {
                        coords[i][0] = cx2;
                        Mapa.Status.MemorySketch.geometry.setCoordinates(coords);
                    }
                }
            });
        }
        tdCX.appendChild(setCX);
        row.appendChild(tdCX);
    
    
        let tdCY = document.createElement('td');
    
        let setCY = document.createElement('input');
        setCY.className = 'w3-right-align';
        setCY.style.width = '100px';
        setCY.type = 'number';
        setCY.setAttribute('data-toggle', 'tooltip');
        setCY.setAttribute('data-placement', 'top');
        setCY.setAttribute('title', 'Cambiar la coordendada Y del vertice: ' + (i + 1));
    
        if (!Mapa.Status.WorkLayer) {
            setCY.disabled = true;
        } else {
            setCY.addEventListener('change', function () {
                Mapa.Status.MemorySketch.y = isNaN(this.value) ? null : this.value;
                if (Mapa.Status.MemorySketch.y) {
    
                    Mapa.Status.MemorySketch.v = i;
                    Mapa.Status.MemorySketch.d = null;
                    Mapa.Status.MemorySketch.a = null;
    
                    let cx1, cy1, cx2, cy2, cd, ca;
    
                    cx2 = Mapa.Status.MemorySketch.geometry.getCoordinates()[0][i][0];
                    cy2 = Mapa.Status.MemorySketch.y;
    
                    if (i > 0) {
                        if (Mapa.Status.MemorySketch.geometry.getType() === 'Polygon') {
                            cx1 = Mapa.Status.MemorySketch.geometry.getCoordinates()[0][i - 1][0];
                            cy1 = Mapa.Status.MemorySketch.geometry.getCoordinates()[0][i - 1][1];
                        } else {
                            cx1 = Mapa.Status.MemorySketch.geometry.getCoordinates()[i - 1][0];
                            cy1 = Mapa.Status.MemorySketch.geometry.getCoordinates()[i - 1][1];
                        }
    
                        cd = Mapa.Math.D(cx1, cy1, cx2, cy2);
                        ca = Mapa.Math.A(Mapa.Math.M(cx1, cy1, cx2, cy2), cx1, cy1, cx2, cy2);
    
                        this.parentElement.parentElement.children[2].children[0].value = Math.round(ca * 100) / 100;
                        this.parentElement.parentElement.children[3].children[0].value = Math.round(cd * 100) / 100;
                    }
    
                    let coords = Mapa.Status.MemorySketch.geometry.getCoordinates();
    
                    if (Mapa.Status.MemorySketch.geometry.getType() === 'Polygon') {
                        coords[0][i][1] = cy2;
                        Mapa.Status.MemorySketch.geometry.setCoordinates(coords);
                    } else {
                        coords[i][1] = cy2;
                        Mapa.Status.MemorySketch.geometry.setCoordinates(coords);
                    }
                }
            });
        }
    
        tdCY.appendChild(setCY);
        row.appendChild(tdCY);
    
        document.getElementById('CCVertices').appendChild(row);
  
        return row;
    };
}

