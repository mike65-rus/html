define(['kendo.all.min'],
    function (kendo) {
        'use strict';
        var model = kendo.data.Model.define({
            id: "vn",
            fields: {
                vn: {type:"number"},
                num: {type:"string"},
                num_int: {type:"number"},
                name:{type:"string"}
            }
        });
        return model;
    }
);