/**
 * Created by STAR_06 on 04.12.2015.
 */
define(["kendo.all.min", 
		"dataSources/searchPacDataSource",
		"dataSources/labAnalListDataSource",
		"models/labListModel",
		"dataSources/labListDataSource", "dataSources/labReportDataSource",
		"dataSources/labOldDataSource",
		"dataSources/oldLabShowDataSource",
		"dataSources/LabIncludeToIbDataSource",
        "services/proxyService", "services/sessionService", "services/printMarginService", "utils", "jqprint"],
    function( kendo, searchPacDS,labAnalListDs,LabListModel,
              labListDs, labReportDs, labOldDs, oldLabShowDS, LabIncludeToIb,
              proxy, sessionService, pmService, utils, jqprint){
    "use strict";

    var clearAnalList=function() {
        var allDs=labAnalListDs;
        var aDel = [];
        for (var i = 0; i < allDs.total(); i++) {
            aDel.push(allDs.at(i));
        }
        for (var i = 0; i < aDel.length; i++) {
            allDs.remove(aDel[i]);
        }
    };
    var fillAnalList=function(myData) {
        var allDs=labAnalListDs;
        for (var i = 0; i < myData.length; i++) {
            var parItem = myData[i];
            var dataItem = new LabListModel;
            dataItem.set("iddoc",parItem.iddoc);
            dataItem.set("ask_id",parItem.ask_id);
            dataItem.set("bl",parItem.bl);
            dataItem.set("bl_code",parItem.bl_code);
            dataItem.set("bl_name",parItem.bl_name);
            dataItem.set("bm_code",parItem.bm_code);
            dataItem.set("bm_name",parItem.bm_name);
            dataItem.set("codes",parItem.codes);
            dataItem.set("data_a",kendo.parseDate(parItem.data_a));
            dataItem.set("diag",parItem.diag);
            dataItem.set("fio",parItem.fio);
            dataItem.set("ib",parItem.ib);
            dataItem.set("is_new",0);
            dataItem.set("otd",parItem.otd);
            dataItem.set("palata",parItem.palata);
            dataItem.set("vrach_id",parItem.vrach_id);
            dataItem.set("vrach",parItem.vrach);
            dataItem.set("time",parItem.time);
            dataItem.set("time36",parItem.time36);
            dataItem.set("tipp",parItem.tipp);

            allDs.pushCreate(dataItem);


        }
        for (var i=0; i<allDs._data.length;i++) {
            allDs.at(i).dirty=false;
//            dataItem.dirty=false;
        }
        allDs.fetch();
    };
    var viewModel = new kendo.data.ObservableObject({
		isOldAnalIncluded: false,
        updateCount: 0,
//        labListDs: labListDs,
        labListDs:labAnalListDs,
		labOldDs: labOldDs,
		searchPacDS: searchPacDS,
		oldLabShowDS: oldLabShowDS,
		LabIncludeToIb: LabIncludeToIb,
        isExt: function() {
            return (this.get("extHtml") ? true: false);
        },
        isClinica: function() {
            return (this.get("clinicaHtml") ? true: false);
        },
        isBioXim: function() {
            return (this.get("bioXimHtml") ? true: false);
        },
        isMocha: function() {
            return (this.get("mochaHtml") ? true: false);
        },
        isKal: function() {
            return (this.get("kalHtml") ? true: false);
        },
        isOther: function() {
            return (this.get("otherHtml") ? true: false);
        },
        setCurrentTab: function(e) {
            var id = $(e.toElement).attr("id");
            var sId = id.substr(6,1);
            viewModel.set("currentTab", Number(sId));
        },
		oldHtml:"",
		oldAnalId:"",
        allHtml: "",
        clinicaHtml: "",
        bioXimHtml: "",
        mochaHtml: "",
        kalHtml: "",
        otherHtml: "",
        extHtml:"",
		oldDataGrid: "",
        isGridVisible: false,
        isAllVisible: function() {
            return !(viewModel.get("isGridVisible"));
        },
        currentExt3: "",
        windowHtml: "",
        currentTab: 5,
        print: function() {
            var ediv = getCurrentDiv();
            if (!ediv) {
                return;
            }
            var css1 = $(ediv).css("height");
            var css2 = $(ediv).css("overflow-y");
            $(ediv).css("height","");
            $(ediv).css("overflow-y", "");
            $(ediv).jqprint();
            $(ediv).css("height", css1).css("overflow-y", css2);
        },
        showNews: function() {
            var sHtml = getHtmlString(this.get("allHtml"), this.get("currentExt3"));
            this.set("windowHtml", sHtml);
            var wName = this.get("currentExt3");

            sessionService.dummyRequest();

            var selIb = proxy.getSessionObject("selectedIb");
            var newsDiv = $("#ib-news-result");
            kendo.bind($("#ib-news-bindable"), viewModel);
            $(newsDiv).kendoWindow({modal:true, position:{top:5,left:5}, height:700, width:1000, close: viewModel.closeWindow});
            $(newsDiv).data("kendoWindow").open().title(selIb.niib.toString() + " " + selIb.fio);

            proxy.publish("newsOpen", this.get("currentExt3"));
        },
        closeWindow: function() {
            var kendoWindow = $("#ib-news-result").data("kendoWindow");
            if (kendoWindow) {
                kendoWindow.unbind("close");
                kendoWindow.close();
                kendo.unbind($("#ib-news-bindable"));

                proxy.publish("newsClose", viewModel.get("currentExt3"));

                viewModel.set("currentExt3","");
            }
        },
        printWindow: function() {
            var ediv = $("#ib-news-result-content");
            if (!ediv) {
                return;
            }
            $(ediv).jqprint();
        },
        showExternal: function(e) {
            var ediv = getCurrentDiv();
            if (!ediv) {
                return;
            }
            var sHtml = getHtmlString2(ediv);
            sessionService.dummyRequest();
            var w = window.open('', 'view_wnd_' + new Date().toString());

            w.document.body.innerHTML = "";   // important!
            w.document.write(sHtml);
        },
        eyeClass: function() {
            return "fa " + ((viewModel.get("isGridVisible")) ? "fa-eye":"fa-eye-slash");
        },
        eyeTitle: function() {
            return (viewModel.get("isGridVisible")) ? "Показать результаты" : "Показать хронологию";
        },
        toggleGrid: function() {
            viewModel.set("isGridVisible", !(viewModel.get("isGridVisible")));
        },
        firstTabText: function() {
            var sRet = "Все";
            if (viewModel.get("isGridVisible"))  {
                sRet = "Хронология";
            }
            return sRet;
        },
        onRefresh: function() {
            var selIb = proxy.getSessionObject("selectedIb");
            this.set("isGridVisible",false);

            this.set("clinicaHtml", "");
            this.set("bioXimHtml", "");
            this.set("mochaHtml", "");
            this.set("kalHtml", "");
            this.set("otherHtml", "");
            this.set("extHtml", "");
            this.set("allHtml", "");
            clearAnalList();

            kendo.ui.progress($("#ib-lab"),true);
            /*
            labListDs.read().then(function() {
                if (selIb.user_id===Number(localStorage['last_user'])) {
                    if (labListDs._data) {
                        if (labListDs._data.length) {
                            // subscribed in ibNewsVm
                            proxy.publish("newsReaded", {ask_id:selIb.ask_id,sys_id: 1});   // обновление в новостях
                        }
                    }
                }
            });
            ;
            */
            labReportDs.read({
                ask_id: selIb.ask_id,
                d1: kendo.toString(kendo.parseDate(selIb.date_ask), "yyyyMMdd"),
                d2: kendo.toString(kendo.parseDate(selIb.date_out),"yyyyMMdd") || "",
                bm_name: "Все",
                niib: selIb.niib,
                fio: selIb.fio,
                otd1: selIb.otd1,
                palata: selIb.palata,
                birt:kendo.toString(kendo.parseDate(selIb.birt), "yyyyMMdd"),
                sex:selIb.sex
            }).then(function() {
                if (labReportDs._data) {
                    if (labReportDs._data.length) {
                        var t1=labReportDs._data[0].anlist;
                        if (t1.length) {
                            var t2=JSON.parse(t1);
                            fillAnalList(t2.anlist.rows);
                        }
                        if (selIb.user_id===Number(localStorage['last_user'])) {
                                    // subscribed in ibNewsVm
                                    proxy.publish("newsReaded", {ask_id:selIb.ask_id,sys_id: 1});   // обновление в новостях
                        }
                    }
                }
            })
        },
        update: function() {
            if (viewModel.get("updateCount")) {
                viewModel.set("currentTab",5);
                activateTab(viewModel.get("currentTab"));
                viewModel.onRefresh();
            }
            else {
                setTimeout(function() {
                    viewModel.labListDs.trigger("change");
                },50);
                if (viewModel.get("currentExt3")) {
                    viewModel.showNews();
                }
                else {
                    activateTab(viewModel.get("currentTab"));
                }
            }
            resizeDivs();
        },
        onDataBinding: function(e) {
            if (utils.isViewer()) {
                var grid = e.sender;
                grid.hideColumn("last_view");
            }
        },
		
		
		hisQuery1: function() {
			//var oldDataGrid;
			var selIb = proxy.getSessionObject("selectedIb");
	        var fio = selIb.fio;
			var sex = selIb.sex;
			var birt = kendo.parseDate(selIb.birt);
			var crit = fio + "$" + sex + "$" + kendo.toString(birt, "yyyyMMdd");

			//$("#old-lab-data").hide();
            /*
			viewModel.searchPacDS.read({
				pin: "",
				fio: crit
			}).then(function () {
				
				if (viewModel.searchPacDS._data.length == 1) {
					
					var selIb = proxy.getSessionObject("selectedIb");
					var d1 = kendo.toString(utils.addDays(kendo.parseDate(selIb.date_ask), 0-365), "yyyyMMdd");
					var d2 = kendo.toString(utils.addDays(kendo.parseDate(selIb.date_ask), 0-1), "yyyyMMdd");
			
					viewModel.labOldDs.read({
						ask_id: viewModel.searchPacDS._data[0].pin,
						d1: d1, 	
						d2: d2
					});
					
				}
			});
			*/
            var selIb = proxy.getSessionObject("selectedIb");
            var d1 = kendo.toString(utils.addDays(kendo.parseDate(selIb.date_ask), 0-(365*2)), "yyyyMMdd");
            var d2 = kendo.toString(new Date(), "yyyyMMdd");
            var askId=selIb.ask_id;
            viewModel.labOldDs.read({
                ask_id: askId,
                d1: d1,
                d2: d2,
                fio: selIb.fio,
                birt:kendo.toString(kendo.parseDate(selIb.birt), "yyyyMMdd"),
                sex:selIb.sex

            }).then(function() {
                /*
                setTimeout(function() {
                    $(".lab-chk-button").on("click",onGridCheckButtonClick);
                },500); */
            });

			if ( ! (this.oldDataGrid) || !($("#old-lab-data-grid").data("kendoGrid"))) {
				
				this.oldDataGrid = $("#old-lab-data-grid").kendoGrid({
					dataSource: viewModel.labOldDs,
					height: "100%",
					autoBind: false,
					scrollable: true,
					//    pageable: {
					// pagesize: 20,
					// numeric: true
					// }, */
					resizable: true,
					sortable: false,
					selectable: "row",
					groupable: false,
					filterable: false,
					navigatable: true,
					columns: [
						{field: "iddoc", title: "iddoc",hidden: true },
                        {field:"included",title:"Вкл",
                            template: $("#lab-check-template").html(),width:59,filterable:false, sortable: false},
						{ field: "data_a", title: "Дата", width: "10%", format: "{0:dd.MM.yyyy}"},
						{ field: "time", title: "Время", width: "8%", format: "{0:HH:mm}", filterable:false, sortable: false},
						{ field: "bl_name", title: "Анализ"},
						{ field: "bm_name", title: "Биоматериал", width: "15%"   },
						{ field: "otd", title: "Отд", width: "8%"  },
						{ field: "vrach", title: "Назначил", width: "15%",
							template: function(dataItem) {
								return kendo.htmlEncode(dataItem.vrach.fio());
							}
						},
						{ field: "vrach", title: "Врач", hidden:true},
						{ field: "diag", title: "Диагноз", width: "25%",hidden:true,filterable:false, sortable: false  }
					],
					change: function(e) {
					    if (e.sender) {
					        if (!(e.sender._lastCellIndex)) {
					            return;
                            }
                        }
						var selectedRow = this.select();
						var dataItem = this.dataItem(selectedRow);
						var sIds = dataItem.iddoc;
						viewModel.set("oldAnalId", sIds);
						viewModel.oldLabShowDS.read({
							ids: sIds,
							patient: "<div>" + viewModel.patientLabel() +"</div>"
						}).then(function () {
							//var pData = this.data();
							var pData = viewModel.oldLabShowDS._data;
							if (pData.length) {
								viewModel.set("oldHtml",pData[0].html);
								viewModel.set("patLabel",viewModel.patientLabel());
								//viewModel.set("oldAnalId",)
								var selIb = proxy.getSessionObject("selectedIb");
								
								viewModel.LabIncludeToIb.read({
									action3:"get",
									ask_id: selIb.ask_id,
									anal_id:viewModel.get("oldAnalId")
								}).then(function () {
									var bRez = 0;
									if (viewModel.LabIncludeToIb._data.length) {
										bRez = viewModel.LabIncludeToIb._data[0].included;
										viewModel.set("isOldAnalIncluded", (bRez) ? true : false);
									}
									else {
										viewModel.set("isOldAnalIncluded", false);
									}
								});
								
								setTimeout(function(){
									$("#old-lab-result-window").data("kendoWindow").title(selIb.fio).open().center();
								},1000);
							}
						});
					}
				});
				kendo.bind("#old-lab-result",viewModel);
				$("#old-lab-result-window").kendoWindow({
					modal: true,
					animation: false,
					//height: 600, 
					width: 800,
					close: function(e) {
						var bChecked = viewModel.get("isOldAnalIncluded");
				   //     alertify.alert("Included="+bChecked.toString());
						var selIb = proxy.getSessionObject("selectedIb");
						viewModel.LabIncludeToIb.read({
							action3: "set",
							ask_id: selIb.ask_id,
							anal_id: viewModel.get("oldAnalId"),
							included: (bChecked ? 1:0)
						}).then(function () {
							var bRez = 0;
							if (viewModel.LabIncludeToIb._data.length) {
								bRez = viewModel.LabIncludeToIb._data[0].included;
								viewModel.set("isOldAnalIncluded", (bRez) ? true : false);
							}
							else {
								viewModel.set("isOldAnalIncluded", false);
							}
                            var ds=viewModel.labOldDs;
							for (var i=0;i<ds._data.length;i++) {
							    var dataItem=ds._data[i];
							    if (dataItem.iddoc==viewModel.LabIncludeToIb._data[0].anal_id) {
							        dataItem.set("included",viewModel.LabIncludeToIb._data[0].included);
                                }
                            }

						});
					}
				});		
			};
		},
		patLabel:"",
		patientLabel: function() {
			var sRet = "";
			var pat;
			
			try {
				pat = proxy.getSessionObject("selectedIb");
			}
			
			catch (e) {
				return sRet;
			}
			
			if (!pat) {
				return sRet;
			}
			else {
				sRet = pat.fio + " " + pat.sex ;
				try {
					sRet = sRet + " " + pat.birt.toLocaleString().substr(0, 10);
				}
				catch (e) {
					sRet = pat.fio + " " + pat.sex ;
				}
				return sRet;
			}
		},
		
		printOldResult: function(e) {
		//        printLdoDiv("old-ldo-result-body-html");
			$("#old-lab-result-body-html").jqprint({debug:false});
		},
		exportPDF: function(e) {
			var sData=$("#old-lab-result-body-html").html();
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
					if (data.error == '') {
						var curIb = proxy.getSessionObject("selectedIb");
						var sFile = curIb.fio.replaceAll(' ', '_');
						var pom = document.getElementById('pom_pdf_downloader');
						
						if (!pom) {
							pom = document.createElement('a');
							pom.setAttribute('id', 'pom_pdf_downloader');
						}
						pom.setAttribute('href', data.alink);
						pom.setAttribute('download', sFile + "_" + kendo.guid() + ".pdf");
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
		}		
    });
    var onGridCheckButtonClick=function(data) {
        var ds=viewModel.labOldDs;
            var dataItem=ds.getByUid(data.uid);
            var selIb = proxy.getSessionObject("selectedIb");
            viewModel.LabIncludeToIb.read({
                action3: "set",
                ask_id: selIb.ask_id,
                anal_id: dataItem.iddoc,
                included: ( (dataItem.included) ? 0:1)
            }).then(function(){
                dataItem.set("included",!(dataItem.get("included")));
            });
    };
    var resizeDivs = function() {
        var height = utils.getAvailableHeight();
        height = Math.max(height - 75 - 50 - 10 + 20, 300);
        for (var i = 0; i < 20; i++) {
            var curDiv = $("#divlab" + i.toString());
            if (curDiv.length) {
                $(curDiv).css("height",height.toString()+"px").css("overflow-y","scroll");
            }
        }
    };
    var activateTab = function(nCurTab) {
        var ldoTabs = $("#labtabs");
        $(ldoTabs).find("li").removeClass("active");
        $(ldoTabs).find("#labtab"+viewModel.get("currentTab").toString()).parent().addClass("active");
        var labContent = $("#lab-content");
        $(labContent).find(".tab-pane").removeClass("active");
        $(labContent).find("#ilab"+viewModel.get("currentTab").toString()).addClass("active");
    };
    var getHtmlString=function(sContent,eanchor) {
        var sHtml = "";
        var sA = $(sContent);
        var sB = "";
        if (eanchor) {
            // скрыть все другие, кроме этого бланка (вызов из вкладки Новое)
            sA = $(sContent).filter("div.lab-table-div[id='"+eanchor+"']");
            sB = $(sContent).filter("div.lab-pac-header");
        //.css("display","none");
            sHtml = "" + $(sB).html() + $(sA).html();
            return sHtml;
        }
        return sHtml;
    };
    var getHtmlString2 = function(eDiv) {
        var selIb = proxy.getSessionObject("selectedIb");
        var sHtml = "<!DOCTYPE HTML > <META http-equiv=Content-Type content='text/html; charset=windows-1251'>";
        sHtml = sHtml + "<TITLE>" + selIb.fio + "</TITLE>";
        sHtml = sHtml + "<HTML> <HEAD>";
        sHtml = sHtml + "<link rel='stylesheet' type='text/css' href='html/css/lab-print.css'  media='print'>";
        sHtml = sHtml + "<link rel='stylesheet' type='text/css' href='html/css/lab-screen-with-title.css'  media='screen'>";
        sHtml = sHtml + "<style media='print'>"+pmService.createPrintMarginStyle() + "</style>";
        sHtml = sHtml + "</HEAD> <BODY>";
        sHtml = sHtml +"<DIV class='no-print'><BUTTON onclick='javascript:window.print()'>Печать</BUTTON> &nbsp;"
        sHtml = sHtml + "<BUTTON onclick='javascript:window.close()'>Закрыть</BUTTON> &nbsp;</DIV>"
        sHtml = sHtml + $(eDiv).html();
        sHtml = sHtml + "<DIV class='no-print'><BUTTON onclick='javascript:window.print()'>Печать</BUTTON> &nbsp;"
        sHtml = sHtml + "<BUTTON onclick='javascript:window.close()'>Закрыть</BUTTON> &nbsp;</DIV>"
        sHtml = sHtml + "</BODY> </HTML>";
        return sHtml;
    };
    var getCurrentTab = function() {
        var tab=$("#labtabs").find("li.active").first();
        if (!tab.length) {
            tab=$("#labtabs").find("li").first();
        }
        return tab;
    };
    var getCurrentDiv = function() {
        var curTab = getCurrentTab();
        if (!(curTab.length)) {
            return null;
        }
        var sCurDivId = $(curTab).find("a").first().attr("id");
        sCurDivId = sCurDivId.replace("labtab","divlab");
        var curDiv = $("#" + sCurDivId);
        return curDiv;
    } ;
    var onSelectedIbChanged = function(data) {
        viewModel.set("updateCount",viewModel.get("updateCount") + 1);
    };
    var onReportReaded=function(e) {
        var ds = e.sender;
        try {
            kendo.ui.progress($("#ib-lab"), false);
        }
        catch (e) {

        }
        viewModel.set("updateCount",0);
        for (var i = 0; i < ds._data.length; i = i + 1) {
            var sType = ds._data[i].atype;
            var sHtml = ds._data[i].ahtml;
            if (!(sType)=="Ext") {
                if ($(sHtml).filter("div").length <= 1) {
                    sHtml = "";
                }
            }
            if (sType === "Все") {
                var sFooter=$($(sHtml)[0]).text();
                sFooter="<div class='kdl-print-footer'>"+ sFooter+ "</div>";
                viewModel.set("allHtml", sHtml+sFooter);
            }
            if (sType === "Клиника") {
                viewModel.set("clinicaHtml", sHtml);
            }
            if (sType === "Биохимия") {
                viewModel.set("bioXimHtml", sHtml);
            }
            if (sType === "Моча") {
                viewModel.set("mochaHtml", sHtml);
            }
            if (sType === "Кал") {
                viewModel.set("kalHtml", sHtml);
            }
            if (sType === "Прочее") {
                viewModel.set("otherHtml", sHtml);
            }
            if (sType === "Ext") {
                viewModel.set("extHtml", sHtml);
            }
        }
        activateTab(viewModel.get("currentTab"));
        if (viewModel.get("currentExt3")) {
            viewModel.showNews();
        }
    };
    var onSet = function(e) {
        if (e.field === "currentExt3") {
            if (e.value) {
                setTimeout(function(){
                    viewModel.update();
                }, 50);
            }
        }
        if (e.field == "currentTab") {
            resizeDivs();
        }
    };
    labReportDs.bind("change", onReportReaded);
    proxy.subscribe("selectedIbChanged", onSelectedIbChanged);
    proxy.subscribe("ibHeaderSizeChanged", resizeDivs);
    proxy.subscribe("labGridCheckButtonClick",onGridCheckButtonClick);
        viewModel.bind("set", onSet);
    return viewModel;
});