/**
 * Created by STAR_06 on 18.11.2015.
 */
define(["kendo.all.min"],
    function(kendo) {
        'use strict';
        var model = kendo.data.Model.define({
            id: "roleid",
            fields: {
                roleid: {type: "number"},
                rolecode: {type:"string"},
                rolename: {type:"string"}
            }
        });
        return model;
    }
);