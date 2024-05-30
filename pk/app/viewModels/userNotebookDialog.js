/**
 * Created by 1 on 06.12.2015.
 */
define(["kendo.all.min",'kendo-template!templates/userNotebookTemplate','kendo-template!templates/userNotebook','services/proxyService',
        'dataSources/userNotebookDataSource',"viewModels/dictofon","utils",'alertify','underscore'],
    function(kendo,noteTemplateId,editTemplateId,proxy,dsUser,dictofon,utils,alertify) {
        "use strict";
        var viewModel;
        viewModel= new kendo.data.ObservableObject({
            ds:null,
            selectedItem: null,
            note:"",
            parData:{},
            isReplaceDocEnabled:false,
            isReplaceNoteEnabled: function() {
                return ((viewModel.get("selectedItem")) ? true: false);
            },
            open: function(data) {
                viewModel.set("selectedItem",null);
                viewModel.set("parData",data);
                viewModel.set("note",data.note || "");
                viewModel.set("ds",prepareDs(data));
                kendoWindow.open();
                var content=$("#ib_doc_notebook");
                kendo.bind($(content),viewModel);
                $(content).find(".k-editor-widget").addClass("no-my-classes"); // this prevents my style for kendoEditor for contenteditable div's
            },
            onExecuteEditorCommand: function(e){
//                console.log("executing command", e.name, e.value);
                if (e.name=="speaker") {
                    openDictofon();
                }
                if (e.name=="unda") {
                    execUndoRedo("undo");
                }
                if (e.name=="reda") {
                    execUndoRedo("redo");
                }
            },
            onPaste: function(e) {
                if (e.html) {
                    var sHtml=utils.removeClasses(utils.removeInlineStyles(e.html));
                    e.html=sHtml;
                }
            },
            onTabSelect: function(e) {
                var index=$(e.item).index();
                switch (index) {
                    case 0: {
                        var editor=$("#note").data("kendoEditor");
                        editor.focus();
                        break;
                    }
                    case 1: {
                        var input=$("#s-input");
                        $(input).val("");
                        var listview = $("#notebook-listView").data("kendoListView");
                        var ds=listview.dataSource;
                        ds.filter({});
                        setTimeout(function() {
                            $(input).focus();
                        },500);
                    }
                }
            },
            onListViewPagerChange: function (e) {
                var listview = $("#notebook-listView").data("kendoListView");
                listview.dataSource.page(e.sender.page());
            },
            addToNotebook: function() {
                saveNote(true);

            },
            saveToNotebook: function() {
                saveNote(true);
            },
            onChangeFilterType: function(e) {
//                console.log("filter type change");
                var input=$("#s-input");
                $(input).trigger("focus");
                $(input).trigger("input");
            },
            onSearchInput: function(e) {
//                console.log("search input");
                var listview = $("#notebook-listView").data("kendoListView");
                var ds=listview.dataSource;
                var sVal=$(e.target).val().trim();
                if (!sVal) {
                    ds.filter({});
                }
                else {
                    var sFilterType="startsWith";
                    if ($("#dva2").is(":checked")) {
                        sFilterType="contains";
                    }
                    ds.filter({field:"text",operator:sFilterType,value:sVal});
                }
            },
            onEdit: function(e) {
                var model= e.model;
                viewModel.set("selectedItem",model);
                viewModel.set("note",model.html);
                var tabStrip=$("#notebook-tabsrip").data("kendoTabStrip");
                tabStrip.select(0);
                e.preventDefault();
//                console.log("onEdit");
            },
            onRemove: function(e) {
                alertify.confirm("Удалить запись из блокнота?",function(ee){
                    if (ee) {
                        $.ajax({
                            url: "default.aspx?action=StacDoct_main/ibDocs_AJAX&action2=del_notebook",
                            type: "POST",
                            data: {
                                record_id: e.model.record_id
                            },
                            success: function(data,textStatus) {
                                dsUser.pushDestroy(e.model);
                                viewModel.set("ds",prepareDs(viewModel.get("parData")));
                            },
                            dataType: "json"
                        });
                    }
                });
                e.preventDefault();
            },
            saveToDocument: function() {
                save(false);
            },
            addToDocument: function() {
                save(true);
            }
        });
        //
//        console.log(autoTemplateId);
        var saved=false;
        var saveNote=function(add) {
            var sHtml=utils.removeClasses(utils.removeInlineStyles(viewModel.get("note")));
            // 29/01/2019
            var sDiv="<div>"+sHtml+"</div>";
            var sText=$(sDiv).text().trim();
            //
            if (!sText) {
                return;
            }
            makeAjaxCall(sText,sHtml,add);

            viewModel.set("note",sHtml);
            var editor=$("#note").data("kendoEditor");
            editor.focus();

        };
        var save=function(add) {
            saved=true;
            proxy.publish('noteSave',{
                uuid:viewModel.get("parData").uuid,
                html:utils.removeClasses(utils.removeInlineStyles(viewModel.get("note"))),
                add:add
            });
            kendoWindow.close();
        };
        var onClose=function(e) {
            if (!saved) {
                /*
                proxy.publish('noteSave',{
                    uuid:viewModel.get("parData").uuid,
                    html:"",
                    add:true
                });
                */
            }
        };
        var makeAjaxCall=function(sText,sHtml,isNew) {
            var sUrl="default.aspx?action=StacDoct_main/ibDocs_AJAX&action2=save_notebook"+
                "&doc_id="+((isNew) ? viewModel.get("parData").doc_vid.toString() : viewModel.get('selectedItem').doc_id.toString())+
                "&doc_part="+((isNew) ? viewModel.get("parData").doc_part : viewModel.get('selectedItem').doc_part)+
                "&record_id="+((isNew) ? '' : viewModel.get('selectedItem').record_id);
            $.ajax({
                url: sUrl,
                type: "POST",
                data: "!1!" +sText+"!2!"+sHtml,
                processData:false,
                success: function(data,textStatus) {
                    utils._onRequestEnd;
                    //
                    var dataItem=data.notebook.rows[0];
                    dataItem.created=kendo.parseDate(dataItem.created);
                    if (dataItem.modified) {
                        dataItem.modified=kendo.parseDate(dataItem.modified);
                    }
                    if (!isNew) {
                        dsUser.pushUpdate(dataItem);
                    }
                    else {
                        dsUser.pushCreate(dataItem);
                    }
                    viewModel.set("ds",prepareDs(viewModel.get("parData")));
                },
                dataType: "json"
            });

        };
        var onSpeechResult=function(data){
            if (data.subscriberId==subscriberId) {
                var editor=$("#note").data("kendoEditor");
                viewModel.set("note",data.result.trim() || "");
                if (editor) {
                    if (data.dialogResult) {
                        editor.focus();
                    }
                    else {
                        editor.focus();
                    }
                }
            }
        };
        var onWindowActivate=function() {
            var tabStrip=$("#notebook-tabsrip").data("kendoTabStrip");
            var temp=viewModel.get("note");
            temp="<div>"+temp+"</div>";
            if ($(temp).text()) {
                viewModel.set("isReplaceDocEnabled",true);
                var editor = $("#note").data("kendoEditor");
                tabStrip.select(0);
                setTimeout(function () {
                    editor.focus();
                    utils.setEndOfContenteditable(editor.body); // not worked!
                }, 1500);
            }
            else {
                viewModel.set("isReplaceDocEnabled",false);
                tabStrip.select(1);
                var input=$("#s-input");
                $(input).val("");
                var listview = $("#notebook-listView").data("kendoListView");
                var ds=listview.dataSource;
                ds.filter({});
                setTimeout(function() {
                    $(input).focus();
                },1500);
            }
        };
        var execUndoRedo=function(sUndoRedo) {
            var editor=$("#note").data("kendoEditor");
            try {
                editor.exec(sUndoRedo);
            }
            catch (e) {

            }
        };
        var openDictofon=function() {
            var editor=$("#note").data("kendoEditor");
            dictofon.open({html:$(editor.body).html(),subscriberId:subscriberId});
        };
        var prepareDs=function(data) {
            function fnc(obj) {
                if (data) {
                    if (!(obj.doc_id == data.doc_vid)) {
//                        return false;
                    }

                    if (obj.doc_part.indexOf(data.doc_part) == -1) {
                        return false;
                    }
                }
                return true;
            }
            var a2=_.filter(dsUser._data, fnc);
            var aRez= _.sortBy(a2,function(o) {return o.text});
            return aRez;
        };
        var kendoWindow=$("<div id='userNotebookDialog'/>").kendoWindow({
            title: "Блокнот пользователя",
            modal:true,
            position:{top:5,left:5},
            width:900,
            content: {
                template: $("#"+editTemplateId).html()
            },
            close: onClose,
            activate: onWindowActivate
        }).data("kendoWindow");
        var subscriberId="userNotebook";
        proxy.subscribe("speechResult",onSpeechResult);

        return viewModel;
    }

);
