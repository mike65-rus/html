define(["kendo.all.min"],
    function(kendo) {
        'use strict';
        var model = kendo.data.Model.define({
            id:"id",
            fields: {
                id: {type:"number"},
                code:{type:"string"},
                name:{type:"string"},
                coef:{type:"number"},
                ext1:{type:"string"},
                code_foms:{type:"string"},
                detail:{type:"string"}
            }
        });
        return model;
    });