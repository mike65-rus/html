/**
 * Created by 1 on 07.04.2018.
 */
define(['kendo.all.min'],
    function(kendo) {
        'use strict';
        var model = kendo.data.Model.define({
            id: "iddoc",
            fields: {
                curdate: {
                    type: "date"
                },
                curtime: {
                    type: "date"
                }
            }
        });
        return model;
    }
);