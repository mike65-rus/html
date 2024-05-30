/**
 * Created by STAR_06 on 18.11.2015.
 */
define(['kendo'],
    function(kendo) {
        var model = kendo.data.Model.define({
            id: "ask_id",
            fields: {
                ask_id: { type: "string", editable: false, nullable: false },
                niib: {type: "number"},
                date_ask: {type: "date"},
                date_out: {type: "date"},
                birt: {type: "date"},
                palata: {type: "number"},
                age: {type: "number"},
                dnst: {type: "number"},
                news: {type:"number"},
                user_name: {type:"string"},
                user2_name: {type: "string"},
                diag: {type: "string"},
                rezult1: {type:"string"}
            }
        });
        return model;
    }
);