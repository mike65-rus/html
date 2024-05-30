/**
 * Created by STAR_06 on 18.11.2015.
 */
define(["kendo.all.min"],
    function(kendo) {
        'use strict';
        var model = kendo.data.Model.define({
            id: "ask_id",
            fields: {
                ask_id: { type: "string", editable: false, nullable: false },
                ib_id: {type:"string"},
                niib: {type: "number"},
                yea: {type:"number"},
                date_ask: {type: "date"},
                date_out: {type: "date"},
                birt: {type: "date"},
                age: {type: "number"},
                dnst: {type: "number"},
                user_name: {type:"string"},
                user2_name: {type: "string"},
                diag: {type: "string"},
                rezult1: {type:"string"},
                rezult2: {type:"string"},
                doctor: {type:"string"},
                rdonly: {type:"boolean"},
                alink: {type:"string"}

            }
        });
        return model;
    }
);