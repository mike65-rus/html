/**
 * Created by STAR_06 on 18.11.2015.
 */
define(["kendo.all.min"],
    function(kendo) {
        'use strict';
        var model = kendo.data.Model.define({
            id: "id",
            fields: {
                id: {type: "number",editable:false},
                event_id:{type:"number",validation:{required:true}},
                user_id:{type:"number",validation:{required:true}},
                ask_id:{type:"string",validation:{required:true}},
                ts:{type:"date",nullable:true,defaultValue:null},
                ext1:{type:"string",nullable:true,defaultValue:null},
                ext2:{type:"string",nullable:true,defaultValue:null},
                ext3:{type:"string",nullable:true,defaultValue:null}
            }
        });
        return model;
    }
);