define(['kendo.all.min'],
    function (kendo) {
        'use strict';
        var model = kendo.data.Model.define({
            id: "visit_id",
            fields: {
                visit_id: {type:"number",editable:false,nullable:true},
                user_id:{type:"number"},
                otd_id: {type: "number"},
                spec_id: {type: "number"},
                visit_type: {type:"number"},
                visit_date: {type:"date",defaultValue:new Date()},
                visit_time: {type:"date",nullable:"true"},
                pay_type: {type:"number",defaultValue:1},
                mkb:{type:"string",defaultValue:""},
                patient_pin:{type:"string"},
                patient_name:{type:"string"},
                patient_id:{type:"number"},
                talon_id:{type:"number"}
            }
        });
        return model;
    }
);