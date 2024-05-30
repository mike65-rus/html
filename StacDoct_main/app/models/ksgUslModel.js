/**
 * Created by STAR_06 on 18.11.2015.
 */
define(["kendo.all.min"],
    function(kendo) {
        'use strict';
        var model = kendo.data.Model.define({
            fields: {
                code:{type:"string"},
                ksg_code:{type:"string"},
                ksg_name:{type:"string"},
                name:{type:"string"}
            }
        });
        return model;
    }
);