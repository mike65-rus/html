/**
 * Created by 1 on 23.02.2018.
 */
const flatten = function(obj) {
    const array = Array.isArray(obj) ? obj : [obj];
    return array.reduce(function(acc, value) {
        acc.push(value);
        if (value.items) {
            acc = acc.concat(flatten(value.items));
            delete value.items;
        }
        return acc;
    }, []);
};

function SchedulerModel() {
    this.modelName="scheduler-pk";
    this.maxInteger=9007199254740991-1; // MAX_SAFE_INTEGER-1
    this.selectedPerson=null;
    this.selectedPersonType="";
    //
    this.isChangeBigPartEnabled=true,
    this.isBodyPartVisible=false;
    this.bigPartId=1;
    this.bodyPartId=1;
    this.buildingId="2";
    this.otdelId="19";
    this.serviceId="1";
    this.scheduleMonthHtml="";
    this.editMode=0;
    //
    this.dataSources={
        buildingsData: [
            { text: "Стационар", value: "1" },
            { text: "Поликлиника", value: "2" }
        ],
        otdelsData: [
            { text: "Женская консультация", value: "12" },
            { text: "Терапевтическое отделение", value: "19" }
        ],
        servicesData: [
            { text: "Забор венозной крови", value: "1" },
            { text: "Забор капиллярной крови", value: "2" }
        ]

    };
    this.initControls=function() {
        var that=this;
        $("#schedule-building").kendoDropDownList({
            dataTextField: "text",
            dataValueField: "value",
            dataSource: this.dataSources.buildingsData,
            index: 2,
            change: function(e) {
                that.set("scheduleMonthHtml","");
            }
        });
        $("#schedule-otdel").kendoDropDownList({
            autoWidth:true,
            dataTextField: "text",
            dataValueField: "value",
            dataSource: this.dataSources.otdelsData,
            index: 2,
            change: function(e) {
                that.set("scheduleMonthHtml","");
            }
        });
        $("#schedule-service").kendoDropDownList({
            cascadeFrom:"schedule-body-part",
            cascadeFromField: "value",
            dataTextField: "text",
            dataValueField: "value",
            dataSource: this.dataSources.servicesData,
            change: function(e) {
                that.set("serviceId",this.value());
                that.set("scheduleMonthHtml","");
                that.scheduleQuery();
            }
        });

    };
    this.scheduleData={
        date: null,
        dateString:"",
        dateWeekDay:"",
        patientId:"",
        patientName:"",
        cabinetId: null,
        cabinetNum:"" ,
        cabinetTime: null,
        cabinetTimeString:"",
        ticketsHtml:"",
        ticketId:0,
        reserveText:"Зарезервировать",
        undoReserveText:"Отменить",
        isReserveAvailable:false,
        isUndoReserveAvailable:false,
        isScheduleVisible: true,
        isDetailsVisible: false,
        serviceDetailsHtml:"",
        isGroupsVisible: false,
        selectedGroup: null,
        groupsDataSource: new kendo.data.DataSource({data:[],pageSize:5000}),
        curSelectedExamsDataSource: new kendo.data.DataSource(
            {data:[],
            schema: {model: { id: "id" }},
            pageSize:5000,
            change: function(e) {
                var model=schedulerModel;
                model.set("isChangeBigPartEnabled",!(this.data().length));
            }
            }),
        selectedExams:"",
        curSelectedExams:"",
        selectedExamsHtml:"",
        curSelectedExamsHtml:"",
        isSaveTicketAvailable:false,
        treeViewDataSource: kendo.observableHierarchy([]),
        onGroupsWidgetChange: function(e) {
//            console.log(this.selectedGroup);
            if (schedulerModel.scheduleData.selectedGroup) {
                schedulerModel.createExamsTree(schedulerModel.scheduleData.selectedGroup.id);
            }
        },
        processLevel: function(item,id) {
            if (item.id==id) {
                return item;
            }
            if (item.hasChildren) {
                return schedulerModel.scheduleData.processLevel2(item.items,id);
            }
            return null;
        },
        processLevel2: function(items,id) {
            for (var i=0;i<items.length;i++) {
                var item=items[i];
                if (item.id==id) {
                    return item;
                }
                if (item.hasChildren) {
                    return schedulerModel.scheduleData.processLeve2(item.items,id);
                }
            }
            return null;
        },
        onSelectedListItemChange: function(e) {
            var selectedItems = e.sender.select();
            var id=Number($(selectedItems[0]).data("base-id"));
            var listViewData=$(e.sender.element).data("kendoListView");
            var ds=listViewData.dataSource;
            var dataItem=ds.get(id);
            ds.remove(dataItem);
            var treeViewDs=schedulerModel.scheduleData.treeViewDataSource;
            var dataEl=null;
            for (var i=0; i<treeViewDs.length;i++) {
                var curItem=treeViewDs[i];
                dataEl= schedulerModel.scheduleData.processLevel(curItem,id);
                if (dataEl) {
                    break;
                }
            };
            if (dataEl) {
                dataEl.set("checked",false);
            }
            // var flatArray=flatten(treeViewDs.toJSON());

        },
        refreshSelectedDataSource: function(treeViewData) {
            var ds=schedulerModel.scheduleData.curSelectedExamsDataSource;
            var mainDs=schedulerModel.scheduleServiceDetailsDS;
            var items= treeViewData.items();
            var iLength=treeViewData.items().length;
            for (var i=0;i<iLength;i++) {
                var dataItem=treeViewData.dataItem(items[i]);
                if (!(dataItem.hasChildren)) {
                    if ((dataItem.checked)) {
                        if (!(ds.get(Number(dataItem.id)))) {
                            var oItem=mainDs.get(dataItem.id);
                            var newItem={id:oItem.id,
                                short_name:oItem.short_name,
                                full_name:oItem.full_name,
                                level_num:oItem.level_num,
                                big_part_id:oItem.big_part_id,
                                body_part_id:oItem.body_part_id,
                                is_folder:oItem.is_folder,
                                parent_id:oItem.parent_id,
                                checkStatus:1
                            };
                            ds.add(newItem);
                        }
                    }
                    else {
                        if ((ds.get(Number(dataItem.id)))) {
                            ds.remove(ds.get(Number(dataItem.id)));
                        }
                    }
                }
            }
        },
        onExpandNode: function(e) {
            if (e.node) {
                var treeView=$(e.sender.element);
                var treeViewData=$(treeView).data("kendoTreeView");
                var dataItem=treeViewData.dataItem(e.node);
                dataItem.set("spriteCssClass","fa fa-folder-open-o");
            }
        },
        onCollapseNode: function(e) {
            if (e.node) {
                var treeView=$(e.sender.element);
                var treeViewData=$(treeView).data("kendoTreeView");
                var dataItem=treeViewData.dataItem(e.node);
                dataItem.set("spriteCssClass","fa fa-folder-o");
            }
        },
        onCheckNode: function(e) {
            if (e.node) {
                var treeView=$(e.sender.element);
                var treeViewData=$(treeView).data("kendoTreeView");
                var dataItem=treeViewData.dataItem(e.node);
                if ((dataItem.checked) && (dataItem.hasChildren)) {
                    treeViewData.expand(e.node);
                }
            }
            this.scheduleData.refreshSelectedDataSource(treeViewData);
        },
        refresh: function() {
            schedulerModel.scheduleQueryDay(this.date);
        },
        reserve: function() {
            schedulerModel.scheduleAddTicket(this);
        },
        undoReserve: function() {
            schedulerModel.scheduleDeleteTicket(this.ticketId);
        },
        doSelectExams:function() {
            var model=schedulerModel;
            model.set("scheduleData.selectedGroup",this.groupsDataSource.data()[0]);
            this.onGroupsWidgetChange(this.selectedGroup);
            var wnd=$("#schedule-exams-window").data("kendoWindow");
            if (wnd.element.is(":hidden")) {
                wnd.open().title("Исследования").center();
            }
        },
        closeExamsWindow: function() {
            var wnd=$("#schedule-exams-window").data("kendoWindow");
            wnd.close();
        },
        saveToTicket: function() {
            var model=schedulerModel;
            model.set("scheduleData.selectedExams",model.get("scheduleData.curSelectedExams"));
            this.closeExamsWindow();
        },
        expandCollapseNextLevel: function(treeView,iMode) {
            if (iMode) {
                treeView.expand(".k-item");
            }
            else {
                treeView.collapse(".k-item");
            }
        },
        collapseAll: function() {
            var treeView = $("#schedule-tree-view").data("kendoTreeView");
            if (!treeView) {
                return;
            }
            var b = $('.k-item .k-minus').length;
            if (b) {
                this.expandCollapseNextLevel(treeView,0);
            }
        },
        expandAll: function() {
            var treeView = $("#schedule-tree-view").data("kendoTreeView");
            if (!treeView) {
                return;
            }
            var b = $('.k-item .k-plus').length;
            if (b) {
                this.expandCollapseNextLevel(treeView,1);
            }
        },
        clearSearch:function() {
            $("#schedule-tree-filterText").val("");
            this.searchInTree("");
        },
        searchInTree:function(filterText) {
            var treeView = $("#schedule-tree-view").data("kendoTreeView");
            if (!treeView) {
                return;
            }

            if (filterText !== "") {

                $("#schedule-tree-view .k-group .k-group .k-in").closest("li").hide();
                $("#schedule-tree-view .k-group").closest("li").hide();
                $("#schedule-tree-view .k-in:Contains(" + filterText + ")").each(function () {
                    $(this).parents("ul, li").each(function () {
                        var treeView = $("#schedule-tree-view").data("kendoTreeView");
                        treeView.expand($(this).parents("li"));
                        $(this).show();
                    });
                });
                $("#schedule-tree-view .k-group .k-in:Contains(" + filterText + ")").each(function () {
                    $(this).parents("ul, li").each(function () {
                        $(this).show();
                    });
                });
            }
            else {
//                return;
                $("#schedule-tree-view .k-group").find("li").show();
                var nodes = $("#schedule-tree-view > .k-group > li");

                $.each(nodes, function (i, val) {
                    if (nodes[i].getAttribute("data-expanded") == null) {
//                        $(nodes[i]).find("li").hide();
                    }
                });

            }
        }

    };
    this.selectExams=function() {
        var model=this;
        model.set("scheduleData.selectedGroup",this.scheduleData.groupsDataSource.data()[0]);
        this.scheduleData.onGroupsWidgetChange(this.scheduleData.selectedGroup);
        var wnd=$("#schedule-exams-window").data("kendoWindow");
        if (wnd.element.is(":hidden")) {
            wnd.open().title("Исследования").center();
        }

    };
    this.clearTicket= function() {
        this.set("scheduleData.cabinetId",null);
        this.set("scheduleData.cabinetNum","");
        this.set("scheduleData.cabinetTime",null);
        this.set("scheduleData.cabinetTimeString","");
        this.set("scheduleData.ticketId",0);
    };

    //
    this.scheduleDeleteTicketDS=new kendo.data.DataSource({
        type: "json",
        serverPaging: false,
        serverSorting: false,
        serverFiltering: false,
        pageSize: 500,
        transport: {
            read: "default.aspx?action=pk/pk_schedule_AJAX&action2=delete",
            dataType: "json"
        },
        requestStart: function(e) {
            try {
                // $("#shedule-data").hide();
                kendo.ui.progress($("#schedule-day-window"), true);
                kendo.ui.progress($("#headerInfo"), true);
            }
            catch (e) {
            }
        },
        requestEnd: function(e) {
            kendo.ui.progress($("#schedule-day-window"), false);
            _onRequestEnd(e);
        },

        schema: {
            data: "ticket.rows",
            total: "records",
            errors: "error",
            model: {
                fields: {
                    ticked_id: {
                        type: "number"
                    },
                    ticket_error:{
                        type: "string"
                    }
                }
            }
        },
        change: function (e) {
            var data=this.data();
            var model=schedulerModel;
            var ticketId=data[0].ticket_id;
            var ticketError=data[0].ticket_error;
            if (ticketError) {
                alertify.alert(ticketError);
            }
            else {
                model.set("scheduleData.ticketId", ticketId);
            }
            model.scheduleQueryDay(model.get("scheduleData.date"));
        },
        error: function(e) {
            ajax_error(e);
        }
    });
    //
    //
    this.scheduleServiceDetailsDS=new kendo.data.DataSource({
        type: "json",
        serverPaging: false,
        serverSorting: false,
        serverFiltering: false,
        pageSize: 50,
        transport: {
            read: "default.aspx?action=pk/pk_schedule_AJAX&action2=service_details",
            dataType: "json"
        },
        requestStart: function(e) {
            try {
                // $("#shedule-data").hide();
                kendo.ui.progress($("#schedule-day-window"), true);
                kendo.ui.progress($("#headerInfo"), true);
            }
            catch (e) {
            }
        },
        requestEnd: function(e) {
            kendo.ui.progress($("#schedule-day-window"), false);
            _onRequestEnd(e);
        },
        schema: {
            data: "service_details.rows",
            total: "records",
            errors: "error",
            model: {
                id: "id",
                fields: {
                    id: {type: "number"},
                    is_folder:{type:"number"},
                    parent_id:{type:"number"},
                    level_num:{type:"number"},
                    short_name:{type: "string"},
                    full_name: {type:"string"},
                    big_part_id:{type:"number"},
                    body_part_id:{type:"number"},
                    ext1:{type:"string"},
                    ext2:{type:"string"},
                    ext3:{type:"string"},
                    int1:{type:"number"},
                    int2:{type:"number"},
                    int3:{type:"number"}
                }
            }
        },
        change: function (e) {
            var model=schedulerModel;
            model.createGroupsDataSource(this);
            model.set("scheduleData.selectedGroup",model.scheduleData.groupsDataSource.data()[0]);
            if (model.get("editMode")) {
                model.getTicketExamsDS.read({ticket_id:model.get("scheduleData.ticketId")});
            }
        },
        error: function(e) {
            ajax_error(e);
        }
    });
    //
    this.getTicketExamsDS=new kendo.data.DataSource({
        type: "json",
        serverPaging: false,
        serverSorting: false,
        serverFiltering: false,
        pageSize: 5000,
        transport: {
            read: "default.aspx?action=pk/pk_schedule_AJAX&action2=get_ticket_exams",
            dataType: "json"
        },
        requestStart: function(e) {
            try {
                // $("#shedule-data").hide();
                kendo.ui.progress($("#schedule-day-window"), true);
                kendo.ui.progress($("#headerInfo"), true);
            }
            catch (e) {
            }
        },
        requestEnd: function(e) {
            kendo.ui.progress($("#schedule-day-window"), false);
            _onRequestEnd(e);
        },
        schema: {
            data: "ticket_exams.rows",
            total: "records",
            errors: "error",
            model: {
                id: "id",
                fields: {
                    id: {type: "number"},
                    ticket_id:{type:"number"},
                    exam_id:{type:"number"},
                    int1:{type:"number"},
                    int2:{type:"number"},
                    int3:{type:"number"}
                }
            }
        },
        change: function (e) {
            var model=schedulerModel;
            var data=this.data();
            var sStr="";
            for (var i=0;i<data.length;i++) {
                sStr=sStr+data[i].exam_id.toString();
                if (i<data.length-1) {
                    sStr=sStr+",";
                }
            }
            model.set("scheduleData.selectedExams",sStr);
            model.set("scheduleData.curSelectedExams",sStr);
            var sHtml=model.createServiceDetailsHtml(this);
            model.set("scheduleData.serviceDetailsHtml",sHtml);
        },
        error: function(e) {
            ajax_error(e);
        }
    });
    //
    this.scheduleReserveDS=new kendo.data.DataSource({
        type: "json",
        serverPaging: false,
        serverSorting: false,
        serverFiltering: false,
        pageSize: 50,
        transport: {
            read: "default.aspx?action=pk/pk_schedule_AJAX&action2=reserve",
            dataType: "json"
        },
        requestStart: function(e) {
            try {
                // $("#shedule-data").hide();
                kendo.ui.progress($("#schedule-day-window"), true);
            }
            catch (e) {
            }
        },
        requestEnd: function(e) {
            kendo.ui.progress($("#schedule-day-window"), false);
            _onRequestEnd(e);
        },
        schema: {
            data: "ticket.rows",
            total: "records",
            errors: "error",
            model: {
                fields: {
                    ticked_id: {
                        type: "number"
                    },
                    ticket_error:{
                        type: "string"
                    }
                }
            }
        },
        change: function (e) {
            var data=this.data();
            var model=schedulerModel;
            var ticketId=data[0].ticket_id;
            var ticketError=data[0].ticket_error;
            if (ticketError) {
                alertify.alert(ticketError);
            }
            else {
                model.set("scheduleData.ticketId", ticketId);
                model.scheduleQueryServiceDetails(model.get("bigPartId"),model.get("bodyPartId"));
            }
            model.scheduleQueryDay(model.get("scheduleData.date"));
        },
        error: function(e) {
            ajax_error(e);
        }
    });
    //
    this.scheduleMonthViewDS=new kendo.data.DataSource({
        type: "json",
        serverPaging: false,
        serverSorting: false,
        serverFiltering: false,
        pageSize: 50,
        transport: {
            read: "default.aspx?action=pk/pk_schedule_AJAX&action2=month",
            dataType: "json"
        },
        requestStart: function(e) {
            try {
                // $("#shedule-data").hide();
                kendo.ui.progress($("#headerInfo"), true);
            }
            catch (e) {
            }
        },
        requestEnd: _onRequestEnd,
        schema: {
            data: "shed_mon.rows",
            total: "records",
            errors: "error",
            model: {
                fields: {
                    w_date: {
                        type: "date"
                    },
                    w_quantity:{
                        type: "number"
                    },
                    w_sheduled:{
                        type: "number"
                    },
                    w_empty:{
                        type: "number"
                    },
                    w_is_work: {
                        type: "number"
                    }
                }
            },
            sort: {
                field: "w_date", dir: "asc"
            }
        },
        change: function (e) {
            var model=schedulerModel;
            var sHtml=model.createScheduleMonthHtml(this);
            model.set("scheduleMonthHtml",sHtml);
            var that=this;
            // function to open dayWindow
            $("div.schedule-clickable").on("click",function(e) {
                var uid=$(this).data("uid");
                if (uid) {
                    var dataItem=that.getByUid(uid);
                    if (dataItem) {
                        if ((dataItem.w_is_work>0) && (dataItem.w_empty>0)) {
                            var model=schedulerModel;
                            var oPers=model.get("selectedPerson");
                            if (oPers) {
                                model.set("scheduleData.date", dataItem.w_date);
                                model.set("scheduleData.dateString", kendo.toString(dataItem.w_date, "dd.MM.yyyy"));
                                model.set("scheduleData.dateWeekDay", dataItem.w_dow_fname);
                                if (model.get("selectedPersonType")==="PK") {
                                    model.set("scheduleData.patientId", oPers.pin);
                                    var sFio = "";
                                    sFio = sFio + oPers.fam.trim() + ' ';
                                    sFio = sFio + oPers.ima.trim() + ' ';
                                    sFio = sFio + oPers.otch.trim();
                                    model.set("scheduleData.patientName", sFio);
                                }
                            }
                            model.scheduleQueryDay(dataItem.w_date);
                        }
                    }
                }
            });
        },
        error: function(e) {
            ajax_error(e);
        }
    });
    this.scheduleViewDayDS=new kendo.data.DataSource({
        type: "json",
        serverPaging: false,
        serverSorting: false,
        serverFiltering: false,
        pageSize: 3000,
        transport: {
            read: "default.aspx?action=pk/pk_schedule_AJAX&action2=day",
            dataType: "json"
        },
        requestStart: function(e) {
            try {
                kendo.ui.progress($("#headerInfo"), true);
                var model=schedulerModel;
                model.set("scheduleData.ticketsHtml","");
            }
            catch (e) {
            }
        },
        requestEnd: _onRequestEnd,
        schema: {
            data: "shed_day.rows",
            total: "records",
            errors: "error",
            model: {
                fields: {
                    w_date: {
                        type: "date"
                    },
                    w_time: {
                        type: "date"
                    },
                    w_dow: {
                        type:"number"
                    },
                    w_quantity:{
                        type: "number"
                    },
                    w_sheduled:{
                        type: "number"
                    },
                    w_empty:{
                        type: "number"
                    },
                    w_is_work: {
                        type: "number"
                    },
                    w_cabinet_id: {
                        type:"number"
                    },
                    w_service_id: {
                        type:"number"
                    },
                    w_building_id: {
                        type:"number"
                    }
                }
            },
            sort: {
                field: "w_date", dir: "asc",
                field:"w_time", dir:"asc"
            }
        },
        change: function (e) {
            var model=schedulerModel;
            var sHtml=model.createScheduleDayHtml(this);
            model.set("scheduleData.ticketsHtml",sHtml);
            var wnd=$("#schedule-day-window").data("kendoWindow");
            if (wnd.element.is(":hidden")) {
                wnd.open().title("Талон").center();
            }
            var that=this;
            $("td.schedule-day-clickable").on("click",function(e) {
                var uid=$(this).data("uid");
                if (uid) {
                    var dataItem=that.getByUid(uid);
                    if (dataItem) {
                        if (dataItem.w_empty>0) {
                            var model=schedulerModel;
                            model.set("scheduleData.cabinetId",dataItem.w_cabinet_id);
                            model.set("scheduleData.cabinetNum",dataItem.w_cabinet_num);
                            model.set("scheduleData.cabinetTime",dataItem.w_time);
                            model.set("scheduleData.cabinetTimeString",dataItem.w_time_s);
                        }
                    }
                }
            });

        },
        error: function(e) {
            ajax_error(e);
        }
    });
    //
    this.scheduleQueryServiceDetails=function(iBigPartId,iBodyPartId) {
        var model=schedulerModel;
        model.scheduleServiceDetailsDS.read({
            big_part_id:iBigPartId,
            body_part_id:iBodyPartId
        });
    };
    this.scheduleQuery=function() {
        //
        var d2=addDays(new Date(),31);
//        this.set("serviceId",$("#schedule-service").data("kendoDropDownList").value())
        this.scheduleMonthViewDS.read({
            building_id:this.buildingId,
            otdel_id:this.otdelId,
            service_id:this.serviceId,
            d1:kendo.toString(new Date(),"yyyyMMdd"),
            d2:kendo.toString(d2,"yyyyMMdd")
        })
    };
    this.scheduleQueryDay=function(dDate) {
        this.scheduleViewDayDS.read({
            building_id:this.buildingId,
            otdel_id:this.otdelId,
            service_id:this.serviceId,
            d1:kendo.toString(dDate,"yyyyMMdd")
        })
    };
    //


    //
    this.scheduleAddTicket=function(shedData) {
        var model=schedulerModel;
        var ticketId=shedData.ticketId;
        var ticketDate=kendo.toString(shedData.date,"yyyyMMdd");
        var ticketTime=shedData.cabinetTimeString;
        var cabinetId=shedData.cabinetId;
        var reserverId=Number(localStorage['last_user']);
        var patientId=shedData.patientId;
        var patientName=shedData.patientName;
        model.scheduleReserveDS.read({
            ticket_id:ticketId.toString(),
            d1: ticketDate,
            t1:ticketTime,
            building_id:model.buildingId,
            otdel_id:model.otdelId,
            service_id:model.serviceId,
            cabinet_id:cabinetId.toString(),
            patient_id:patientId,
            patient_name:patientName,
            reserver_id:reserverId.toString()
        })
    };
    //
    this.scheduleDeleteTicket=function(ticketId) {
        var model=schedulerModel;
        model.scheduleDeleteTicketDS.read({
            ticket_id:ticketId.toString()
        })
    };
    //
    this.processExamsTable= function(data, idField, foreignKey, rootLevel) {
        var hash = {};

        for (var i = 0; i < data.length; i++) {
            var item = data[i];
            var id = item[idField];
            var parentId = item[foreignKey];

            hash[id] = hash[id] || [];
            hash[parentId] = hash[parentId] || [];

            item.items = hash[id];
            hash[parentId].push(item);
        }

        return hash[rootLevel];
    };
    //
    this.createGroupsDataSource=function(ds) {
        var model=schedulerModel;
        var data=ds.data();
        var groupsDs=model.scheduleData.groupsDataSource;
        while (groupsDs.data().length) {
            groupsDs.remove(groupsDs.at(0));    // clear
        }
        for (var i=0; i<data.length; i++) {
            if ((data[i].level_num==1) && (data[i].is_folder)) {
                groupsDs.add(data[i]);
            }
        }
        groupsDs.add({id:model.get("maxInteger"), short_name: "Все"});

        model.trigger("change", {field: "scheduleData.groupsDataSource"});
        model.trigger("change", {field: "scheduleData.selectedGroup"});

    };
    //
    this.createExamsTree=function(iGroupId) {
        var model=schedulerModel;
        var oEmpty=kendo.observableHierarchy([]);
        if (!iGroupId) {
            model.set("scheduleData.treeViewDataSource",oEmpty);
//            return oEmpty;
        }
        if (iGroupId==model.maxInteger) {
            iGroupId=0;
        }
        var data=model.scheduleServiceDetailsDS.data();
        if (!data) {
            model.set("scheduleData.treeViewDataSource",oEmpty);
//            return oEmpty;
        }
        var flatData=[];
        var ds=model.scheduleData.curSelectedExamsDataSource;
        for (var i=0;i<data.length;i++) {
            var dataItem=data[i];
            var checked=false;
            var expanded=false;
            if (ds.get(dataItem.id)) {
                checked=true;
                expanded=true;
            }
            var item;
            if (!dataItem.is_folder) {
                item = {id: dataItem.id, parent: dataItem.parent_id,
                    text: dataItem.short_name, hasChildren:dataItem.is_folder, checked: checked, expanded:expanded};
            } else {
                item = {id: dataItem.id, parent: dataItem.parent_id, text: dataItem.short_name,
                    hasChildren:dataItem.is_folder, checked: checked, expanded:expanded, spriteCssClass: "fa fa-folder-o"};
            }
            flatData.push(item);
        }
        var newData=model.processExamsTable(flatData, "id", "parent", iGroupId);
        model.set("scheduleData.treeViewDataSource",newData);
        $("#schedule-tree-view").data("kendoTreeView").updateIndeterminate();
//        model.scheduleData.treeViewDataSource.data(newData);
//        return kendo.observableHierarchy(newData);
    };
    //
    this.createExamsTreeOld=function(iGroupId) {
        var model=schedulerModel;
        var treeWidget=$("#schedule-tree-view");
        var treeWidgetData=$(treeWidget).data("kendoTreeView");
        if (treeWidgetData) {
            treeWidgetData.destroy();
            treeWidget.empty();
        }
        if (!iGroupId) {
            return;
        }
        if (iGroupId==model.maxInteger) {
            iGroupId=0;
        }
        var data=model.scheduleServiceDetailsDS.data();
        if (!data) {
            return ;
        }
        var flatData=[];
        for (var i=0;i<data.length;i++) {
            var dataItem=data[i];
            var item;
            if (!dataItem.is_folder) {
                item = {id: dataItem.id, parent: dataItem.parent_id, text: dataItem.short_name};
            } else {
                item = {id: dataItem.id, parent: dataItem.parent_id, text: dataItem.short_name, spriteCssClass: "fa fa-folder-o"};
            }
            flatData.push(item);
        }
        $("#schedule-tree-view").kendoTreeView({
            dataSource: model.processExamsTable(flatData, "id", "parent", iGroupId),
            loadOnDemand: false ,
            checkboxes: {
                checkChildren: true
            },
            expand: function(e) {
//                console.log("Expand", e.node);
                if (e.node) {
                    $(e.node).find(".k-sprite").first().removeClass("fa-folder-o").addClass("fa-folder-open-o");
                }
            },
            collapse: function(e) {
//                console.log("Collapse", e.node);
                if (e.node) {
                    $(e.node).find(".k-sprite").first().removeClass("fa-folder-open-o").addClass("fa-folder-o");
                }
            },
            check: function(e) {
                var checkedNodes = [], newChecked=[], notChecked=[],
                    treeView = $("#schedule-tree-view").data("kendoTreeView"),
                    model=schedulerModel;

                    var node=treeView.dataItem(e.node);
                    if (node.checked) {
                        treeView.expand(e.node);
                    }

                var aPrevChecked=[];
                if (model.get("scheduleData.curSelectedExams"))
                    aPrevChecked=model.get("scheduleData.curSelectedExams").split(",");
                scheduleGetCheckedNodesIds(treeView.dataSource.view(), checkedNodes,1);
                for (var i=0;i<checkedNodes.length;i++) {
                    if (aPrevChecked.indexOf(checkedNodes[i].toString())<0) {
                        newChecked.push(checkedNodes[i]);
                    }
                }
                for (var i=0; i<newChecked.length; i++) {
                    aPrevChecked.push(newChecked[i]);
                }
                scheduleGetCheckedNodesIds(treeView.dataSource.view(), notChecked,0);
                for (var i=0; i<notChecked.length; i++) {
                    var idx=aPrevChecked.indexOf(notChecked[i].toString());
                    if (idx>=0) {
                        aPrevChecked.splice(idx,1); // delete
                    }
                }
                model.set("scheduleData.curSelectedExams",aPrevChecked.join(','));
            }

        });

        treeWidgetData=$(treeWidget).data("kendoTreeView");
        var aPrevChecked=[];
        if (model.get("scheduleData.curSelectedExams"))
            aPrevChecked=model.get("scheduleData.curSelectedExams").split(",");
        if (aPrevChecked.length) {
            var items=treeWidgetData.items();
            for (var i=0;i<items.length;i++) {
                var dataItem=treeWidgetData.dataItem(items[i]);
                if (aPrevChecked.indexOf(dataItem.id.toString())>=0) {
                    dataItem.set("checked",true);
                }
            }
        }
        $("#schedule-tree-view .k-icon").addClass("tree-plus-minus").addClass("margin-right-10px");
        $("#schedule-tree-view .k-sprite").addClass("margin-right-10px");
        $("#schedule-tree-view input").addClass("check_row").addClass("margin-right-10px");

    };
    //
    this.createServiceDetailsHtml=function(ds) {    // not used
        // the tree for visualizing data
        var model=schedulerModel;
        var data=ds.data();
        var flatData=[];
        for (var i=0;i<data.length;i++) {
            var dataItem=data[i];

            var item;
            if (!dataItem.is_folder) {
                item = {id: dataItem.id, parent: dataItem.parent_id, text: dataItem.short_name};
            } else {
                item = {id: dataItem.id, parent: dataItem.parent_id, text: dataItem.short_name, spriteCssClass: "fa fa-folder-o"};
            };
            flatData.push(item);
        }
        var treeWidget=$("#schedule-tree-view");
        var treeWidgetData=$(treeWidget).data("kendoTreeView");
        if (treeWidgetData) {
            treeWidgetData.destroy();
            treeWidget.empty();
//            treeWidgetData.remove();
        }
        $("#schedule-tree-view").kendoTreeView({
            dataSource: model.processExamsTable(flatData, "id", "parent", 55),
            loadOnDemand: false ,
            checkboxes: {
                checkChildren: true
            },
            expand: function(e) {
                console.log("Expand", e.node);
                if (e.node) {
                    $(e.node).find(".k-sprite").first().removeClass("fa-folder-o").addClass("fa-folder-open-o");
                }
            },
            collapse: function(e) {
                console.log("Collapse", e.node);
                if (e.node) {
                    $(e.node).find(".k-sprite").first().removeClass("fa-folder-open-o").addClass("fa-folder-o");
                }
            }

        });
        $("#schedule-tree-view .k-icon").addClass("tree-plus-minus").addClass("margin-right-10px");
        $("#schedule-tree-view .k-sprite").addClass("margin-right-10px");
        $("#schedule-tree-view input").addClass("check_row").addClass("margin-right-10px");
        var sHtml="";
        if (!data.length) {
            return sHtml;
        }
        var iGroups1Cnt=0;
        var aLevel1=[];
        var aLevel1Groups=[];
        for (var i=0;i<data.length;i++) {
            // get level1 groups (is_folder)
            var dataItem=data[i];
            if ((dataItem.level_num==1)) {
                if (dataItem.is_folder==1) {
                    iGroups1Cnt++;
                    aLevel1Groups.push(dataItem);
                }
                else {
                    aLevel1.push(dataItem);
                }
            }
        }
        var groupsDs=model.scheduleData.groupsDataSource;
        if (iGroups1Cnt) {
            while (groupsDs.data().length) {
                groupsDs.remove(groupsDs.at(0));
            }
            for (var i=0; i<iGroups1Cnt;i++) {
                groupsDs.add(aLevel1Groups[i]);
            }
            model.trigger("change", {field: "scheduleData.groupsDataSource"});
            model.set("scheduleData.isGroupsVisible",true);
        }
        else {
            model.set("scheduleData.isGroupsVisible",false);
        }
        if (!iGroups1Cnt) {
            iGroups1Cnt=3;
        }
        var iColPercent=Math.round(100/iGroups1Cnt);
        sHtml="<TABLE class='schedule-exams-level1-table'>";
        sHtml=sHtml+"<colgroup>";
        for (var i=0;i<iGroups1Cnt;i++) {
            if (i==(iGroups1Cnt-1)) {
                sHtml=sHtml+"<col />";
            }
            else {
                sHtml=sHtml+"<col style='width:"+iColPercent.toString()+"%' />";
            }
        }
        sHtml=sHtml+"</colgroup>";
        sHtml=sHtml+"<tbody>";
        if (aLevel1.length) {
            for (var i=0;i<aLevel1.length;i++) {
                if ((i%iGroups1Cnt)==0) {
                    if (i>0) {
                        sHtml=sHtml+"</TR>";
                    }
                    sHtml=sHtml+"<TR>";
                }
                var dataItem=aLevel1[i];
                sHtml=sHtml+"<TD>";
                var sClass="schedule-service-detail";
                var sInputId="sh-serv-detail-"+i.toString();
                sHtml=sHtml+"<DIV class='"+sClass+"' data-uid='"+dataItem.uid+"' >";
                sHtml=sHtml+"<INPUT type='checkbox' id='"+sInputId+"' class='k-checkbox'/>";
                sHtml=sHtml+"<LABEL class='k-checkbox-label service-detail-label' for='"+sInputId+"' >"+dataItem.short_name+"</LABEL>";
                sHtml=sHtml+"</DIV>";
                sHtml=sHtml+"</TD>";
            }
            var reminder=(aLevel1.length%iGroups1Cnt);
            if (reminder) {
                for (var i=reminder+1;i<=iGroups1Cnt;i++) {
                    sHtml=sHtml+"<TD>&nbsp;</TD>";
                }
                sHtml=sHtml+"</TR>";
            }
        }
        sHtml=sHtml+"</tbody>";
        sHtml=sHtml+"</TABLE>";
        return sHtml;
    };
    this.createScheduleDayHtml=function(ds) {
        var model=schedulerModel;
        var sHtml="";
        var data=ds.data();
        if (!data.length) {
            return sHtml;
        }
        var aDisabled=[];
        if (data[0].w_service_id==1) {
            // венозная кровь
            // попытка уровнять нагрузку
            for (var i=0;i<data.length;i++) {
                var dataItem = data[i];
                for (var j=0;j<data.length;j++) {
                    if (j==i) {
                        continue;
                    }
                    var dataItem2=data[j];
                    if (dataItem2.w_time_s==dataItem.w_time_s) {
                        if  (dataItem2.w_building_id==dataItem.w_building_id) {
                            if  (!(dataItem2.w_cabinet_id==dataItem.w_cabinet_id)) {
                                if ((dataItem2.w_quantity==dataItem.w_quantity)
                                        && (dataItem2.w_empty>dataItem.w_empty)) {
                                    aDisabled.push(i);
                                }
                            }
                        }
                    }
                }
            }
        }
        sHtml="<TABLE class='schedule-day-table'>";
        for (var i=0;i<data.length;i++) {
            var dataItem=data[i];
            if ((i%4)==0) {
                if (i>0) {
                    sHtml=sHtml+"</TR>";
                }
                sHtml=sHtml+"<TR>";
            }
            var sClass="schedule-day-talon ";
            if (aDisabled.indexOf(i)<0) {
                sClass=sClass+"schedule-day-clickable";
            }
            else {
                sClass=sClass+"schedule-day-disabled";
            }

            sHtml=sHtml+"<TD class='"+sClass+"' data-uid='"+dataItem.uid+"'>";
            sHtml=sHtml+"<DIV class='schedule-cabinet'>"+dataItem.w_cabinet_num+"&nbsp;&nbsp;&nbsp;"+dataItem.w_time_s+"</DIV>";
            sHtml=sHtml+"<DIV class='schedule-cabinet-empty'>"+model.getScheduleAvailableAsString(dataItem.w_empty,1,dataItem.w_sheduled)+"&nbsp;</DIV>";
            sHtml=sHtml+"</TD>";
        }
        sHtml=sHtml+"</TR></TABLE>";
        return sHtml;
    };
    this.createScheduleMonthHtml=function(ds) {
        var model=schedulerModel;
        var sHtml="";
        var data=ds.data();
        sHtml=sHtml+"<div class='schedule-month-main' style='margin-top:5px;margin-bottom:5px;margin-left:5px'margin-right:5px>";
        if (!data.length) {
            return sHtml;
        }
        var j=0;
        for (var i=0;i<data.length;i++) {
            var dataItem = data[i];
            var isWork=dataItem.w_is_work;
            if (isWork<=0) {
                continue;
            }
            if ((j%2)==0) {
                sHtml=sHtml+"<div style='width:100%'>";
                if (j>0) {
                    sHtml=sHtml+"</div>";
                }
            }
            var sClass="schedule-day";
            if (dataItem.w_empty>0) {
                sClass=sClass+" schedule-clickable";
            }
            if ((kendo.toString(dataItem.w_date,"yyyyMMdd"))==(kendo.toString(new Date(),"yyyyMMdd"))) {
                sClass=sClass+" schedule-today";
            }
            sHtml=sHtml+"<div style='display:inline-block;width:45%' class='"+sClass+"' data-uid='"+dataItem.uid+"'>";
            sHtml=sHtml+"<DIV class='schedule-date'>"+model.getShortDateTitle(dataItem.w_date)+"&nbsp;"+dataItem.w_dow_sname+"</DIV>";
            sHtml=sHtml+"<DIV class='schedule-empty'>"+model.getScheduleAvailableAsString(dataItem.w_empty,isWork,dataItem.w_sheduled)+"&nbsp;</DIV>";
            sHtml=sHtml+"</div>";
            if ((j%2)==0) {
                sHtml=sHtml+"<div style='display:inline-block; width:2%'>&nbsp;</div>";
            }
            j++;
        }
        if ((j%2)==0) {
            sHtml=sHtml+"<div style='display:inline-block;width:49%' >&nbsp;</div>";
        }
        sHtml=sHtml+"</div>";
        return sHtml;
    };
    this.createScheduleMonthHtmlOld=function(ds) {
        var model=schedulerModel;
        var sHtml="";
        var data=ds.data();
        if (!data.length) {
            return sHtml;
        }
        sHtml="<TABLE class='schedule-month-table'>";
        sHtml=sHtml+"<THEAD>";
        sHtml=sHtml+"<TR>";
        for (var i=0;i<7;i++) {
            var dataItem=data[i];

            sHtml=sHtml+"<TH><DIV class='schedule-day-names'>"+dataItem.w_dow_sname+"</DIV></TH>";

        }
        sHtml=sHtml+"</TR>";
        sHtml=sHtml+"</THEAD>";

        for (var i=0;i<data.length;i++) {
            var dataItem=data[i];
            var isWork=dataItem.w_is_work;
            if (dataItem.w_dow==1) {
                if (i>0) {
                    sHtml=sHtml+"</TR>";
                }
                sHtml=sHtml+"<TR>";
            }
            var sClass="schedule-day";
            if (isWork<0) {
                sClass=sClass+" schedule-past-date";
            }
            if (isWork==0) {
                sClass=sClass+" schedule-holiday-date";
            }
            if (dataItem.w_empty>0) {
                sClass=sClass+" schedule-clickable";
            }
            if ((kendo.toString(dataItem.w_date,"yyyyMMdd"))==(kendo.toString(new Date(),"yyyyMMdd"))) {
                sClass=sClass+" schedule-today";
            }

            sHtml=sHtml+"<TD class='"+sClass+"' data-uid='"+dataItem.uid+"'>";
            sHtml=sHtml+"<DIV class='schedule-date'>"+model.getShortDateTitle(dataItem.w_date)+"</DIV>";
            sHtml=sHtml+"<DIV class='schedule-empty'>"+model.getScheduleAvailableAsString(dataItem.w_empty,isWork,dataItem.w_sheduled)+"&nbsp;</DIV>";
            sHtml=sHtml+"</TD>";
        }
        sHtml=sHtml+"</TR></TABLE>";
        return sHtml;
    };
    this.getScheduleAvailableAsString=function(iEmpty,iIsWork,iSheduled) {
        var iNumber;
        iNumber=iEmpty;
        if (iIsWork<=0) {
            iNumber=iSheduled;
        }
        if (iNumber) {
            return kendo.toString(iNumber);
        }
        else {
            return "";
        }
    };
    this.getShortDateTitle=function(dDate) {
        var sDate=kendo.toString(dDate,"m");
        var aDate=sDate.split(" ");
        sDate="<span style='font-size:x-large'>"+aDate[1]+"</span>&nbsp;"+aDate[0].substr(0,3);
        return sDate;
    };
    this.onPatientChanged=function(data) {
        this.set("selectedPerson",data.selectedPerson);
        this.set("selectedPersonType",data.selectedPersonType);
        this.scheduleQuery();
    };
    //
    //
    this.getBigPartsDS=new kendo.data.DataSource({
        type: "json",
        serverPaging: false,
        serverSorting: false,
        serverFiltering: false,
        pageSize: 500,
        transport: {
            read: "default.aspx?action=pk/pk_schedule_AJAX&action2=get_big_parts",
            dataType: "json"
        },
        requestStart: function(e) {
            try {
                // $("#shedule-data").hide();
                kendo.ui.progress($("#headerInfo"), true);
            }
            catch (e) {
            }
        },
        requestEnd: function(e) {
            _onRequestEnd(e);
        },

        schema: {
            data: "big_parts.rows",
            total: "records",
            errors: "error",
            model: {
                id: "id",
                fields: {
                    id: {
                        type: "number"
                    },
                    name: {
                        type:"string"
                    },
                    range:{
                        type: "number"
                    }
                }
            }
        },
        change: function (e) {
        },
        error: function(e) {
            ajax_error(e);
        }
    });
    //
    this.getBodyPartsDS=new kendo.data.DataSource({
        type: "json",
        serverPaging: false,
        serverSorting: false,
        serverFiltering: false,
        pageSize: 500,
        transport: {
            read: "default.aspx?action=pk/pk_schedule_AJAX&action2=get_body_parts",
            dataType: "json"
        },
        requestStart: function(e) {
            try {
                kendo.ui.progress($("#headerInfo"), true);
            }
            catch (e) {
            }
        },
        requestEnd: function(e) {
            _onRequestEnd(e);
        },
        schema: {
            data: "body_parts.rows",
            total: "records",
            errors: "error",
            model: {
                fields: {
                    id: {
                        type: "number"
                    },
                    body_id: {
                        type:"number"
                    },
                    big_part_id: {
                        type:"number"
                    },
                    service_id:{
                        type: "number"
                    },
                    name: {
                        type:"string"
                    },
                    display_label:{
                        type: "string"
                    }
                }
            }
        },
        change: function (e) {
        },
        error: function(e) {
            ajax_error(e);
        }
    });
    //
    this.createSelectedExamsHtml=function(sExamsIds) {
        var sRet="<ul><h6>Выбранные исследования</h6>";
        var aExamsIds=sExamsIds.split(",");
        var ds=this.scheduleServiceDetailsDS;
        for (var i=0; i<aExamsIds.length;i++) {
            var item=ds.get(Number(aExamsIds[i]));
            if (item) {
                if (!(item.is_folder)) {
                    var sStr=item.short_name;

                    sRet=sRet+"<li style='white-space:nowrap'>"+sStr;
                    var aParents=[];
                    while (item.parent_id) {
                        item=ds.get(item.parent_id);
                        aParents.push(item.short_name);
                    }
                    while (aParents.length) {
                        sStr="&nbsp;<span style='font-style:italic; font-size: x-small'>"+aParents.pop()+"</span>";
                        sRet=sRet+sStr;
                    }
                    sRet=sRet+"</li>";

                }
            }
//            if (i<(aExamsIds.length-1)) {
//                sRet=sRet+"; ";
//            }
        }
        sRet=sRet+"</ul>";
        return sRet;
    };
    //
    this.onMyTabActivated=function(data) {
        var el=data.content;
        if ($(el).data("model-name")===this.modelName) {
            setTimeout(function(){
                var tab=$("#exams_tabstrip-4");
                var divHeight=Number.parseInt($(tab).css("height"));
//                console.log(divHeight);
                $(el).find(".k-splitter").each(function(idx,el) {
                    $(this).css("height",divHeight-5);
//                    console.log($(this).css("height"));
                    var splitter=$(this).data("kendoSplitter");
                    var size=splitter.size(".k-pane:first");
                    splitter.size(".k-pane:first",size);
                });

            },100);
        }
    };

    //
    var that=kendo.observable(this);
    amplify.subscribe("patientChanged",that,that.onPatientChanged);
    amplify.subscribe("examsTabActivated",that,that.onMyTabActivated);
    return that;


}

