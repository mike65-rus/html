define(["kendo.all.min","dataSources/mobile/myPatientsDataSource",
        "dataSources/mobile/kdlReportDataSource","dataSources/mobile/ldoReportDataSource",
        "dataSources/mobile/ibDocsListDataSource","dataSources/mobile/ibDocDataSource"],
    function(kendo,myIbDs,kdlDs,ldoDs,ibDocsDs,ibDocDs) {
    'use strict';
    var offlineData={date:null,patients:[],kdl:[],ldo:[],docs:[]};
    var viewModel;
    var navigateBack=function() {
        window._kendoApplication.navigate("#:back");
    };
    var clearOfflineData=function() {
        offlineData={kdl:[],ldo:[],docs:[]};
    };
    var preparePatientsList=function() {
        $("#my-patient-list").kendoMobileListView({
            dataSource: viewModel.myIbDs,
            template: "<a href='\##patient-view?ask_id=#:data.ask_id#'>${fio} ${niib}.${palata}</a>",
            /* template:"${fio} ${niib}.${palata}", */
            filterable: false/*{
                        placeholder:"Поиск"

                    }*/,
            click: function (e) {
                if (e.dataItem) {
//                                console.log(e.dataItem.ask_id);
                    viewModel.set("selectedIb", viewModel.myIbDs.get(e.dataItem.ask_id));
                }
            }
        });
    };
    var prepareDocsList=function() {
        $("#docs-list").kendoMobileListView({
            dataSource:viewModel.ibDocsDs,
            template:"<a href='\##doc-view?record_id=#:data.record_id#'>${doc_name} - ${user_name.fio()}</a>",
            filterable: false,
            click: function(e) {
                if (e.dataItem) {
                    viewModel.set("docRecordId",e.dataItem.record_id);
                    viewModel.set("docHtml",e.dataItem.ahtml);
                }
            }
        });
    };
    viewModel= new kendo.data.ObservableObject({
        userId:sessionStorage.getItem("mobile_user_uid"),
        userName:sessionStorage.getItem("mobile_user_name"),
        userFio:"",
        currentUserRole:null,
        currentSkin: localStorage.getItem("mobile_skin"),
        savedSkin:localStorage.getItem("mobile_skin"),
        settingsLabel:"Настройки",
        selectedIb:null,
        dataSources: {
            userRoles: new kendo.data.DataSource({
                data: JSON.parse(sessionStorage.getItem("mobile_user_roles"))
            }),
            appSkins: new kendo.data.DataSource({
                data: [{name: "flat"}, {name: "nova"}, {name: "material"}, {name: "fiori"}, {name: "office365"}]
            })
        },
        myIbDs: null,
        kdlHtml:"",
        kdlDs:null,
        lastReadedKdlAskId:"",
        ldoHtml:"",
        ldoDs:null,
        lastReadedLdoAskId:"",
        ibDocsDs:null,
        lastReadedDocsAskId:"",
        docRecordId:"",
        ibDocDs:null,
        docHtml:"",
        lastReadedDocRecordId:"",
        isOnline:true,
        isOffline:false,
        isKdlOffline:false,
        isLdoOffline:false,
        isDocsOffline:false,
        downloadState:null,
        openModalViewDownload: function(e) {
            viewModel.set("isCloseModalViewDownloadEnabled",true);
            viewModel.set("isDoDownloadEnabled",true);
            viewModel.set("downloadState","&nbsp;");
            viewModel.set("downloadDate",new Date());

            kendo.bind($("#modalview-download"),viewModel);
            $("#modalview-download").kendoMobileModalView("open");
        },
        closeModalViewDownload: function(e) {
            viewModel.set("isCloseModalViewDownloadEnabled",true);
            viewModel.set("isDoDownloadEnabled",true);
            $("#modalview-download").kendoMobileModalView("close");
        },
        doDownload: function(e) {
            var dtStart=new Date();
            offlineData={kdl:[],ldo:[],docs:[]};
            var isKdl=$("#download-kdl").prop("checked");
            var isLdo=$("#download-ldo").prop("checked");
            var isDocs=$("#download-docs").prop("checked");
            var index=0;
            var ds=viewModel.myIbDs;
            if (!ds.online()) {
                ds.offlineData([]);
                ds.online(true);
            }
            clearOfflineData();
            ds.read({uid:viewModel.userId}).then(function() {
//                if (!window.serviceWorkerRegistered) {
                    ds.online(false);
//                }
                viewModel.myIbDs.fetch();
                preparePatientsList();
                var totalPats=ds.total();
                var patData=ds.offlineData();
                patData.reduce(function(sequence,pat) {
                    var params={isKdl:isKdl,isLdo:isLdo,isDocs:isDocs};
                    return sequence.then(function(p) {
                        var dtEnd=new Date();
                        var minutes=Math.floor((dtEnd-dtStart)/1000/60);
                        var seconds=Math.floor(((dtEnd-dtStart)/1000)-minutes*60);
                        var str="Загрузка ... "+(++index).toString()+" из "+totalPats.toString();
                        str=str+"      Прошло "+minutes.toString()+" мин "+seconds.toString()+" сек";
                       viewModel.set("downloadState",str);
                       return downloadPatientData(pat,params);
                    })
                },Promise.resolve())
                .then(function() { /* reduce */
                    if (!window.serviceWorkerRegistered) {
                        viewModel.set("kdlDs",new kendo.data.DataSource({
                            data: offlineData.kdl
                        }));
                        viewModel.set("ldoDs",new kendo.data.DataSource({
                            data: offlineData.ldo
                        }));
                        viewModel.set("ibDocsDs",new kendo.data.DataSource({
                            data: offlineData.docs
                        }));
                    }
                    clearOfflineData();
                    var dtEnd=new Date();
                    var minutes=Math.floor((dtEnd-dtStart)/1000/60);
                    var seconds=Math.floor(((dtEnd-dtStart)/1000)-minutes*60);
                    viewModel.set("downloadState","Загружено "+totalPats.toString()+" ИБ за "+
                        minutes.toString()+" мин "+seconds.toString()+" сек !");
                }).catch(function(err) {
                    viewModel.set("downloadState","Что-то пошло не так: "+err.message);
                }).then(function() {
//                    sessionStorage.setItem("offlineData",JSON.stringify(offlineData));
//                    viewModel.set("downloadState","Загрузка завершена!");
                });
            },function() {
                viewModel.set("downloadState","Не удалось загрузить список пациентов!");
            });
        },
        startDownload: function(e) {
            if (!($("#download-kdl").prop("checked")) && !($("#download-kdl").prop("checked")) && !($("#download-docs").prop("checked"))) {
                viewModel.set("downloadState","Не выбрано что загружать!");
                return;
            }
            if (window.serviceWorkerRegistered) {
                viewModel.set("downloadState", "Очистка предыдущих данных...");
                try {
                navigator.serviceWorker.controller.postMessage({'clearData':'clearData'});
                }
                catch (ex) {

                }
            }
            viewModel.doDownload();
        },
        doExit: function(e) {
            var location=window.location;
            var sUrl=/*location.origin+location.pathname+*/"?action=logout";
//            window._kendoApplication.navigate(sUrl);
            window.location.href=sUrl;
        },
        onSkinChange: function(e) {
            window._kendoApplication.skin(viewModel.get("currentSkin"));
        },
        settingsViewSaveAction: function(e) {
            localStorage.setItem("mobile_skin",viewModel.get("currentSkin"));
            navigateBack();
        },
        settingsViewCancelAction: function(e) {
            viewModel.set("currentSkin",viewModel.get("savedSkin"));
            viewModel.onSkinChange();
            navigateBack();
        },
        isOfflineMode: function() {
            return (!(viewModel.myIbDs.online()) && (!window.serviceWorkerRegistered));
        },
        myPatients: function(e,fromDownload="") {
            if (!window.serviceWorkerRegistered) {
                if (viewModel.isOfflineMode()) {
                    return;
                }
                if (fromDownload) {
                    viewModel.set("myPatientsDownloaded",false);
                }
                if (viewModel.isOfflineMode()) {
                    return;
                }
            }
            if (viewModel.userId) {
                if (window._kendoApplication) {
                    window._kendoApplication.showLoading();
                }
                viewModel.myIbDs.read({uid:viewModel.userId}).then(function() {
                    if (fromDownload) {
                        viewModel.set("myPatientsDownloaded",true);
                    }
                    if (window._kendoApplication) {
                        window._kendoApplication.hideLoading();
                    }
                    viewModel.myIbDs.fetch();
                    preparePatientsList();
                },
                    function() {
                        if (window._kendoApplication) {
                            window._kendoApplication.hideLoading();
                        }
                    });

            }
        },
        readLdo: function() {
            var selectedIb=viewModel.get("selectedIb");
            var askId=selectedIb.ask_id;
            if (askId==viewModel.get("lastReadedLdoAskId")) {
                return true;
            }
            var ds=viewModel.ldoDs;
            viewModel.set("ldoHtml","");
            if (viewModel.isOfflineMode() && (!window.serviceWorkerRegistered)) {
                ds.filter({field:"ask_id",operator:"eq",value:askId});
                var view=ds.view();
                if (view.length) {
                    viewModel.set("ldoHtml",view[0].html);
                    kendo.bind("#ldo-html",viewModel);
                    viewModel.set("lastReadedLdoAskId",view[0].ask_id);
                    setTimeout(function() {
                        try {
                            $("#ldo-view").data("kendoMobileView").scroller.reset();
                        }
                        catch (ex) {

                        }
                    });
                }
                return;
            }

            var d2="";
            if (selectedIb.date_out) {
                d2=kendo.stringify(selectedIb.date_out,"yyyyMMdd");
            }
            var d1=kendo.stringify(selectedIb.date_ask,"yyyyMMdd");
            var niib=selectedIb.niib_s;
            var otd1=selectedIb.otd1;
            var palata=selectedIb.palata;
            var fio=selectedIb.fio;
            var sex=selectedIb.sex;
            var birt=kendo.stringify(selectedIb.birt,"yyyyMMdd");
            if (window._kendoApplication) {
                window._kendoApplication.showLoading();
            }
            viewModel.ldoDs.read({ask_id:askId,d1:d1,d2:d2,niib:niib,otd1:otd1,
                palata:palata,fio:fio,sex:sex,birt:birt}).then(function(){
                if (window._kendoApplication) {
                    window._kendoApplication.hideLoading();
                }
                viewModel.set("lastReadedLdoAskId",askId);
                if (viewModel.ldoDs._data) {
                    viewModel.set("ldoHtml",viewModel.ldoDs._data[0].ahtml);
                }
                kendo.bind("#ldo-html",viewModel);
                setTimeout(function(){
                    try {
                        $("#ldo-view").data("kendoMobileView").scroller.reset();
                    }
                    catch(ex) {

                    }
                },1);
            },
                function() {
                    if (window._kendoApplication) {
                        window._kendoApplication.hideLoading();
                    }
                });
            return true;
        },
        readKdl: function() {
            var selectedIb=viewModel.get("selectedIb");
            var askId=selectedIb.ask_id;
            if (askId==viewModel.get("lastReadedKdlAskId")) {
                return true;
            }
            var ds=viewModel.kdlDs;
            viewModel.set("kdlHtml","");
            if (viewModel.isOfflineMode()  && (!window.serviceWorkerRegistered) ) {
                ds.filter({field:"ask_id",operator:"eq",value:askId});
                var view=ds.view();
                if (view.length) {
                    viewModel.set("kdlHtml",view[0].html);
                    kendo.bind("#kdl-html",viewModel);
                    viewModel.set("lastReadedKdlAskId",view[0].ask_id);
                    setTimeout(function() {
                        try {
                            $("#kdl-view").data("kendoMobileView").scroller.reset();
                        }
                        catch (ex) {

                        }
                    });
                }
                return;
            }
            var d2="";
            if (selectedIb.date_out) {
                d2=kendo.stringify(selectedIb.date_out,"yyyyMMdd");
            }
            var d1=kendo.stringify(selectedIb.date_ask,"yyyyMMdd");
            var niib=selectedIb.niib_s;
            var otd1=selectedIb.otd1;
            var palata=selectedIb.palata;
            var fio=selectedIb.fio;
            var sex=selectedIb.sex;
            var birt=kendo.stringify(selectedIb.birt,"yyyyMMdd");
            if (window._kendoApplication) {
                window._kendoApplication.showLoading();
            }
            viewModel.kdlDs.read({ask_id:askId,d1:d1,d2:d2,niib:niib,otd1:otd1,
                palata:palata,fio:fio,sex:sex,birt:birt}).then(function(){
                if (window._kendoApplication) {
                    window._kendoApplication.hideLoading();
                }
                viewModel.set("lastReadedKdlAskId",askId);
                if (viewModel.kdlDs._data) {
                    viewModel.set("kdlHtml",viewModel.kdlDs._data[0].ahtml);
                }
                kendo.bind("#kdl-html",viewModel);
                setTimeout(function(){
                    try {
                        $("#kdl-view").data("kendoMobileView").scroller.reset();
                    }
                    catch(ex) {

                    }
                },1);
            },
                function() {
                    if (window._kendoApplication) {
                        window._kendoApplication.hideLoading();
                    }
                });
            return true;
        },
        readDocs: function() {
            var selectedIb=viewModel.get("selectedIb");
            var askId=selectedIb.ask_id;
            if (askId==viewModel.get("lastReadedDocsAskId")) {
                return true;
            }
            var ds=viewModel.ibDocsDs;
            if (viewModel.isOfflineMode()) {
                ds.filter({field:"ask_id",operator:"eq",value:askId});
                var view=ds.view();
                if (view.length) {
                    kendo.bind("#docs-html",viewModel);
                    viewModel.set("lastReadedDocsAskId",view[0].ask_id);
                    prepareDocsList();
                    setTimeout(function() {
                        try {
                            $("#docs-view").data("kendoMobileView").scroller.reset();
                        }
                        catch (ex) {

                        }
                    });
                }
                return;
            }
//            viewModel.set("kdlHtml","");
            if (window._kendoApplication) {
                window._kendoApplication.showLoading();
            }
            viewModel.ibDocsDs.read({ask_id:askId}).then(function(){
                if (window._kendoApplication) {
                    window._kendoApplication.hideLoading();
                }
                viewModel.set("lastReadedDocsAskId",askId);
                if (viewModel.ibDocsDs._data) {
                    viewModel.ibDocsDs.fetch();
                    prepareDocsList();
               }
            },
                function() {
                    if (window._kendoApplication) {
                        window._kendoApplication.hideLoading();
                    }
                });
            return true;

        },
        readDoc: function() {
            var recordId=viewModel.get("docRecordId");
            if (recordId==viewModel.get("lastReadedDocRecordId")) {
                return true;
            }
            if (viewModel.isOfflineMode() || true) {
                kendo.bind("#doc-html",viewModel);
                viewModel.set("lastReadedDocRecordId",recordId);
                setTimeout(function() {
                    try {
                        $("#doc-html").find("[contenteditable]").removeAttr("contenteditable");
                    }
                    catch(ex) {}
                    try {
                        $("#doc-view").data("kendoMobileView").scroller.reset();
                    }
                    catch (ex) {

                    }
                },1);
                return;
            }
            viewModel.set("docHtml","");
            if (window._kendoApplication) {
                window._kendoApplication.showLoading();
            }
            viewModel.ibDocDs.read({record_id:recordId}).then(function(){
                if (window._kendoApplication) {
                    window._kendoApplication.hideLoading();
                }
                viewModel.set("lastReadedDocRecordId",recordId);
                if (viewModel.ibDocDs._data) {
                    viewModel.set("docHtml",viewModel.ibDocDs._data[0].doc_html);
                }
                kendo.bind("#doc-html",viewModel);
                setTimeout(function(){
                    try {
                        $("#doc-view").data("kendoMobileView").scroller.reset();
                    }
                    catch(ex) {

                    }
                    try {
                        $("#doc-html").find("[contenteditable]").removeAttr("contenteditable");
                    }
                    catch(ex) {}
                },1);
            },
                function() {
                    if (window._kendoApplication) {
                        window._kendoApplication.hideLoading();
                    }
                });
            return true;

        },
        myPatientsShow:function() {
            setTimeout(function(){
                $('[type="search"]').on("input", function () {
                    var searchByPalata=false;
                    var listView=$("#my-patient-list").data("kendoMobileListView");
                    var filterTerm = $(this).val().trim();
                    if (!filterTerm) {
                        viewModel.myIbDs.filter({});
                        $(this.blur());
                    }
                    else {
                        if ((filterTerm.indexOf(".")==0) || (filterTerm.indexOf(",")==0)) {
                            searchByPalata=true;
                        }
                        if (!searchByPalata) {
                            viewModel.myIbDs.filter({
                                logic: "or",
                                filters: [
                                    { field: "fam", operator: "startsWith", value: filterTerm },
                                    { field: "im", operator: "startsWith", value: filterTerm },
                                    { field: "niib_s", operator: "startsWith", value: filterTerm }
                                ]
                            });
                        }
                        else {
                            searchByPalata=true;
                            viewModel.myIbDs.filter({
                                logic: "or",
                                filters: [
                                    { field: "palata", operator: "eq", value: Number(filterTerm.substr(1)) }
                                ]
                            })
                        }
                        try {
                            listView.view().scroller.reset()
                        }
                        catch(ex) {

                        }
                    }

                });
                $('[type="search"]').on("search", function () {
                    var filterTerm = $(this).val();
                    if (!filterTerm) {
                        $(this.blur());
                    }
                });
                //$('[type="search"]').focus();
            },1000);
        }

    });


    String.prototype.fio = function() {
        var sRet="";
        var aSplit=this.trim().split(" ");
        for (var i=0; i<aSplit.length;i++) {
            if (i==0) {
                sRet=sRet+aSplit[i];
            }
            if (i==1) {
                sRet=sRet+" "+aSplit[i].substr(0,1)+".";
            }
            if (i==2) {
                sRet=sRet+aSplit[i].substr(0,1)+".";
            }
        }
        return sRet;
    };
    var downloadPatientData=function(patItem,params) {
        var selectedIb=patItem;
        var askId = selectedIb.ask_id;
        var d2 = "";
        if (selectedIb.date_out) {
            d2 = kendo.stringify(selectedIb.date_out, "yyyyMMdd");
        }
        var d1 = kendo.stringify(selectedIb.date_ask, "yyyyMMdd");
        var niib = selectedIb.niib_s;
        var otd1 = selectedIb.otd1;
        var palata = selectedIb.palata;
        var fio = selectedIb.fio;
        var sex = selectedIb.sex;
        var birt = kendo.stringify(selectedIb.birt, "yyyyMMdd");
        //
        var promises=[];
        if (params.isKdl) {
            promises.push(
                viewModel.kdlDs.read({
                    ask_id: askId, d1: d1, d2: d2, niib: niib, otd1: otd1,
                    palata: palata, fio: fio, sex: sex, birt: birt
                }).then(function(response) {
                    if (!window.serviceWorkerRegistered) {
                        var ds=viewModel.kdlDs._data;
                        if (ds.length) {
                            offlineData.kdl.push({ask_id:askId,html:ds[0].ahtml});
                        }
                    }
                })
            );
        }
        if (params.isLdo) {
            promises.push(
                viewModel.ldoDs.read({ask_id:askId,d1:d1,d2:d2,niib:niib,otd1:otd1,
                    palata:palata,fio:fio,sex:sex,birt:birt
                }).then(function(response) {
                    if (!window.serviceWorkerRegistered) {
                        var ds = viewModel.ldoDs._data;
                        if (ds.length) {
                            offlineData.ldo.push({ask_id: askId, html: ds[0].ahtml});
                        }
                    }
                })
            );
        }
        if (params.isDocs) {
            promises.push(
                viewModel.ibDocsDs.read({ask_id:askId,forMobile:"yes"
                }).then(function(response) {
                    if (!window.serviceWorkerRegistered) {
                        var ds = viewModel.ibDocsDs._data;
                        if (ds.length) {
                            for (var i = 0; i < ds.length; i++) {
                                offlineData.docs.push(ds[i]);
                            }
                        }
                    }
                })
            );
        }
        return Promise.all(promises);
    };
    viewModel.dataSources.userRoles.read();
    viewModel.dataSources.appSkins.read();
    viewModel.set("currentUserRole",viewModel.dataSources.userRoles.data().at(0));
    viewModel.set("userFio",(sessionStorage.getItem("mobile_user_name")).fio());
    viewModel.set("myIbDs",myIbDs);
    viewModel.set("kdlDs",kdlDs);
    viewModel.set("ldoDs",ldoDs);
    viewModel.set("ibDocsDs",ibDocsDs);
    viewModel.set("ibDocDs",ibDocDs);
    window.mainModel=viewModel;
    return viewModel;
});