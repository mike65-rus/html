/**
 * Created by 1 on 07.04.2018.
 */
define(['kendo.all.min'],
    function (kendo) {
        'use strict';
        var model = kendo.data.Model.define({
            id: "iddoc",
            fields: {
                iddoc: {
                    type: "string"
                },
                data_a: {
                    type: "date"
                },
                time: {
                    type: "date"
                }
            }
        });
        return model;
    }
);