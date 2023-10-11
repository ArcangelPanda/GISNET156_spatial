"use strict";

class MapUI {
    constructor(Mapa){
        const UI = this;
        UI.Parent = Mapa;

        UI.Container=null;
        UI.MapView={};
        UI.MenuBar={};
        UI.ButtonBar={};
        UI.ToolBar={};
        UI.Panel={};
        UI.UpdateList={};
        UI.Controls = {};

        if(document.getElementById('Mapa')){
            UI.Container = document.getElementById('Mapa');
        } else {
            UI.Container = document.createElement('div');
        }

        UI.JSONConfig = httpGet("/json/" + Mapa.Params.type + "/UI.json", "JSON");
        UI.Container.className = "no-space MapContainer";

        return UI.init();
    }

    init(){
        const UI = this;

        this.initButtonBar();
        //this.initPanels();
        this.initMapView();

        //this.initMenuBar();
        
        //this.initToolBar();

        return UI;
    }

    initMapView(){

        let UI = this;

        UI.MapView.Container = document.createElement('div');

        UI.MapView.Container.className = "no-space Mapa";

        if(UI.Controls.Background && UI.Controls.Background.Control){
            UI.Controls.Background.Control.onchange = function () {
                UI.MapView.Container.style.backgroundColor = this.value;
            };
        
            UI.Controls.Background.Control.value = UI.JSONConfig.BackgroundColor;
            UI.Controls.Background.Control.onchange();
        }

        UI.Container.appendChild(UI.MapView.Container);

        return UI;
    }

    initPanels(){
        const UI = this;

        let panelTop = document.createElement('div');
        panelTop.className="w3-top no-space";

        let panelRight = document.createElement('div');
        panelTop.className="w3-right no-space";

        UI.Container.appendChild(pann)


    }

    initBar(){
        let UI = this;

        return;
    }

    initButtonBar(){
        let UI = this;

        if(UI.JSONConfig.ButtonBar && UI.JSONConfig.ButtonBar !== undefined){
            UI.ButtonBar.Container = document.createElement('div');
        
            UI.ButtonBar.Container.className = "w3-bar no-space ButtonBar";
            UI.Container.appendChild(UI.ButtonBar.Container);

            for(let ctl in UI.JSONConfig.ButtonBar.Controls){
                let control = UI.initControl(UI.JSONConfig.ButtonBar.Controls[ctl]);

                UI.Controls[ctl] = control;
                UI.ButtonBar.Container.appendChild(UI.Controls[ctl].html);
            }
        }

        return UI;
    }

    initToolBar(){
        let UI = this;

        if(UI.JSONConfig.ButtonBar && UI.JSONConfig.ButtonBar !== undefined){
            UI.ButtonBar.Container = document.createElement('div');
        
            UI.ButtonBar.Container.className = "w3-bar no-space ToolBar";
            UI.Container.appendChild(UI.ButtonBar.Container);

            for(let ctl in UI.JSONConfig.ButtonBar.Controls){
                let control = UI.initControl(UI.JSONConfig.ButtonBar.Controls[ctl]);

                UI.Controls[ctl] = control;
                UI.ButtonBar.Container.appendChild(UI.Controls[ctl].html);
            }
        }

        return UI;
    }

    initControl(def){
        let control = {};
        control.html = document.createElement(def.Type);
        control.html.className = "w3-bar-item w3-button Control";

        switch (def.Type) {
            case 'button':
                control.html.onclick = function(){
                    eval(def.Action);
                }
                break;
            case 'select':
                control.html.onchange = function(){
                    eval(def.Action);
                }            
                break;
        }

        control.html.innerHTML += def.Content.Icon ? def.Content.Icon : "";
        control.html.innerHTML += def.Content.Text ? def.Content.Text : "";
        if(def.Content.Tip){
            control.html.setAttribute('title', def.Content.Tip);
        }
        

        if(def.Update && (def.Update.Visible || def.Update.Disabled)){
            control.update = function(){
                if(def.Update.Visible){
                    control.html.style.display = function(){
                        return eval(def.Update.Visible) ? '' : 'none';
                    }
                }
                
                if(def.Update.Disabled){
                    control.html.disabled = function(){
                        return eval(def.Update.Disabled) ? 'disabled' : '';
                    }
                }
            }
        }

        return control;
    }

    createGroupControl(Group){
        let GroupContainer = document.createElement('div')
        GroupContainer.className = 'no-space Group-Container';

        let LayerGroupContainer = document.createElement('div')
        LayerGroupContainer.className = 'w3-bar no-space LayerGroup-Container';

        let LayerGroupControl = document.createElement('div')
        LayerGroupControl.className = 'w3-bar no-space LayerGroup-Control';

        let ExpandControl = document.createElement('button');
        ExpandControl.className = 'w3-bar-item no-space ExpandGroup-Control';
        ExpandControl.innerHTML = Group.JsonGroup.expanded ? '<i class="far fa-minus-square no-space"></i>' : '<i class="far fa-plus-square no-space"></i>';
        ExpandControl.setAttribute('title', 'Expander/Contraer el grupo');

        ExpandControl.onclick = function () {
            LayerGroupContainer.style.display = LayerGroupContainer.style.display === 'show' ? '' : 'show';
            ExpandControl.innerHTML = LayerGroupContainer.style.display === 'show' ? '<i class="far fa-lg fa-minus-square no-space"></i>' : '<i class="far fa-lg fa-plus-square no-space"></i>';
        };
    
        let ControlVisible = document.createElement('button');
        ControlVisible.className = "w3-bar-item no-space VisibleGroup-Control";
        ControlVisible.innerHTML = Group.Group.isVisible() ? '<i class="far fa-lg fa-check-square no-space"></i>' : '<i class="far fa-lg fa-square no-space"></i>';
        ControlVisible.setAttribute('title', 'Apaga/Enciende la capa');
        
        ControlVisible.onclick = function () {
            Group.Group.setVisible(Group.Group.setVisible(!Group.Group.isVisible()));
            ControlVisible.innerHTML = Group.Group.isVisible() ? '<i class="far fa-lg fa-check-square no-space"></i>' : '<i class="far fa-lg fa-square no-space"></i>';
        }
    
        LayerGroupControl.appendChild(ExpandControl);
        LayerGroupControl.appendChild(ControlVisible);
        GroupContainer.appendChild(LayerGroupControl);
        GroupContainer.appendChild(LayerGroupContainer);

        return Control;
    }

    createLayerControl(Layer){
        
    }

    static update(){
        let UI = this;

        UI.Controls.forEach(e => {
            if(e.update && e.update !== undefined){
                e.update();
            }
        });

        return UI;
    }

    
}
