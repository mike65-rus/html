define(["kendo.all.min","models/labReportModel","utils","services/proxyService"],function(kendo,viewmodel,utils,proxy){
   'use strict';

    var ds = new kendo.data.DataSource({
		transport: {
			read: {
				url: "default.aspx?action=pk/CASES_AJAX&action2=find_persons",
				dataType: "json"
			}
		},
		requestStart:  function(e) {
			kendo.ui.progress($(".k-content"), true);
		},
		requestEnd: function(e) {
			kendo.ui.progress($(".k-content"), false);
			utils._onRequestEnd(e);
		},
		schema: {
			data: "persons.rows",
			total: "records",
			errors: "error",
			model: {
				fields: {
					pin: {type: "string"},
					fam: {type: "string"},
					ima: {type: "string"},
					otch: {type: "string"},
					sex: {type: "string"},
					birt: {type: "date"},
					fio: {type: "string"},
					evn: {type: "number"}
				}
			}
		},/*
		change: function(e) {

			if (e.items.length==1) {
				var selIb=ibModel.get("selectedIb");
				var d1=kendo.toString(addDays(selIb.date_ask,0-365),"yyyyMMdd");
				var d2=kendo.toString(addDays(selIb.date_ask,0-1),"yyyyMMdd");

				LabViewModel.oldLabDS.read({
					ask_id: e.items[0].pin,
					d1: d1,
					d2: d2
				});
			}
		},*/
		error: function(e) {
			utils.ajax_error(e);
		}

    });
	return ds;
});
