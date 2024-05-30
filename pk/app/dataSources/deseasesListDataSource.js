/**
 * Created by 1 on 08.04.2018.
 */
define(["kendo.all.min","models/deseasesModel","utils","services/proxyService"], function(kendo,model,utils,proxy){
        'use strict';
        var ds=new kendo.data.DataSource({
            batch: false,
            serverPaging: false,
            serverSorting: false,
            serverFiltering: false,
            transport: {
                read: {
                    url:"default.aspx?action=pk/cases_AJAX&action2=patient_deseases_crud&crud_action=read",
                    dataType: "json"
                },
                parameterMap: function(data,type) {
                        return "data="+kendo.stringify(data);
                }
            },
            schema: {
                data: "deseases.rows",
                total: "records",
                errors: "error",
                model: model,
                sort: {
                    field: "mkb", dir: "asc"
                }
            }
        });
        return ds;
    }
);