/**
 * Created by STAR_06 on 18.11.2015.
 */
define(["kendo.all.min"],
    function(kendo) {
        'use strict';
        var model = kendo.data.Model.define({
            id: "record_id",
            fields: {
                record_id: { type: "string", editable: false },
                ask_id: {type: "string"},
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