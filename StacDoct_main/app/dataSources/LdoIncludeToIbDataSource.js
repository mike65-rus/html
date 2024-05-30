define(["kendo.all.min", "models/ldoReportModel", "utils", "services/proxyService"], function(kendo, model, utils, proxy){
   'use strict';

    var ds = new kendo.data.DataSource({
        transport: {
            read: {
                url: "default.aspx?action=StacDoct_main/ldo_AJAX&action2=include_to_ib",
                dataType: "json"
            }
        },
        requestStart: function(e) {
            kendo.ui.progress($(".k-content"), true);
        },
        requestEnd: function(e) { 
            kendo.ui.progress($(".k-content"), false);
			utils._onRequestEnd(e)
		},
        schema: {
            data: "ldoi.rows",
            total: "records",
            errors: "error"
        },
        error: function(e) {
            kendo.ui.progress($('.k-content'), false);
            utils.ajax_error(e);
        }/*,
        change: function(e) {
            var bRez=0;
            if (this._data.length) {
                bRez = this._data[0].included;
                LdoViewModel.set("oldIsslIncluded", (bRez>0) ? true:false);
            }
            else {
                LdoViewModel.set("oldIsslIncluded", false);
            }
        }*/
    });
	return ds;
	
});
