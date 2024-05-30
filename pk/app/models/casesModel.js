define(['kendo.all.min'],
    function (kendo) {
        'use strict';
        var model = kendo.data.Model.define({
            id: "case_id",
            fields: {
                case_id:{type:"string"},
                case_date:{type:"date"},
                case_time:{type:"date"},
                user_id:{type:"number"},
                patient_id:{type:"number"},
                patient_pin:{type:"string"},
                created:{type:"date"},
                updated:{type:"date"},
				case_end_date:{type:"date"},
				result:{type:"string"}
            }
        });
        return model;
    }
);