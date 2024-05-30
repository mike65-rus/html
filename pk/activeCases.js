/**
 * Created by 1 on 03.01.2015.
 */
$("#active_cases").kendoGrid({
/*    height: 550, */
    autoBind: false,
    dataSource: casesModel.getDS(),
    /*
    scrollable: {
        virtual: true
    },
    */
    scrollable:true,


    pageable: {
        pageSizes: [5,10,15,20],
        buttonCount: 5
    },

    resizable: true,
    /*
    sortable: {
        mode: "multiple"
    },
    */
    sortable: true,
    selectable: "row",
    groupable: false,
    filterable: true,
    navigatable: true,
    editable: "popup",
    columns: [
        {field: "case_id", title: "CASE_ID",hidden: true },
        {field: "fio", title: "ФИО", width:"42%"},
        {field: "pin", title: "ПИН", width:"12%"},
        {field: "d_start", title: "Начат", format: "{0: dd.MM.yyyy - HH:mm}"},
        { command: [
            {name:"openMe",text: " Изменить",className:"faa faa-pencil",
                click:function(e){
                    // e.target is the DOM element representing the button
                    var tr = $(e.target).closest("tr"); // get the current table row (tr)
                    // get the data bound to the current table row
                    var data = this.dataItem(tr);
                    casesModel.editCase(data);
                }},
            {name:"deleteMe",text: " Удалить",className:"faa faa-close",
                click:function(e){
                    // e.target is the DOM element representing the button
                    var tr = $(e.target).closest("tr"); // get the current table row (tr)
                    // get the data bound to the current table row
                    var data = this.dataItem(tr);
                    casesModel.deleteCase(data);
                }}
            ],
            title: "&nbsp;", width: "250px" }
    ]
});
var dsSort=[];
dsSort.push({field:"fio",dir:"asc"});
$("#active_cases").data("kendoGrid").dataSource.sort(dsSort);

$("#active_cases_toolbar").kendoToolBar({
    items: [
        {type: "button", text: " Новый случай", attributes: { "action":"newCase", "class": "faa faa-magic", "rel": "tooltip", "title": "Создать новый случай" }, showText: "overflow"},
        {type: "button", text: " Обновить", attributes: { "action":"refreshActiveCases", "class": "faa faa-refresh", "rel": "tooltip", "title": "Перечитать данные с сервера" }, showText: "overflow"},
        {type: "separator"},
        {template:"<input type='input' class='k-input active-cases-search-input' placeholder='ПИН-код или ФИО...'/>"},
        {type: "button", text: " Поиск", attributes: { "action":"filterActiveCases", "class": "faa faa-search", "rel": "tooltip", "title": "Поиск" }, overflow:"never", showText:"overflow"},
        {type: "button", text: " Снять фильтр", attributes: { "action":"filterOff", "class": "faa faa-filter", disabled:"disabled", "rel": "tooltip", "title": "Сбросить фильтр" }, overflow:"never", showText:"overflow"},
        {type: "separator"},
        {type: "button", text: " Закрыть все вкладки", attributes: { "action":"closeAllTabs", "class": "faa faa-times", disabled:"disabled", "rel": "tooltip", "title": "Закрыть все вкладки" }, overflow:"never", showText:"overflow"}
    ],
    click: function(e) {
        casesModel.activeCasesToolbarAction(e);
    }
});
setTimeout(function() {
//    casesModel.setGridHeight($("#active_cases"));
},1000);