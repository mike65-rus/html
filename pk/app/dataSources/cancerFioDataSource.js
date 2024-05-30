define(["kendo.all.min","utils","services/proxyService"],
    function(kendo,utils,proxy) {
//  cancer
        'use strict';
        var ds= new kendo.data.DataSource({
            serverPaging: false,
            serverSorting: false,
            pageSize: 10,
            transport: {
                read: {
                    async: true,
                    url: "default.aspx?action=pk/CASES_AJAX&action2=get_cancer_data",
                    dataType: "json"
                }
            },
            requestEnd: utils._onRequestEnd,
            schema: {
                data: "cancer_data.rows",
                total: "records",
                errors: "error",
                model: {
                    id : "reg_num",
                    fields: {
                        reg_num: {type:"string"},
                        fio: {type:"string"},
                        birthday:{type:"date"},
                        date_diag:{type:"date"},
                        topography:{type:"string"},
                        morfology:{type:"string"}
                    }
                }
            },
        });
        return ds;

}
);