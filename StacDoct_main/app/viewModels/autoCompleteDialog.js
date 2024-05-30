/**
 * Created by 1 on 06.12.2015.
 */
define(["kendo.all.min",'kendo-template!templates/autoCompleteTemplate','kendo-template!templates/autoComplete','services/proxyService',
        'dataSources/pubNotebookDataSource','dataSources/userNotebookDataSource','underscore'],
    function(kendo,autoTemplateId,editTemplateId,proxy,dsPub,dsUser) {
        "use strict";
        var viewModel;
        viewModel= new kendo.data.ObservableObject({
            ds:[],
            selectedItem: null,
            preventClosePopup:false,
            open: function(data) {

                var ds=prepareSearchDs(data);
                viewModel.set("ds",ds);

                viewModel.set("selectedItem",null);
                viewModel.preventClosePopup=true;
                kendoWindow.open();
                kendo.bind($("#ib_doc_autoComplete_window"),viewModel);
//                kendo.ui.progress($("#ib_doc_autoComplete_window"),true);
                setTimeout(function(){
//                    kendo.ui.progress($("#ib_doc_autoComplete_window"),false);
                    var comboBox=$("#ib_doc_autoComplete").data("kendoAutoComplete");
//                    comboBox.open();
                    comboBox.focus();
                    var sText=data.text || "";
//                    if (sText) {
                        comboBox.value(sText);
                        comboBox.search(sText);
//                    }
                },500);

            },
            closeCombo: function(e) {
                if (viewModel.preventClosePopup) {
                    e.preventDefault();
                    viewModel.preventClosePopup=false;
                    e.sender.focus();
                }
            },
            change: function(e) {
            },
            select: function(e) {
                var item= e.item;
                var dataItem= (e.sender).dataItem(e.item.index());
                if (dataItem) {
                    var sRet=(dataItem.html) ? dataItem.html.trim() : dataItem.text.trim();
                    proxy.publish("autoCompleteResult",sRet);
                    kendoWindow.close();
                }
            },
            onClose: function(e) {
                proxy.publish("autoCompleteResult","");
                /*
                var comboBox=$("#ib_doc_autoComplete").data("kendoComboBox");
                comboBox.close();
                */
            }

        });
        //
//        console.log(autoTemplateId);
        var kendoWindow=$("<div id='autoCompleteDialog'/>").kendoWindow({
            title: "Поиск в блокноте",
            modal:true,
            position:{top:5,left:5},
            width:900,
            content: {
                template: $("#"+editTemplateId).html()
            },
            close: viewModel.onClose
        }).data("kendoWindow");
        var prepareSearchDs=function(data) {
            function fnc(obj) {
                if (data) {
                if (!(obj.doc_id == data.doc_vid)) {
//                    return false;
                }
                if (!(obj.doc_part)) {
                    return false;
                }
                if (obj.doc_part.indexOf(data.doc_part) == -1) {
                    return false;
                }
            }
                return true;
            }

            var a1=_.filter(dsPub._data, fnc);
            var a2=_.filter(dsUser._data, fnc);
            var aRez= _.sortBy(_.union(a1,a2),function(o) {return o.text});
            return aRez;
        };
        return viewModel;
    }

);
