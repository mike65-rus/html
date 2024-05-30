define(['kendo.all.min'],
    function (kendo) {
        'use strict';
        var model = kendo.data.Model.define({
            id: "evn",
            fields: {
                evn: {type:"number"},
                mkb:{type:"string"},
                date_nach: {type:"date"},
                date_next:{type:"string"},
                nvrach:{type:"string"}
            }
        });
        return model;
    }
);