var schedulerModel=new SchedulerModel();


schedulerModel.bind("change",function(e) {
    if (e.field=="scheduleData.selectedGroup") {
        if (this.scheduleData.selectedGroup) {
            this.createExamsTree(this.scheduleData.selectedGroup.id);
        }
    }

    if (e.field=="bigPartId") {
        if (this.get("bigPartId")==1) {
            // исследования крови
            this.set("isBodyPartVisible",true) ;
        }
        else {
            this.set("isBodyPartVisible",false) ;
        }
    }
    if ((e.field=="bigPartId") || (e.field=="bodyPartId")) {
        this.scheduleQueryServiceDetails(this.get("bigPartId"),this.get("bodyPartId"));
    }
    if ((e.field == "scheduleData.cabinetTimeString") ||
        (e.field == "scheduleData.cabinetNum") ||
        (e.field == "scheduleData.ticketId")) {
        var cabNum = this.get("scheduleData.cabinetNum");
        var cabTime = this.get("scheduleData.cabinetTimeString");
        var isReserved = this.get("scheduleData.ticketId");
        if ((!isReserved) && cabNum && cabTime) {
            this.set("scheduleData.isReserveAvailable", true);
        }
        else {
            this.set("scheduleData.isReserveAvailable", false);
        }
        if ((isReserved) && cabNum && cabTime) {
            this.set("scheduleData.isUndoReserveAvailable", true);
        }
        else {
            this.set("scheduleData.isUndoReserveAvailable", false);
        }
        this.set("scheduleData.isDetailsVisible", (isReserved > 0));
        this.set("scheduleData.isScheduleVisible", !(isReserved > 0));
    }
    if (e.field=="scheduleData.curSelectedExams") {
        this.set("scheduleData.curSelectedExamsHtml",
            this.createSelectedExamsHtml(this.get("scheduleData.curSelectedExams")));
    }
    if (e.field=="scheduleData.selectedExams") {
        this.set("scheduleData.selectedExamsHtml",
            this.createSelectedExamsHtml(this.get("scheduleData.selectedExams")));
        if (this.get("scheduleData.selectedExams"))  {
            this.set("scheduleData.isSaveTicketAvailable",true);
        }
        else {
            this.set("scheduleData.isSaveTicketAvailable",false);
        }
    }
});

