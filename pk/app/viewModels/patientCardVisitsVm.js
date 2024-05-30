define(['kendo.all.min','utils','kendo-template!views/patientCardVisits',
        'services/proxyService','dataSources/visitsListDataSource','dataSources/periodVisitsDataSource',
        'viewModels/patientCardVisitVm'
    ],
    function(kendo,utils,viewId,proxy,visitsListDs,dsPeriod,modelVisit) {
        'use strict';
        var myTabStripOrder=0;
        var myTabStripName="visits";
        var defaultPeriodIndex=0;
        var myTabStrip=null;
        var isMyTabCurrent=false;
        var gridSelector="#exams_visits_grid";
        var gridDs=visitsListDs;
        var periodDs=dsPeriod;
        var visitTab="visit";
        var visitTabMain="main";
        var viewModel=new kendo.data.ObservableObject({
            selectedPatient:null,
            selectedPeriod:null,
            gridDs:gridDs,
            periodDs:periodDs,
            suffix:"",
            visit:null,
            onAddButtonClicked:function(e) {
                proxy.publish("visitsBackUrl",{backUrl:myTabStripName});
                var url="/patient_card/"+viewModel.selectedPatient.id.toString()+"/"+visitTab+"/0/"+visitTabMain;
                proxy.publish("navigateCommand",url);
            },
            onEditButtonClicked:function(e) {
                var grid=$(gridSelector).data("kendoGrid");
                var row=grid.select();
                if (row && row.length) {
                    var item=grid.dataItem(row);
                    proxy.publish("visitsBackUrl",{backUrl:myTabStripName});
                    var url="/patient_card/"+viewModel.selectedPatient.id.toString()+"/"+visitTab+"/"+item.id+"/"+visitTabMain;
                    proxy.publish("navigateCommand",url);
                }
            },
            onDeleteButtonClicked:function(e) {
                /*
                var grid=$(gridSelector).data("kendoGrid");
                var row=grid.select();
                if (row && row.length) {
                    var item=grid.dataItem(row);
                    grid.dataSource.remove(item);
                    grid.dataSource.sync().then(function(){
                        utils._onRequestEnd();
                    });
                }
                */
            },
            onRefreshButtonClicked: function(e) {
                var periodVal=viewModel.selectedPeriod.value;
                var d1=utils.addDays(new Date(),0-periodVal);
                doQuery(viewModel.selectedPatient.evn,d1);
            }
        });
        var restoreState=function() {

        };
        var onRowDblClick=function(e) {
            viewModel.onEditButtonClicked(e);
        };
        var bindWidgets=function() {
            var mode=viewModel.mode;
            kendo.bind($(gridSelector),viewModel);
            kendo.bind("#exams-visits-toolbar",viewModel);
            var grid=$(gridSelector).data("kendoGrid");
            var selectedPeriod=viewModel.get("selectedPeriod");
            if (!(selectedPeriod)) {
                viewModel.set("selectedPeriod",viewModel.periodDs[defaultPeriodIndex]);
            }
            else {
                if (grid) {
                    if (grid.dataSource.data().length) {
                        grid.refresh();
                    }
                }
            }
            restoreState();
            if (grid) {
                grid.tbody.on('dblclick',"tr",onRowDblClick);
            }
        };

        var onPatientCardVisible=function(data) {
            var order=data.order;
            var currentTab=data.currentTab;
            var name=data.name;
            if (!(name==myTabStripName)) {
                return;
            }
            isMyTabCurrent=(currentTab==myTabStripName);
            var tabStrip=data.tabStrip;
            var contentHtml=$("#"+viewId).html();
            myTabStrip = tabStrip.append({
                text: "Посещения",
                content: (isMyTabCurrent && (!(viewModel.suffix))) ? contentHtml: "<div></div>"
            });
            if (isMyTabCurrent) {
                setTimeout(function(){
                    bindWidgets();
                    viewModel.set("selectedPatient",data.patient);
                },1);
            }
        };
        var doQuery=function(iPatientId,dDateEnd){
            if (!iPatientId) {
                return;
            }
            if (!dDateEnd) {
                return;
            }
            $(gridSelector).hide();
            kendo.ui.progress($("#visits-tab"),true);
            viewModel.gridDs.read({
                patient_id: iPatientId,
                date_end: dDateEnd
            }).
            then(function() {
                kendo.ui.progress($("#visits-tab"),false);
                try {
                    $(gridSelector).show();
                    $(gridSelector).data("kendoGrid").resize();
                }
                catch (ex) {

                }
                utils._onRequestEnd();
            });
        };
        var onSuffix=function(suffix) {
            var backUrl="/patient_card/"+viewModel.selectedPatient.evn.toString()+"/"+myTabStripName;
            proxy.publish("suffixChanged",{
                suffix:suffix,
                backUrl:backUrl,
                tabStrip: myTabStrip,
                order:myTabStripOrder,
                selectedPatient:viewModel.selectedPatient,
                visitsDs:viewModel.gridDs
            });
        };
        var onVmChange=function(e) {
            if (e.field=="selectedPatient") {
                if (viewModel.selectedPatient) {
                    viewModel.set("suffix","");
                    viewModel.set("visit",null);
                    viewModel.set("selectedPeriod", null);
                    viewModel.set("selectedPeriod", viewModel.periodDs[defaultPeriodIndex]);  // 3 года
                }
            }
            if ((e.field=="selectedPeriod") && isMyTabCurrent) {
                if (viewModel.selectedPatient) {
                    if (viewModel.selectedPeriod) {
                        var periodVal=viewModel.selectedPeriod.value;
                        var d1=utils.addDays(new Date(),0-periodVal);
                        doQuery(viewModel.selectedPatient.evn,d1);
                    }
                }
            }
            if ((e.field=="suffix") && isMyTabCurrent) {
                var suffix=viewModel.suffix;
                if (suffix) {
                    setTimeout(function(){
                        onSuffix(suffix);
                    },20);
                }
            }
        };

        var onTabActivated=function(data) {
            var idx=data.index;
            var name=data.name;
            if (!(name==myTabStripName)) {
                return true;
            }
            myTabStripOrder=idx;
            // resize grid
            var contentElement=data.content;
            $(gridSelector).css("height",($(contentElement).height()-5)+"px");
            try {
                $(gridSelector).data("kendoGrid").resize();
            }
            catch (ex) {
            }
            if (data.suffix) {
                viewModel.set("suffix",data.suffix);
            }
            var suffix=viewModel.suffix;
            if (suffix) {
                var url=window.location.href;
                if (!(url.endsWith(myTabStripName+"/"+suffix))) {
                    viewModel.set("suffix","");
                    url="/patient_card/"+viewModel.selectedPatient.evn.toString()+"/visits/"+suffix;
                    proxy.publish("navigateCommand",url);
                }
                setTimeout(function() {
                    proxy.publish("suffixTabActivated",
                        {index:91, element: data.item, content: data.content, suffix:suffix });
                },1000);
        }
        };
        proxy.subscribe("patientCardVisible",onPatientCardVisible);
        proxy.subscribe("patientCardTabActivated",onTabActivated);
        viewModel.bind("change",onVmChange);
        return viewModel;
    }
);