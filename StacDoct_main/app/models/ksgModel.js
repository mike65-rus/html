/**
 * Created by STAR_06 on 18.11.2015.
 */
define(["kendo.all.min"],
    function(kendo) {
        'use strict';
        var model = kendo.data.Model.define({
            id: "vn",
            fields: {
                vn: {type: "number"},
                yea: {type:"number"},
                descr:{type:"string"},
                ncode:{type:"string"},
                code: {type: "string"},
                code_dn: {type:"string"},
                code_st: {type:"string"},
                name0: {type: "string"},
                norm_st:{type:"number"},
                norm_dn:{type:"number"},
                tar_st_v:{type:"number"},
                tar_dn_v:{type:"number"},
                tar_st_d:{type:"number"},
                tar_dn_d:{type:"number"}
            }
        });
        return model;
    }
);