schedulerModel.initControls();
//
//schedulerModel.getBigPartsDS.read();
//schedulerModel.getBodyPartsDS.read();
$("#schedule-big-part").kendoDropDownList({
    dataTextField: "name",
    dataValueField: "id",
    dataSource: schedulerModel.getBigPartsDS,
    change: function(e) {
        var model=schedulerModel;
        model.set("bigPartId".this.value());
        model.set("scheduleMonthHtml","");
    }
});
$("#schedule-body-part").kendoDropDownList({
    cascadeFrom:"schedule-big-part",
    cascadeFromField: "big_part_id",
    dataTextField: "name",
    dataValueField: "service_id",
    dataSource: schedulerModel.getBodyPartsDS,
    change: function(e) {
        var model=schedulerModel;
        model.set("bodyPartId",Number(this.value()));
        model.set("scheduleMonthHtml","");
        setTimeout(function() {
            $("#schedule-service").data("kendoDropDownList").trigger("change");
        },100);
    }
});

//
//
$("#schedule-day-window").kendoWindow({
    modal:true,
    height:600,
    width:800,
    close: function(e) {
        var model=schedulerModel;
        model.clearTicket();
        model.set("scheduleData.cabinetNum","");
        model.set("scheduleData.cabinetTimeString","");
        //
        model.scheduleQuery();
        /*
         model.sheduleData={
         date: null,
         dateString:"",
         dateWeekDay:"",
         patientId:"",
         patientName:"",
         cabinetId: null,
         cabinetNum:"" ,
         cabinetTime: null,
         cabinetTimeString:""
         }
         */
    }
});
$("#schedule-exams-window").kendoWindow({
    modal:true,
    height:600,
    width:900,
    close: function(e) {
    }
});
$("#schedule-main-splitter").kendoSplitter({
    panes:[
        { collapsible:true},
        { collapsible:true, size:"260px"}
    ]
});
$("#schedule-right-pane-splitter").kendoSplitter({
    orientation: "vertical",
    panes:[
        { collapsible:true,size:"20%"},
        { collapsible:false}
    ]
});
$("#schedule-main-pane-splitter-top").kendoSplitter({
    orientation: "vertical",
    panes:[
        { collapsible:false,size:"10%",scrollable:false},
        { collapsible:false,scrollable:false}
    ]
});
$("#schedule-main-pane-splitter-center").kendoSplitter({
    panes:[
        { collapsible:false,scrollable:false},
        { collapsible:false,scrollable:false}
    ]
});

