/**
 * Created by 1 on 25.11.2015.
 */
define(["kendo.all.min"],
    function(kendo) {
        'use strict';
        var model = kendo.data.Model.define({
            id:"file",
            fields: {
                file:{type:"string"},
                date:{type:"date"},
                theme: {type:"string"},
                body: {type: "string"}
            }

        });
        return model;

    }
);
