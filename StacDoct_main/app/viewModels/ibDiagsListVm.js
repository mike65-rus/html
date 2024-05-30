/**
 * Created by 1 on 06.12.2015.
 */
define(["kendo.all.min","services/proxyService","dataSources/ibDiagsDataSource",
        'kendo-template!templates/ibDiagsListItemTemplate',
        'kendo-template!templates/ibDiagsWindow',"utils"],
    function(kendo,proxy,ds,listItemTemplate,editTemplateId,utils) {
        'use strict';
        var kendoWindow;
        var viewModel;
		
		function Fiscal(obj) {
			if (!(this instanceof Fiscal)) return new Fiscal(obj);
			this.isxod=Number(obj.isxod);
			this.result=Number(obj.result);
			this.ksg=obj.ksg;
			this.inVyp=obj.in_vyp;
			this.otkaz=obj.otkaz;
			this.summa=obj.summa;
			this.mkb=obj.mkb;
			this.czab=Number(obj.czab); // код характера заболевания

			this.mkb_name=obj.mkb_name;
			this.mkb_vers=Number(obj.mkb_vers);
			this.ksg_name=obj.ksg_name;
			this.usl_list=obj.usl_list;

			$("#fiscal_mkb_code").text(this.mkb);
			$("#fiscal_mkb_name").text(this.mkb_name);
			$("#fiscal_mkb_vers").text(this.mkb_vers.toString());
			$("#fiscal_ksg_code").text(this.ksg);
			$("#fiscal_ksg_name").text(this.ksg_name);
			$("#fiscal_usl_list").text(this.usl_list);

			try {
				this.ksgNum = obj.ksg.substr(2);
			}
			catch (e) {

			}
			if (obj.sluch_id=="") {
				this.inVyp=0;
				this.otkaz=0;
				this.ksgNum="000";
			}
		}
		var getFssInoeName=function (sCode) {
			var ds=fssSpr.inoe;
			for (var i=0; i<ds._data.length;i++) {
				if (ds._data[i].code==sCode) {
					return ds._data[i].name;
				}
			}
			return "";
		};
		
        viewModel= new kendo.data.ObservableObject({
            dataSource:ds,
			doFiscalReport: function(bForceReadFss) {
				var that=this;
				var selIb = proxy.getSessionObject("selectedIb");
				var dateAsk = kendo.parseDate(selIb.date_ask);
				var dateOut = kendo.parseDate(selIb.date_out);
				//var otd=that.data.ext1;
				var otd=null;
				if (!otd) {
					if (that.fiscal) {
						otd=that.fiscal.otd || "";
					}
				}
				//var perev = that.data.ext2;
				var perev = null;
				proxy.publish("openFiscal",{uuid:this.uuid,fiscal:that.fiscal,date_ask:dateAsk,date_out:dateOut,
					otd:otd,perevod:perev,forceReadFss:bForceReadFss});
			},
			isFiscalComplete: function() {
				if (!this.fiscal) {
					return false;
				}
				if (!(this.fiscal.isxod)) {
					return false;
				}
				if ((this.fiscal.isxod!=103)) {
					// не умер
					if (!(this.fiscal.result)) {
						return false;
					}
				}
				if (this.fiscal.ksg=="") {
					return false;
				}
				if (this.fiscal.ksg=="000") {
					return false;
				}
				return true;
			},	
			fiscalError: function() {
				alertify.error("Справка о результате лечения не заполнена или заполнена не полностью!");
			},
			dsReadFiscal: new kendo.data.DataSource({
				serverPaging: false,
				serverSorting: false,
				pageSize: 15,
				transport: {
					read: "default.aspx?action=StacDoct_main/ibDocs_AJAX&action2=get_fiscal",
					dataType: "json"
				},
				requestEnd: utils._onRequestEnd,
				schema: {
					data: "fiscal.rows",
					total: "records",
					errors: "error",
					model: {
						fields: {
							sluch_id: {type: "string"},
							isxod: {type: "number"},
							result: {type: "number"},
							ksg: {type: "string"},
							in_vyp: {type: "number"},
							otkaz: {type:"number"},
							summa: {type: "number"},
							mkb: {type:"string"},
							mkb_name:{type:"string"},
							mkb_vers: {type:"number"},
							ksg_name:{type:"string"}
						}
					}
				},
				change: function(e) {
					this.parentObj.fiscal=new Fiscal(e.items[0]);
					if (!(this.parentObj.recordId)) {
						// auto-open Fiscal
		//                this.parentObj.doFiscalReport();
					}
				},
				error: function(e) {
		//            this.parentObj.dsReadError(e);
				}
			})
        });
        var closeWindow=function(e) {
            var selector="#diagsListWindow";
            kendo.unbind("#ib_diags_list_window");
            kendoWindow.destroy();
            $(selector).remove();
        };
        var showWindow=function(data) {
            if (!data.length) {
                return;
            }
            var sTitle="Диагнозы."+data[0].pac_name;
            kendoWindow=$("<div id='diagsListWindow'/>").kendoWindow({
                title: sTitle,
                modal:true,
                animation:false,
                width:700,
                maxWidth:700,
                content: {
                    template: $("#"+editTemplateId).html()
                },
                close: closeWindow
            }).data("kendoWindow");
            kendo.bind("#ib_diags_list_window",viewModel);
            kendoWindow.open().center();
        };
        var onShowDiagsList=function(data) {
            kendo.ui.progress($("#app"),true);
            viewModel.dataSource.read({ask_id:data.ask_id}).
            then(function() {
                kendo.ui.progress($("#app"),false);
                showWindow(viewModel.dataSource._data);
            },function() {
                kendo.ui.progress($("#app"),false);
            });
        };
        proxy.subscribe("showDiagsList",onShowDiagsList);
        return viewModel;
    }
);