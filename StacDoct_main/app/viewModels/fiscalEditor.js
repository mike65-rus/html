/**
 * Created by STAR_06 on 26.11.2015.
 */
define(["kendo.all.min",'kendo-template!templates/fiscalEdit','services/proxyService','alertify',
        'dataSources/fiscalDataSource',
        'dataSources/refIsxodDataSource',
        'dataSources/refResultDataSource',
        'dataSources/ksgListDataSource',
        'dataSources/fssSprDataSource',
        'dataSources/fssDataSource',
        'dataSources/kslpSprDataSource',
        'viewModels/mkbKsgChooserVm',
        'models/fiscalModel',
        'utils',
        'viewModels/kslpVm',
		'kendo-template!templates/hospitalPharma'
    ],
 function(kendo,editTemplateId,proxy,alertify,dsFiscal,dsIsxod,dsResult,dsKsg,dsFss,dsReadFss,dsKslp,
          mkbKsgChooserVm,Fiscal,utils,kslpVm,pharmaTemplateId) {
   'use strict';
    var viewModel;
    var kendoWindow;
    var closeWindow=function(e) {
        var selector="#fiscalEditor";
        kendo.unbind(selector);
        kendoWindow.destroy();
        $(selector).remove();
    };
    var createWindow=function() {
        kendoWindow=$("<div id='fiscalEditor'/>").kendoWindow({
            title: "Результат лечения",
            modal:true,
            width:950,
            maxWidth:950,
            content: {
                template: $("#"+editTemplateId).html()
            },
            close: closeWindow
        }).data("kendoWindow");

    };
    var getKslpNames=function() {
        var vm=viewModel;
        var aRet=[];
        for (var i=1;i<=3;i++) {
            var sRet="";
            var id=vm.get("fiscal.kslp"+i.toString());
            if (id) {
                var dataItem=dsKslp.get(id);
                if (dataItem) {
                    sRet=dataItem.name || "";
                }
                var detailId=vm.get("fiscal.kslp"+i.toString()+"_detail");
                if (detailId) {
                    var detailItems=JSON.parse(dataItem.detail);
                    var aDetail=detailItems.detail.rows;
                    for (var j=0;j<aDetail.length;j++) {
                        if (aDetail[j].id==detailId) {
                            sRet=sRet+" ["+aDetail[j].name+"]";
                        }
                    }
                }
            }
            if (sRet) {
                aRet.push(sRet);
            }
        }
        return aRet;
    };
    viewModel= new kendo.data.ObservableObject({
        isEditable:true,
		isCovidKsg:false,
        dateAsk:null,
        dateOut:null,
        dateOmo:null,
        fiscal:null,
        prevFiscal:null,
        dsIsxod:dsIsxod,
        dsResult:dsResult,
        dsKsg:dsKsg,
        dsFssAnswers:dsFss.answers,
        dsFssInoe:dsFss.inoe,
        curDate: new Date(),
        maxDateOut:new Date(),
        updated: false,
        uuid:"",
        isFssAnswerEnabled:true,
        dsCzab: new kendo.data.DataSource( {
            data:[
                {code:1,name:"Острое"},
                {code:2,name:"Впервые в жизни установленное хроническое"},
                {code:3,name:"Ранее установленное хроническое"}
            ]
        }),
        openKslpDialog: function(e) {
            var selIb=proxy.getSessionObject("selectedIb");
            proxy.publish("openKslpDialog",{ib:selIb,fiscal:viewModel.fiscal}); // subscribed in kslpVm
        },
        checkFss: function(e) {
            var selIb=proxy.getSessionObject("selectedIb");
            var niib,dAsk;
            if (selIb.department==2) {
                niib = selIb.niib_s + "/" + selIb.yea.toString();
            }
            else {
                niib=selIb.pin;
            }
            dAsk=kendo.toString(kendo.parseDate(selIb.date_ask),"yyyyMMdd");
            var dBirt=kendo.toString(kendo.parseDate(selIb.birt),"yyyyMMdd");
            var fam=selIb.fam;
            var im=selIb.im;
            var ot=selIb.ot || '';
            var sex=selIb.sex;
            var dateOut=kendo.toString(kendo.parseDate(selIb.date_out ? selIb.date_out:new Date()),"yyyyMMdd");
            var container=$("#ib_fiscal_window");
            kendo.ui.progress(container,true);
            dsReadFss.read({ib_no:niib,fam:fam,im:im,ot:ot,
                    birt:dBirt,sex:sex,date_ask:dAsk,date_out:dateOut}).then(function(){
                kendo.ui.progress(container,false);
                var that=viewModel;
                if (dsReadFss._data.length) {
                    that.set("fiscal.fss_answer",2);
                    that.set("isFssAnswerEnabled",false);
                    for (var i=0;i<dsReadFss._data.length;i++) {
                        var item = dsReadFss._data[i];
                        if (i == 0) {
                            that.set("fiscal.fss_num", item.ln_num);
                        }
                        else {
                            that.set("fiscal.fss_num", that.fiscal.fss_num + "," + item.ln_num);
                        }
                        if (i == 0) {
                            that.set("fiscal.fss_d1", item.ln_d1);
                        }
                        if (i==dsReadFss._data.length-1) {
                            that.set("fiscal.fss_d2",item.ln_d2);
                            that.set("fiscal.fss_d3",item.ln_d3);
                        }
                        that.set("fiscal.fss_inoe",item.inoe);
                    }
                }
                else {
                    that.set("isFssAnswerEnabled",true);
                }
            });
        },
        onFssAnswerChanged: function(e) {
//            kendo.alert("Change");
            /*
            var selIb=proxy.getSessionObject("selectedIb");
            var val=this.value();
            if (val==2) {
                // выдавался
            }
            */
        },
        setKslpNames: function() {
            if (!viewModel.get("fiscal.kslp1") && !viewModel.get("fiscal.kslp2") && !viewModel.get("fiscal.kslp3")) {

                viewModel.set("kslpNames","Сложность лечения не указана");
            }
            else {
                var aNames=getKslpNames();
                var sNames=aNames.join("<br>");
                viewModel.set("kslpNames",sNames);
            }
        },
        reallyEdit: function(dataItem,date_ask,date_out,otd,perevod,uuid,forceReadFss) {
            if (utils.isViewer()) {
                viewModel.set("isEditable",false);
                dsIsxod.read({ref: "ISXOD", arm: 1});
                dsResult.read({ref: "RESULT", arm: 1});
            }
            viewModel.set("uuid",uuid);
            viewModel.set("otd",otd);
            viewModel.set("perevod",perevod);
            var selIb=proxy.getSessionObject("selectedIb");
            /*            viewModel.set("dateAsk",kendo.parseDate(selIb.date_ask)); */
            /*            viewModel.set("dateOut",new Date());
                        if (selIb.date_out) {
                            viewModel.set("dateOut",kendo.parseDate(selIb.date_out));
                        }
            */
            viewModel.set("dateAsk",date_ask);
            viewModel.set("dateOut",date_out);
            viewModel.set("dateOmo",null);
            viewModel.set("maxDateOut",utils.addDays(new Date(),14));
            if (selIb.date_omo) {
                viewModel.set("dateOmo",kendo.parseDate(selIb.date_omo));
            }
            if (!(viewModel.isEditable)) {
                if (!dataItem) {
                    kendo.alert("Данные о результате лечения недоступны!");
                    return;
                }
            }
            if (!dataItem.czab) {
                dataItem.czab=0;
            }
            if (!dataItem.fss_answer) {
                dataItem.fss_answer=0;
            }
            viewModel.set("fiscal",dataItem);
            viewModel.setKslpNames();
            viewModel.set("isFssAnswerEnabled",!viewModel.fiscal.fss_num);
            viewModel.set("prevFiscal",dataItem);
            viewModel.set("curDate",new Date());
            setKsgFilter(viewModel.get("dateOut"),selIb.dnst);
						
			if (selIb.ves && viewModel.fiscal) {
				viewModel.set("fiscal.ves", selIb.ves);
			}
			
            createWindow();
            kendo.bind(kendoWindow.element,viewModel);
            kendoWindow.open().center();
            if (forceReadFss) {
                viewModel.checkFss();
            }
        },
        edit: function(dataItem,date_ask,date_out,otd,perevod,uuid,forceReadFss) {
//            console.log(editTemplateId);
            dsKslp.read().then(function() {
                viewModel.reallyEdit(dataItem,date_ask,date_out,otd,perevod,uuid,forceReadFss);
            });
        },
        openMkbKsgChooser: function(e) {
            var data;
            var selIb=proxy.getSessionObject("selectedIb");
            var otd=viewModel.get("otd");
            if (!otd) {
                otd=selIb.otd1;
            }
            if (viewModel.fiscal) {
                var uslList=viewModel.fiscal.uslList;
                data={dnst:selIb.dnst,otd:otd,ksg:viewModel.fiscal.ksg,
                    usl_list:(uslList) ? uslList.split(" ") : [],selectedIb:selIb};
            }
            else {
                data={dnst:selIb.dnst,otd:otd};
            }
            mkbKsgChooserVm.open(data);
        },
        isCancelledVisible: function() {
            return (this.curRec.get("ucancel_ts")) ? true:false;
        },
        clearRecomType1Date: function() {
            this.set("props.type1.dtExt1",null);
        },
        save: function() {
//            var selIb=proxy.getSessionObject("selectedIb");
            var sMsg=validateFiscal();
            if (sMsg) {
                alertify.alert(sMsg);
                return;
            }
			var ksg1 = this.get("fiscal").ksg;
			if (ksg1.startsWith("TS2212")) {
				var split = ksg1.split('.');
				if (split.length >= 2)
					ksg1 = split[0] + '.' + split[1];
			}
            dsFiscal.dsSave.read({
                ask_id: this.get("fiscal").sluch_id,
                otd_code: this.get("otd"),
                user_id: Number(localStorage['last_user']),
                arm_id: 1,
                date: kendo.toString(this.get("dateOut"), "dd.MM.yyyy"),
                is_otkaz: 0,
                is_in_vyp: 0,
                ksg: ksg1,
				ksg_id: this.get("fiscal").ksg_id,
				ves: this.get("fiscal").ves,
                mkb: this.get("fiscal").mkb,
                isxod: this.get("fiscal").isxod,
                result: this.get("fiscal").result,
                summa: this.get("fiscal").summa,
                usl_list: this.get("fiscal").usl_list,
                czab: this.get("fiscal").czab,
                fss_answer: (this.get("fiscal").fss_answer).toString(),
                fss_num: this.get("fiscal").fss_num,
                fss_d1: kendo.toString(this.get("fiscal").fss_d1,"yyyyMMdd") || "",
                fss_d2: kendo.toString(this.get("fiscal").fss_d2,"yyyyMMdd") || "",
                fss_d3: kendo.toString(this.get("fiscal").fss_d3,"yyyyMMdd") || "",
                fss_inoe: this.get("fiscal").fss_inoe,
                kslp1: this.get("fiscal.kslp1") || 0,
                kslp2: this.get("fiscal.kslp2") || 0,
                kslp3: this.get("fiscal.kslp3") || 0,
                kslp1_detail: this.get("fiscal.kslp1_detail") || 0,
                kslp2_detail: this.get("fiscal.kslp2_detail") || 0,
                kslp3_detail: this.get("fiscal.kslp3_detail") || 0
            });
            proxy.publish("fiscalSave",{fiscal:this.get("fiscal"),uuid:this.get("uuid")});
            proxy.publish("changeDateOut",{dateout:this.get("dateOut"),uuid:this.get("uuid")});
			
			kendoWindow.close();
        },
        close: function() {
            kendoWindow.close();
        },
        isDateAskEnabled: function() {
            return false;
        },
        isDateOutEnabled: function() {
            var bRet=true;
            if (viewModel.get("dateOmo")) {
                if (viewModel.get("dateOut")) {
                    bRet=false;
                }
            }
            return bRet;
        },
        onIsxodChanged: function() {
            if (viewModel.get("fiscal.isxod")==103) {
                viewModel.set("fiscal.result",null);
            }
        },
        onKsgChanged: function() {
            //
        },
        isResultEnabled: function() {
            var bRet=true;
            if (viewModel.get("fiscal.isxod")==103) {
                bRet=false;
            }
            return bRet;
        }

    });
//    kendo.bind($("#"+editTemplateId),viewModel);
    var  validateFiscal= function() {
        var fiscal=viewModel.get("fiscal");
        if ((!fiscal.ksg) || (!fiscal.isxod || (!fiscal.czab))) {
            if (!fiscal.ksg) {
                return "Обязательное поле 'КСГ-МКБ' не заполнено!";
            }
            if (!fiscal.isxod) {
                return "Обязательное поле 'Исход заболевания' не заполнено!";
            }
            if (!fiscal.czab) {
                return "Обязательное поле 'Характер заболевания' не заполнено!";
            }			
            if (fiscal.fss_answer==2) {
                // выдавался б/л
                if (!fiscal.fss_d1 ) {
                    return "Должна быть заполнена дата открытия больничного листа!";
                }
                if (fiscal.fss_d3) {
                    if (!(fiscal.fss_d2) || fiscal.fss_d2>=fiscal.fss_d3) {
                        return "Дата к труду должна быть больше даты закрытия больничного листа!";
                    }
                }
            }
            else {
                // не выдавался
                if (fiscal.fss_d1 || fiscal.fss_d2 || fiscal.fss_num || fiscal.fss_inoe || fiscal.fss_d3) {
                    return "Если больничный лист не выдавался, то его данные должны быть пустыми!";
                }
            }
        }
		if ((fiscal.ksg.startsWith("TS2112")) && (!fiscal.ves || isNaN(fiscal.ves) || fiscal.ves <= 0)) {
			return "Обязательное поле 'Вес' не заполнено!";
        }
        return "";
    };
    var ksgYears=[{year:2014,filter:2014},{year:2015,filter:2015},{year:2016,filter:2015}];
    var getKsgYearValue=function(nYear) {
        for (var i=0;i<ksgYears.length;i++) {
            if (ksgYears[i].year==nYear) {
                return ksgYears[i].filter;
            }
        }
        return nYear;
    };
    var setKsgFilter= function(dDateOut,isDnSt) {

         var nYear=dDateOut.getFullYear();
         var ds=viewModel.get("dsKsg");
         var sFld="code_st";
         if (isDnSt >0) {
             sFld = "code_dn";
         }
         var filters=[];
         filters.push({field:"yea",operator: "eq",value:getKsgYearValue(nYear)});
         filters.push({field:"ncode",operator: "eq",value:"000"});
         if (viewModel.get("fiscal")) {
             filters.push({field:"code",operator: "eq",value:viewModel.get("fiscal").ksg});
         }
         ds.filter({});
         ds.filter([
                 {logic:"or",
                     filters:filters},
                 {field:sFld, operator: "neq", value:""}
             ]
         );
    };
    var onMkbKsgSelected=function(data) {
        var selIb=proxy.getSessionObject("selectedIb");
        if (!viewModel.fiscal) {
            viewModel.set("fiscal", new Fiscal());
        }
        viewModel.set("fiscal.sluch_id",selIb.ask_id);
        viewModel.set("fiscal.ksg",data.ksg);
        viewModel.set("fiscal.ksg_id",data.ksg_id);
        viewModel.set("fiscal.mkb",data.mkb);
        viewModel.set("fiscal.ksg_name",data.ksg_name);
        viewModel.set("fiscal.mkb_name",data.mkb_name);
        viewModel.set("fiscal.usl_list",(data.uslList || []).join(" "));
    };
    var onKslpSaved=function(data) {
        viewModel.set("fiscal.kslp1",data.kslp1);
        viewModel.set("fiscal.kslp2",data.kslp2);
        viewModel.set("fiscal.kslp3",data.kslp3);
        viewModel.set("fiscal.kslp1_detail",data.kslp1_detail);
        viewModel.set("fiscal.kslp2_detail",data.kslp2_detail);
        viewModel.set("fiscal.kslp3_detail",data.kslp3_detail);
        viewModel.setKslpNames();
    };
    proxy.subscribe("mkbKsgSelected",onMkbKsgSelected);
    proxy.subscribe("kslpSaved",onKslpSaved);
     return viewModel;
}
);