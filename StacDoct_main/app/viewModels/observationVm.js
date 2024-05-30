define(["kendo.all.min",'kendo-template!templates/observation','services/proxyService','alertify'],
    function(kendo,editTemplateId,proxy,alertify) {
        "use strict";
        var viewModel;
		var medsystemPath = location.origin + "/medsystem/gb2ajax/home/";
        viewModel= new kendo.data.ObservableObject({
            open: function() {
				var selIb = proxy.getSessionObject("selectedIb");
				$.ajax({
					url:
						//"http://localhost/Medsystem/Gb2Ajax/Home/Observation?askId=" 
						//"https://tele.pgb2.ru/Medsystem/Gb2Ajax/Home/Observation?askId="
						medsystemPath + "Observation?askId=" + selIb.ask_id,
					dataType: "json",
					success: function(data,textStatus) {
						if (data.error === "") {
							if (data.records > 0) {
								viewModel.reason = data.rowlist.rows[0].Reason;						
							}					
							kendoWindow.open().center();	
							kendo.bind($("#observation-data"),viewModel);								
						}
						else {
							kendo.alert(data.error);
						}
					}
				});                
            },
            save: function() {
				var selIb = proxy.getSessionObject("selectedIb");
				$.ajax({
					url:
						//"http://localhost/Medsystem/Gb2Ajax/Home/SaveObservation?askId="
						//"https://tele.pgb2.ru/Medsystem/Gb2Ajax/Home/SaveObservation?askId="
						medsystemPath + "SaveObservation?askId=" + selIb.ask_id + "&uid=" + selIb.user_id.toString() + "&reason=" + this.reason,
					dataType: "json",
					success: function(data,textStatus) {
						kendo.alert(data.Text);
					}
				});
                kendoWindow.close();
            },
            close: function() {
                kendoWindow.close();
            },
			reason: null
        });

        var kendoWindow=$("<div id='observationDialog'/>").kendoWindow({
            title: "Оставить под наблюдение",
            modal:true,
            content: {
                template: $("#"+editTemplateId).html()
            }
        }).data("kendoWindow");
		
        return viewModel;
    }
);