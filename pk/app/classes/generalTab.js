define(["kendo.all.min","utils","services/proxyService","services/configService"],
    function(kendo,utils,proxy,configService) {
    'use strict';
    var GeneralTab = kendo.Class.extend({
        level:0,
        name:"",
        parentName:"",
        label:"",
        tabStripsNames:[],
        myOrder:-1,
        suffix:"",
        isMyTabCurrent:false,
        tabStrip:null,
        childTabStrip:null,
        contentHtml:"",
        tabStripSelector:"",
        onTabIsCurrent:null,
        currentTab:0,
        viewModel:null,
        navPath:{},
        mustHaveSuffix:true,
        hasChilds: function() {
            return !! (this.tabStripsNames.length);
        },
        hasInternalTabs: function() {
            return !!(this.tabStripSelector);
        },
        getDefaultModelSuffix:function() {
            return this.tabStripsNames[0];
        },
        getModelSuffix: function() {
            return this.viewModel.get("suffix");
        },

        onInternalTabActivate: function(that) {
            var fnc=function(e) {
                var navPath=that.navPath;
                var idx=$(e.item).index();
                if (!(idx==that.currentTab)) {
                    if (that.tabStripsNames[idx]) {
                        var url="/"+navPath.topic+"/"+navPath.id.toString()+
                            "/"+that.name+"/"+that.tabStripsNames[idx];
                        that.currentTab=idx;
                        proxy.publish("navigateCommand",url);
                        e.preventDefault;
                    }
                }
                else {
                    var contentElement=that.tabStrip.contentElement(that.myOrder);
                    $(e.contentElement).css("height",($(contentElement).height()-80)+"px");
                    proxy.publish("internalTabActivated",
                        {index:idx, name:that.tabStripsNames[idx],  element: e.item, content: e.contentElement,
                            parentModel:that.viewModel});
                    //lastSelectedTab=idx;
                }
            };
            return fnc;
        },
        createTabStrips: function() {
            if (!this.hasChilds()) {
                return;
            }
            if ((this.childTabStrip.items().length)<(this.tabStripsNames.length)) {
                $(this.tabStripSelector).hide();
                for (var i=0;i<this.tabStripsNames.length;i++) {
                    proxy.publish("parentVisible",
                        {   parentName:this.name,
                            name:this.tabStripsNames[i],
                            parentModel:this.viewModel,
                            tabStrip: this.childTabStrip, order:i, currentTab:this.tabStripsNames[this.currentTab]});
                }
                var that=this;
                setTimeout(function(){
                    try {
                        var selector=that.tabStripSelector;
                        if (selector) {
                            if (!$(selector).data("kendoTabStrip") ) {
                                // hack for initialize after browser page reload (F5)
                                kendo.init(selector);
                                that.childTabStrip=$(selector).data("kendoTabStrip");
                                that.childTabStrip.bind("activate",that.onInternalTabActivate(that));
//                                $(selector).bind("activate",that,that.onInternalTabActivate);
                            }
                            $(that.tabStripSelector).show();
                            that.childTabStrip.select(that.currentTab);
                        }
                    }
                    catch (ex) {
                        $(that.tabStripSelector).show();
                    }
                },10);
            }
        },
        getTabStripIndexFromUrlPage: function(page) {
            var idx=0;
            if (!page) {
                return idx;
            }
            if (this.tabStripsNames.indexOf(page)<0) {
                return idx;
            }
            return this.tabStripsNames.indexOf(page);
        },
        init: function(options) {   // constructor
            this.level=options.level;
            this.name=options.name;
            this.parentName=(options.parentName ? options.parentName : "");
            this.label=options.label;
            var sPath=this.name;
            if (this.parentName) {
                sPath=this.parentName+"."+this.name;
            }
            this.tabStripsNames=configService.getPatientCardTabs(sPath);
            this.contentHtml=options.contentHtml;
            this.tabStripSelector=options.tabStripSelector;
            this.viewModel=options.viewModel;
            this.onTabIsCurrent=options.onTabIsCurrent;
            this.getDefaultModelSuffix=(options.getDefaultModelSuffix ? options.getDefaultModelSuffix : this.getDefaultModelSuffix);
            this.getModelSuffix=(options.getModelSuffix ? options.getModelSuffix : this.getModelSuffix);
            this.createTabStrips=(options.createTabStrips ? options.createTabStrips : this.createTabStrips);
            this.viewModel.suffix=this.getDefaultModelSuffix();
            if (!this.level) {
                proxy.subscribe("patientCardVisible",this,this.onPatientCardVisible);
                proxy.subscribe("patientCardTabActivated",this,this.onTabActivated);
            }
            else {
                proxy.subscribe("parentVisible",this,this.onParentVisible);
                proxy.subscribe("internalTabActivated",this,this.onInternalTabActivated);
            }
        },
        onParentVisible: function(data) {
            var order=data.order;
            var currentTab=data.currentTab;
            var parentName=data.parentName;
            var name=data.name;
            if (!((parentName==this.parentName) && (name==this.name))) {
                return true;
            }
            this.isMyTabCurrent=(currentTab==this.name);
            var tabStrip=data.tabStrip;
            this.tabStrip = tabStrip.append({
                text: this.setLabel(),
                content: this.setContent()
            });
            return true;

        },
        onInternalTabActivated: function(data) {
            var idx=data.index;
            var name=data.name;
            if (!(name==this.name)) {
                return true;
            }
            this.myOrder=idx;
            this.onTabIsCurrent(data);
        },
        setLabel: function() {
            return this.label
        },
        setContent: function() {
            return (this.isMyTabCurrent) ? this.contentHtml: "<div></div>"
        },
        onPatientCardVisible: function(data) {
            var order=data.order;
            var currentTab=data.currentTab;
            var name=data.name;
            if (!(name==this.name)) {
                return true;
            }
            this.isMyTabCurrent=(currentTab==this.name);
            var tabStrip=data.tabStrip;
            this.tabStrip = tabStrip.append({
                text: this.setLabel(),
                content: this.setContent()
            });
            if (this.isMyTabCurrent) {
                if (this.onTabIsCurrent) {
                    this.childTabStrip=$(this.tabStripSelector).kendoTabStrip({
                        animation: {
                            open:false
                        },
                        activate:this.onInternalTabActivate(this)
                    }).data("kendoTabStrip");
                    this.onTabIsCurrent(data);
                }
            }
            return true;
        },
        onTabActivated: function(data) {
            var idx=data.index;
            var name=data.name;
            if (!(name==this.name)) {
                return true;
            }
            this.myOrder=idx;
//            var suffix=data.navigationPath.suffix;
            var suffix=this.getModelSuffix(data);
            if (suffix) {
                this.currentTab=this.tabStripsNames.indexOf(suffix);
                if (this.currentTab<0) {
                    this.currentTab=0;
                }
                this.navPath=data.navigationPath;
                var url = window.location.href;
                if (!(url.endsWith(this.name + "/" + suffix))) {
                    url = "/" + this.navPath.topic + "/" + this.navPath.id.toString() + "/" + this.name + "/" + suffix;
                    proxy.publish("navigateCommand", url);
                }
                else {
//                    viewModel.suffix="";
//                    viewModel.set("suffix",suffix);
                }
            }
            this.createTabStrips();
        }
    });
    return GeneralTab;
}
);