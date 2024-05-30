/**
 * Created by STAR_06 on 26.11.2015.
 */
define(["kendo.all.min",'kendo-template!templates/recomEdit','services/proxyService','alertify','dataSources/ibRecomUpdateDataSource'],
 function(kendo,editTemplateId,proxy,alertify,dsUpdate) {
   'use strict';
    var viewModel;
    viewModel= new kendo.data.ObservableObject({
        updated: false,
        curRec: null,
        myStyle: "font-weight:bold;",
        myClass: "",
        props: {
            date_ask: new Date(),
            fio: "",
            type1: {
                dtExt1: null,
                dtExt1Max: new Date(),
                dtExt1Min: new Date(2005,0,1)
            },
            isDisabled: false,
        },
        edit: function(dataItem) {
//            console.log(editTemplateId);
            var selIb=proxy.getSessionObject("selectedIb");
            var dtAsk=kendo.parseDate(selIb.date_ask);
            viewModel.set("props.date_ask",dtAsk);
            viewModel.set("props.fio",selIb.fio);

            if (dataItem.recom_type==1) {
                viewModel.set("isType1",true);
                if (dataItem.ext1) {
                    var dt=dataItem.ext1.toDate();
                    viewModel.set("props.type1.dtExt1Max",(dtAsk<dt) ? dt : dtAsk);
                    viewModel.set("props.type1.dtExt1",dt);
                }
                else {
                    viewModel.set("props.type1.dtExt1Max",dtAsk);
                    viewModel.set("props.type1.dtExt1","");
                }
            }
            else {
                viewModel.set("isType1",false);
            }
            if (dataItem.rec_level>=90) {
                viewModel.set("myClass","ib-recom-tr-warn");
            }
            else {
                viewModel.set("myClass","ib-recom-tr-info");
            }
            viewModel.set("isSaveVisible",true);
            viewModel.set("isNoShowMoreVisible",true);
            if ((dataItem.recom_type==2) && (dataItem.rec_level>=90)) {
                viewModel.set("isSaveVisible",false);
                viewModel.set("isNoShowMoreVisible",false);
            }
            viewModel.set("curRec",dataItem);
            viewModel.set("props.isDisabled",(dataItem.ucancel_ts) ? true:false);
            kendo.bind(kendoWindow.element,viewModel);
            kendoWindow.open().center();
        },
        isCancelledVisible: function() {
            return (this.curRec.get("ucancel_ts")) ? true:false;
        },
        clearRecomType1Date: function() {
            this.set("props.type1.dtExt1",null);
        },
        saveRecom: function() {
            var iType=viewModel.get("curRec.recom_type");
            var iCancel=viewModel.get("props.isDisabled") ? 1:0;
            var sMsg=validateRecom(iType,iCancel);
            if (sMsg) {
                alertify.alert(sMsg);
                return;
            }
            var iRecomId=this.get("curRec.recomid");
            var sExt1="";
            var sExt2="";
            var sExt3="";
            if (iType==1) {
                var dt=viewModel.get("props.type1.dtExt1");
                if (dt) {
                    sExt1=kendo.toString(dt,"yyyyMM")+"01";
                }
            }
            dsUpdate.read({
                recomid: iRecomId,
                ext1:sExt1,
                ext2:sExt2,
                ext3:sExt3,
                cancel:iCancel
            });
            this.closeRecom();
        },
        closeRecom: function() {
            kendoWindow.close();
        }


        });
    kendo.bind($("#"+editTemplateId),viewModel);
    var kendoWindow=$("<div id='recomEditor'/>").kendoWindow({
        title: "Рекомендация",
        modal:true,
        width:600,
        content: {
            template: $("#"+editTemplateId).html()
        }
    }).data("kendoWindow");
    var  validateRecom= function(iType,iCancel) {
         var sRet="";
         switch (iType)         {
             case 1:
                 var dt=viewModel.get("props.type1.dtExt1");
                 if ((iCancel>0) && (!dt)) {
                     sRet="Необходимо выбрать примерную дату предыдущего исследования!";
                 }
                 break;
         }
        return sRet;
     };

    return viewModel;
}
);