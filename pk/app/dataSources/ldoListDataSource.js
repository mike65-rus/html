/**
 * Created by 1 on 08.04.2018.
 */
define(["kendo.all.min", "models/ldoListModel", "utils", "services/proxyService"], function (kendo, model, utils, proxy) {
        'use strict';
        var ds = new kendo.data.DataSource({
            batch: "true",
            serverPaging: false,
            serverSorting: false,
            serverFiltering: false,
            transport: {
                read: "default.aspx?action=pk/pk_ldo_AJAX&action2=list",
                dataType: "json"
            },
            schema: {
                data: "ldodata.rows",
                total: "records",
                errors: "error",
                model: model,
                sort: {
                    field: "curdate", dir: "desc"
                }
            }
        });
        return ds;
    }
);