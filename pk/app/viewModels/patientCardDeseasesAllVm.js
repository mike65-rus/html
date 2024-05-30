define(['kendo.all.min','utils','kendo-template!views/patientCardDeseasesAll',
        'services/proxyService','classes/generalTab',
        'dataSources/deseasesListDataSource','dataSources/periodDeseasesDataSource',
        'dataSources/deseasesDetailsDataSource',
        'viewModels/deseasesDetailsVm'
    ],
    function(kendo,utils,viewId,proxy,GeneralTab,visitsListDs,dsPeriod,dsDetails,detailsVm) {
        'use strict';
        var contentHtml=$("#"+viewId).html();
        var gridSelector="#exams_deseases_grid";
        var gridDs=visitsListDs;
        var periodDs=dsPeriod;
        var detailsDs=dsDetails;
        var selectedDataId=null;
        var defaultPeriodIndex=periodDs.length-1;
        var viewModel=new kendo.data.ObservableObject({
            selectedPatient:null,
            selectedPeriod:null,
            gridDs:gridDs,
            periodDs:periodDs,
            detailDs:null,
            onRefreshButtonClicked: function(e) {
                var periodVal=viewModel.selectedPeriod.value;
                var d1=utils.addDays(new Date(),0-periodVal);
                doQuery(viewModel.selectedPatient.evn,d1);
            },
            onPrintButtonClicked: function(e) {
                var gridHtml=utils.getGridHtmlForPrinting($(gridSelector),true);
                if (gridHtml) {
                    var sHtml="<div>"+getPatientLabel()+"</div>"+gridHtml;
                    tryShowResults(sHtml);
                }
            },
            onViewDetailsButtonClicked:function(e) {
                var grid=$(gridSelector).data("kendoGrid");
                var row=grid.select();
                if (row && row.length) {
                    var dataItem=grid.dataItem(row);
                    var des=dataItem.deseases_list;
                    var desList=JSON.parse(des);
                    detailsDs.options.data=desList.des2.rows;
                    detailsDs.data(detailsDs.options.data);
                    for (var i=0; i<detailsDs.data().length; i++) {
                        var item2=detailsDs.at(i);
                        item2.des_date=kendo.parseDate(item2.des_date,"yyyy-MM-ddTHH:mm:sszzz");
                    }
                    viewModel.set("detailsDs",detailsDs);
                    viewModel.set("selectedDesease",dataItem);
                    proxy.publish("deseasesViewDetails",{parentModel:viewModel})
//                    console.log(detailsDs.data());
                }
            }
        });
        var onTabIsCurrent=function(data) {
            // resize grid
            var contentElement=data.content;
            $(gridSelector).css("height",($(contentElement).height()-5)+"px");
            try {
                $(gridSelector).data("kendoGrid").resize();
            }
            catch (ex) {
            }
            //          viewModel.set("selectedPatient",data.parentModel.selectedPatient);
//            if (isMyTabCurrent) {
                viewModel.set("selectedPatient",data.parentModel.selectedPatient);
                bindWidgets();
//            }
        };


        var getPatientLabel=function() {
            var pat=viewModel.get("selectedPatient");
            var sRet="<Пациент не выбран>"
            if (!pat) {
                return sRet;
            }
            else {
                sRet=pat.fio+" "+pat.sex+" "+pat.pin+" ";
                try {
                    sRet=sRet+" "+pat.birt.toLocaleString().substr(0,10);
                }
                catch (e) {
                    sRet=pat.fio+" "+pat.sex+" "+pat.pin;
                }
                return sRet;
            }
        };

        var tryShowResults = function (sHtml) {
            var resultsHtml = sHtml;
            proxy.publish("navigateCommand", {path: "/show_results", data: resultsHtml});    // subscribed in router
        };

        var saveState=function() {
            selectedDataId=null;
            var grid=$(gridSelector).data("kendoGrid");
            if (grid) {
                var row=grid.select();
                if (row) {
                    var dataItem=grid.dataItem(row);
                    var dataId=dataItem.id;
                    if (dataId) {
                        selectedDataId=dataId;
                    }
                }
            }
        };
        var restoreState=function() {

        };
        var onRowDblClick=function(e) {
            viewModel.onViewDetailsButtonClicked(e);
        };

        var bindWidgets=function() {
            kendo.bind($(gridSelector),viewModel);
            kendo.bind("#exams-deseases-toolbar",viewModel);
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

        var doQuery=function(iPatientId,dDateEnd){
            if (!iPatientId) {
                return;
            }
            if (!dDateEnd) {
                return;
            }
            $(gridSelector).hide();
            kendo.ui.progress($("#deseases-tab"),true);
            viewModel.gridDs.read({
                patient_id: iPatientId,
                date_end: dDateEnd,
                bDisp:false
            }).
            then(function() {
                kendo.ui.progress($("#deseases-tab"),false);
                $(gridSelector).show();
                var grid=$(gridSelector).data("kendoGrid");
                if (grid) {
                    grid.resize();
                }
                utils._onRequestEnd();
            });
        };

        var onVmChange=function(e) {
            if (e.field=="selectedPatient") {
                if (viewModel.selectedPatient) {
                    viewModel.set("selectedPeriod", null);
                    viewModel.set("selectedPeriod", viewModel.periodDs[defaultPeriodIndex]);  // 3 года
                }
            }
            if ((e.field=="selectedPeriod") ) {
                if (viewModel.selectedPatient) {
                    if (viewModel.selectedPeriod) {
                        var periodVal=viewModel.selectedPeriod.value;
                        var d1=utils.addDays(new Date(),0-periodVal);
                        doQuery(viewModel.selectedPatient.evn,d1);
                    }
                }
            }
        };

        var options={
            level: 1,
            parentName:"deseases",
            name:"all",
            label:"Все",
            contentHtml:contentHtml,
            tabStripSelector:"",
            viewModel:viewModel,
            onTabIsCurrent: onTabIsCurrent
        };

        var myTab= new GeneralTab(options);

        viewModel.bind("change",onVmChange);
        return viewModel;
    }
);