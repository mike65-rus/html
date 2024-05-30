/**
 * Created by STAR_06 on 18.11.2015.
 */
define(["kendo.all.min"],
    function(kendo) {
        'use strict';
        var model = kendo.data.Model.define({
            id: "id",
            fields: {
                id:{type:"number"},
                ksg:{type:"string"},
                mkb:{type:"string"},
                stepen:{type:"string"},
                prep1:{type:"string"},
                prep2:{type:"string"},
                doza:{type:"string"},
                ksg_name:{type:"string"},
                stepen_code:{type:"number"}
            }
        });
        return model;
    }
);