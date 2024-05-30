/**
/**
 * Created by 1 on 11.03.2015.
 */
function ExamsModel() {
    this.tabs=null;
    this.toolbar=null;
    this.periodDropDownKdl=null;
    this.periodDropDownLdo=null;
    this.tabsIndex=0;
    this.selectedPerson=null;
    this.patListData=[];
    this.labGrid=null;
    this.ldoGrid=null;
    this.periodValKdl=31;
    this.periodValLdo=31;
    //
    this.kdlQuickFilter=0;
    this.ldoQuickFilter=0;
    //
    this.kdlSelUid="";
    this.ldoSelUid="";


    this.pacsQuery1=function() {
        this.pacsQuery(1);  // for current Ib
    };
    this.pacsQuery2=function() {
        this.pacsQuery(2);  // for all patient cases
    };
    this.pacsQuery= function(iMode) {
//        console.log("pacsQuery called with parameter "+iMode.toString());
        var oPers=examsModel.get("selectedPerson");
        if (!(oPers)){
            return;
        }
        /*
        var selIb=ibModel.get("selectedIb");
        if (!selIb) {
            return;
        }
        */
        var d2="";
        kendo.ui.progress($('.k-content'), true);
        var sFioSexBirt=""
        sFioSexBirt=sFioSexBirt+oPers.fam.trim()+';';
        sFioSexBirt=sFioSexBirt+oPers.ima.trim()+';';
        sFioSexBirt=sFioSexBirt+oPers.otch.trim()+';';
        sFioSexBirt=sFioSexBirt+oPers.sex.trim()+';';
        sFioSexBirt=sFioSexBirt+oPers.birt2.trim();
        if (iMode==2) {
            this.PacsDataSource.read({
                global_vn:oPers.pin,
                ask_id:"",
                birt:kendo.toString(oPers.birt,"yyyyMMdd"),
                d1:"20140101",
                d2:d2,
                sFioSexBirt:sFioSexBirt
            })
        }
        else {
            this.PacsDataSource.read({
                global_vn:selIb.global_vn,
                ask_id:selIb.ask_id,
                birt:kendo.toString(selIb.birt,"yyyyMMdd"),
                d1:kendo.toString(selIb.date_ask,"yyyyMMdd"),
                d2:d2
            })
        }
    };
    this.PacsDataSource= new kendo.data.DataSource({
        transport: {
            read: {
                url: "default.aspx?action=StacDoct_main/ldo_AJAX&action2=pacs",
                dataType: "json"
            }
        },
        requestEnd: _onRequestEnd,
        schema: {
            data: "alinks.rows",
            total: "records",
            errors: "error"
        },
        change: function(e) {
            kendo.ui.progress($('.k-content'), false);
            $('#pacs-data').html(this._data[0].ahtml);   // таблица с линками на pacs

        },
        error: function(e) {
            kendo.ui.progress($('.k-content'), false);
            ajax_error(e);
        }

    });

    this.ldoDS=new kendo.data.DataSource({
        type: "json",
        serverPaging: false,
        serverSorting: false,
        serverFiltering: false,
        pageSize: 3500,
        transport: {
            read: "default.aspx?action=pk/pk_ldo_AJAX&action2=list",
            dataType: "json"
        },
        requestStart: function(e) {
            try {
                kendo.ui.progress($("#headerInfo"), true);
            }
            catch (e) {
            }
            $("#exams_ldo_grid").hide();
            $("#exams_ldo_grid").find(".check_row").prop("checked", false);
        },
        requestEnd: _onRequestEnd,
        schema: {
            data: "ldodata.rows",
            total: "records",
            errors: "error",
            model: {
                id: "iddoc",
                fields: {
                    curdate: {
                        type: "date"
                    },
                    curtime: {
                        type: "date"
                    }
                }
            },
            sort: {
                field: "curdate", dir: "desc",
                field: "curtime", dir: "desc"
            }
        },
        change: function (e) {
            $("#exams_ldo_grid").show();
        },
        error: function(e) {
            ajax_error(e);
        }
    });

    this.labDS=new kendo.data.DataSource({
        batch: "true",
        type: "json",
        serverPaging: false,
        serverSorting: false,
        serverFiltering: false,
        pageSize: 3000,
        transport: {
            read: "default.aspx?action=pk/pk_lab_AJAX&action2=list",
            dataType: "json"
        },
        requestStart: function(e) {
            $("#exams_kdl_grid").hide();
            $("#exams_kdl_grid").find(".check_row").prop("checked", false);
            try {
                kendo.ui.progress($("#headerInfo"), true);
            }
            catch (e) {
            }
        },
        requestEnd: _onRequestEnd,
        schema: {
            data: "anlist.rows",
            total: "records",
            errors: "error",
            model: {
                id: "iddoc",
                fields: {
                    id: {
                        type: "string"
                    },
                    data_a: {
                        type: "date"
                    },
                    time: {
                        type: "string"
                    }
                }
            },
            sort: {
                field: "data_a", dir: "desc"
/*                field: "time", dir: "desc" */
            }
        },
        change: function (e) {
            $("#exams_kdl_grid").show();
        },
        error: function(e) {
            ajax_error(e);
        }

    });

    this.labShowDS=new kendo.data.DataSource({
        type: "json",
        serverPaging: false,
        serverSorting: false,
        pageSize: 100,
        transport: {
            read: "default.aspx?action=pk/pk_lab_AJAX&action2=show",
            dataType: "json"
        },
        requestStart: function(e) {
            try {
                kendo.ui.progress($("#headerInfo"), true);
            }
            catch (e) {

            }
        },
        requestEnd: _onRequestEnd,
        schema: {
            data: "ids.rows",
            total: "records",
            errors: "error",
            model: {
                fields: {
                    html: {
                        type: "string"
                    }
                }
            }
        },
        change: function (e) {
            var pData=this.data();
            $("#html_results").html(pData[0].html);
            $("#word_results").html("");
            try {
                that.removeWordSelectableButton();
                that.toWordSelectable($("#html_results"), $("#word_results"));
                that.addWordSelectableButton();
            }
            catch(e) {}

            appRouter.navigate("/html-results")
        },
        error: function(e) {
            ajax_error(e);
        }
    });
    this.showWordSelectable=function(bShow) {
        var $btn=$("#word-selectable-button");
        $("#word_results").removeClass("div-invisible");
        $("#html_results").removeClass("div-invisible");
        if (!$btn.length) {
            return;
        }
        if (bShow) {
            $btn.attr("title","Переключиться в режим просмотра");
            $btn.find("i:first").removeClass("fa-table");
            $btn.find("i:first").addClass("fa-eye");
//            $("#word_results").removeClass("div-invisible");
            $("#html_results").addClass("div-invisible");

        }
        else {
            $btn.attr("title","Переключиться в режим выделения таблиц");
            $btn.find("i:first").removeClass("fa-file");
            $btn.find("i:first").addClass("fa-table");
//            $("#html_result").removeClass("div-invisible");
            $("#word_results").addClass("div-invisible");

        }
    };
    this.removeWordSelectableButton=function() {
        $("#word-selectable-button").remove();

    };
    this.addWordSelectableButton=function() {
        var $btns=$("#html_div").find("div:first").find("button:last");
        var sHtml="<button rel='tooltip' title='Переключиться в режим выделения таблиц'  class='k-button word-selectable-button' type='button' ><i class='fa fa-table'></i></button>";
        $btns.after("&nbsp;"+sHtml);
        var $btn=$("#html_div").find("div:first").find("button:last");
        $btn.attr("id","word-selectable-button");
        this.showWordSelectable(false);
        $btn.on("click",function(e) {
            that.showWordSelectable($("#word_results").hasClass("div-invisible"));
        });
    };
    this.toWordSelectable=function($divSrc,$divDst) {
        $divDst.html($divSrc.html());
        var $labDivs=$divDst.find("div.lab-table-div");
        for (var i=0;i<$labDivs.length;i++) {
            var $labTable=$($labDivs[i]).find("table.lab-table").first();
            var $labSubtables=$($labDivs[i]).find("table.subtable");
            for (var j=0; j<$labSubtables.length;j++) {
                var $labSub=$($labSubtables[j]);
                $.each($labSub.find("tr"),function(idx,val) {
                     $labTable.find("tr:last").after("<tr>"+$(val).html()+"</tr>");
                    }
                );
            };
            $($labDivs[i]).find("table.subtable").remove();
            $($labDivs[i]).attr("id",$($labDivs[i]).attr("id")+"-wrd");
            var sId=$($labDivs[i]).attr("id");
            var sHtml="<button ids='"+sId+"' rel='tooltip' title='Выделить таблицу'  class='k-button btn-select' type='button'> <i class='fa fa-table'></i></button>";
            sHtml="<div class='no-print form toolbar pull-left k-content'>"+sHtml+"</div>";
            $($labDivs[i]).before(sHtml);
        };
        $divDst.find(".btn-select").on("click",function(e) {
            var sId= $(e.target).attr("ids");
            if (!sId) {
                // click on <i> tag
                sId= $(e.target.parentElement).attr("ids");
            }
            if (sId) {
                selectElementContents( $("#"+sId).find("table:first").first().get(0));
            }
        })
    };

    this.searchPacDS=new kendo.data.DataSource({
        transport: {
            read: {
                url: "default.aspx?action=pk/CASES_AJAX&action2=find_persons",
                dataType: "json"
            }
        },
        requestStart:  function(e) {
            that.set("patListData",[]);
            that.patList.wrapper.hide();
            try {
                kendo.ui.progress($("#headerInfo"), true);
            }
            catch (e) {

            }
        },
        requestEnd: _onRequestEnd,
        schema: {
            data: "persons.rows",
            total: "records",
            errors: "error",
            model: {
                fields: {
                    pin: {type: "string"},
                    fam: {type: "string"},
                    ima: {type: "string"},
                    otch: {type:"string"},
                    sex: {type: "string"},
                    birt: {type: "date"},
                    fio: {type: "string"},
                    evn: {type:"number"}
                }
            }
        },
        change: function(e) {
            if (e.items.length==1) {
                that.set("selectedPerson", e.items[0]);
            }
            if (e.items.length>1) {
                for (var i=0;i< e.items.length;i++) {
                    that.patListData.push({fioPin: e.items[i].fio+" "+ e.items[i].pin, val:e.items[i]});
                }
                that.patList.setDataSource(that.patListData);
                that.patList.value(null);
                that.patList.wrapper.show();
                that.patList.focus();
                that.patList.open();
            }

        },
        error: function(e) {
            ajax_error(e);
        }

    });
    this.onTabActivate= function (e) {
        var idx=$(e.item).index();
        that.set("tabsIndex",idx);
        setDocHeight($(e.contentElement));
        amplify.publish("examsTabActivated",{index:idx, element: e.item, content: e.contentElement });
    };
    this.initControls=function() {
        this.toolbar=$("#exams_toolbar").kendoToolBar({
            items: [
                {
                    template: "<input id='exams_pin' class='k-input input-large-font' style='width: 250px;' placeholder='Пин-код или ФИО'/>",
                    overflow: "never"
                },
                {type:"button", text:" Поиск",
                    attributes: { "id":"exams_pin_search","class": "faa faa-search","rel":"tooltip","title":"Поиск" },
                    click: this.searchButtonClickHandler,
                    showText: "overflow"
                },
                {
                    template: "<input  id='exams_patient_list'  style='width:500px' style='display:none'/>",
                    overflow: "never"
                }

            ]
        }).data("kendoToolBar");

        // fire Search button click on <Enter>
        $("#exams_pin").keyup(function(event){
            if(event.keyCode == 13){
//                $("#exams_pin_search").click();
                $("#exams_pin_search").focus();
                that.searchButtonClickHandler(event);
            }
        });
        //
        this.patList=$("#exams_patient_list").kendoDropDownList({
            dataSource:this.patListData,
            dataTextField: "fioPin",
            dataValueField: "val",
            optionLabel: {
                fioPin:"Выберите пациента... ",
                val:null
            },
            change: function(e) {
                var idx= this.selectedIndex;
                if (idx) {
                    that.set("kdlQuickFilter",0);
                    that.set("ldoQuickFilter",0);
                    var val = that.patListData[idx - 1].val;
                    if (val) {
                        that.set("selectedPerson", val);
                    }
                }
                else {
                    that.set("kdlQuickFilter",0);
                    that.set("ldoQuickFilter",0);
                    that.set("selectedPerson", null);
                }
            },
            height: 500
        }).data("kendoDropDownList");

        this.patList.wrapper.hide();

        this.tabs=$("#exams_tabstrip").kendoTabStrip({animation:false,navigatable:false,activate:examsModel.onTabActivate}).data("kendoTabStrip");
        setTimeout(function(){
            that.tabs.select("li:first");
            $("#exams_pin").focus();
        },1000);

        this.labGrid=$("#exams_kdl_grid").kendoGrid({
            dataSource:  this.labDS,
            toolbar: kendo.template($("#template-exams-kdl-toolbar").html()),
            autoBind: false,
            scrollable: true,
            pageable: {
                pageSize: 3000,
                previousNext:false,
                numeric:false
            },
            resizable: true,
            sortable: true,
            selectable: 'cell',
            groupable: false,
            filterable: false,
            navigatable: true,
            columns: [
                { field: "check_row", title: " ", width: 30, filterable:false, sortable: false,
                    template: "<input class='check_row' type='checkbox' />",
                    attributes: {
                        style: "text-align: center"
                    },
                    headerAttributes: {
                        style: "text-align: center"
                    },
                    headerTemplate:  "<input class='check_row' type='checkbox'/>"
                },
                {field: "iddoc", title: "iddoc",hidden: true },
                { field: "data_a", title: "Дата", width: "10%", format: "{0:dd.MM.yyyy}"},
                { field: "time", title: "Время", width: "8%", format: "{0:HH:mm}", filterable:false, sortable: false},
                { field: "bl_name", title: "Анализ"},
                { field: "bm_name", title: "Биоматериал", width: "15%"   },
                { field: "otd", title: "Отд", width: "8%"  },
                { field: "vrach", title: "Назначил", width: "15%",
                    template: function(dataItem) {
                        return kendo.htmlEncode(dataItem.vrach.fio());
                    }
                },
                { field: "vrach", title: "Врач", hidden:true},
                { field: "diag", title: "Диагноз", width: "25%",hidden:true,filterable:false, sortable: false  }

            ],
            /*
            filterMenuInit: function(e) {
//                alertify.log(e.field);
                if (e.field=="bl_name") {
                    $(e.container).css({"width":"410px"});
                    $(e.container).find(".k-dropdown-wrap").css({"width":"380px"});
                    $(e.container).find(".k-list-container").css({"width":"380px"})
                }
            },
            */
            dataBound: function (e) {
                that.onGridDataBound(e.sender);
            },
            change: function(e) {
                that.onGridCellSelect(e.sender);
            }
        }).data("kendoGrid");

        kendo.bind($("#exams-kdl-toolbar"),this);

        this.periodDropDownKdl=$("#exams-kdl-period").kendoDropDownList({
            dataTextField: "text",
            dataValueField: "value",
            dataSource: [
                { text: "Месяц", value: 31 },
                { text: "Квартал", value: 31*3 },
                { text: "Пол года", value: 31*6 },
                { text: "9 месяцев", value: 31*9 },
                { text: "Год", value: 31*12 },
                { text: "2 года", value: 31*12*2 }
            ],
            change: function(e) {
                var value=this.value();
                that.set("periodValKdl",value);
            }
        }).data("kendoDropDownList");

        this.ldoGrid=$("#exams_ldo_grid").kendoGrid({
            dataSource:  this.ldoDS,
            toolbar: kendo.template($("#template-exams-ldo-toolbar").html()),
            autoBind: false,
            scrollable: true,
            pageable: {
                pageSize: 3000,
                previousNext:false,
                numeric: false
            },
            resizable: true,
            sortable: true,
            selectable: "cell",
            groupable: false,
            filterable: false,
            navigatable: true,
            columns: [
                { field: "check_row", title: " ", width: 30, filterable:false,sortable:false,
                    template: "<input class='check_row' type='checkbox' />",
                    attributes: {
                        style: "text-align: center"
                    },
                    headerAttributes: {
                        style: "text-align: center"
                    },
                    headerTemplate:  "<input class='check_row' type='checkbox'/>"
                },
                {field: "iddoc", title: "iddoc",hidden: true },
                { field: "curdate", title: "Дата", width: "10%", format: "{0:dd.MM.yyyy}"},
                { field: "curtime", title: "Время", width: "8%", format: "{0:HH:mm}", filterable:false,sortable:false},
                { field: "namearm", title: "Раздел", width: "10%"  },
                { field: "title", title: "Исследование", width: "30%"  },
                { field: "pk_doctor1", title: "Назначил",
                    template: function(dataItem) {
                        return kendo.htmlEncode(dataItem.pk_doctor.fio());
                    }
                },
                { field: "pk_doctor", title: "Назначил", hidden:true},
                { field: "namedoct1", title: "Исполнил",
                    template: function(dataItem) {
                        return kendo.htmlEncode(dataItem.namedoct.fio());
                    }
                },
                { field: "namedoct", title: "Выполнил", hidden:true},
                { field: "otd", title: "Отд"},

                {field: "ask_id", title: "ask_id",hidden: true }
            ],
            dataBound: function (e) {
                that.onGridDataBound(e.sender);
            },
            change: function(e) {
                that.onGridCellSelect(e.sender);
            }
        }).data("kendoGrid");

        kendo.bind($("#exams-ldo-toolbar"),this);

        this.periodDropDownLdo=$("#exams-ldo-period").kendoDropDownList({
            dataTextField: "text",
            dataValueField: "value",
            dataSource: [
                { text: "Месяц", value: 31 },
                { text: "Квартал", value: 31*3 },
                { text: "Пол года", value: 31*6 },
                { text: "9 месяцев", value: 31*9 },
                { text: "Год", value: 31*12 },
                { text: "2 года", value: 31*12*2 }
            ],
            change: function(e) {
                var value=this.value();
                that.set("periodValLdo",value);
            }
        }).data("kendoDropDownList");
    };
    this.onUnFilterKdlButton=function() {
        this.set("kdlQuickFilter",0);
    };
    this.onUnFilterLdoButton=function() {
        this.set("ldoQuickFilter",0);
    };
    this.onFilterKdlButton=function() {
        var grid=this.labGrid;
        if (!grid) {
            return;
        }
        if (this.get("kdlQuickFilter")) {
            this.set("kdlQuickFilter",0);
            return;
        };
        var selCell=grid.select();
        if (!selCell.length) {
            return;
        }
        var cell=selCell[0];
        if (!cell) {
            return;
        }
        var aCellsIdx=[2,4,5,6,7];
        var idx=grid.cellIndex(cell);
        if (aCellsIdx.indexOf(idx)==-1) {
            return;
        }
        var sText=$(cell).text();
//        grid.dataSource.filter({});
        switch (idx) {
            case 2: // Дата анализа
                var dDta=kendo.parseDate(sText);
                grid.dataSource.filter({field:"data_a", operator: "eq", value: dDta});
                this.set("kdlQuickFilter",1);
                break;
            case 4: // Анализ
                grid.dataSource.filter({field:"bl_name", operator: "eq", value: sText});
                this.set("kdlQuickFilter",1);
                break;
            case 5: // Биометериал
                grid.dataSource.filter({field:"bm_name", operator: "eq", value: sText});
                this.set("kdlQuickFilter",1);
                break;
            case 6: // Отделение
                grid.dataSource.filter({field:"otd", operator: "eq", value: sText});
                this.set("kdlQuickFilter",1);
                break;
            case 7: // Врач
                sText=$(cell).next().text();    // полное фио в следующей колонке
                grid.dataSource.filter({field:"vrach", operator: "eq", value: sText});
                this.set("kdlQuickFilter",1);
                break;
        }
//        alertify.log("index="+idx.toString());
    };
    this.onFilterLdoButton=function() {
        var grid=this.ldoGrid;
        if (!grid) {
            return;
        }
        if (this.get("ldoQuickFilter")) {
            this.set("ldoQuickFilter",0);
            return;
        };
        var selCell=grid.select();
        if (!selCell.length) {
            return;
        }
        var cell=selCell[0];
        if (!cell) {
            return;
        }
        var aCellsIdx=[2,4,5,6];
        var idx=grid.cellIndex(cell);
        if (aCellsIdx.indexOf(idx)==-1) {
            return;
        }
        var sText=$(cell).text();
//        grid.dataSource.filter({});
        switch (idx) {
            case 2: // Дата исследования
                var dDta=kendo.parseDate(sText);
                grid.dataSource.filter({field:"curdate", operator: "eq", value: dDta});
                this.set("ldoQuickFilter",1);
                break;
            case 4: // Раздел
                grid.dataSource.filter({field:"namearm", operator: "eq", value: sText});
                this.set("ldoQuickFilter",1);
                break;
            case 5: // Исследование
                grid.dataSource.filter({field:"title", operator: "eq", value: sText});
                this.set("ldoQuickFilter",1);
                break;
            case 6: // Врач
                sText=$(cell).next().text();    // полное фио в следующей колонке
                grid.dataSource.filter({field:"namedoct", operator: "eq", value: sText});
                this.set("ldoQuickFilter",1);
                break;
        }
//        alertify.log("index="+idx.toString());
    };
    this.onPrintKdlButton=function() {
        var data=this.labGrid.dataSource.view();
        var aIds=[];
        var aArray=this.get("kdlSelUid").split(",");
        data.forEach(function(item,index,array) {
            var uid=item.uid;
            if (aArray.indexOf(uid)!=-1) {
                aIds.push(item.get("iddoc"));
            }
        });
        if (!aIds.length) {
            alertify.error("Не выбрано ни одного анализа!");
            return;
        }
        var sIds=aIds.join(",");
        this.labShowDS.read({
            ids: sIds,
            patient: "<div>"+this.patientLabel()+"</div>"
        });

    };
    this.onPrintLdoButton=function() {
        var data=this.ldoGrid.dataSource.view();
        var aArray=this.get("ldoSelUid").split(",");
        var aIds=[];
        data.forEach(function(item,index,array) {
            var uid=item.uid;
            if (aArray.indexOf(uid)!=-1) {
                aIds.push(item.uid);
            }
        });
        if (!aIds.length) {
            alertify.error("Не выбрано ни одного исследования!");
            return;
        };

        var sHtml="<p>"+this.patientLabel()+"</p>"+"<ul class='em14'>";

        for (var i=0;i<aIds.length; i++) {
            var sId=aIds[i];
            var oData=this.ldoGrid.dataSource.getByUid(sId);
            sHtml=sHtml+"<li class='em14'>";
            sHtml=sHtml+kendo.toString(oData.curdate,"dd.MM.yyyy");
            sHtml=sHtml+" "+oData.namearm+"."+oData.title;
            sHtml=sHtml+" "+oData.namedoct.fio();
            sHtml=sHtml+"</li>"
//            sHtml=sHtml+"<div><pre class='pre-large-font'>"+oData.text+"</pre></div>";
//            sHtml=sHtml+"<div><pre>"+oData.text+"</pre></div>";
            var sText=textToHtml(oData.text);
            sHtml=sHtml+"<div><blockquote class='em14'>"+sText+"</blockquote></div>";
         };
        sHtml=sHtml+"</ul>";
        $("#html_results").html(sHtml);
        $("#word_results").html("");
        appRouter.navigate("/html-results");
    };

    this.searchButtonClickHandler=function(e) {
        var inputText=$("#exams_pin").val().trim();
        if (!isSearchEnabled(inputText)) {
            alertify.error("Введите не менее 2-х символов в поле поискового критерия!");
            return;
        }
        that.set("selectedPerson",null);
        that.set("kdlQuickFilter",0);
        that.set("ldoQuickFilter",0);
        $('#pacs-data').html("");
        if (isPin(inputText.toUpperCase())) {
            that.searchPacDS.read({
                pin: inputText.toUpperCase(),
                fio: ""
            });
        }
        else {
            var sFio=inputText.capitalize(true);
            that.searchPacDS.read({
                pin: "",
                fio: sFio
            });
        }

    };

    this.patientLabel=function() {
        var pat=this.get("selectedPerson");
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

    this.isPatientsListVisible=function() {
        if (!this.searchPacDS.data) {
            return false;
        };
        if ((!this.get("selectedPerson")) && (this.searchPacDS.data.length>=2)) {
            return true;
        }
        return false;
    };

    this.onGridDataBound=function(grid) {
        grid.tbody.off('click',".check_row");
        grid.thead.off('click',".check_row");
        //
        grid.tbody.on('click',".check_row", function (e) {
            var row = $(this).closest("tr");
            var uid=row.attr("data-uid");
            var bChecked=$(e.target).is(":checked") ? true : false;
            var iMode=that.get("tabsIndex");
            var aArray=(iMode>0) ? that.get("ldoSelUid").split(",") : that.get("kdlSelUid").split(",") ;
            if (bChecked) {
                aArray.push(uid)
            }
            else {
                aArray= _.without(aArray,uid);
            }
            that.set((iMode>0) ? "ldoSelUid" : "kdlSelUid", aArray.join(","));
        });
        //
        grid.thead.on('click',".check_row", function (e) {
            var bCheck=$(e.target).is(":checked");
            var data=grid.dataSource.view();
            var iMode=that.get("tabsIndex");
            var aArray=(iMode>0) ? that.get("ldoSelUid").split(",") : that.get("kdlSelUid").split(",") ;
            data.forEach(function(item,index,array) {
                var uid=item.uid;
                var checkBox=grid.tbody.find("tr[data-uid='"+uid+"']").find("td:first").find(".check_row");
                checkBox.prop("checked",false);
                aArray= _.without(aArray,uid);
                if (bCheck) {
                    aArray.push(uid);
                    checkBox.prop("checked",true);
                }

            });
            that.set((iMode>0) ? "ldoSelUid" : "kdlSelUid", aArray.join(","));
        });
        //
        var iMode=that.get("tabsIndex");
        var aArray=(iMode>0) ? that.get("ldoSelUid").split(",") : that.get("kdlSelUid").split(",") ;
        var data=grid.dataSource.view();
        data.forEach(function(item,index,array) {
            var uid=item.uid;
            var checkBox=grid.tbody.find("tr[data-uid='"+uid+"']").find("td:first").find(".check_row");
            if (aArray.indexOf(uid)!=-1) {
                checkBox.prop("checked",true);
            }
            else {
                checkBox.prop("checked",false);
            }
        });
    };

    this.onGridCellSelect=function(grid) {
        return; //!!!
        var selCell=grid.select();
        if (!selCell.length) {
            return;
        }
        var cell=selCell[0];
        if (!cell) {
            return;
        }
        var idx=grid.cellIndex(cell);
        if (idx==0) {
            $(cell).find(".check_row").trigger("click");
        }
    };
    // local functions
    var isSearchEnabled= function(searchString) {
        return (searchString.length>=2);
    };

    var that=kendo.observable(this);
    return that;

};

var examsModel=new ExamsModel();

examsModel.bind("change",function(e) {


   if (e.field=="kdlQuickFilter") {
       var $button=$("#exams-kdl-funnel-button");
       if (!examsModel.get("kdlQuickFilter")) {
           try {
               examsModel.labDS.filter({});
               $button.attr("title","Установить фильтр по значению выделенной ячейки");
               $button.find("span").first().html("<span class='k-icon k-i-funnel'></span>");
           }
           catch (e) {}
       }
       else {
           $button.attr("title","Сбросить фильтр");
           $button.find("span").first().html("<span class='k-icon k-i-funnel-clear'></span>");
       }
    }
    if (e.field=="ldoQuickFilter") {
        var $button=$("#exams-ldo-funnel-button");
        if (!examsModel.get("ldoQuickFilter")) {
            try {
                examsModel.ldoDS.filter({});
                $button.attr("title","Установить фильтр по значению выделенной ячейки");
                $button.find("span").first().html("<span class='k-icon k-i-funnel'></span>");
            }
            catch (e) {}
        }
        else {
            $button.attr("title","Сбросить фильтр");
            $button.find("span").first().html("<span class='k-icon k-i-funnel-clear'></span>");
        }
    }

   if (e.field=="selectedPerson") {
       this.set("kdlSelUid","");
       this.set("ldoSelUid","");
       var model=examsModel;
       var oPerson=model.get("selectedPerson");
       if (oPerson){
           amplify.publish("patientChanged",{selectedPerson:oPerson,selectedPersonType:"PK"});
           $("#exams_tabstrip").show();
           var periodVal=examsModel.periodDropDownKdl.value();
           var d1=kendo.toString(addDays(new Date(),0-periodVal),"yyyyMMdd");
           model.labDS.read({
               ask_id: oPerson.pin,
               d1: d1
           });
           periodVal=examsModel.periodDropDownLdo.value();
           d1=kendo.toString(addDays(new Date(),0-periodVal),"yyyyMMdd");
           model.ldoDS.read({
               ask_id: oPerson.pin,
               d1: d1
           });
       }
       else {
           $("#exams_tabstrip").hide();
       }
   }
   if (examsModel.get("tabsIndex")==1) {
       if (e.field=="periodValKdl")  {
           this.set("kdlSelUid","");
           if (examsModel.get("selectedPerson")){
               var periodVal=examsModel.periodDropDownKdl.value();
               var d1=kendo.toString(addDays(new Date(),0-periodVal),"yyyyMMdd");
               examsModel.labDS.read({
                   ask_id: examsModel.get("selectedPerson").pin,
                   d1: d1
               });
           }

       }
   }
    if (examsModel.get("tabsIndex")==2) {
        if (e.field=="periodValLdo")  {
            this.set("ldoSelUid","");
            if (examsModel.get("selectedPerson")){
                var periodVal=examsModel.periodDropDownLdo.value();
                var d1=kendo.toString(addDays(new Date(),0-periodVal),"yyyyMMdd");
                examsModel.ldoDS.read({
                    ask_id: examsModel.get("selectedPerson").pin,
                    d1: d1
                });
            }
        }
    }
});

function openInNewTab(url) {
    dummyRequest();
    var win = window.open(url, '_blank');
    win.focus();
}

kendo.bind($("#exams_header"),examsModel);
kendo.bind($("#exams-pk-pacs"),examsModel);


/*
$("#pager").kendoPager({
    autoBind: false ,
    dataSource: examsModel.sheduleMonthViewDS
});
*/
/*
$("#shedule-month-view").kendoListView({
    autoBind: false ,
    selectable: true,
    dataSource: examsModel.sheduleMonthViewDS,
    template: kendo.template($("#template-shedule-month").html()),
    change: function(e) {
        var data = this.dataSource.view(),
            selected = $.map(this.select(), function(item) {
                var dataItem=data[$(item).index()];
                if ((dataItem.w_is_work>0) && (dataItem.w_empty>0)) {
                    var model=examsModel;
                    var oPers=model.get("selectedPerson");
                    if (oPers){
                        model.set("sheduleData.dateString",kendo.toString(dataItem.w_date,"dd.MM.yyyy"));
                        model.set("sheduleData.dateWeekDay",dataItem.w_dow_fname);
                        model.set("sheduleData.patientId",oPers.pin);
                        var sFio=""
                        sFio=sFio+oPers.fam.trim()+' ';
                        sFio=sFio+oPers.ima.trim()+' ';
                        sFio=sFio+oPers.otch.trim()
                        model.set("sheduleData.patientName",sFio);
                        $("#shedule-day-window").data("kendoWindow").open().center();
                    }

                }
            });
    },
    dataBound: function(e) {
//        console.log("dataBound");
        var ds=this.dataSource;
        var dataItems=this.dataItems();
        for (var i=0;i<dataItems.length;i++) {
            var uid=dataItems[i].uid;
            var isWork=dataItems[i].w_is_work;
            var listItem=$("*[data-uid='"+uid+"']");
            if (listItem.length) {
                if (isWork==-1) {
                    listItem.addClass("shedule-past-date");
                }
                if (isWork==0) {
                    listItem.addClass("shedule-holiday-date");
                }
                if (isWork>0) {
                    listItem.addClass("k-content");
                }
                if ((kendo.toString(dataItems[i].w_date,"yyyyMMdd"))==(kendo.toString(new Date(),"yyyyMMdd"))) {
                    listItem.addClass("shedule-today");
                }
            }
        }
    }
});
*/

