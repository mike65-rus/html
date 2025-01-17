/**
 * Created by 1 on 06.12.2015.
 */
define(["kendo.all.min",'kendo-template!templates/selectDocVid','services/proxyService',
        'dataSources/docsTreeDataSource'],
    function(kendo,editTemplateId,proxy,ds) {
        "use strict";
        var viewModel;
		var medsystemPath = location.origin + "/medsystem/gb2ajax/home/";
        viewModel= new kendo.data.ObservableObject({
            ds:ds,
            selectedItem: null,
            onSelect: function(e) {
                var dataUid=$(e.node).attr("data-uid");
                viewModel.set("selectedItem",viewModel.ds.getByUid(dataUid));

            },
            isOkEnabled: function() {
                var bRet=false;
                var selected=viewModel.get("selectedItem");
                if (selected) {
                    bRet=(selected.sprite==="html") ? true: false;
                }
                return bRet;
            },
            open: function(data) {
                viewModel.set("selectedItem",null);
                viewModel.set("passedData",data);
                kendoWindow.open().center();
                kendo.bind($("#ibdocs_vid_view_modal"),viewModel);
                setTimeout(function(){
                    var treeView = $("#doc_tree").data("kendoTreeView");
                    try {
                        treeView.expand(treeView.findByText("Общие шаблоны"));
                    }
                    catch (e) {
                    }
                    try {
                        treeView.expand(treeView.findByText("Первичный осмотр"));
                    }
                    catch (e) {
                    }
                    try {
                        treeView.expand(treeView.findByText("Осмотр врача"));
                    }
                    catch (e) {
                    }
                    try {
                        treeView.expand(treeView.findByText("ОнкоДокументация"));
                    }
                    catch (e) {
                    }
                    if ((treeView.select()).length) {
                        viewModel.onSelect({node:treeView.select()});
                    }
                },500);

            },
            ok: function() {
                var item=viewModel.get("selectedItem");
				if ((item.doc_type == 74 || item.doc_type == 65 || item.doc_type == 61) && viewModel.passedData.selIb.rezult1 != "Умер") {
					kendo.alert("Невозможно создать данный документ для не умершего пациента.");
					return;
				}
				if (item.doc_type == 74 && !localStorage.last_user_roles.includes("NACH_MED")) {
					kendo.alert("Данный документ имеет право создавать только начмед.");
					return;
				}
<<<<<<< .mine
				if (item.doc_type != 67 && item.doc_type != 68 && item.doc_type != 63) {
					if (!((item.doc_type == 72 || item.doc_type == 73) && localStorage.last_user_roles.includes("VRACH_DEGURANT"))) {
						if (item.doc_type != 57 || (item.doc_type == 57 && !localStorage.last_user_roles.includes("VRACH_ORIT"))) {
							if (viewModel.passedData.selIb.user_id != localStorage.last_user && viewModel.passedData.selIb.department == 2) {
								if (!(viewModel.passedData.selIb.rezult1 == "Умер" && (localStorage.last_user_roles.includes("ZAV_OTD") || localStorage.last_user_roles.includes("NACH_MED")))) {
									kendo.alert("Невозможно создать данный документ для не закрепленного пациента.");
									return;
								}
							}
						}
					}
				}
||||||| .r735
				if (item.doc_type != 67 && item.doc_type != 68 && item.doc_type != 63) {
					if (item.doc_type != 57 || (item.doc_type == 57 && !localStorage.last_user_roles.includes("VRACH_ORIT"))) {
						if (viewModel.passedData.selIb.user_id != localStorage.last_user && viewModel.passedData.selIb.department == 2) {
							if (!(viewModel.passedData.selIb.rezult1 == "Умер" && (localStorage.last_user_roles.includes("ZAV_OTD") || localStorage.last_user_roles.includes("NACH_MED")))) {
								kendo.alert("Невозможно создать данный документ для не закрепленного пациента.");
								return;
							}
						}
					}
				}
=======
				if (false) {
                    if (!localStorage.last_user_roles.includes("VRACH_DEGURANT")) { //24.04.2023
                        if (item.doc_type != 67 && item.doc_type != 68 && item.doc_type != 63) {
                            if (item.doc_type != 57 || (item.doc_type == 57 && !localStorage.last_user_roles.includes("VRACH_ORIT"))) {
                                if (viewModel.passedData.selIb.user_id != localStorage.last_user && viewModel.passedData.selIb.department == 2) {
                                    if (!(viewModel.passedData.selIb.rezult1 == "Умер" && (localStorage.last_user_roles.includes("ZAV_OTD") || localStorage.last_user_roles.includes("NACH_MED")))) {
                                        kendo.alert("Невозможно создать данный документ для не закрепленного пациента.");
                                        return;
                                    }
                                }
                            }
                        }
                    }
                }
>>>>>>> .r740
				if (item.doc_type == 1 && viewModel.passedData.selIb.rezult1 == "Умер") {
					kendo.confirm("Невозможно создать выписку для умершего пациента. Создать посмертный эпикриз?")
						.done(function(){
							proxy.publish("createDoc",{
								doc_vid:61,
								doc_sub:1,
								extData:null
							});
							kendoWindow.close();
						})
						.fail(function(){
							return;
						});
				}
				else {
					if (item.doc_type==1) {
						// Выписка
						/* if (viewModel.passedData.selIb.department == 2) {
							var myData = { askId: viewModel.passedData.selIb.ask_id };
							$.ajax({
								type: "GET",
								url: medsystemPath + "GetPlanDateOut",
								dataType: "json",
								data: myData,
								success: function(data,textStatus) {
									var dateOutFound = true;
									if (data) {
										if (!data.DateOutActual && !data.DateOutPlanned) {
											dateOutFound = false;
										}
									}
									if (dateOutFound) {
										var passedData=viewModel.get("passedData");
										if (passedData) {
											var ib=passedData.selIb;
											var sOtdList=ib.otd_list;
											var gOtdList=JSON.parse(sOtdList);
											var otdList=gOtdList.otd_list.rows;
											for (var i=0;i<otdList.length;i++) {
												if (otdList[i].date_ask) {
													otdList[i].date_ask=kendo.parseDate(otdList[i].date_ask);
												}
												if (otdList[i].date_out) {
													otdList[i].date_out=kendo.parseDate(otdList[i].date_out);
												}
											}						
											getVypiskaOtdel(otdList,item).then(function(promiseData) {
												proxy.publish("createDoc",{
													doc_vid:item.doc_type,
													doc_sub:item.doc_subtype,
													extData:promiseData
												});
											});                        
										}
									}
									else {
										kendo.alert("Невозможно создать выписку для пациента без даты выбытия или даты планируемого выбытия. Если планируется не выписка, а перевод в другое отделение, то необходимо заполнить Переводной эпикриз.");
									}
								},
								error: function (jqXHR, exception) {
									alert(jqXHR.STATUS + " " + jqXHR.message + " " + exception);
								}
							});					
						}
						else { */
							var passedData=viewModel.get("passedData");
							if (passedData) {
								var ib=passedData.selIb;
								var sOtdList=ib.otd_list;
								var gOtdList=JSON.parse(sOtdList);
								var otdList=gOtdList.otd_list.rows;
								for (var i=0;i<otdList.length;i++) {
									if (otdList[i].date_ask) {
										otdList[i].date_ask=kendo.parseDate(otdList[i].date_ask);
									}
									if (otdList[i].date_out) {
										otdList[i].date_out=kendo.parseDate(otdList[i].date_out);
									}
								}						
								getVypiskaOtdel(otdList,item).then(function(promiseData) {
									proxy.publish("createDoc",{
										doc_vid:item.doc_type,
										doc_sub:item.doc_subtype,
										extData:promiseData
									});
								});                        
							}
						//}
					}
					else {
						proxy.publish("createDoc",{
							doc_vid:item.doc_type,
							doc_sub:item.doc_subtype,
							extData:null
						});
					}
					kendoWindow.close();
				}
            },
            cancel: function() {
                kendoWindow.close();
            }
        });
        var getVypiskaOtdel=function(aOtdList,selectedDoc) {
            var promise=$.Deferred();
            var otdList=[];
            for (var i=0;i<aOtdList.length;i++) {
                otdList.push({date_ask:aOtdList[i].date_ask,
                    date_out:aOtdList[i].date_out,
                    otd_code:aOtdList[i].spr_code,
                    otd_name:aOtdList[i].spr_descr,
                    is_checked: false
                });
            }
            if (otdList.length==1) {
                setTimeout(function() {
                    otdList[0].is_checked=true;
                    promise.resolve(otdList);
                },10);
            }
            else {
				/*
                var sHtml="<div><ul class='unstyled' id='otdChooseList'>";
                for (var i=0;i<otdList.length;i++) {
                    var sLabel=otdList[i].otd_name+" c "+kendo.toString(otdList[i].date_ask,"dd.MM.yy");
                    if (otdList[i].date_out) {
                        sLabel=sLabel+" по "+kendo.toString(otdList[i].date_out,"dd.MM.yy")
                    }
                    sHtml=sHtml+"<li>"
                    sHtml=sHtml+"<input type='checkbox' class='k-checkbox' id='chk_"+i.toString()+"'>";
                    sHtml=sHtml+"<label class='k-checkbox-label' for='chk_"+i.toString()+"'>"+sLabel+"</label>";
                    sHtml=sHtml+"</li>";
                }
                sHtml=sHtml+"</ul></div>";
                sHtml=sHtml+"<div style='marin-top:10px;text-align: center'>";
                sHtml = sHtml+"<button class='k-button' type='button' id='btnOtdOk' style='width:60px;'>ОК</button>";
                sHtml=sHtml+"&nbsp;&nbsp;&nbsp;"
                sHtml = sHtml+"<button class='k-button' type='button' id='btnOtdCancel' style='width:60px;'>Отказ</button>";
                sHtml=sHtml+"</div>";
                //
                kendoWindowOtd=$("<div id='selectDocOtdel'/>").kendoWindow({
                    title: "Выбор отделения",
                    modal:true,
                    actions:[],
                    close: function(e) {
                        kendoWindowOtd.destroy();
                        $("#selectedDocOtdel").remove();
                    }
                }).data("kendoWindow");
                kendoWindowOtd.content(sHtml);
                kendoWindowOtd.open().center();
                $("#btnOtdOk").on("click",function(e) {
                    var checkedCount=0;
                    var checkboxes=$("#otdChooseList").find("input");
                    $(checkboxes).each(function(idx,el) {
                        if ($(el).prop("checked")) {
                            otdList[idx].is_checked=true;
                            checkedCount++;
                        }
                    });
                    if (!checkedCount) {
                        kendo.alert("Не выбрано ни одного отделения!");
                    }
                    else {
                        kendoWindowOtd.close();
                        promise.resolve(otdList);
                    }
                });
                $("#btnOtdCancel").on("click",function(e) {
                    kendoWindowOtd.close();
                    promise.reject([]);
                })
				*/
				setTimeout(function() {
                    for (var i = 0; i < otdList.length; i++) {
						otdList[i].is_checked = true;
					}
					promise.resolve(otdList);
                }, 10);
            }
            return promise;
        };
        //
        var kendoWindowOtd;
        var kendoWindow=$("<div id='selectDocVidDialog'/>").kendoWindow({
            title: "Выбор вида нового документа",
            modal:true,
            content: {
                template: $("#"+editTemplateId).html()
            }
        }).data("kendoWindow");
        return viewModel;
    }

);
