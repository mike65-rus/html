/**
/**
 * Created by 1 on 03.01.2015.
 */
function CasesModel() {
    var readUrl="default.aspx?action=pk/CASES_AJAX&action2=get_active_cases";
    var crudUrl="default.aspx?action=pk/CASES_AJAX&action2=cases_crud";
    var dataType="json";

    this.tabs=null;
    this.tabsIndex=0;

    this.currentUserId=0;
    this.otdelSpec=null,
    this.userSpecDS=new kendo.data.DataSource({
        transport: {
            read: {
                url: "default.aspx?action=pk/CASES_AJAX&action2=get_user_spec",
                dataType: dataType
            }
        },
        schema: {
            data: "otdspec.items",
            total: "records",
            errors: "error",
            model: ModelOtdSpec
        },
        change: function(e) {
            if ((e.items) && (e.items.length==0)) {
                alertify.alert("Не указана специальность врача!");
            }
            else {
                that.otdelSpec= e.items[0];
                kodifDS.read({spec_id:that.otdelSpec.nspecid})
            }
        },
        error: function(e) {
            ajax_error(e);
        }

    });

    this.activeCasesDS=new kendo.data.DataSource({
        transport: {
            read: {
                url: readUrl,
                dataType: dataType
            },
            create: {
                url: crudUrl,
                dataType: dataType
            },
            update: {
                url: crudUrl,
                dataType: dataType

            },
            destroy: {
                url: crudUrl,
                dataType: dataType
            },
            parameterMap: function(data, type) {
                if (!(type == "read")) {
                    // send the created data items as the "models" service parameter encoded in JSON
                    return {
                            models: kendo.stringify(data.models),
                            type: type
                    };
                }
                else {
                    return {
                        user_id: Number(localStorage['last_user']),
                        otd_id: 0
                    };
                }
            }
        },
        serverSorting: false,
        serverPaging: false,
        pageSize: 15,
        requestEnd: _onRequestEnd,
        batch: true,
        schema: {
            data: "cases.rows",
            total: "records",
            errors: "error",
            model: ModelCase
        },
        change: function(e) {
//            that.refreshGrid();

            that.onFilter(this);
            if (newModelUid) {
                var dataItem=this.getByUid(newModelUid);
                if (dataItem && dataItem.case_id) {
                    setTimeout(function(){
                        // select grid row by model uid
                        if (!newModelUid) {
                            return;
                        }
                        var gridData=that.getGrid().data("kendoGrid");
                        try {
                            var row=[];
                            var i=1;
                            while (!row.length) {
                                gridData.dataSource.page(i);
                                row = gridData.tbody.find("tr[data-uid='" + newModelUid + "']");
                                if (row.length>0) {
                                    gridData.select(row);
                                    row.scrollIntoView();
                                    break;
                                }
                                i++;
                            }
                        }
                        catch (e) {
                        }
                        // clear this mode
                        newModelUid="";
                    },100);
                    // auto-edit if item is added and server returned case_id
                    that.editCase(dataItem);
                }
            }
            else {
                // preserve selection row if grid refreshes from toolbar
                if (savedItem) {
                    setTimeout(function(){
                        // select grid row by case_id
                        var gridData=that.getGrid().data("kendoGrid");
                        if (savedItem) {
                            try {
    //                            var row=gridData.tbody.find("td:contains('"+savedItem.id+"')").first().closest("tr");
                                gridData.tbody.find("tr td:first-child").each(function(i,td) {
                                    if (Number($(td).text())==savedItem.id) {
                                        var row=$(td).closest("tr");
                                        if (row.length>0) {
                                            gridData.select(row);
                                            row.scrollIntoView();
                                        }
                                    }
                                })
                            }
                            catch (e) {
                            }
                        }
                        // clear this mode
                        savedItem=null;
                    },100);
                }
            }
        },
        error: function(e) {
            ajax_error(e);
        }

    });
    this.addCaseModel=function(oCaseModel) {
        caseModels.push(oCaseModel);
    };
    this.removeCaseModel= function(case_id) {
        var idx=this.findCaseModel(case_id);
        if (idx) {
            caseModels.splice(idx);
        }
    };
    this.findCaseModel=function(case_id) {
        var iRet=0;
        for (var i=1;i<caseModels.length;i++) {
            if (caseModels[i].oCase.case_id==case_id) {
                iRet=i;
                break;
            }
        }
        return iRet;
    };
    this.closeAllTabs=function() {
        for (var i=caseModels.length-1;i>=1;i-- ) {
            this.closeCaseTab(caseModels[i].oCase.case_id);
        }
    };
    this.closeCaseTab=function(case_id) {
        var idx=this.findCaseModel(case_id);
        if (idx) {
            this.tabs=this.tabs.remove(idx);
            caseModels.splice(idx,1);
            this.tabs.select(idx-1);
        }
        setCloseAllState();
    };
    this.getGrid=function() {
      return $("#active_cases");
    };
    this.getDS=function() {
        return this.activeCasesDS;
    };
    this.refreshGrid=function() {
        return;
    };
    this.findActiveCasesByPin=function(sPin) {
        var aRet=[];
        for (var i=0;i<this.activeCasesDS.data().length;i++) {
            if (this.activeCasesDS.data()[i].pin===sPin) {
                aRet.push(this.activeCasesDS.data()[i]);
            }
        }
        return aRet;
    };
    this.tryAddCase=function(oCase) {
        var oPerson=oCase.get("selectedPerson");
        if (!oPerson) return;
        var sPin=oPerson.pin;
        var aCases=this.findActiveCasesByPin(sPin);
        if (aCases.length==0) {
            this.addCase(oCase);
            return;
        }
        alertify.set({ labels: {
            ok     : "ДА.Открыть новый случай",
            cancel : "НЕТ.Не открывать новый случай"
        } });
        alertify.confirm("Пациент уже имеет "+aCases.length.toString()+" открытых случая! Вы действительно хотите открыть новый случай?",
            function(e) {
                if (e) {
                    that.addCase(oCase);
                }
        });
    };
    this.addCase=function(oCase) {
        var oPerson=oCase.get("selectedPerson");
        if (!oPerson) return;
        this.filterOff();
        var oModel=new ModelCase({
            user_id: Number(localStorage['last_user']),
            pin: oPerson.pin,
            fam: oPerson.fam,
            ima: oPerson.ima,
            otch: oPerson.otch,
            d_birt: oPerson.birt,
            gender: oPerson.sex,
            fio: oPerson.fio,
            d_start:oCase.get("selectedDate"),
            d_end: null,
            spec_id: this.otdelSpec.nspecid,
            otd_id: this.otdelSpec.notdid
        });
        newModelUid=oModel.uid;
        this.activeCasesDS.add(oModel);
        this.activeCasesDS.sync();

    };
    this.editCase=function(oCase) {
//        alertify.log("Edit called for: " + oCase.fio+';'+oCase.uid);
        var idx=this.findCaseModel(oCase.case_id);
        if (idx) {
            this.tabs.select(idx);
            return;
        }
        var caseModel=new CaseModel(oCase,this,this,false);
        caseModel.initUI();
        this.addCaseModel(caseModel);

    };
    this.deleteCase=function(oCase) {
        alertify.set({ labels: {
            ok     : "ДА.Удалить",
            cancel : "НЕТ.Не удалять"
        } });
        alertify.confirm("Вы действительно хотите удалить случай пациента "+oCase.fio+"?",function(e){
            if (e) {
                var idx=that.findCaseModel(oCase.case_id);
                if (idx) {
                    that.removeCaseModel(oCase.case_id);
                    that.tabs.remove(idx);
                }
                that.activeCasesDS.remove(oCase)
                that.activeCasesDS.sync();
            }
        })
    };
    this.changeUser=function(userId) {
        this.currentUserId=userId;
        this.userSpecDS.read({user_id: userId});
        this.readActiveCases(this.currentUserId,0);
    };
    this.readActiveCases=function(userId,otdId) {
        var grid=this.getGrid();
        savedItem=null;
        var selection=grid.data("kendoGrid").select();
        if (selection) {
            if (selection.length>0) {
                try {
                    savedItem = grid.data("kendoGrid").dataItem(selection);
                }
                catch (e) {

                }
            }
        }
        this.filterOff();
        this.activeCasesDS.read({user_id: userId,otd_id: otdId});

    };
    this.newCaseModel=newCaseModel;
    this.activeCasesToolbarAction= function(e) {
        var btnAction;
        try {
            btnAction=$(e.target).attr("action").trim();
        }
        catch (e) {
            btnAction="";
        };
        if (btnAction=="refreshActiveCases") {
            that.readActiveCases(that.currentUserId,0);
        }
        if (btnAction=="newCase") {
            that.newCaseModel.newCaseDialog(that);
        }
        if (btnAction=="filterActiveCases") {
            var input=$(e.target).closest("div[data-role='toolbar']").find("input.active-cases-search-input").first();
            var sVal=$(input).val().trim();
            that.filterActiveCases(sVal,input);
        }
        if (btnAction=="filterOff") {
            savedSelection=that.getGrid().data("kendoGrid").select();
            savedPage=0;
            that.filterOff($(e.target),1);
        }
        if (btnAction=="closeAllTabs") {
            alertify.set({ labels: {
                ok     : "ДА.Закрыть все вкладки",
                cancel : "НЕТ.Не закрывать"
            } });

            alertify.confirm("Вы действительно хотите закрыть все вкладки?",function(e){
                if (e) {
                    that.closeAllTabs();
                }
            })
        }
    };
    this.filterOff=function(el,iFromOffAction) {
        if (el) {
            try {
                var input=$(el).closest("div[data-role='toolbar']").find("input.active-cases-search-input").first();
                $(input).val("");
            }
            catch (e) {

            }
        }
        if (el) {
            // preserve selected row
            this.activeCasesDS.filter({});
            if (savedPage) {
                this.activeCasesDS.page(savedPage);
            }
            var grid = this.getGrid();
            var gridData=grid.data("kendoGrid");
            if (savedSelection.length) {
                if (!iFromOffAction) {
                    setTimeout(function () {
                        var row = gridData.tbody.find("tr[data-uid='" + $(savedSelection).attr("data-uid") + "']");
                        if (row.length) {
                            gridData.select(row);
                            row.scrollIntoView();
                        }
                        ;
                        savedSelection = [];
                    }, 100);
                }
                else {
                    // called when FilterOff button clicked
                    setTimeout(function () {
                        var iPage=1;
                        var row=[];
                        while (!row.length) {
                            gridData.dataSource.page(iPage);
                            row = gridData.tbody.find("tr[data-uid='" + $(savedSelection).attr("data-uid") + "']");
                            if (row.length) {
                                gridData.select(row);
                                row.scrollIntoView();
                            }
                            else {
                                iPage++;
                            }
                        }
                        savedSelection = [];
                    }, 100);

                }
            }
        }

    };
    this.onFilter=function() {
        var filter=this.activeCasesDS.filter();
        var filterButton=$("#active_cases_toolbar").find('a[action="filterOff"]');
        if (filter) {
            $(filterButton).removeAttr("disabled");
        }
        else {
            $(filterButton).attr("disabled","disabled");
        }
    };
    this.filterActiveCases=function(sVal,input) {
//        alertify.log("value="+sVal);
//        this.activeCasesDS.filter({});
        var gridData=this.getGrid().data("kendoGrid");
        savedSelection=gridData.select();
        savedPage=gridData.dataSource.page();
        if (isEmpty(sVal)) {
            this.filterOff(1);
            return;
        }
        var sStr=sVal;
        if (isPin(sVal.toUpperCase())) {
            sStr=sVal.toUpperCase();
            this.activeCasesDS.filter({field:"pin", operator:"startswith",value:sStr})
        }
        else {
            sStr=sVal.capitalize(true);
            this.activeCasesDS.filter({field:"fio", operator:"startswith",value:sStr})
        }
        var view=this.activeCasesDS.view();
        if ((!view) || (!view.length)) {
            this.filterOff(input);
            alertify.log("По запросу ["+sVal+"] ничего не найдено!");
            return;
        }
        try {
            var row=gridData.tbody.find("tr[data-uid='" + view[0].uid + "']");
            if (row.length>0) {
                gridData.select(row);
                row.scrollIntoView();
            }
        }
        catch (e) {
        }
     };
    this.onTabActivate= function (e) {
        var idx=$(e.item).index();
        if (idx==0) {
            setCloseAllState();
            setDocHeight($(e.contentElement));
            setDocHeight($(e.contentElement).find(".pk_case_div").first());
            try {
//                this.activeCasesDS.fetch();
                $(this.getGrid()).data("kendoGrid").resize();
            }
            catch (e) {}

        }
        else {
            setDocHeight($(e.contentElement));
            if (caseModels[idx]) {
                caseModels[idx].onActivateContainerTab();
            }
        }
    };
    this.setGridHeight=function(oGrid) {
        setGridHeight(oGrid);
    };
    // privates
    var setCloseAllState=function() {
        var aLink=$("#active_cases_toolbar").find("a[action='closeAllTabs']").first();
        if (!aLink.length) {
            return;
        }
        var tabsCnt=that.tabs.items();
        if (tabsCnt.length>1) {
            $(aLink).removeAttr("disabled");
        }
        else {
            $(aLink).attr("disabled","disabled");
        }
    };
    var setGridHeight= function (oGrid) {
        var iH=divHDistance(oGrid,$("#simplefooter"));
        var dataArea = oGrid.find(".k-grid-content");
        var diff = oGrid.innerHeight() - dataArea.innerHeight();
        var newHeight=Math.max(iH-15,550);
        oGrid.height(newHeight);
        dataArea.height(newHeight - diff);
    };
    var newModelUid="";
    var savedItem=null;
    var caseModels=[null];
    var savedPage=1;
    var savedSelection=[];

    //
    var that=kendo.observable(this);
    return that;
};

var casesModel=new CasesModel();
$("#active_cases").delegate("tbody>tr", "dblclick", function(e){
    e.preventDefault();
    var dataItem = $("#active_cases").data("kendoGrid").dataItem($(e.currentTarget));
    if (dataItem) {
        casesModel.editCase(dataItem);
    }
});

var kodifDS=new kendo.data.DataSource({
    transport: {
        read: {
            url: "default.aspx?action=pk/CASES_AJAX&action2=get_kodif",
            dataType: "json"
        }
    },
    schema: {
        data: "kodif.items",
        total: "records",
        errors: "error",
        model: ModelKodif
    },
    change: function(e) {
    },
    error: function(e) {
        ajax_error(e);
    }
});
