define(['kendo.all.min'],
    function (kendo) {
        'use strict';
        var model = kendo.data.Model.define({
            id: "mkb",
            fields: {
                mkb:{type:"string"},
                patient_id: {type:"number"},
                patient_pin:{type:"string"},
                patient_name:{type:"string"},
                date_first: {type:"date"},
                date_last: {type:"date"},
                vrach_first:{type:"string"},
                vrach_last:{type:"string"},
                mkb_name1:{type:"string"},
                mkb_name2:{type:"string"},
                kdisp: {type:"number"},
                kdisp_n: {type:"string"},
                deseses_list:{type:"object"}
            }
        });
        return model;
    }
);