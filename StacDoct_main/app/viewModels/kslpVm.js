define(["kendo.all.min",'kendo-template!templates/kslpEdit','services/proxyService','alertify',
        'dataSources/kslpSprDataSource',
        'dataSources/refIsxodDataSource',
        'dataSources/refResultDataSource',
        'dataSources/ksgListDataSource',
        'dataSources/fssSprDataSource',
        'dataSources/fssDataSource',
        'viewModels/mkbKsgChooserVm',
        'models/fiscalModel',
        'utils'
    ],
    function(kendo,editTemplateId,proxy,alertify,dsKslp,dsIsxod,dsResult,dsKsg,dsFss,dsReadFss,
             mkbKsgChooserVm,Fiscal,utils) {
        'use strict';
        var viewModel;
        var kendoWindow;
        var closeWindow=function(e) {
            var selector="#kslpEditor";
            kendo.unbind(selector);
            kendoWindow.destroy();
            $(selector).remove();
        };

        var createWindow=function() {
            kendoWindow=$("<div id='kslpEditor'/>").kendoWindow({
                title: "Установка коэффициентов сложности лечения",
                modal:true,
                width:950,
                height:600,
                content: {
                    template: $("#"+editTemplateId).html()
                },
                actions:[],
                close: closeWindow
            }).data("kendoWindow");
        };

        var createDataSources=function(ds) {
            var data=ds.data();
            var aData1=new kendo.data.DataSource({data:[]});
            var aData2=new kendo.data.DataSource({data:[]});
            var aData3=new kendo.data.DataSource({data:[]});
            var aData;
            for (var j=1;j<=3;j++) {
                switch (j) {
                    case 1: {
                        aData=aData1;
                        break;
                    }
                    case 2: {
                        aData=aData2;
                        break;
                    }
                    case 3: {
                        aData=aData3;
                        break;
                    }
                }
                for (var i=0;i<data.length;i++) {
                    aData.pushCreate(
                        {id:data[i].id,name:data[i].name+" ("+kendo.toString(data[i].coef,'0.00')+")",
                        detail:data[i].detail,ext1:data[i].ext1});
                }
            }
            viewModel.set("aData1",aData1);
            viewModel.set("aData2",aData2);
            viewModel.set("aData3",aData3);
        };

        viewModel= new kendo.data.ObservableObject({
            aData1:null,
            aData2:null,
            aData3:null,
            close: function() {
                kendoWindow.close();
            },
            save: function(e) {
                var that=viewModel;
                var sValidationErr=validate();
                if (sValidationErr) {
                    kendo.alert("<strong>Необходимо исправить ошибки:</strong><br>"+sValidationErr);
                    return;
                }
                proxy.publish("kslpSaved",that.get("fiscal"));  // subscribed in fiscalEditor.js
                that.close();
            },
            clearKslp:function(e) {
                var btnId=$(e.currentTarget).attr("id");
                var suffix=btnId.slice(-1);
                var idx=Number(suffix);
                var that=viewModel;
                that.set("fiscal.kslp"+suffix,0);
                that.set("fiscal.kslp"+suffix+"_detail",0);
                if (idx==1) {
                    that.set("fiscal.kslp"+suffix,that.get("fiscal.kslp2"));
                    that.set("fiscal.kslp"+suffix+"_detail",that.get("fiscal.kslp2_detail"));
                    that.set("fiscal.kslp2",that.get("fiscal.kslp3"));
                    that.set("fiscal.kslp2"+"_detail",that.get("fiscal.kslp3_detail"));
                    that.set("fiscal.kslp3",0);
                    that.set("fiscal.kslp3_detail",0);
                }
                if (idx==2) {
                    that.set("fiscal.kslp"+suffix,that.get("fiscal.kslp3"));
                    that.set("fiscal.kslp"+suffix+"_detail",that.get("fiscal.kslp3_detail"));
                    that.set("fiscal.kslp3",0);
                    that.set("fiscal.kslp3_detail",0);
                }
            }

        });
        var validate=function() {
            var sRet="";
            var aErr=[];
            var vm=viewModel;
            var kslp1=viewModel.get("fiscal.kslp1");
            var kslp1Detail=viewModel.get("fiscal.kslp1_detail");
            var kslp2=viewModel.get("fiscal.kslp2");
            var kslp2Detail=viewModel.get("fiscal.kslp2_detail");
            var kslp3=viewModel.get("fiscal.kslp3");
            var kslp3Detail=viewModel.get("fiscal.kslp3_detail");
            var sErr="";
            if (kslp1) {
                if (!kslp1Detail ) {
                    aErr.push("Необходимо указать обоснование КСЛП-1");
                }
            }
            if (kslp2) {
                if (!kslp2Detail ) {
                    aErr.push("Необходимо указать обоснование КСЛП-2");
                }
            }
            if (kslp3) {
                if (!kslp3Detail ) {
                    aErr.push("Необходимо указать обоснование КСЛП-3");
                }
            }
            if (((kslp1 || 0)+(kslp2 || 0) +(kslp3 || 0))>0) {
                if (kslp1 && (kslp1==(kslp2 || 0))) {
                    sErr="Совпадают КСЛП-1 и КСЛП-2";
                    if (aErr.indexOf(sErr)<0) {
                        aErr.push(sErr);
                    }
                }
                if (kslp1 && (kslp1==(kslp3 || 0))) {
                    sErr="Совпадают КСЛП-1 и КСЛП-3";
                    if (aErr.indexOf(sErr)<0) {
                        aErr.push(sErr);
                    }
                }
                if (kslp2 && (kslp2==(kslp1 || 0))) {
                    sErr="Совпадают КСЛП-1 и КСЛП-2";
                    if (aErr.indexOf(sErr)<0) {
                        aErr.push(sErr);
                    }
                }
                if (kslp2 && (kslp2==(kslp3 || 0))) {
                    sErr="Совпадают КСЛП-2 и КСЛП-3";
                    if (aErr.indexOf(sErr)<0) {
                        aErr.push(sErr);
                    }
                }
                if (kslp3 && (kslp3==(kslp1 || 0) )) {
                    sErr="Совпадают КСЛП-1 и КСЛП-3";
                    if (aErr.indexOf(sErr)<0) {
                        aErr.push(sErr);
                    }
                }
                if (kslp3 && (kslp3==(kslp2 || 0))) {
                    sErr="Совпадают КСЛП-2 и КСЛП-3";
                    if (aErr.indexOf(sErr)<0) {
                        aErr.push(sErr);
                    }
                }
            }
            if (aErr.length) {
                sRet=aErr.join("<br>");
            }
            return sRet;
        };
        var onOpenKslpDialog=function(data) {
            var that=viewModel;
            var parentFiscal=data.fiscal;

            that.set("fiscal",
                {kslp1:parentFiscal.kslp1,kslp1_detail:parentFiscal.kslp1_detail,
                    kslp2:parentFiscal.kslp2,kslp2_detail:parentFiscal.kslp2_detail,
                    kslp3:parentFiscal.kslp3,kslp3_detail:parentFiscal.kslp3_detail
                }
            );
            that.set("ib",data.ib);
            dsKslp.read().then(function(){
                createDataSources(dsKslp);
                for (var i=1; i<=3; i++) {
                    var kslpId=that.get("fiscal.kslp"+i.toString());
                    if (kslpId) {
                        var dataItem=dsKslp.get(kslpId);
                        createDetailList(i,kslpId,dataItem.detail);
                        if (i<=2) {
                            that.set("isKslp"+(i+1).toString()+"Visible",true);
                        }
                    }
                    else {
                        if ((i<=2)) {
                            that.set("isKslp"+(i+1).toString()+"Visible",false);
                        }
                    }
                }
                createWindow();
                kendo.bind(kendoWindow.element,viewModel);
                kendoWindow.open().center();
            })
        };
        var createDetailList=function(controlIndex,kslpValue,detailField) {
            var ds=new kendo.data.DataSource({data:[]});
            var oDetail=JSON.parse(detailField);
            var aDetail=oDetail.detail.rows;
            for (var i=0;i<aDetail.length;i++) {
                var id=aDetail[i].id;
                var name="";
                switch(kslpValue) {
                    case 3: {   // наличие сопутствующей патологии
                        name=aDetail[i].name+" ("+aDetail[i].code+")";
                        break;
                    }
                    case 1: {   // возраст пациента
                        name=aDetail[i].name+" ("+(aDetail[i].ext1 || '')+")";
                        break;
                    }
                    case 2: {   // антибиотики
                        name=aDetail[i].name+((aDetail[i].ext1) ? " ("+aDetail[i].ext1+")" : "");
                        break;
                    }
                    case 5: {   // сверхдлительная госпитализация (более 70 дней)
                        name=aDetail[i].name;
                        break;
                    }
                }
                var aItem={id:id,name:name};
                ds.pushCreate(aItem);
            }
            viewModel.set("aData"+controlIndex.toString()+"1",ds);
        };
        var onVmChange=function(e) {
            var that=viewModel;
            var field=e.field;
            if (!field.startsWith("fiscal.kslp")) {
                return;
            }
            if (field.length==12) {
                var suffix=field.slice(-1);
                var idx=Number(suffix);
                var kslpValue=that.get("fiscal.kslp"+suffix);
                if (!kslpValue) {
                    viewModel.set(field+"_detail",0);
                    viewModel.set("kslp"+suffix+"1Text","");
                }
                else {
                    var ds=that.get("aData"+suffix);
                    var dataItem=ds.get(kslpValue);
                    createDetailList(idx,kslpValue,dataItem.detail);
                    viewModel.set("kslp"+suffix+"1Text",dataItem.ext1 || "");
                }
            }
            else {
                if (field.indexOf("_detail")>=0) {
                    var aFld=field.split("_");
                    if (aFld[0].length==12) {
                        var suffix=aFld[0].slice(-1);
                        var idx=Number(suffix);
                        var kslpValue=that.get("fiscal.kslp"+suffix+"_detail");
                        if (idx<3) {
                            viewModel.set("isKslp"+(idx+1).toString()+"Visible",(kslpValue) ? true:false);
                        }
                    }
                }
            }
        };
        viewModel.bind("change",onVmChange);
        proxy.subscribe("openKslpDialog",onOpenKslpDialog);
        return viewModel;
    }
);