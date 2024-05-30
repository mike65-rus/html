/**
 * Created by STAR_06 on 27.11.2015.
 * DatePicker with not-editable by keybord input inside
 * usage in MVVM: data-no-keyboard="true"
 * usage in $: options:{ noKeyboard: true}
 */
(function(f, define){
    define([ "kendo" ], f);
})(function(){
    (function ($, kendo) {
    var MyDatePicker = kendo.ui.DatePicker.extend({
        init: function (element, options) {
            var that = this;
            kendo.ui.DatePicker.fn.init.call(this, element, options);
            if (that.options.noKeyboard) {
                $(that.element).attr("readonly", "readonly");
                $(that.element).on("click",function(e) {
                    that.dateView.toggle();
                });
                /*
                $(that.element).on("keydown",function(e){
                    e.preventDefault();
                })
                */
            }
        },
        options: {
            name: "MyDatePicker",
            noKeyboard: false
        }
    });
    kendo.ui.plugin(MyDatePicker);
})(window.jQuery, window.kendo);
    return window.kendo;

}, typeof define == 'function' && define.amd ? define : function(_, f){ f(); });