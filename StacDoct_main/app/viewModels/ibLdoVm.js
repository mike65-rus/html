/**
 * Created by 1 on 06.12.2015.
 */
define(["kendo.all.min",
		"dataSources/ldoListDataSource",
		"dataSources/ldoReportDataSource",
		"dataSources/ldoAnalListDataSource",
		"models/ldoListModel",
		"dataSources/ldoPacsDataSource",
		"dataSources/ldoOldDataSource",
		"dataSources/LdoIncludeToIbDataSource",
        "dataSources/ibRisOrdersDataSource",
        "services/proxyService",
		"services/sessionService",
		"services/printMarginService",
		"utils",
		"jqprint"],
    function(kendo,
		ldoListDs,
		ldoReportDs,
		ldoAnalListDs,
		LdoListModel,
		ldoPacsDs,
		ldoOldDs,
		LdoIncludeToIbDs,
		ibRisOrdersDs,
		proxy,
		sessionService,
		pmService,
		utils,
		jqprint) {
        "use strict";

        var clearAnalList=function() {
            var allDs=ldoAnalListDs;
            var aDel = [];
            for (var i = 0; i < allDs.total(); i++) {
                aDel.push(allDs.at(i));
            }
            for (var i = 0; i < aDel.length; i++) {
                allDs.remove(aDel[i]);
            }
        };
        var fillAnalList=function(myData) {
            var allDs=ldoAnalListDs;
            for (var i = 0; i < myData.length; i++) {
                var parItem = myData[i];
                var dataItem = new LdoListModel;
                dataItem.set("ask_id",parItem.ask_id);
                dataItem.set("codarm",parItem.codarm);
                dataItem.set("curdate",kendo.parseDate(parItem.curdate));
                dataItem.set("curtime",kendo.parseDate(parItem.curtime));
                dataItem.set("dosage",parItem.dosage);
                dataItem.set("incl",parItem.incl);
                dataItem.set("is_new",0);
                dataItem.set("namearm",parItem.namearm);
                dataItem.set("namedoct",parItem.namedoct);
                dataItem.set("otd",parItem.otd);
                dataItem.set("pk_doctor",parItem.pk_doctor);
                dataItem.set("title",parItem.title);
                dataItem.set("text",parItem.text);
                dataItem.set("last_view",parItem.last_view);

                allDs.pushCreate(dataItem);
            }
            for (var i=0; i<allDs._data.length;i++) {
                allDs.at(i).dirty=false;
            }
            allDs.fetch();
        };
        var viewModel = new kendo.data.ObservableObject({
            updateCount:0,
            isGridVisible:true,
            isAllVisible:function() {
                return !(viewModel.get("isGridVisible"));
            },
//            ldoListDs:ldoListDs,
            ldoListDs:ldoAnalListDs,
            ldoPacsDs: ldoPacsDs,
			ldoOldDs: ldoOldDs,
			LdoIncludeToIbDs: LdoIncludeToIbDs,
            ibRisDs:ibRisOrdersDs,
            currentExt3:"",
            allHtml:"",
            ekgHtml:"",
            fdHtml:"",
            uzdHtml:"",
            rentgenHtml:"",
            ktHtml:"",
            endoHtml:"",
            fisioHtml:"",
            otherHtml:"",
            pacsHtml:"",
            oldldoHtml:"",
			oldDataGrid:"",
            ibRisQuery:function(e) {
                var selIb=proxy.getSessionObject("selectedIb");
                if (selIb.ask_id) {
                    viewModel.ibRisDs.read({ask_id:selIb.ask_id}).then(function(){

                        })
                }
            },
            isNaprLdoVisible:function() {
                var bRet=true;
                if (utils.isViewer()) {
                    bRet=false;
                }
                return bRet;
            },
            doNaprLdo: function(e) {
                proxy.publish("doNaprLdo"); // subscribed in ib.js
            },
			cancelNaprLdo: function(e) {
                proxy.publish("cancelNaprLdo", { 'elem': e, 'ds': viewModel.ibRisDs });
            },
            isEndo:function() {
                return (this.get("endoHtml") ? true: false);
            },
            isEkg:function() {
                return (this.get("ekgHtml") ? true: false);
            },
            isFd:function() {
                return (this.get("fdHtml") ? true: false);
            },
            isUzd:function() {
                return (this.get("uzdHtml") ? true: false);
            },
            isRentgen:function() {
                return (this.get("rentgenHtml") ? true: false);
            },
            isKt:function() {
                return (this.get("ktHtml") ? true: false);
            },
            isFisio:function() {
                return (this.get("fisioHtml") ? true: false);
            },
            isOther:function() {
                return (this.get("otherHtml") ? true: false);
            },
            firstTabText: function() {
                return (viewModel.get("isGridVisible")) ? "Хронология" : "Все";
            },
            eyeClass: function() {
                return "fa "+((viewModel.get("isGridVisible")) ? "fa-eye":"fa-eye-slash");
            },
            eyeTitle: function() {
                return (viewModel.get("isGridVisible")) ? "Показать результаты" : "Показать хронологию";
            },
            toggleGrid: function() {
                viewModel.set("isGridVisible",!(viewModel.get("isGridVisible")));
            },
            print: function() {
                var ediv=getCurrentDiv();
                if (!ediv) {
                    return;
                }
                var css1=$(ediv).css("height");
                var css2=$(ediv).css("overflow-y");
                $(ediv).css("height","");
                $(ediv).css("overflow-y","")
                $(ediv).jqprint();
                $(ediv).css("height",css1).css("overflow-y",css2);
            },
            showNews: function() {
                var sHtml=getHtmlString(this.get("allHtml"),this.get("currentExt3"));
                this.set("windowHtml",sHtml);
                var wName=this.get("currentExt3");

                sessionService.dummyRequest();

                var selIb=proxy.getSessionObject("selectedIb");
                var newsDiv=$("#ib-news-result")
                kendo.bind($("#ib-news-bindable"),viewModel);
                $(newsDiv).kendoWindow({modal:true,position:{top:5,left:5},height:700,width:1000,close:viewModel.closeWindow});
                $(newsDiv).data("kendoWindow").open().title(selIb.niib.toString()+" "+selIb.fio);

                proxy.publish("newsOpen",this.get("currentExt3"));
            },
            closeWindow: function() {
                var kendoWindow=$("#ib-news-result").data("kendoWindow");
                if (kendoWindow) {
                    kendoWindow.unbind("close");
                    kendoWindow.close();
                    kendo.unbind($("#ib-news-bindable"));

                    proxy.publish("newsClose",viewModel.get("currentExt3"));

                    viewModel.set("currentExt3","");
                }
            },
            printWindow: function() {
                var ediv=$("#ib-news-result-content");
                if (!ediv) {
                    return;
                }
                $(ediv).jqprint();
            },
            setCurrentTab: function(e) {
                var id= $(e.toElement).attr("id");
                var sId=id.substr(9,2);
                viewModel.set("currentTab",Number(sId));
                if (Number(sId)==11) {
                    setTimeout(function(){
                        var grid= $("#ibRisOrders").data("kendoGrid");
                        if (grid) {
                            grid.resize();
                        }
                    },50);
                }
            },
            showExternal: function(e) {
                var ediv;
                ediv = getCurrentDiv();
                if (!ediv) {
                    return;
                }
                var sHtml=getHtmlString2(ediv);
                sessionService.dummyRequest();
                var w = window.open('', 'view_wnd_'+new Date().toString());

                w.document.body.innerHTML="";   // important!
                w.document.write(sHtml);
            },
            onRefresh: function() {
                var selIb = proxy.getSessionObject("selectedIb");
                clearAnalList();
                kendo.ui.progress($("#ib-ldo"), true);
/*
                ldoListDs.read().then(function() {
                    if (selIb.user_id===Number(localStorage['last_user'])) {
                        if (ldoListDs._data) {
                            if (ldoListDs._data.length) {
                                // subscribed in ibNewsVm
                                proxy.publish("newsReaded", {ask_id:selIb.ask_id,sys_id: 2});   // обновление в новостях
                            }
                        }
                    }
                });
*/
                ldoReportDs.read(
                    {
                        ask_id: selIb.ask_id,
                        sort_order: "desc",
                        niib: selIb.niib,
                        fio: selIb.fio,
                        otd1: selIb.otd1,
                        palata: selIb.palata
                    }
                ).then(function() {
                    if (ldoReportDs._data) {
                        if (ldoReportDs._data.length) {
                            var t1=ldoReportDs._data[0].anlist;
                            if (t1.length) {
                                var t2=JSON.parse(t1);
                                fillAnalList(t2.anlist.rows);
                            }
                            if (selIb.user_id===Number(localStorage['last_user'])) {
                                // subscribed in ibNewsVm
                                proxy.publish("newsReaded", {ask_id:selIb.ask_id,sys_id: 2});   // обновление в новостях
                            }
                        }
                    }
                });
            },
            update: function(page) {
                if (viewModel.get("updateCount")) {

                    viewModel.set("isGridVisible",false);
                    viewModel.set("allHtml","");
                    viewModel.set("ekgHtml","");
                    viewModel.set("fdHtml","");
                    viewModel.set("uzdHtml","");
                    viewModel.set("rentgenHtml","");
                    viewModel.set("ktHtml","");
                    viewModel.set("endoHtml","");
                    viewModel.set("fisioHtml","");
                    viewModel.set("otherHtml","");
                    viewModel.set("pacsHtml","");
                    viewModel.set("oldldoHtml","");

                    viewModel.set("currentTab",8);
                    activateTab(viewModel.get("currentTab"));
                    viewModel.onRefresh();
                }
                else {
                    setTimeout(function() {
                        viewModel.ldoListDs.trigger("change");
                    },50);
                    if (viewModel.get("currentExt3")) {
                        viewModel.showNews();
                    }
                    else {
                        activateTab(viewModel.get("currentTab"));
                    }
                }
                resizeDivs();
                if (page) {
                    viewModel.set("currentTab",page);
                    activateTab(viewModel.get("currentTab"));
                }
            },
            pacsQuery1:function() {
                this.pacsQuery(1);  // for current Ib
            },
            pacsQuery2:function() {
                this.pacsQuery(2);  // for all patient cases
            },
            pacsQuery: function(iMode) {
                var selIb=proxy.getSessionObject("selectedIb");
                if (!selIb) {
                    return;
                }
                var d1=kendo.parseDate(selIb.date_ask);
                d1=kendo.toString(d1,"yyyyMMdd");
                var birt=kendo.parseDate(selIb.birt);
                birt=kendo.toString(birt,"yyyyMMdd");
                var d2="";
                try {
                    d2=kendo.parseDate(selIb.date_out);
                    d2=kendo.toString(d2,"yyyyMMdd")
                }
                catch(e) {
                    d2="";
                }
                kendo.ui.progress($('#ib-ldo'), true);
                if (iMode==2) {
                    viewModel.ldoPacsDs.read({
                        global_vn:selIb.global_vn,
                        ask_id:selIb.ask_id,
                        birt:birt
                    })
                }
                else {
                    viewModel.ldoPacsDs.read({
                        global_vn:selIb.global_vn,
                        ask_id:selIb.ask_id,
                        birt:birt,
                        d1:d1,
                        d2:d2
                    })
                }
            },

			printOldResult: function(e) {
		//        printLdoDiv("old-ldo-result-body-html");
				$("#old-ldo-result-body-html").jqprint({debug:false});
			},
			exportPDF: function(e) {
				var sData=$("#old-ldo-result-body-html").html();
				kendo.ui.progress($('.k-content'), true);
				$.ajax({
					url: "default.aspx?action=StacDoct_main/ibDocs_AJAX&action2=get_PDF&" +
						"CSS=html/css/vyp-print.css;html/css/lab-print.css;html/css/ldo-print.css;html/StacDoct_main/app/css/app-print.css&"+
						"top=10&bottom=5&left=15&right=5zoom=1.15",
					type: "POST",
					data: sData,
					processData:false,
					success: function(data,textStatus) {
		//                console.log(data);
						if (data.error=='') {
							var curIb=proxy.getSessionObject("selectedIb");
							//var curIb=ibModel.get('selectedIb');
							var sFile=curIb.fio.replaceAll(' ','_');
							var pom=document.getElementById('pom_pdf_downloader');
							if (!pom) {
								pom=document.createElement('a');
								pom.setAttribute('id','pom_pdf_downloader');
							}
							pom.setAttribute('href',data.alink);
							pom.setAttribute('download',sFile+"_"+kendo.guid()+".pdf");
							setTimeout(function() {
								pom.click();
							},2000);

						}
						else {
							ajax_error({error:data.error});
						}
						utils._onRequestEnd(0);
					},
					dataType: "json"
				}).always(function (dataOrjqXHR, textStatus, jqXHRorErrorThrown){
					kendo.ui.progress($('.k-content'), false);

				});

			},
			
			oldQuery:function() {
				var sId;
				var selIb;
				//var oldDataGrid;
				
				selIb = proxy.getSessionObject("selectedIb");
				if ( !selIb ) {
					return;
				};
				
				sId = selIb.ask_id;
				
				if (selIb.department == 3) {
					sId = selIb.pin;
				};
				
				viewModel.ldoOldDs.read({
					ask_id: sId
				});
				
				if ( ! (this.oldDataGrid) || !($("#old-ldo-data-grid").data("kendoGrid"))) {
				this.oldDataGrid = $("#old-ldo-data-grid").kendoGrid({
					dataSource: viewModel.ldoOldDs,
					height: "100%",
					autoBind:false,
					scrollable: true,
				/*    pageable: {
						pagesize: 20,
						numeric: true
					}, */
					resizable: true,
					sortable: false,
					selectable: "row",
					groupable: false,
					filterable: false,
					navigatable: true,
					columns: [
						{field: "ask_id", title: "ask_id",hidden: true },
                        {field:"included",title:"Вкл",
                            template: $("#ldo-check-template").html(),width:59,filterable:false, sortable: false},
						{ field: "curdate", title: "Дата", width: "10%", format: "{0:dd.MM.yyyy}"},
						{ field: "disp_ib", title: "Карта", width: "10%"  },
						{ field: "otd", title: "Отдел", width: "10%"  },
						{ field: "namearm", title: "Раздел", width: "10%"  },
						{ field: "title", title: "Исследование"  },
						{ field: "namedoct", title: "Врач", width: "25%"   }
					],
					change: function(e) {
                        if (e.sender) {
                            if (!(e.sender._lastCellIndex)) {
                                return;
                            }
                        }
						var selectedRow = this.select();
						var dataItem = this.dataItem(selectedRow);
						// selectedDataItems contains all selected data items
						if (dataItem) {
							var model=viewModel;
							model.set("oldText",dataItem.text);
							model.set("oldDate",kendo.toString(dataItem.curdate,"dd.MM.yyyy"));
							model.set("oldTime",kendo.toString(dataItem.curtime,"HH:mm"));
							model.set("oldVrach",dataItem.namedoct);
							model.set("oldTitle",dataItem.title);
							model.set("oldHtml",dataItem.html);
							model.set("oldIsslIncluded",(dataItem.included>0) ? true:false);
							model.set("currentOldData",dataItem);
                            var selIb=proxy.getSessionObject("selectedIb");
							// $("#old-ldo-result-body-text").html(dataItem.text);
							model.LdoIncludeToIbDs.read({
								action3:"get",
								ask_id: selIb.ask_id, /*ibModel.selectedIb.ask_id*/
								a_id: dataItem.ask_id,
								codarm:dataItem.codarm.toString(),
								curDate:kendo.toString(dataItem.curdate,"yyyyMMdd"),
								curTime:kendo.toString(dataItem.curtime,"HH:mm:ss")
							}).then(function () {
								var bRez = 0;
								if (viewModel.LdoIncludeToIbDs._data.length) {
									bRez = viewModel.LdoIncludeToIbDs._data[0].included;
									viewModel.set("oldIsslIncluded", (bRez>0) ? true : false);
								}
								else {
									viewModel.set("oldIsslIncluded", false);
								}
							});
							setTimeout(function(){
								$("#old-ldo-result-window").data("kendoWindow").title(dataItem.namearm+" "+selIb./*selectedIb.*/fio).open().center();
							},1000);
						}
					}
				});
				kendo.bind("#old-ldo-result",viewModel);
				$("#old-ldo-result-window").kendoWindow({
					modal: true,
					animation: false,
				/*    height: 600, */
					width: 800,
					close: function(e) {
                        var selIb=proxy.getSessionObject("selectedIb");
						var bChecked=viewModel.get("oldIsslIncluded");
						var dataItem=viewModel.get("currentOldData");
						viewModel.LdoIncludeToIbDs.read({
							action3:"set",
							ask_id: selIb.ask_id,
							a_id:dataItem.ask_id,
							codarm:dataItem.codarm.toString(),
							curDate:kendo.toString(dataItem.curdate,"yyyyMMdd"),
							curTime:kendo.toString(dataItem.curtime,"HH:mm:ss"),
							included: (bChecked ? 1:0)
						}).then(function () {
							var bRez = 0;
							if (viewModel.LdoIncludeToIbDs._data.length) {
								bRez = viewModel.LdoIncludeToIbDs._data[0].included;
								viewModel.set("isOldAnalIncluded", (bRez) ? true : false);
							}
							else {
								viewModel.set("isOldAnalIncluded", false);
							}
                            var ds=viewModel.ldoOldDs;
							var aItem=viewModel.LdoIncludeToIbDs._data[0];
                            for (var i=0;i<ds._data.length;i++) {
                                var dataItem=ds._data[i];

                                if (dataItem.ask_id==aItem.a_id) {
                                    if (dataItem.codarm==aItem.codarm) {
                                        if (kendo.toString(dataItem.curdate,"yyyyMMdd")==kendo.toString(kendo.parseDate(aItem.curdate),"yyyyMMdd")) {
                                            if (kendo.toString(dataItem.curtime,"HH:mm:ss")==kendo.toString(kendo.parseDate(aItem.curtime),"HH:mm:ss")) {
                                                dataItem.set("included",aItem.included);
                                            }
                                        }
                                    }
                                }
                            }

						});
                        viewModel.set("currentOldData",null);
					}

				});		
				
				};
				
			},
			/*
            oldQuery: function() {
                let selIb = proxy.getSessionObject("selectedIb");
				//let selectedRow = this.select();
				//let dataItem = this.dataItem(selectedRow);
				
				
                if (!selIb) {
                    return;
                }
				
                kendo.ui.progress($('#ib-ldo'), true);
				
				viewModel.ldoOldDs.read({
					action3: "get",
					ask_id: selIb.ask_id,
					a_id: selIb.ask_id, //dataItem.ask_id,
					codarm: selIb.codarm,
					curDate: kendo.toString(selIb.curdate,"yyyyMMdd"),
					curTime: kendo.toString(selIb.curtime,"HH:mm:ss")
					
					
					//global_vn:selIb.global_vn,
					//ask_id:selIb.ask_id,
					//birt:birt,
					//d1:d1,
					//d2:d2
					
				})
            },
			*/
            onDataBinding: function(e) {
                if (utils.isViewer()) {
                    var grid = e.sender;
                    grid.hideColumn("last_view");
                }
            }
			
        });
        var resizeDivs=function() {
            var height=utils.getAvailableHeight();
            height=Math.max(height-75-50-10+20,300);
            for (var i=0;i<20;i++) {
                var curDiv=$("#divldo"+i.toString());
                if (curDiv.length) {
                    $(curDiv).css("height",height.toString()+"px").css("overflow-y","scroll");
                }
            }
        };
        var activateTab=function(nCurTab) {
            var labTabs=$("#ldotabs");
            $(labTabs).find("li").removeClass("active");
            $(labTabs).find("#labtabldo"+viewModel.get("currentTab").toString()).parent().addClass("active");
            var labContent=$("#ldo-content");
            $(labContent).find(".tab-pane").removeClass("active");
            $(labContent).find("#ildo"+viewModel.get("currentTab").toString()).addClass("active");
        };
        var getHtmlString=function(sContent,eanchor) {
            var sHtml="";
            var sA=$(sContent);
            var sB="";
            if (eanchor) {
                // скрыть все другие, кроме этого бланка (вызов из вкладки Новое)
                sA=$(sContent).filter("div.ldo-table-div[id='i"+eanchor+"']");
                sB=$(sContent).filter("div.lab-pac-header");
                //.css("display","none");
                sHtml=""+$(sB).html()+$(sA).html();
                return sHtml;
            }
            return sHtml;
        };
        var getHtmlString2=function(eDiv) {
            var selIb=proxy.getSessionObject("selectedIb");
            var sHtml="<!DOCTYPE HTML > <META http-equiv=Content-Type content='text/html; charset=windows-1251'>";
            sHtml=sHtml+"<TITLE>"+selIb.fio+"</TITLE>"
            sHtml=sHtml+"<HTML> <HEAD>";
            sHtml=sHtml+"<link rel='stylesheet' type='text/css' href='html/css/ldo-print.css'  media='print'>";
            sHtml=sHtml+"<link rel='stylesheet' type='text/css' href='html/css/ldo-screen-with-title.css'  media='screen'>";
            sHtml=sHtml+"<style media='print'>"+pmService.createPrintMarginStyle()+"</style>";
            sHtml=sHtml+"</HEAD> <BODY>";
            sHtml=sHtml+"<DIV class='no-print'><BUTTON onclick='javascript:window.print()'>Печать</BUTTON> &nbsp;"
            sHtml=sHtml+"<BUTTON onclick='javascript:window.close()'>Закрыть</BUTTON> &nbsp;</DIV>"
            sHtml=sHtml+$(eDiv).html();
            sHtml=sHtml+"<DIV class='no-print'><BUTTON onclick='javascript:window.print()'>Печать</BUTTON> &nbsp;"
            sHtml=sHtml+"<BUTTON onclick='javascript:window.close()'>Закрыть</BUTTON> &nbsp;</DIV>"
            sHtml=sHtml+"</BODY> </HTML>";
            return sHtml;
        };
        var getCurrentTab=function() {
            return $("#ldotabs").find("li.active").first();
        };
        var getCurrentDiv=function() {
            var curTab=getCurrentTab();
            if (!(curTab.length)) {
                return null;
            }
            var sCurDivId=$(curTab).find("a").first().attr("id");
            sCurDivId=sCurDivId.replace("labtabldo","divldo");
            var curDiv=$("#"+sCurDivId);
            return curDiv;
        } ;
        var onSelectedIbChanged=function(data) {
            viewModel.set("updateCount",viewModel.get("updateCount")+1);
        };
        proxy.subscribe("selectedIbChanged",onSelectedIbChanged);
        var onReportReaded=function(e) {
            var ds= e.sender;
            try {
                kendo.ui.progress($("#ib-ldo"), false);
            }
            catch (e) {

            }
            viewModel.set("updateCount",0);
            for (var i = 0; i < ds._data.length; i = i + 1) {
                
				var sType=ds._data[i].atype;
				
                if (sType==="Все") {
                    viewModel.set("allHtml", ds._data[i].ahtml);
                }
                if (sType==="ЭКГ") {
                    viewModel.set("ekgHtml", ds._data[i].ahtml);
                }
                if (sType==="ФД") {
                    viewModel.set("fdHtml", ds._data[i].ahtml);
                }
                if (sType==="УЗД") {
                    viewModel.set("uzdHtml", ds._data[i].ahtml);
                }
                if (sType==="Рентген") {
                    viewModel.set("rentgenHtml", ds._data[i].ahtml);
                }
                if (sType==="КТ") {
                    viewModel.set("ktHtml", ds._data[i].ahtml);
                }
                if (sType==="Эндоскопия") {
                    viewModel.set("endoHtml", ds._data[i].ahtml);
                }
                if (sType==="Физио") {
                    viewModel.set("fisioHtml", ds._data[i].ahtml);
                }
                if (sType==="Прочее") {
                    viewModel.set("otherHtml", ds._data[i].ahtml);
                }
                if (sType==="История") {
                    viewModel.set("oldldoHtml", ds._data[i].ahtml);
                }
            }
            if (viewModel.get("currentExt3")) {
                viewModel.showNews();
            }
        };
        ldoReportDs.bind("change",onReportReaded);
		
        var onPacsDataChange=function(e) {
            var ds= e.sender;
            try {
                kendo.ui.progress($("#ib-ldo"), false);
            }
            catch (e) {

            }
            viewModel.set("pacsHtml",ds._data[0].ahtml);
        };
        ldoPacsDs.bind("change",onPacsDataChange);

		
		/*
        var onOldLdoDataChange=function(e) {
            var ds= e.sender;
            try {
                kendo.ui.progress($("#ib-ldo"), false);
            }
            catch (e) {

            }
            viewModel.set("oldldoHtml",ds._data[0].ahtml);
        };

        ldoOldLdoDs.bind("change",onOldLdoDataChange);
		*/
		
		
        var onSet=function(e) {
            if (e.field==="currentExt3") {
                if (e.value) {
                    setTimeout(function(){
                        viewModel.update();
                    },50);
                }
            }
            if (e.field=="currentTab") {
                resizeDivs();
            }
        };

        var onGridCheckButtonClick=function(data) {
            var ds=viewModel.ldoOldDs;
            var dataItem=ds.getByUid(data.uid);
            var selIb = proxy.getSessionObject("selectedIb");
            viewModel.LdoIncludeToIbDs.read({
                action3: "set",
                ask_id: selIb.ask_id,
                a_id:dataItem.ask_id,
                codarm:dataItem.codarm.toString(),
                curDate:kendo.toString(dataItem.curdate,"yyyyMMdd"),
                curTime:kendo.toString(dataItem.curtime,"HH:mm:ss"),
                included: ( (dataItem.included) ? 0:1)
            }).then(function(){
                dataItem.set("included",!(dataItem.get("included")));
            });
        };

		
        viewModel.bind("set",onSet);
        proxy.subscribe("ibHeaderSizeChanged",resizeDivs);
        proxy.subscribe("ldoGridCheckButtonClick",onGridCheckButtonClick);
        proxy.subscribe("risOrdersUpdate",viewModel.ibRisQuery);    // published from ib.js
        return viewModel;
    }
	
);