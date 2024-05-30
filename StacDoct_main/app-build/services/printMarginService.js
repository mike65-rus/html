/**
 * Created by 1 on 20.11.2015.
 */
define(['kendo'],function(kendo) {
    var leftMargin=2;
    var rightMargin=0.5;
    var topMargin=1;
    var bottomMargin=1;
    var isMirror=false;
    //
    function setDefaultMargins() {
        leftMargin=2;
        rightMargin=0.5;
        topMargin=1;
        bottomMargin=1;
        isMirror=false;
    }
    function setMargins() {
        localStorage.setItem("leftMargin",leftMargin.toString());
        localStorage.setItem("rightMargin",rightMargin.toString());
        localStorage.setItem("topMargin",topMargin.toString());
        localStorage.setItem("bottomMargin",bottomMargin.toString());
        localStorage.setItem("isMirror",isMirror.toString());
    }
    function marginsToFields() {
        $("#mirror-flag").attr("checked",isMirror ? true:false);
        $("#margin-left").data("kendoNumericTextBox").value(leftMargin);
        $("#margin-right").data("kendoNumericTextBox").value(rightMargin);
        $("#margin-top").data("kendoNumericTextBox").value(topMargin);
        $("#margin-bottom").data("kendoNumericTextBox").value(bottomMargin);
    }
    function fieldsToMargins() {
        leftMargin=$("#margin-left").data("kendoNumericTextBox").value();
        rightMargin=$("#margin-right").data("kendoNumericTextBox").value();
        topMargin=$("#margin-top").data("kendoNumericTextBox").value();
        bottomMargin=$("#margin-bottom").data("kendoNumericTextBox").value();
        isMirror=$("#mirror-flag").is(":checked") ? true:false;
    }
    function createPrintMarginStyle() {
        var style="";
        style="@page {size: A4; margin-left:"+leftMargin.toString()+"cm; margin-right:"+rightMargin.toString()+"cm; ";
        style=style+"margin-top:"+topMargin.toString()+"cm; margin-bottom:"+bottomMargin.toString()+"cm; }";

        if (isMirror) {
            style=style+"@page :right {margin-left:"+leftMargin.toString()+"cm; margin-right:"+rightMargin.toString()+"cm; }";
            style=style+"@page :left  {margin-right:"+leftMargin.toString()+"cm; margin-left:"+rightMargin.toString()+"cm; }";
        }
        return style;
    }
    function addPrintMarginStyle() {
        var style=createPrintMarginStyle();
        var dynamStyle=$("#print-style-css");
        if (dynamStyle.length) {
            dynamStyle.html(style);
        }
        else {
            var s = document.createElement('style');
            s.setAttribute('media', 'print');
            s.setAttribute('id', 'print-style-css');
            s.innerHTML = style;
            document.getElementsByTagName("head")[0].appendChild(s);
        }
    }
    function changePrintSettings(e) {
        fieldsToMargins();
        setMargins();
        addPrintMarginStyle();
    }
    function initialize() {
        $(".print-margin").kendoNumericTextBox({
            format: "#.0 см",
            step: 0.1,
            decimals: 1,
            downArrowText: "Уменьшить",
            upArrowText: "Увеличить"

        });
        setDefaultMargins();
        var l=localStorage.getItem("leftMargin");
        if (l==null) {
            setDefaultMargins();
            setMargins();
            return;
        }
        else {
            leftMargin=Number(l);
        }
        rightMargin=Number(localStorage.getItem("rightMargin"));
        topMargin=Number(localStorage.getItem("topMargin"));
        bottomMargin=Number(localStorage.getItem("bottomMargin"));
        isMirror=localStorage.getItem("isMirror").toBool();
        //
        marginsToFields();
        //
        addPrintMarginStyle();

        $(".print-margin").on("change",function(e) {
            changePrintSettings(e);
        })
        $("#mirror-flag").on("change",function(e) {
            changePrintSettings(e);
        })

    }
    return {
        initialize: initialize
    }
}
);