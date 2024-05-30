/**
 * Created by 1 on 07.04.2018.
 */
define(['kendo.all.min'],
    function(kendo) {
        'use strict';
        var model = kendo.data.Model.define({
            id: "evn",
            fields: {
                pin: {type: "string"},
                fam: {type: "string"},
                ima: {type: "string"},
                otch: {type:"string"},
                sex: {type: "string"},
                birt: {type: "date"},
                fio: {type: "string"},
                evn: {type:"number"},
                pr_date: {type: "date"},
                pr_type: {type:"number"},
                stick_mo: {type:"string"},
                priz3: {type:"string"},
                dta3: {type:"date"},
                type_ds:{type:"number"},
                is_short:{type:"number"},
                dta_ds:{type:"date"},
                grup_ds:{type:"string"},
                from_mon:{type:"number"},
                ud_foms:{type:"number"},
                p_ud_foms:{type:"string"},
                is_ud:{type:"number"}
            }
        });
        return model;
    }
);