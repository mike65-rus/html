define(['kendo.all.min'],
    function (kendo) {
        'use strict';
        var model = kendo.data.Model.define({
            id: "evn",
            fields: {
                evn:{type:"number"},
                edi:{type:"number"},
                pin:{type:"string"},
                kdis:{type:"number"},
                dop_date:{type:"date"},
                date_nach:{type:"date"},
                date_kon:{type:"date"},
                mkb:{type:"string"},
                kodvrach: {type:"number"},
                kod_spec: {type:"number"},
                nvrach: {type:"string"},
                nspec: {type:"string"},
                ndis: {type:"string"},
                codedis:{type:"string"}
            }
        });
        return model;
    }
);