/**
 * Created by STAR_06 on 18.11.2015.
 */
define(["kendo.all.min"],
    function(kendo) {
        'use strict';
        var model = kendo.data.Model.define({
            id: "studyuid",
            fields: {
                studyuid:{type:"string"},
                patientid: { type: "string"},
                issuer: {type:"string"},
                patientname:{type:"string"},
                patientbirth:{type:"string"},
                studydate:{type:"string"},
                studymodal:{type:"string"},
                series:{type:"number"},
                instances:{type:"number"},
                httplink:{type:"string"},
                studyavail:{type:"string"},
                fio: { type: "string"},
                birt:{type:"date"},
                curtime:{type:"date"},
                sex:{type:"string"}
            }
        });
        return model;
    }
);