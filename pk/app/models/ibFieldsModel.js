/**
 * Created by STAR_06 on 18.11.2015.
 * all fields from ib
 */
define(["kendo.all.min"],
    function(kendo) {
        'use strict';
        var model = kendo.data.Model.define({
            fields: {
                ask_id: { type: "string" },
                doc_record_id: { type: "string" },
                field_id: { type: "string" },
                text: { type: "string" },
                html: { type: "string" },
                ext1: { type: "string" },
                ext2: { type: "string" },
                ext3: { type: "string" },
                doc_id: { type: "string" },
                created: { type: "date" },
                doc_date: { type: "date" },
                doc_time: { type: "date" },
                extb1: { type: "string" },
                extb2: { type: "string" },
                extb3: { type: "string" }
            }
        });
        return model;
    }
);