var wizardHeight=$(window).height()-60;
var wizardWidth=$(window).width()-60;
$("#schedule-wizard-window").kendoWindow({
    modal:true,
    height:wizardHeight,
    width:wizardWidth,
    close: function(e) {
    }
});
$("#schedule-wizard-tabstrip").kendoTabStrip({
    animation: {
        open: {
            effects: "none"
        }
    },
    dataTextField:"name",
    dataContentField:"content",
    dataSource: [
        {name:"Step1",content:"<div class='schedule-wizard-tab' style='font-weight:bold' >Step1:content</div>"},
        {name:"Step2",content:"<div class='schedule-wizard-tab' style='font-weight:bold' >Step2:content</div>"},
        {name:"Step3",content:"Step3:content"},
        {name:"Step4",content:"Step4:content"}
    ]

});
$(".schedule-wizard-tab").css("height",wizardHeight-130);

kendo.bind($("#schedule-day-window"),schedulerModel.scheduleData);
kendo.bind($("#schedule-exams-window"),schedulerModel.scheduleData);
kendo.bind($("#exams-pk-schedule-right"),schedulerModel);
kendo.bind($("#exams-pk-schedule-main"),schedulerModel);
kendo.bind($("#schedule-data-content"),schedulerModel);
kendo.bind($("#schedule-main-pane-content"),schedulerModel);

