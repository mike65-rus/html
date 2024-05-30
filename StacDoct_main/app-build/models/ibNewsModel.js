/**
 * Created by 1 on 29.11.2015.
 */
define(['kendo'],
    function(kendo) {
        var model = kendo.data.Model.define({
            fields: {
                sys_id: {type:"number"},
                ask_id: {type:"string"},
                curdate: {type:"date"},
                curtime: {type:"date"},
                ext1: {type:"string"},
                ext2: {type:"string"},
                ext3: {type:"string"}
            }
        });
        return model;
    });