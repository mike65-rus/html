/**
 * Created by STAR_06 on 18.11.2015.
 */

define(['kendo.all.min'],function(kendo){
    kendo.data.binders.date = kendo.data.Binder.extend({
        init: function (element, bindings, options) {
            kendo.data.Binder.fn.init.call(this, element, bindings, options);

            this.dateformat = $(element).data("dateformat");
        },
        refresh: function () {
            var data = this.bindings["date"].get();
            if (data) {
                var dateObj = new Date(data);
                $(this.element).text(kendo.toString(dateObj, this.dateformat));
            }
        }
    });
    kendo.data.binders.widget.max = kendo.data.Binder.extend({
        init: function(widget, bindings, options) {
            //call the base constructor
            kendo.data.Binder.fn.init.call(this, widget.element[0], bindings, options);
        },
        refresh: function() {
            var that = this,
                value = that.bindings["max"].get(); //get the value from the View-Model
            $(that.element).data("kendo"+that.options.name).max(value); //update the widget
        }
    });

    kendo.data.binders.widget.min = kendo.data.Binder.extend({
        init: function(widget, bindings, options) {
            //call the base constructor
            kendo.data.Binder.fn.init.call(this, widget.element[0], bindings, options);
        },
        refresh: function() {
            var that = this,
                value = that.bindings["min"].get(); //get the value from the View-Model
            $(that.element).data("kendo"+that.options.name).min(value); //update the widget
        }
    });

    // end of kendo extenders
    //
    if (!String.prototype.includes) {
        String.prototype.includes = function() {
            'use strict';
            return String.prototype.indexOf.apply(this, arguments) !== -1;
        };
    }

    if (!String.prototype.toDate) {
        String.prototype.toDate=function() {
            var s=this;
            var sY= s.substring(0,4);
            var sM= s.substring(4,6);
            var sD= s.substring(6,8);
            return new Date(Number(sY),Number(sM)-1,Number(sD));
        };
    }

    if (!String.prototype.endsWith) {
        String.prototype.endsWith = function(suffix) {
            return this.indexOf(suffix, this.length - suffix.length) !== -1;
        };
    }
    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function (searchElement, fromIndex) {
            var i,
                pivot = (fromIndex) ? fromIndex : 0,
                length;

            if (!this) {
                throw new TypeError();
            }

            length = this.length;

            if (length === 0 || pivot >= length) {
                return -1;
            }

            if (pivot < 0) {
                pivot = length - Math.abs(pivot);
            }

            for (i = pivot; i < length; i++) {
                if (this[i] === searchElement) {
                    return i;
                }
            }
            return -1;
        };
    }
    String.prototype.toBool = function() {
        return (/^true$/i).test(this);
    };
    String.prototype.replaceAll = function (sfind, sreplace) {
        var str = this;
        while (str.indexOf(sfind)>-1) str=str.replace(sfind, sreplace);
        return str;
    };
    String.prototype.isNumber = function(){return /^\d+$/.test(this);}


    String.prototype.fio = function() {
        var sRet="";
        var aSplit=this.trim().split(" ");
        for (var i=0; i<aSplit.length;i++) {
            if (i==0) {
                sRet=sRet+aSplit[i];
            }
            if (i==1) {
                sRet=sRet+" "+aSplit[i].substr(0,1)+".";
            }
            if (i==2) {
                sRet=sRet+aSplit[i].substr(0,1)+".";
            }
        }
        return sRet;
    };
    String.prototype.fio2 = function() {
        var sRet=this.fio().replace(" ",".");
        var aSplit=sRet.split(".");
        if (aSplit.length>=3) {
            sRet=aSplit[1]+"."+aSplit[2]+"."+aSplit[0];
        }
        return sRet;
    };
    String.prototype.capitalize = function(lower) {
        return (lower ? this.toLowerCase() : this).replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
    };
    if (!Number.prototype.pluralAge) {
        Number.prototype.pluralAge = function() {
            var n=this;
            var m=n%10, l=n%100;
            return n + ' ' + (((m==1)&&(l!=11))?'год':(((m==2)&&(l!=12)||(m==3)&&(l!=13)||(m==4)&&(l!=14))?'года':'лет'));
        };
    };
    $.fn.hasAttr = function(name) {
        return this.attr(name) !== undefined;
    };
    $.fn.justText = function() {
        return $(this).clone()
            .children()
            .remove()
            .end()
            .text();

    };

});