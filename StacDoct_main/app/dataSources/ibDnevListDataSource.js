/**
 * Created by STAR_06 on 04.12.2015.
 */
define(["kendo.all.min","models/ibDocModel","utils","services/proxyService"],function(kendo,model,utils,proxy){
   'use strict';
    var ds = new kendo.data.DataSource({
        pageSize: 1000,
        transport: {
            read: {
                //url: "http://localhost/Medsystem/Gb2Ajax/home/dnevlist
				//url: "https://tele.pgb2.ru/Medsystem/Gb2Ajax/home/dnevlist",
                url: location.origin + "/Medsystem/Gb2Ajax/home/dnevlist",
				dataType: "json",
                data: function() {
                    var selIb = proxy.getSessionObject("selectedIb");
                    return {
                        askid: selIb.ask_id
                    }
                }
            }
        },
        requestEnd: utils._onRequestEnd,
        schema: {
            data: "ibdocs.rows",
            total: "records",
            errors: "error",
            model: model
        },
        error: function(e) {
            utils.ajax_error(e);
        }
    });
    return ds;
});