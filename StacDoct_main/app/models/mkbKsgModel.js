/**
 * Created by STAR_06 on 18.11.2015.
 */
define(["kendo.all.min"],
    function(kendo) {
        'use strict';
        var model = kendo.data.Model.define({
            id:"id",
            fields: {
                id:{type:"string"},
                has_custom:{type:"number"},
                is_custom:{type:"number"},
                is_enable:{type:"number"},
                ksg_code:{type:"string"},
                ksg_name:{type:"string"},
                mkb_name:{type:"string"},
                norm_dn:{type:"number"},
                norm_st:{type:"number"},
                profil:{type:"string"},
                rowspan:{type:"number"},
                tar_dn_d:{type:"number"},
                tar_dn_v:{type:"number"},
                tar_st_d:{type:"number"},
                tar_st_v:{type:"number"},
                text:{type:"string"},
                usl_cnt:{type:"number"},
                vers:{type:"number"}
            }
        });
        return model;
    }
);