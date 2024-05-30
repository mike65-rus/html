/**
 * Created by 1 on 25.11.2015.
 */
define(["kendo.all.min"],
    function(kendo) {
        'use strict';
        var model = kendo.data.Model.define({
            id:"id",
            fields: {
                id:{type:"number"},
                ask_id:{type:"string", validation:{required:true}},
                fio:{type:"string", validation:{required:true}},
                otd:{type:"string", validation:{required:true}},
                ib_no:{type:"string", validation:{required:true}},
                age:{type:"number", validation:{required:true}},
                sex:{type:"string", validation:{required:true}},
                address:{type:"string", validation:{required:true}},
                rabota:{type:"string",},
                date_zabol:{type:"date", validation:{required:true},defaultValue:null},
                date_obr:{type:"date", validation:{required:true},defaultValue:null},
                diag_obr:{type:"string", validation:{required:true}},
                date_hosp:{type:"date", validation:{required:true}},
                diag_osn:{type:"string", validation:{required:true}},
                diag_osl:{type:"string"},
                diag_soput:{type:"string"},
                privivka:{type:"string", validation:{required:true}},
                ivl:{type:"string", validation:{required:true}},
                date_issl:{type:"date", validation:{required:true},defaultValue:null},
                date_result:{type:"date", validation:{required:true},defaultValue:null},
                laboratoria:{type:"string", validation:{required:true}},
                date_death:{type:"date",defaultValue:null},
                diag_pat1:{type:"string"},
                diag_pat2:{type:"string"},
                virus_type:{type:"string", validation:{required:true}},
                virus_subtype:{type:"string", validation:{required:true}},
                user_name:{type:"string"},
                user_id:{type:"number", validation:{required:true,min:1}},
                method:{type:"string",defaultValue:""},
                mkb:{type:"string",defaultValue:""}
            }
        });
        return model;

    }
);
