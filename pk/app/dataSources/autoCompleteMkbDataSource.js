/**
 * Created by 1 on 08.04.2018.
 */
define(["kendo.all.min","utils","services/proxyService"], function(kendo,utils,proxy){
        'use strict';
        var ds=new kendo.data.DataSource({
            serverFiltering: true,
            transport: {
                read: {
                    url:"default.aspx?action=pk/cases_AJAX&action2=get_matched_mkb",
                    dataType: "json"
                },
                parameterMap: function(data,type) {
                        return "filter="+kendo.stringify(data.filter.filters[0]);
                }
            },
            schema: {
                data: "mkb.rows",
                total: "records",
                errors: "error"
            }
        });
        return ds;
    }
);