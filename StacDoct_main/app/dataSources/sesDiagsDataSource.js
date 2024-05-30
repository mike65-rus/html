/**
 * Created by STAR_06 on 25.11.2015.
 */
define(["kendo.all.min","utils","services/proxyService"],
    function(kendo,utils,proxy) {
        'use strict';
        var ds= new kendo.data.DataSource({
            serverPaging: false,
            serverSorting: false,
            pageSize: 100,
            transport: {
                read: {
                    url: location.origin + "/Medsystem/Gb2Ajax/home/sesDiags",
					//url: "https://tele.pgb2.ru/Medsystem/Gb2Ajax/home/sesDiags",
                    dataType: "json"
                }
            },
            requestEnd: utils._onRequestEnd,
            schema: {
                data: "rowlist.rows",
                total: "records",
                errors: "error",
                model: {
                    fields: {
                        searchstring: {type:"string"}
                    }
                }
            }
        });
        return ds;
	}
);