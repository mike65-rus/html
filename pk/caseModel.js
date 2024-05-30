/**
 * Created by STAR_06 on 14.01.2015.
 */
// inside the case
function CaseModel(theCase,theCases,theContainer,bReadOnly) {
    this.oCase=theCase;
    this.oCases=theCases;
    this.oContainer=theContainer;
    this.readOnly=(bReadOnly) ? bReadOnly : false;
    this.myUiId="";
    this.timeInterval=10;
  //  this.visitTypes=[];
    this.initUI=function() {
        // init UI
        this.visitTypesDS.read({date:this.oCase.d_start.toISOString(), active:1});
//        this.readUsl();
        createBody();
        createTabs();
        initWidgets();
        openMe();
        //
//        this.readVisits();
    };
    var readUrl="default.aspx?action=pk/CASES_AJAX&action2=get_case_visits";
    var crudUrl="default.aspx?action=pk/CASES_AJAX&action2=visits_crud";
    var readUrl2="default.aspx?action=pk/CASES_AJAX&action2=get_case_usl";
    var crudUrl2="default.aspx?action=pk/CASES_AJAX&action2=usl_crud";
    var dataType="json";

    //
    this.visitTypesDS=new kendo.data.DataSource({
        transport: {
            read: {
                url: "default.aspx?action=pk/CASES_AJAX&action2=get_visit_types",
                dataType: dataType
            }
        },
        schema: {
            data: "visit_types.rows",
            total: "records",
            errors: "error",
            model: ModelVisitTypes
        },
        change: function(e) {
//            that.visitTypes=new kendo.data.ObservableArray(e.items);
        },
        error: function(e) {
            ajax_error(e);
        }

    });
    //
    //
    this.uslDS=new kendo.data.DataSource({
        transport: {
            read: {
                url: readUrl2,
                dataType: dataType
            },
            create: {
                url: crudUrl2,
                dataType: dataType
            },
            update: {
                url: crudUrl2,
                dataType: dataType

            },
            destroy: {
                url: crudUrl2,
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
                        case_id: that.oCase.case_id
                    };
                }
            }
        },
        serverSorting: false,
        serverPaging: false,
        serverFiltering:false,
        pageSize: 5,
        requestEnd: _onRequestEnd,
        batch: false,
        schema: {
            data: "usl.rows",
            total: "records",
            errors: "error",
            model: ModelUsl
        },
        change: function(e) {
        },
        error: function(e) {
            ajax_error(e);
        }

    });
    //
    this.visitsDS=new kendo.data.DataSource({
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
                        case_id: that.oCase.case_id
                    };
                }
            }
        },
        serverSorting: false,
        serverPaging: false,
        pageSize: 5,
        requestEnd: _onRequestEnd,
        batch: true,
        schema: {
            data: "visits.rows",
            total: "records",
            errors: "error",
            model: ModelVisit
        },
        change: function(e) {
            if (bFirstRead) {
                var totalPages=this.totalPages();
                if (totalPages) {
                    var ds = this;
                    setTimeout(function () {
                        ds.page(totalPages);
                        lastVisitsPage=totalPages;
                        var gridData = $(visitsGrid).data("kendoGrid");
                        var row = gridData.tbody.find("tr:last");
                        if (row.length > 0) {
                            gridData.select(row);
                            row.scrollIntoView();
//                            gridData.trigger("change");
                        }
                        setTimeout(function() {
                            bFirstRead=false;
                        },100)
                    }, 100);
                }
                else {bFirstRead=false;}
            }
            if (newModelUid) {
                var dataItem=this.getByUid(newModelUid);
                if (dataItem && dataItem.visit_id) {
                    setTimeout(function(){
                        // select grid row by model uid
                        if (!newModelUid) {
                            return;
                        }
                        var gridData=$(visitsGrid).data("kendoGrid");
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
                }
            }
        },
        error: function(e) {
            ajax_error(e);
        }

    });
    this.readUsl=function() {
      this.uslDS.read();
    };
    this.readVisits=function() {
        this.visitsDS.read();
    };
    this.onActivateContainerTab=function() {
        var tabStrip=$(this.uiContainer.tabStrip).data("kendoTabStrip");
        if (!tabStrip) {
            return;
        }
        var li=tabStrip.select();
        if (li.length>0) {
            var idx=li.index();
            var content=tabStrip.contentElement(idx);
            setTimeout(function(){
                setDocHeight($(content))
            },1);
//            tabStrip.select(li);
        }
    };
    //
    // privates
    var tabs=["Основое","Посещения","Протоколы","КДЛ","ЛДО"];
    var createBody=function() {
        var oContainer=that.oContainer;
        var newIndex=oContainer.tabs.items().length;
        var sUuid=Math.uuid(15);
        that.myUiId=sUuid;
        var documentId="case_"+sUuid;
        var tabStripId="ts_"+sUuid;
        oContainer.tabs.append([{
//            text:that.oCase.fio.fio()+"&nbsp;<button case_id='"+that.oCase.case_id.toString()+"' class='k-button close-button' onclick='closeTab(this)'><i class='fa fa-times'> </i></button>",
            text:that.oCase.fio.fio()+"&nbsp;<button case_id='"+that.oCase.case_id.toString()+"' class='k-button close-button' rel='tooltip' title='Закрыть это окно'><i class='fa fa-times'> </i></button>",
            encoded:false,
            content:"<div class='case-div' id='"+documentId+"'><div id='"+tabStripId+"'><ul></ul></div></div>"
        }]);
        $("button[case_id='"+that.oCase.case_id+"']").click(onClose)
        that.uiContainer= (new UiContainer($("#"+documentId),$("#"+tabStripId)));
    };
    var createTabs=function() {
        var myBody=that.uiContainer.body;
        var tabStrip=that.uiContainer.tabStrip;
        var ul=$(tabStrip).find("ul").first();
        for (var i=0;i<tabs.length;i++) {
            var sUuidTab="case_"+that.myUiId+"_tab_"+i.toString(); // tab
            $(ul).append("<li id='"+sUuidTab+"'>"+tabs[i]+"</li>");    //tab
        }
//        var k=0;
        for (var j=tabs.length-1;j>=0;j--) {
            var sUuid1="case_"+that.myUiId+"_body_"+j.toString(); // main div
            var sUuid2="case_"+that.myUiId+"_toolbar_"+j.toString(); // child toolbar
            var sUuid3="case_"+that.myUiId+"_content_"+j.toString(); // child content
            var sStr="<div id='"+sUuid1+"'>";
            sStr=sStr+"<div id='"+sUuid2+"'>"+"</div>";
            sStr=sStr+"<div class='pk-case-div' id='"+sUuid3+"' ui_id='"+that.myUiId+"'>"+getTabContent(j)+"</div>";
            sStr=sStr+"</div>";
            $(ul).after(sStr);
            tabsContainer.unshift(new TabContainer($('#'+sUuidTab),$('#'+sUuid1),$('#'+sUuid2),$('#'+sUuid3)));
  //          k++;
        }
    };
    var getTabContent=function(idx) {
        var sRet=tabs[idx]+"."+that.oCase.fio+","+that.oCase.pin;
        var templateId="case_template_"+idx.toString();
        if (($("#"+templateId).length)) {
            sRet= sRet+$("#"+templateId).html();
        }
        return sRet;
    };
    var onClose=function() {
        that.oCases.closeCaseTab(that.oCase.case_id);
        return;
        /*
        var myTab=$(this).closest("li");
        var tabStrip=$(this).closest("li").closest("ul").closest("div").data("kendoTabStrip");
        that.oCases.removeCaseModel(that.oCase.case_id);
        tabStrip.remove(myTab);
        tabStrip.select(tabStrip.items(tabStrip.items().length-1));
        */
    };
    var onActivateTab=function(e) {
        var content= $(e.contentElement).find("div.pk-case-div").first();
        setDocHeight(content);
    };
    var initWidgets =function() {
        var tabStrip=$(that.uiContainer.tabStrip).kendoTabStrip({animation:false,navigatable:false}).data("kendoTabStrip");
        tabStrip.bind("activate",onActivateTab);
        for (var i=0; i<tabStrip.items().length;i++) {
            initTabWidgets(i);
        }
    };
    var initTabWidgets=function(idx) {
        var myContainer=tabsContainer[idx];
        if (idx==1) {
            initTabWidgets1(myContainer);
        }
    };
    var initTabWidgets1=function(myContainer) {
        var myContent=myContainer.content;
        var splitter=$(myContent).find("div[pid='splitter']").first();
        $(splitter).kendoSplitter({
            orientation:"vertical",
            panes: [{ size: "50%" }, {}]
        });
        //
        uslGrid=$(myContent).find("div[pid='usl']").first().kendoGrid({
            dataSource: that.uslDS,
            autoBind: false,
            resizable: true,
            scrollable:true,
            pageable: {
                pageSizes: [5,10,15,20],
                buttonCount: 5
            },
            editable: {
                mode:"popup",
                /*               template: kendo.template($("#visit_editor").html()), */
                window: {
                    title: "Услуга"
                }
            },
            toolbar:["create"],
            sortable: false,
            selectable: "row",
            groupable: false,
            filterable: true,
            navigatable: false,
            columns: [
                {field: "visit_id", title: "USL_ID",hidden: true },
                {field: "visit_id", title: "VISIT_ID",hidden: false },
                {field: "case_id", title: "CASE_ID",hidden: true },
                /*                {field: "d_start", title: "Дата", width:"20%",format: "{0: dd.MM.yyyy HH:mm}"}, */
                {field: "usl_num", title: "Код", width:"10%"},
                {field: "usl_kol", title: "Кол-во", width:"10%"},
                {field: "usl_name", title: "Наименование",template: "#: usl_name() #"},
                { command: ["edit", "destroy"] }
            ],
            messages:{
                commands: {
                    create: "Добавить услугу",
                    edit: "Изменить",
                    destroy: "Удалить",
                    save: "Сохранить",
                    update: "Сохранить",
                    cancel: "Отказ",
                    canceledit:"Отказ"
                }
            }

        });


        visitsGrid=$(myContent).find("div[pid='visits']").first().kendoGrid({
            dataSource: that.visitsDS,
            autoBind: false,
            resizable: true,
            scrollable:true,
            pageable: {
                pageSizes: [3,5,10,15,20],
                buttonCount: 5
            },
            toolbar:["create"],
            sortable: false,
            selectable: "row",
            groupable: false,
            filterable: false,
            navigatable: false,
            editable: {
                mode:"popup",
                template: kendo.template($("#visit_editor").html()),
                window: {
                    title: "Посещение"
                }
            },
            columns: [
                {field: "visit_id", title: "VISIT_ID",hidden: true },
                {field: "case_id", title: "CASE_ID",hidden: true },
                {field: "d_start", title: "Дата", width:"20%",format: "{0: dd.MM.yyyy HH:mm}"},
                {field: "visit_code", title: "Код", width:"5%"},
                {field: "visit_name", title: "Наименование",template: "#: visit_name() #"},
                { command: ["edit", "destroy"],width:"180px;" }
            ],
            messages:{
                commands: {
                    create: "Добавить посещение",
                    edit: "",
                    destroy: "",
                    save: "Сохранить",
                    update: "Сохранить",
                    cancel: "Отказ",
                    canceledit:"Отказ"
                }
            },
            save: onSaveVisit,
            cancel: onCancel,
            change: onChangeVisit,
            dataBound: onDataBoundVisits
        });
        var visitsGridData=$(visitsGrid).data("kendoGrid");
        visitsGridData.bind("edit",editVisit);
        var dsSort=[];
        dsSort.push({field:"d_start",dir:"asc"});
        visitsGridData.dataSource.sort(dsSort);
        // prevent user selection
        $(visitsGrid).delegate("tbody>tr", "selectstart", function(e){
            return false;
        }).css( 'MozUserSelect','none' ).mousedown( function( ) {
//        return false;
        });
        // handles double-click
        $(visitsGrid).delegate("tbody>tr", "dblclick", function(e){
            e.preventDefault();
            var dataItem = $(visitsGrid).data("kendoGrid").dataItem($(e.currentTarget));
            if (dataItem) {
                var row=$(visitsGrid).data("kendoGrid").select();
                $(visitsGrid).data("kendoGrid").editRow(row);
            }
        });
    };
    var openMe=function() {
        var oContainer=that.oContainer;
        oContainer.tabs.select("li:last");
        $(that.uiContainer.tabStrip).data("kendoTabStrip").select(1);
    };

    var validateVisit=function(model,grid) {
        var data=grid.dataSource.data();
        var uid=model.uid;
        var date=model.get("d_start");
        if (model.get("visit_name")=="") {
            alertify.error("Код посещения неверен!");
            return false;
        }
        var minDate=that.oCase.d_start;
        if (date<minDate) {
            alertify.error("Дата посещения не может быть меньше даты открытия случая!");
            return false;
        }
        if (date>new Date()) {
            alertify.error("Дата посещения не может быть больше текшей даты!");
            return false;
        }
        var firstCode=0;
        var codeOneCnt=0;
        for(var i=0;i<data.length;i++) {
            // check for duplicate dates
            // check for min date
            if ((!firstCode) && (data[i].visit_code) && (data[i].d_start.toString().substr(0,10)==minDate.toString().substr(0,10))) {
                firstCode=data[i].visit_code;
            }
            if (data[i].visit_code==1) {
                codeOneCnt++;
            }
            if ((data[i].d_start.toString().substr(0,10)==date.toString().substr(0,10)) &&
                !(data[i].uid==uid)) {
                alertify.error("Дублирование даты посещения!");
                return false;
            }
        }
        if (!firstCode) {
            firstCode=model.get("visit_code");
        }
        if (firstCode==2) {
            // первое обращение повторное
            alertify.error("Недопустимый код первого песещения!");
            return false;
        }
        if ((firstCode==1) && (model.get("visit_code")==1) && (data.length>=1) && (codeOneCnt>1)) {
            // более одного первичного посещения
            alertify.error("Первичное посещение может быть только одно!");
            return false;
        }
        return true;
    };
    var onChangeVisit=function(e) {
        var row=this.select();
        if (row.length>0) {
            var dataItem=this.dataItem(row);
            if (dataItem) {
                filterUsl(dataItem,0);
                if (!(dataItem.uid==lastSelectedVisitUid)) {
//                    alertify.log("Change fired for visit " + dataItem.d_start.toLocaleString());
                    lastSelectedVisitUid=dataItem.uid;
                }
            }
        }
    };
    var onDataBoundVisits=function(e) {
        if (!bFirstRead) {
            var page = this.dataSource.page();

            var row = this.select();
            if (!row.length) {
                var dir = "last";
                if (page > lastVisitsPage) {
                    dir = "first";
                }
                row = this.tbody.find("tr:" + dir);
                if (row.length) {
                    this.select(row);
                    row.scrollIntoView();
                }
            }
            lastVisitsPage = page;
        }
    };
    var onSaveVisit=function(e) {
        var model= e.model;
        var grid=this;
        if (!validateVisit(model,grid)) {
            e.preventDefault();
            grid.trigger("cancel");
        }
        newModelUid= e.model.uid;
    };
    var onCancel=function(e) {
//      alertify.log("cancel called");
        newModelUid="";
    };
    var editVisit=function(e) {
        enterAsTab();
        var $visit_date=$(e.container).find("input[name=visit_date]");
//        var $visit_time=$(e.container).find("input[name=visit_time]");
        $visit_date.data("kendoDateTimePicker").setOptions({interval:10,format: "dd.MM.yyyy HH:mm",timeFormat:"HH:mm"});
        $visit_date.data("kendoDateTimePicker").max(new Date());
        $visit_date.data("kendoDateTimePicker").min(that.oCase.d_start);
        $visit_date.mask("99.99.9999 99:99",{placeholder:"дд.мм.гггг чч.мм"});
//        $visit_time.mask("99:99",{placeholder:"чч.мм"});
        var $visit_code=$(e.container).find("input[name=visit_code]");
        $visit_code.kendoComboBox({
            dataSource: visitTypesDS,
            dataTextField: "code",
            dataValueField:"code",
//            suggest: true,    // error in kendo script???
            change: function(e) {
                var value=this.value();
                this.suggest(value);
            },
            template: "<table width='100%'><tr><td width='10%'>${code}</td><td width='90%'>${name}</td></tr></table>"
        });
        $visit_code.data("kendoComboBox").input.mask("9");
        if (e.model.isNew()) {
            e.model.set("case_id",that.oCase.case_id);
            e.model.set("user_id",that.oCase.user_id);
            e.model.set("spec_id",that.oCase.spec_id);
            e.model.set("otd_id",that.oCase.otd_id);
            e.model.set("ist_fin",1);
            if (this.dataSource.view().length<=1) {
                e.model.set("d_start",that.oCase.d_start);
                $visit_date.data("kendoDateTimePicker").enable(false);
            }
            else {
                e.model.set("d_start",roundMinutes(new Date(),10));
            }
       }
       setTimeout(function(){
           var $container=$(".k-edit-form-container");
           var newWidth=700;
           var gridData=visitsGrid.data("kendoGrid");
           var editWindow=$container.parent().data("kendoWindow");
           if (!editWindow) {
               return
           }
           $container.parent().width(newWidth).data("kendoWindow").center();
           $container.width(newWidth);
           var elToFocus=$visit_code;
           setTimeout(function(){
               try {
                   $(elToFocus).data("kendoComboBox").input.focus();
               }
               catch (e) {}
//               $visit_code.data("kendoComboBox").options.suggest=true;    // error in kendo javascript
           },1000);
            },500);
    };
    var filterUsl=function(visitItem,iMode) {
        if(!iMode) {
            /*
            that.uslDS.filter({logic:"and",filters:[
                { field: "visit_id",value:visitItem.visit_id,operator:"eq"},
                {field:"case_id",value:visitItem.case_id,operator:"eq"}]})
            */
           that.uslDS.query({filter:{ field: "visit_id",value:visitItem.visit_id,operator:"eq"}});

        }
    };
    var tabsContainer=[];
    var newModelUid="";
    var visitsGrid=null;
    var uslGrid=null;
    var bFirstRead=true;
    var lastSelectedVisitUid="";
    var lastVisitsPage=0;
    var that=kendo.observable(this);
    return that;

};
// UiContainer
function UiContainer(body,tabStrip) {
    this.body=body;
    this.tabStrip=tabStrip;
}
//TabContainer
function TabContainer(tab,body,toolbar,content) {
    this.tab=tab;
    this.body=body; // main
    this.toolbar=toolbar;   // toolbar child
    this.content=content;   // content child
}


