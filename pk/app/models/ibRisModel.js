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
                globalvn:{type:"string"},
                askid:{type:"string"},
                niib:{type:"number"},
                fullname:{type:"string"},
                datetime: {type:"date"},
                orderdatetime:{type:"date"},
                plandatetime:{type:"date"},
                user_name:{type:"string"},
                service: {type: "string"},
                name_issl:{type:"string"},
                otd:{type:"string"},
                reason:{type:"string"},
                comment:{type:"string"}
            }
        });
        return model;
    }
);