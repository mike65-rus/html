/**
 * Created by STAR_06 on 04.12.2015.
 */
define(["kendo.all.min"],function(kendo){
   "use strict";
    var model = kendo.data.Model.define({
        id: "iddoc",
        fields: {
            iddoc: {type:"string"},
            ask_id: {type:"string"},
            bl: {type:"string"},
            bl_code: {type:"string"},
            bl_name: {type:"string"},
            bm_code: {type:"string"},
            bm_name: {type:"string"},
            codes: {type:"string"},
            data_a: {type:"date"},
            diag: {type:"string"},
            fio: {type:"string"},
            ib: {type:"string"},
            is_new: {type:"number"},
            last_view: {type:"string"},
            nomer: {type:"string"},
            otd: {type:"string"},
            palata: {type:"number"},
            time: {type:"string"},
            time36: {type:"string"},
            tipp: {type:"string"},
            vrach: {type:"string"},
            vrach_id: {type:"string"}
        }
    });
    return model;
});