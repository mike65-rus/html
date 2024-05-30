define(['kendo.all.min'],
    function (kendo) {
        'use strict';
        var model = kendo.data.Model.define({
            id: "id",
            fields: {
                id: {type:"number"},
                mkb:{type:"string"},
                patient_id: {type:"number"},
                patient_pin:{type:"string"},
                des_date: {type:"date"},
                des_doct:{type:"string"},
                source: {type:"number"}
            }
        });
        return model;
    }
);