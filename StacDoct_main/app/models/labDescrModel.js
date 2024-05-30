/**
 * Created by STAR_06 on 18.11.2015.
 */
define(["kendo.all.min"],
    function(kendo) {
        'use strict';
        var model = kendo.data.Model.define({
            id: "id",
            fields: {
                id: {type:"number"},
                issl: {type:"string"},
                name: {type:"string"},
                to_html:{type:"string"},
                hsource:{type:"string"}
            }
        });
        return model;
    }
);