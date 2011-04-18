﻿function LayerExportData(layer) {    this.layer = layer;        this.nestedComp;    this.parent;        this._name = layer.name;    this.type = Util.getLayerType(layer);        Log.info("# " + this.type);        if(layer.source) this.sourceType = layer.source.typeName;    else this.sourceType = "No source";}LayerExportData.prototype.uniqueName = function() {    var n = Util.cleanName(this._name);    var ns = this.nestedComp;        if(ns != null) n = ns.uniqueName() + "_" + n;    return n;}LayerExportData.prototype.isVisible = function() {    // if null or not enabled do not export data    var b = (this.nestedComp == null) ? !this.layer.nullLayer : this.nestedComp.isVisible();    return b && this.layer.enabled;}LayerExportData.prototype.isComposition = function() {    return this.sourceType == "Composition";}// Does the layer contain an asset that needs to be exportedLayerExportData.prototype.isAsset = function() {    return this.type != "Camera" && !(this.layer.source.mainSource instanceof SolidSource);}LayerExportData.prototype.isCamera = function() {    return this.type == "Camera";}LayerExportData.prototype.hasAlpha = function() {    return this.layer.source.mainSource.hasAlpha;}LayerExportData.prototype.numParents = function() {    return (this.parent == null) ? 0 : 1 + this.parent.numParents();}LayerExportData.prototype.webmFileName = function() {    var n = this.layer.source.mainSource.file.name;    n = n.substring (0, n.length-4);        var ns = n.split("");    while( !isNaN( parseInt(ns[ns.length-1]) ) ) ns.pop();        n = ns.join("");        return n + ".webm";}LayerExportData.prototype.sequenceWildcard = function() {    var n = this.layer.source.mainSource.file.name;    var nm  = n.substring (0, n.length-4);    var ext = n.substring (n.length-4, n.length);        var c = 0;    var ns = nm.split("");    while( !isNaN( parseInt(ns[ns.length-1]) ) ) {        c++;        ns.pop();    }    nm = ns.join("");    return nm + "%" + c + "d" + ext;}LayerExportData.prototype.jpgFileName = function() {    var n = this.layer.source.mainSource.file.name;    n = n.substring (0, n.length-4);    return n + ".jpg";}LayerExportData.prototype.toString = function() {    return this.uniqueName() + " (" + this.numParents() + ", " + this.isVisible() + ")";}LayerExportData.prototype.toObject = function() {            var keyframes = [];        if(this.hasAnimationData()) {        for(var t = 0; t < ExportSettings.duration; t += ExportSettings.samplingRate) {            var key = {};            key.position = Util.adaptPosition( this.getPosition(t) );            keyframes.push(key);        }    }        var obj = {};        obj.position = Util.adaptPosition( this.getPosition(0) );    obj.rotation = Util.adaptRotation( this.layer.orientation.valueAtTime(0, true) );    obj.scale    = Util.adaptScale( this.layer.scale.valueAtTime(0, true) );        if(this.isAsset()) {        obj.texture  = (this.layer.source.mainSource.isStill) ? this.jpgFileName() : this.webmFileName();        obj.alpha = this.hasAlpha();    }    if(keyframes.length > 0) obj.keyframes = keyframes;        return obj;}LayerExportData.prototype.hasAnimationData = function() {    var selfAnim = this.layer.position.isTimeVarying;        var isParentAnim = (this.parent) ? this.parent.hasAnimationData() : false;    var isNestedAnim = (this.nestedComp) ? this.nestedComp.hasAnimationData() : false;        return isParentAnim || isNestedAnim || selfAnim; // Add other exportable values, skip those we do not export}LayerExportData.prototype.getPosition = function(t) {    var m = this.layer.position.valueAtTime(t, true);        if(this.parent) {        var p = this.parent.getPosition(t);           m[0] += p[0];        m[1] += p[1];        m[2] += p[2];    }    if(this.nestedComp) {        var n = this.nestedComp.getPosition(t);                  n[0] = this.nestedComp.layer.width  /2 - n[0];        n[1] = this.nestedComp.layer.height /2 - n[1];                m[0] -= n[0];        m[1] -= n[1];        m[2] += n[2];    }        return m;}