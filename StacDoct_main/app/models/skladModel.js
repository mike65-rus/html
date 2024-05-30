/**
 * Created by STAR_06 on 18.11.2015.
 */
define(["kendo.all.min"],
    function(kendo) {
        'use strict';
        /*
        var model = kendo.data.Model.define({
            id: "id",
            fields: {
                id: {type: "string"},
                name: {type:"string"}
            }
        });
        */
        var model=kendo.data.Model.define({
            id: "otd_guid",
            fields: {
                otd_guid: {type:"string"},
                otd_descr: {type:"string"},
                otd_id: {type:"string"},
                sklad_guid: {type:"string"},
                sklad_descr: {type:"string"}
            }
        });
        return model;
    }
);