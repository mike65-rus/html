define(['kendo.all.min','utils','kendo-template!views/patientCardDeseasesDisp38',
        'services/proxyService','classes/generalTab',
        'dataSources/deseases38ListDataSource',
        'dataSources/deseasesDetails38DataSource',
        'viewModels/deseasesDisp38DetailsVm'
    ],
    function(kendo,utils,viewId,proxy,GeneralTab,visitsListDs,dsDetails,detailsVm) {
        'use strict';
        var myTabStripOrder=1;
        var myTabStrip=null;
        var isMyTabCurrent=false;
        var contentHtml=$("#"+viewId).html();
        var gridSelector="#exams_deseases_disp38_grid";
        var gridDs=visitsListDs;
/*        var periodDs=dsPeriod;    */
        var detailsDs=dsDetails;
        var selectedDataId=null;
/*        var defaultPeriodIndex=periodDs.length-1; */

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

        var viewModel=new kendo.data.ObservableObject({
            selectedPatient:null,
            gridDs:gridDs,
/*            periodDs:periodDs,    */
            detailDs:null,
            onRefreshButtonClicked: function(e) {
                doQuery(viewModel.selectedPatient.evn);
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

                    var des=dataItem.cases_list;
                    var desList=JSON.parse(des);
                    detailsDs.options.data=desList.des2.rows;
                    detailsDs.data(detailsDs.options.data);
                    for (var i=0; i<detailsDs.data().length; i++) {
                        var item2=detailsDs.at(i);
                        item2.date_nach=kendo.parseDate(item2.date_nach,"yyyy-MM-ddTHH:mm:sszzz");
                    }
                    viewModel.set("detailsDs",detailsDs);

                    viewModel.set("selectedDesease",dataItem);
                    proxy.publish("deseasesDisp38ViewDetails",{parentModel:viewModel})
//                    console.log(detailsDs.data());
                }
            }
        });
        var restoreState=function() {

        };
        var onRowDblClick=function(e) {
            viewModel.onViewDetailsButtonClicked();
        };

        var bindWidgets=function() {
            kendo.bind($(gridSelector),viewModel);
            kendo.bind("#exams-deseases-disp38-toolbar",viewModel);
            var grid=$(gridSelector).data("kendoGrid");
            var selectedPeriod=viewModel.get("selectedPeriod");
            if (false) {
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

        var doQuery=function(iPatientId){
            if (!iPatientId) {
                return;
            }
            $(gridSelector).hide();
            kendo.ui.progress($("#deseases-tab-disp38"),true);
            viewModel.gridDs.read({
                patient_id: iPatientId
            }).
            then(function() {
                kendo.ui.progress($("#deseases-tab-disp38"),false);
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
                    doQuery(viewModel.selectedPatient.evn);
                }
            }
        };

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

        var options={
            level: 1,
            parentName:"deseases",
            name:"disp38",
            label:"ДиспУчет38",
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