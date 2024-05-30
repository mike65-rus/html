/**
 * Created by 1 on 21.11.2015.
 */
define(["kendo.all.min", 'dataSources/myIbPerevodDataSource','router','services/proxyService','kendoHelpers'],
    function(kendo, myIbDataSource,router,proxy,kendoHelpers) {
        'use strict';
        var lastSelectedDataItem = null;
        var onClick = function(event, delegate) {
            event.preventDefault();
            var grid = $("#grid").data("kendoGrid");
            var selectedRow = grid.select();
            var dataItem = grid.dataItem(selectedRow);
            if (selectedRow.length > 0)
                delegate(grid, selectedRow, dataItem);
            else
                alert("Please select a row.");
        };
		
		var lastUser = window.localStorage.last_user;
		var medsystemPath = location.origin + "/medsystem/gb2ajax/home/";
		var otds;
		var ds = new kendo.data.DataSource({
			schema: {
				data: "rowlist.rows",
				total: "records",
				errors: "error",
				model: {
					id: "id",
					fields: {
						id: {type: "string"},
						code: {type: "string"}
					}
				},
			},
			transport: {
				read: {
					url: medsystemPath + "OtdList",
					dataType: "json",
					type:"get"
				}
			}
		});

		ds.read({ uid: lastUser }).then(function() {
			otds = ds.view()
		})
		
        var indexViewModel;
        indexViewModel = new kendo.data.ObservableObject({
            details: function (event) {
                onClick(event, function (grid, row, dataItem) {
                    router.navigate('/customer/edit/' + dataItem.ask_id);
                });
            },
            onChange: function (arg) {
                var grid = arg.sender;
                lastSelectedDataItem = grid.dataItem(grid.select());
            },
            onRefresh: function () {
                myIbDataSource.filter([]);
                myIbDataSource.read(
                    {uid: this.getUid(), otd: this.getOtdCode(), outed: "true"}
                );
            },
            dataSource: myIbDataSource,
            onDataBound: function (arg) {
				// get all the rows
				var view = this.dataSource.view();
				for (var i = 0; i < view.length; i++) {
					var askId = view[i].ask_id.replaceAll(':', '').replaceAll('.', '').replaceAll('-', '');
					/*$("#" + askId).on("click", function() { 
						var id = this.id;
						var askIdFull = this.title;
						var selectedOtd = $("#" + id + "_select").val();
						var myData = { askId: askIdFull, uid: lastUser, otd: selectedOtd };
						$.ajax({
							type: "POST",
							url: medsystemPath + "Transfer",
							dataType: "json",
							data: myData,
							success: function(data,textStatus) {
								alert(data.Text);
							},
							error: function (jqXHR, exception) {
								alert(jqXHR.STATUS + " " + jqXHR.message + " " + exception);
							}
						});
					});*/
					var sel = $('#' + askId + "_select");
					sel.on("change", function() { 
						var id = this.id;
						var askIdFull = this.title;
						var selectedOtd = $('#' + id).val();
						if (selectedOtd != 0) {
							var myData = { askId: askIdFull, uid: lastUser, otdTo: selectedOtd };
							$.ajax({
								type: "POST",
								url: medsystemPath + "TransferToMe",
								dataType: "json",
								data: myData,
								success: function(data,textStatus) {
									myIbDataSource.read();
									alert(data.Text);
								},
								error: function (jqXHR, exception) {
									alert(jqXHR.STATUS + " " + jqXHR.message + " " + exception);
								}
							});
						}
					});
					var k = 0;
					sel.append($('<option>', {
						value: 0,
						text: ""
					}));
					for (var j = 0; j < otds.length; j++) {
						if (view[i].user_id != lastUser || view[i].otd1 != otds[j].Code) {
							sel.append($('<option>', {
								value: otds[j].ID,
								text: otds[j].Code
							}));
							k++;
						}
					}
					if (k == 0) {
						$('#' + askId + "_select").prop("disabled", true);
					}
					else {
						$('#' + askId + "_select").prop("disabled", false);
					}
				}
                if (lastSelectedDataItem == null) return; // check if there was a row that was selected                
                for (var i = 0; i < view.length; i++) { // iterate through rows
                    if (view[i].ask_id == lastSelectedDataItem.ask_id) { // find row with the lastSelectedProductd
                        var grid = arg.sender; // get the grid
                        grid.select(grid.table.find("tr[data-uid='" + view[i].uid + "']")); // set the selected row
                        break;
                    }
                }
            },
            getUid: function () {
                return (this.get("selectedAction").act_type==1 ? this.get("selectedAction").act_val : 0);
            },
            getOtdCode: function () {
                return (this.get("selectedAction").act_type==2 ? this.get("selectedAction").act_val : "");
            },
            selIb: null,
            onSearchFieldChange: function(e) {
                /*var selIb=this.get("selIb");
                if (selIb) {
                    if (selIb.ask_id) {
                        proxy.publish("openIb",{ask_id:selIb.ask_id});
                        this.set("selIb",null);
                    }
                    else {
                        this.set("selIb",null)
                    }
                    this.dataSource.filter([]); // clear DS filter
                }*/
            },
            onBeforeFiltering: function(e) {
                var filter = e.filter;

                if (!filter.value) {
                    //prevent filtering if the filter does not value
                    this.dataSource.filter([]); // clear DS filter
                    e.preventDefault();
                }
                else {
                    if (!isNaN(filter.value)) {
                        e.filter.field="niib_s";
                    }
                    else {
                        e.filter.field="fio";
                    }
                }
            }


        });

        /*if (myIbDataSource._total==undefined) {
  //          myIbDataSource.transport.read.data={uid: localStorage['last_user'],outed: true};
//            myIbDataSource.read({uid: localStorage['last_user'],outed: true});
        };
        var onRowDoubleClick=function(dataItem) {
            router.navigate("#/ib/"+dataItem.ask_id);
        };
        setTimeout(function(){
            var grid=$("#grid").data("kendoGrid");
            if (grid) {
                kendoHelpers.grid.eventRowDoubleClick(grid,onRowDoubleClick);
            }
        },1000);*/
        var findAction=function(actionName) {
            for (var i=0;i<indexViewModel.actSource._data.length;i++) {
                if (indexViewModel.actSource._data[i].act_descr==actionName) {
                    return indexViewModel.actSource._data[i];
                }
            }
            return null;
        };
        var findActionByIndex=function(iIdx) {
            var oAction=null;
            if ((indexViewModel.actSource._data.length>=iIdx)) {
                oAction=indexViewModel.actSource._data[iIdx];
            }
            return oAction;
        };
        return indexViewModel;

    });
