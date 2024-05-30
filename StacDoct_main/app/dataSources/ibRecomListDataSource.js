/**
 * Created by STAR_06 on 25.11.2015.
 */
define(['models/ibRecomModel',"kendo.all.min","utils","services/proxyService"], function(ibRecomModel,kendo,utils,proxy) {
//  Рекомендации
        'use strict';
        var getIbRecomSource= new kendo.data.DataSource({
            transport: {
                read: {
                    url: "default.aspx?action=StacDoct_main/newIb_AJAX&action2=get_ib_recomendation",
                    dataType: "json",
                    data: function() {
                        var iMode = 2;
                        var selIb = proxy.getSessionObject("selectedIb");
                        var dataItem = {
                            ask_id: selIb.ask_id,
                            global_vn: selIb.global_vn,
                            dnst: selIb.dnst,
                            date_ask: kendo.parseDate(selIb.date_ask),
                            date_out: kendo.parseDate(selIb.date_out)
                        };
                        return {
                            recomid: 0,
                            ask_id: dataItem.ask_id,
                            global_vn: dataItem.global_vn,
                            dnst: dataItem.dnst,
                            dateask: kendo.toString(dataItem.date_ask, "yyyyMMdd"),
                            dateout: (dataItem.date_out == null) ? "" : kendo.toString(dataItem.date_ask, "yyyyMMdd"),
                            user_id: 0,
                            mode: iMode
                        }
                    }
                }
            },
            requestStart: function(e) {
            },
            requestEnd: utils._onRequestEnd,
            schema: {
                data: "myrecoms.rows",
                total: "records",
                errors: "error",
                model: ibRecomModel
            },
            change: function(e) {
            },
            error: function(e) {
                utils.ajax_error(e);
            }
        });
        return getIbRecomSource;

}
);