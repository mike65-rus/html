/**
 * Created by STAR_06 on 25.11.2015.
 */
define(["kendo.all.min","utils","services/proxyService"],
    function(kendo,utils,proxy) {
//  for mon_gp
        'use strict';
        var ds= new kendo.data.DataSource({
            serverPaging: false,
            serverSorting: false,
            pageSize: 10,
            transport: {
                read: {
                    async: true,
                    url: "default.aspx?action=StacDoct_main/ibNews_AJAX&action2=get_for_mon_gp",
                    data:{uid: localStorage['last_user']},
                    dataType: "json"
                }
            },
            requestEnd: utils._onRequestEnd,
            schema: {
                data: "formongp.rows",
                total: "records",
                errors: "error",
                model: {
                    id : "rec_id",
                    fields: {
                        rec_id: {type:"number"},
                        users_list: {type:"string"},
                        holidays: {type:"string"},
                        hash: {type:"string"},
                        check_interval:{type:"number"},
                        confirmed: {type:"date"}
                    }
                }
            },
        });
        return ds;

}
);