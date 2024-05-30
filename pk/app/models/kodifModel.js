/**
 * Created by 1 on 07.04.2018.
 */
define(['kendo.all.min'],
    function(kendo) {
        'use strict';
        var model = kendo.data.Model.define({
            id: "vn",
            fields: {
                vn: {type:"number"},
                num: {type:"string"},
                name: {type:"string"},
                vid: {type:"number"}
            }
        });
        return model;
    }
);