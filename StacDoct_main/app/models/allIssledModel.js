/**
 * Created by 1 on 25.11.2015.
 */
define(["kendo.all.min"],
    function(kendo) {
        'use strict';
        var model = kendo.data.Model.define({
            fields: {
                date:{type:"date"},
                time:{type:"date"},
                fio: {type:"string"},
                niib:{type:"number"},
                recomid: {type:"number"},
                ask_id: {type: "string"},
                date_ask: {type:"date"},
                recom_type: {type:"number"},
                recom_ts: {type:"date"},
                update_ts: {type:"date"},
                cancel_ts: {type:"date"},
                ucancel_ts: {type:"date"},
                last_show: {type:"date"},
                user_id: {type:"number"},
                uname: {type:"string"},
                uid_answer: {type:"number"},
                answer_ts: {type:"date"},
                recomendat: {type:"string"},
                reason: {type:"string"},
                rec_level: {type: "number"},
                ext1: {type:"string"},
                ext2: {type:"string"},
                ext3: {type:"string"}
            }

        });
        return model;

    }
);