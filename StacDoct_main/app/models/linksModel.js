/**
 * Created by STAR_06 on 18.11.2015.
 */
define(["kendo.all.min"],
    function(kendo) {
        'use strict';
        var model = kendo.data.Model.define({
            id: "id",
            fields: {
                id: {type: "number"},
                name: {type:"string"},
                url: {type:"string"},
                image: {type:"string"}
            }
        });
        return model;
    }
);