define(['kendo.all.min'],
    function (kendo) {
        'use strict';
        var model = kendo.data.Model.define({
            id: "code",
            fields: {
                code: {type:"number"},
                name:{type:"string"},
                code_name:{type:"string"},
                is_pay_req:{type:"boolean"}
            }
        });
        return model;
    }
);