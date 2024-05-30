/**
 * Created by STAR_06 on 04.12.2015.
 */
define(["kendo.all.min"],function(kendo){
   "use strict";
    var model = kendo.data.Model.define({
        fields: {
            ahtml: {type:"string"},
            alink: {type:"string"},
            atype: {type:"string"},
            is_empty: {type:"boolean"},
            anlist:{type:"string"}
        }
    });
    return model;
});