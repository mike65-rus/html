define(['kendo.all.min'],
    function (kendo) {
        'use strict';
        var model = kendo.data.Model.define({
            id: "id",
            fields: {
                id: {type:"number"},
                name:{type:"string"},
                fio:{type:"string"}
            }
        });
        return model;
    }
);