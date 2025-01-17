// -----------------------------------------------------------------------
// Eros Fratini - eros@recoding.it
// jqprint 0.3
//
// - 19/06/2009 - some new implementations, added Opera support
// - 11/05/2009 - first sketch
//
// Printing plug-in for jQuery, evolution of jPrintArea: http://plugins.jquery.com/project/jPrintArea
// requires jQuery 1.3.x
//
// Licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php
//------------------------------------------------------------------------

(function($) {
    var opt;

    $.fn.jqprint = function (options) {
        opt = $.extend({}, $.fn.jqprint.defaults, options);

        var $element = (this instanceof jQuery) ? this : $(this);
        //$.browser not supported as of jQuery1.9
        // if (opt.operaSupport && $.browser.opera)
        // {
        // var tab = window.open("","jqPrint-preview");
        // tab.document.open();

        // var doc = tab.document;
        // }
        // else
        // {
        var $iframe = $("<iframe />");

        if (!opt.debug) { $iframe.css({ position: "absolute", width: "0px", height: "0px", left: "-600px", top: "-600px" }); }

        $iframe.appendTo("body");
        var doc = $iframe[0].contentWindow.document;
        // }

        if (opt.importCSS)
        {
            if ($("link[media=print]").length > 0)
            {
                $("link[media=print]").each( function() {
                    doc.write("<link type='text/css' rel='stylesheet' href='" + $(this).attr("href") + "' media='print' />");
                });
            }
            else
            {
                $("link").each( function() {
                    doc.write("<link type='text/css' rel='stylesheet' href='" + $(this).attr("href") + "' />");
                });
            }
            var dynamStyle=$("#print-style-css");
            if (dynamStyle.length) {
                var s = doc.createElement('style');
                s.setAttribute('media', 'print');
//                s.setAttribute('id', 'print-style-css');
                s.innerHTML = dynamStyle.html();
                doc.getElementsByTagName("head")[0].appendChild(s);
            }
        }

        if (opt.printContainer) { doc.write($element.outer()); }
        else { $element.each( function() { doc.write($(this).html()); }); }

        doc.close();

        //(opt.operaSupport && $.browser.opera ? tab : $iframe[0].contentWindow).focus();
        $iframe[0].onload=function(e) {
            ($iframe[0].contentWindow).focus();
            setTimeout(function() {
                ($iframe[0].contentWindow).print();
                $iframe.remove();
            },250);
        };
        /*
        ($iframe[0].contentWindow).focus();

        //setTimeout( function() { (opt.operaSupport && $.browser.opera ? tab : $iframe[0].contentWindow).print(); if (tab) { tab.close(); } }, 1000);
        setTimeout( function() {
            ($iframe[0].contentWindow).print();
            $iframe.remove();
            }, 2000);
        */
    };

    $.fn.jqprint.defaults = {
        debug: false,
        importCSS: true,
        printContainer: true,
        operaSupport: true
    };

    // Thanks to 9__, found at http://users.livejournal.com/9__/380664.html
    jQuery.fn.outer = function() {
        return $($('<div></div>').html(this.clone())).html();
    };
})(jQuery);

