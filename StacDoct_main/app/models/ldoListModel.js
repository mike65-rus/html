/**
 * Created by STAR_06 on 04.12.2015.
 */
define(["kendo.all.min"],function(kendo){
   "use strict";
    var model = kendo.data.Model.define({
        fields: {
            ask_id: {type:"string"},
            codarm: {type:"number"},
            curdate:{type:"date"},
            curtime: {type:"date"},
            dosage: {type:"number"},
            incl: {type:"string"},
            is_new: {type:"number"},
            last_view:{type:"string"},
            namearm:{type:"string"},
            namedoct:{type:"string"},
            otd:{type:"string"},
            pk_doctor:{type:"string"},
            text:{type:"string"},
            title:{type:"string"}
        }
    });
    return model;
});