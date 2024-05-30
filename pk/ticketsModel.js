/**
 * Created by 1 on 17.03.2018.
 */
function TicketsModel() {
    this.dataSources={
        ticketsFilter: [
            {id:1,name:"Все направления"},
            {id:2,name:"Только мои направления"}
        ],
        patientTickets: new kendo.data.DataSource({
            type: "json",
            serverPaging: false,
            serverSorting: false,
            serverFiltering: false,
            pageSize: 300000,
            transport: {
                read: "default.aspx?action=pk/pk_schedule_AJAX&action2=get_patient_tickets",
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
                data: "p_tickets.rows",
                total: "records",
                errors: "error",
                model: { id: "id",
                    fields: {
                        id: {type:"number"},
                        ticket_date: {type: "date"},
                        ticket_time:{type: "date"},
                        reserved_date: {type: "date"},
                        reserved_time:{type: "date"},
                        reserver_id:{type: "number"},
                        is_editable:{type:"number"}
                    }
                }
            },
            error: function(e) {
                ajax_error(e);
            }
        })
    };
    //
    this.modelName="tickets-pk";
    this.selectedPerson=null;
    this.selectedPersonType="";
    this.ticketsGrid=null;
    this.currentGridTicket=null;
    this.currentGridTicketExamsHtml="";
    this.ticketFilter=this.dataSources.ticketsFilter[0];
    this.isEditEnabled=false;
    //
    this.newTicket=function() {
        $("#schedule-wizard-window").data("kendoWindow").open().center();
    };
    //
    this.onTicketsGridChange=function(e,grid) {
        var selectedRows = grid.select();
        var dataItem = grid.dataItem(selectedRows[0]);
        this.set("currentGridTicket",dataItem);
    };
    this.onTicketsGridDataBound=function(e,grid) {
        if (grid.dataSource.view().length) {
            try {
                var row= e.sender.tbody.find('tr:first');
                grid.select(row);
                row.trigger("click");
            }
            catch(e) {}
        }
        else {
            this.set("currentGridTicket",null);
        }
    };
    //
    this.initControls=function() {
        var that=this;
        this.ticketsGrid=$("#tickets-grid").kendoGrid({
            dataSource:  this.dataSources.patientTickets,
            toolbar: kendo.template($("#template-tickets-toolbar").html()),
            autoBind: false,
            scrollable: true,
            pageable: false,
            noRecords: true,
            resizable: true,
            sortable: false,
            selectable: "row",
            groupable: false,
            filterable: false,
            navigatable: true,
            columns: [
                {field: "id", title: "id",hidden: true },
                { field: "ticket_date", title: "Дата", width: "10%", format: "{0:dd.MM.yy}"},
                { field: "ticket_time", title: "Время", width: "8%", format: "{0:HH:mm}", filterable:false,sortable:false},
                { field: "service_name", title: "Услуга", width: "30%"  },
                { field: "cabinet_name", title: "Кабинет", width: "8%"  },
                { field: "reserver_name", title: "Назначил",
                    template: function(dataItem) {
                        return kendo.htmlEncode(dataItem.reserver_name.fio());
                    }
                },
                { field: "reserved_date", title: "Дата", width: "10%", format: "{0:dd.MM.yy}"}
            ],
            change: function(e) {
                that.onTicketsGridChange(e,this);
            },
            dataBound: function(e) {
                that.onTicketsGridDataBound(e,this);
            }
        }).data("kendoGrid");
        kendo.bind($("#tickets-grid-toolbar"),that);
        //
        $("#tickets-list-view").kendoSplitter({
            orientation: "vertical",
            panes:[
                { collapsible:false,size:"70%",scrollable:false},
                { collapsible:false,scrollable:false}
            ]
        });

    };
    this.queryPatientTickets=function(sPatientId) {
        this.dataSources.patientTickets.read({patient_id:sPatientId,user_id:Number(localStorage.last_user)});
    };
    this.onPatientChanged=function(data) {
        this.set("currentGridTicked",null);
        this.set("selectedPerson",data.selectedPerson);
        this.set("selectedPersonType",data.selectedPersonType);
        this.queryPatientTickets(this.selectedPerson.pin);
    };
    this.onMyTabActivated=function(data) {
        var el=data.content;
        if ($(el).data("model-name")===this.modelName) {
            setTimeout(function(){
                var tab=el;
                var divHeight=Number.parseInt($(tab).css("height"));
                $(el).find(".k-splitter").each(function(idx,el) {
                    $(this).css("height",divHeight-5);
                    var splitter=$(this).data("kendoSplitter");
                    var size=splitter.size(".k-pane:first");
                    splitter.size(".k-pane:first",size);
                });
            },100);
        }
    };

    this.onFieldChange=function(e) {
      if (e.field==="currentGridTicket") {
          var sHtml="";
          if (this.currentGridTicket) {
              for (var i=0;i<30;i++) {
                sHtml=sHtml+"<div>"+this.currentGridTicket.exams+"&nbsp;"+(i+1).toString()+"</div>" ;
              }
          }
          this.set("currentGridTicketExamsHtml",sHtml);
//          this.set("currentGridTicketExamsHtml",(this.currentGridTicket) ? this.currentGridTicket.exams : "");
          this.set("isEditEnabled",(this.currentGridTicket) ? this.currentGridTicket.is_editable : false);
      }
      if (e.field==="ticketFilter") {
          if (this.ticketFilter) {
              if (this.ticketFilter.id==1) {
                  this.dataSources.patientTickets.filter({});
              }
              else {
                  this.dataSources.patientTickets.filter({field:"reserver_id",operator:"eq",value:Number(localStorage.last_user)});
              }
          }
      }
    };
    //
    var that=kendo.observable(this);
    amplify.subscribe("patientChanged",that,that.onPatientChanged);
    amplify.subscribe("examsTabActivated",that,that.onMyTabActivated);
    return that;
}

var ticketsModel=new TicketsModel();

ticketsModel.initControls();
ticketsModel.bind("change",function(e) {
    ticketsModel.onFieldChange(e);
});
kendo.bind($("#tickets-list-view"),ticketsModel);
