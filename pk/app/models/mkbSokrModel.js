/**
 * Created by STAR_06 on 18.11.2015.
 */
define(["kendo.all.min"],
    function(kendo) {
        'use strict';
        var model = kendo.data.Model.define({
            fields: {
                name:{type:"string"},
                sokr:{type:"string"}
            }
        });
        return model;
    }
);