schedulerModel.trigger("change", {field: "bigPartId"});
// NEW selector
jQuery.expr[':'].Contains = function(a, i, m) {
    return jQuery(a).text().toUpperCase().indexOf(m[3].toUpperCase()) >= 0;
};
$("#schedule-tree-filterText").keyup(function (e) {
    var filterText = $(this).val();
    schedulerModel.scheduleData.searchInTree(filterText);
});

$("#schedule-tree-view-toolbar-1").kendoToolBar({
    items: [
        { template:"<input class='k-input' placeholder='Поиск с фильтром...' style='margin-left:5px'>"},
        { template:"<button class='k-button' data-bind='click:expandAll' title='Развернуть все'>"+
                "<i class='fa fa-folder-open-o'></i></button>" },
        { template:"<button class='k-button' data-bind='click:collapseAll' title='Свернуть все'>"+
            "<i class='fa fa-folder-o'></i></button>" }

    ]
});

function scheduleGetCheckedNodesIds(nodes, checkedNodes,iMode) {
    for (var i = 0; i < nodes.length; i++) {
        if (iMode) {
            if (nodes[i].checked) {
                checkedNodes.push(nodes[i].id);
            }
        }
        else {
            if (!(nodes[i].checked)) {
                checkedNodes.push(nodes[i].id);
            }

        }
        if (nodes[i].hasChildren) {
            scheduleGetCheckedNodesIds(nodes[i].children.view(), checkedNodes,iMode);
        }
    }
};
