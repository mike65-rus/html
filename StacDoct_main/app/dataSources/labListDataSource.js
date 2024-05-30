/**
 * Created by STAR_06 on 04.12.2015.
 */
define(["kendo.all.min","models/labListModel","utils","services/proxyService"],function(kendo,model,utils,proxy){
   'use strict';
    var ds = new kendo.data.DataSource({
        pageSize: 10,
        transport: {
            read: {
                url: "default.aspx?action=StacDoct_main/lab_AJAX&action2=list",
                dataType: "json",
                data: function() {
                    var selIb = proxy.getSessionObject("selectedIb");
                    return {
                        ask_id: selIb.ask_id,
                        d1: kendo.toString(kendo.parseDate(selIb.date_ask),"yyyyMMdd"),
                        d2: kendo.toString(kendo.parseDate(selIb.date_out),"yyyyMMdd") || ""
                        /* ,
                        fio: selIb.fio,
                        birt:kendo.toString(kendo.parseDate(selIb.birt), "yyyyMMdd"),
                        sex:selIb.sex
                        */
                    }
                }
            }
        },
        requestEnd: utils._onRequestEnd,
        schema: {
            data: "anlist.rows",
            total: "records",
            errors: "error",
            model: model
        },
        sort: [
            {field: "data_a", dir: "desc"},
            {field: "time", dir: "desc"}
        ],
        error: function(e) {
            utils.ajax_error(e);
        }

    });
    return ds;
});