define(["kendo.all.min"],
    function(kendo) {
        'use strict';
        var model = kendo.data.Model.define({
            id: "record_id",
            fields: {
                record_id: { type: "string", editable: false },
                case_id:{type:"string"},
                pat_id: {type: "number"},
                pat_pin: {type:"string"},
                pat_fio:{type:"string"},
                doc_id: {
                    type: "number"
                },
                user_id: {
                    type: "number"
                },
                created: {
                    type: "date"
                },
                modified: {
                    type: "date"
                },
                doc_date: { type: "date"},
                doc_time: {type:"date"},
                doc_html: {type: "string"},
                signed:{type:"number"},
                signs: {type:"string"}
            }
        });
        return model;
    }
);