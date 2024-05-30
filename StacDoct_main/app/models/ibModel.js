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
                niib: {type: "number"},
                date_ask: {type: "date"},
                date_out: {type: "date"},
                birt: {type: "date"},
                palata: {type: "number"},
                age: {type: "number"},
                rost:{type:"number"},
                ves:{type:"number"},
                cancer_num:{type:"string"},
                dnst: {type: "number"},
                news: {type:"number"},
                user_name: {type:"string"},
                user2_name: {type: "string"},
                diag: {type: "string"},
                rezult1: {type:"string"},
                is_shef: {type:"boolean"},
                is_degur: {type:"boolean"},
                is_nachmed: {type:"boolean"},
                is_orit: {type:"boolean"},
                is_ldo: {type:"boolean"},
                rdonly: {type:"boolean"},
                date_omo: {type:"date"},
                pin: {type:"string"},
                department:{tyle:"date"},
                otd_list:{type:"string"}
            }
        });
        return model;
    }
);