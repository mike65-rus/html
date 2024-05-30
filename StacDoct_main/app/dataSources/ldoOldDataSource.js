/**
 * Created by STAR_06 on 04.12.2015.
 */
define(["kendo.all.min","models/ldoReportModel","utils","services/proxyService"],function(kendo,model,utils,proxy){
   'use strict';
    var ds = new kendo.data.DataSource({
        transport: {
            read: {
                url: "default.aspx?action=StacDoct_main/ldo_AJAX&action2=get_old_issl",
                dataType: "json"
            }
        },
        pageSize: 10000,
        requestStart: function(e) {
            //$("#old-ldo-data").hide();
            kendo.ui.progress($('.k-content'), true);
        },
        requestEnd: function(e) {
            kendo.ui.progress($(".k-content"), false);
			utils._onRequestEnd(e);
		},
        schema: {
            data: "oldldo.rows",
            total: "records",
            errors: "error",
            model: {
                fields: {
                    curdate: {type:"date"},
                    curtime: {type:"date"}
                }
            }
        },/*
        change: function(e) {
            //kendo.ui.progress($('.k-content'), false);
            //if (this.data().length) {
                $("#old-ldo-data").show();
            //}
            //else {
            //   alertify.alert("Ничего не найдено!");
            //}
        },*/
        error: function(e) {
            utils.ajax_error(e);
        }

    });
    return ds;
});

