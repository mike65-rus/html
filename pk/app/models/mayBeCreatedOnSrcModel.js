define(['kendo.all.min'],
    function (kendo) {
        'use strict';
        var model = kendo.data.Model.define({
            id:"id",
            fields: {
                id:{type:"number"},
                doc_id:{type:"number"},
                subtype:{type:"number"},
                doc_name:{type:"string"},
                sub_name:{type:"string"}
            }
        });
        return model;
    }
);