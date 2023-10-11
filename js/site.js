"use strict";

function Error(title, message) {
    this.message = message;
    this.title = title;
}

var httpGet = function (url, type) {
        let xmlhttp;
        if (window.XMLHttpRequest) {
            // code for IE7+, Firefox, Chrome, Opera, Safari
            xmlhttp = new XMLHttpRequest();
        } else {
            // code for IE6, IE5
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
        xmlhttp.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                if (type === "xml") {
                    return this.responseXML;
                } else {
                    return this.responseText;
                }
            } else {
                return false;
            }
        };

	console.log(url);
        xmlhttp.open("get", url, false);
        xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xmlhttp.send();
        
        let respuesta;
        if (type === "text") {
            respuesta = xmlhttp.responseText;
        } else if (type === "xml") {
            respuesta = xmlhttp.responseXML;
        } else if (type === "JSON") {
            respuesta = JSON.parse(xmlhttp.responseText);
        }

        return respuesta;
};

var httpPost = function (url, data, type) {
    if (!url || !data || !type) {
        return null;
    } else {
        let xmlhttp;
        if (window.XMLHttpRequest) {
            // code for IE7+, Firefox, Chrome, Opera, Safari
            xmlhttp = new XMLHttpRequest();
        } else {
            // code for IE6, IE5
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
        xmlhttp.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                if (type === "text") {
                    return this.responseText;
                } else if (type === "xml") {
                    return this.responseXML;
                }
            } else {
                return false;
            }
        };

        try {
            xmlhttp.open("post", url, false);
            xmlhttp.send(JSON.serialize(data));

            if (type === "text") {
                return xmlhttp.responseText;
            } else if (type === "xml") {
                return xmlhttp.responseXML;
            } else if (type === "JSON") {
                return JSON.parse(xmlhttp.responseText);
            }
        } catch (e) {
            return null;
        }
    }
};
