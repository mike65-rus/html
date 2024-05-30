/**
 * Created by 1 on 25.11.2015.
 */
define(["kendo.all.min"],
    function(kendo) {
        'use strict';
        var model = kendo.data.Model.define({
            id:"ask_id",
            fields: {
                ask_id:{type:"string"},
                weight:{type:"number", nullable: true},
                height: {type:"number", nullable: true},
                blood_group: {type: "string", nullable: true},
                blood_rezus: {type: "string", nullable: true},
                blood_fenotype: {type: "string", nullable: true}
            }

        });
        return model;

    }
);
