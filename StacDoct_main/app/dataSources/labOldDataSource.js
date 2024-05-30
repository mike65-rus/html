define(["kendo.all.min","models/labReportModel","utils","services/proxyService"],function(kendo,model,utils,proxy){
   'use strict';
   
    var ds = new kendo.data.DataSource({
        batch: "true",
        serverPaging: false,
        serverSorting: false,
        serverFiltering: false,
        pageSize: 3000,
        transport: {
            read: "default.aspx?action=pk/pk_lab_AJAX&action2=list",
            dataType: "json"
        },
        requestStart: function(e) {
            kendo.ui.progress($(".k-content"), true);
        },
        requestEnd: function(e) {
            kendo.ui.progress($(".k-content"), false);
            utils._onRequestEnd(e);
        },
        schema: {
            data: "anlist.rows",
            total: "records",
            errors: "error",
            model: {
                id: "iddoc",
                fields: {
                    id: {
                        type: "string"
                    },
                    data_a: {
                        type: "date"
                    },
                    time: {
                        type: "string"
                    }
                }
            },
            sort: {
                field: "data_a", dir: "desc"
                
            }
        },
        change: function (e) {
            /*
//            $("#exams_kdl_grid").show();
            if (e.items.length) {
                $("#old-lab-data").show();
            }
            else {
                kendo.alert("Ничего не найдено!");
            }
            */
        },
        error: function(e) {
            utils.ajax_error(e);
        }

    });
	
    return ds;
	
/*	
	var ds=new kendo.data.DataSource({
		batch: "true",
		serverPaging: false,
		serverSorting: false,
		serverFiltering: false,
		transport: {
			read: "default.aspx?action=pk/pk_lab_AJAX&action2=list",
			dataType: "json"
		},
		schema: {
			data: "anlist.rows",
			total: "records",
			errors: "error",
			model: model,
			sort: {
				field: "data_a", dir: "desc"
			}
		}
	});
	return ds;
*/	
 });
