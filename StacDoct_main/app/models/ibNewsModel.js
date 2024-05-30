/**
 * Created by 1 on 29.11.2015.
 */
define(["kendo.all.min"],
    function(kendo) {
        'use strict';
        var model = kendo.data.Model.define({
            fields: {
                sys_id: {type:"number"},
                ask_id: {type:"string"},
                curdate: {type:"date"},
                curtime: {type:"date"},
                ext1: {type:"string"},
                ext2: {type:"string"},
                ext3: {type:"string"},
                iddoc: {type:"string"}

            }
        });
        return model;
    });