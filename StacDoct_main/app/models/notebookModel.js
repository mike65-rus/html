/**
 * Created by STAR_06 on 18.11.2015.
 */
define(["kendo.all.min"],
    function(kendo) {
        'use strict';
        var model = kendo.data.Model.define({
            id: "record_id",
            fields: {
                record_id: {type: "string"},
                doc_id: {type: "number"},
                doc_part: {type: "string"},
                text: {type:"string"},
                html: {type:"string"},
                created: {type:"date"},
                modified: {type:"date"}
            }
        });
        return model;
    }
);