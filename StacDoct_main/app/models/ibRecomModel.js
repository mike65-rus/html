/**
 * Created by 1 on 25.11.2015.
 */
define(["kendo.all.min"],
    function(kendo) {
        'use strict';
        var model = kendo.data.Model.define({
            recLevelPicture : function() {
                var sRet="fa fa-info-circle";
                if (this.rec_level==99) {
                    sRet="fa fa-exclamation-circle";
                };
                return sRet+" fa-2x";
            },
            recLevelClass: function() {
                var sRet="ib-recom-tr-info";
                if (this.rec_level==99) {
                    sRet="ib-recom-tr-warn";
                }
                return sRet;
            },
            id: "recomid",
            fields: {
                recomid: {type:"number",editable:false},
                ask_id: {type: "string", editable:false},
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
