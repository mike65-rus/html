define(['kendo.all.min'], function(kendo) {
    'use strict';
    var model = kendo.data.Model.define({
        fields: {
            notdid: {type:"number"},
            nspecid: {type:"number"},
            sotdcode: {type:"string"},
            sotdname:{type:"string"},
            nspeccode:{type:"number"},
            sspecname:{type:"string"}
        }
    });
    return model;
});