		$("#grid0").kendoGrid({
			dataSource: {
				type: "json",
				serverPaging: false,
				serverSorting: false,
				pageSize: 10,
				transport: {
					read: "default.aspx?action=default/TimeLine_AJAX&action2=current"
				},
				schema: {
				  data: "current.rows",
				  total: "records",
				  errors: "error"
				  }, 
			   error: function(e) {
			   	ajax_error(e);
			   }
		  },
//			height: 400,
            resizable: true,
            scrollable:
			{
				virtual: true
			},

			pageable: {
			  pagesize: 10,
			  numeric: true,
			  refresh: true
			},
			
			sortable: {
			  mode: "multiple"
			},
			selectable: "row",
			groupable: false,
			filterable: false,  
			navigatable: true,  
//			autoBind: false,		
			columns: [
				{field: "user_id", title: "ИДП",hidden: false, width: "5%" },
				{ field: "uname", title: "Пользователь", width: "30%" },
				{ field: "last_login", title: "Вход", width: "13%", type: "date", format: "{0:dd.MM.yyyy - HH:mm}"
				},
				{ field: "last_request", title: "Последний запрос", width: "13%", type: "date", format: "{0:dd.MM.yyyy - HH:mm}"
				},
				{
				  field: "login_ip", title: "IP",width: "15%"
				},
				{
				  field: "minutes", title: "Длит", width: "5%"
				},
				{
				  field: "session_id", title: "ИД сессии"
				}
			]
         });
        //
        $("#grid1").kendoGrid({
            dataSource: {
                type: "json",
                serverPaging: false,
                serverSorting: false,
                pageSize: 10,
                transport: {
                    read: {
                        url: "default.aspx?action=default/TimeLine_AJAX&action2=current",
                        dataType: "json"
//                        data: {q: start.value()}
                    }
                },
                schema: {
                    data: "journal.rows",
                    total: "records",
                    errors: "error"
                },
                error: function(e) {
                    ajax_error(e);
                }
            },
            toolbar: kendo.template($("#toolbar1").html()),
            autoBind: false,
//            height: 400,
            scrollable:
            {
                virtual: true
            },

            pageable: {
                pagesize: 10,
                numeric: true,
                refresh: false
            },
            resizable: true,
            sortable: {
                mode: "multiple"
            },
            selectable: "row",
            groupable: false,
            filterable: false,
            navigatable: true,
            columns: [
                {field: "user_id", title: "ИДП",hidden: false, width:"5%" },
                { field: "uname", title: "Пользователь", width: "30%" },
                { field: "last_login", title: "Вход", width: "13%", type: "date", format: "{0:dd.MM.yyyy - HH:mm}"
                },
                { field: "last_request", title: "Последний запрос", width: "13%", type: "date", format: "{0:dd.MM.yyyy - HH:mm}"
                },
                { field: "last_logout", title: "Выход", width: "13%", type: "date", format: "{0:dd.MM.yyyy - HH:mm}"
                },
                {
                    field: "login_ip", title: "IP",width: "13%"
                },
                {
                    field: "session_id", title: "ИД сессии"
                }
            ]
        });
        /*
        function startChange() {
            var startDate = start.value(),
                endDate = end.value();

            if (startDate) {
                startDate = new Date(startDate);
                startDate.setDate(startDate.getDate());
                end.min(startDate);
            } else if (endDate) {
                start.max(new Date(endDate));
            } else {
                endDate = new Date();
                start.max(endDate);
                end.min(endDate);
            }
        }

        function endChange() {
            var endDate = end.value(),
                startDate = start.value();

            if (endDate) {
                endDate = new Date(endDate);
                endDate.setDate(endDate.getDate());
                start.max(endDate);
            } else if (startDate) {
                end.min(new Date(startDate));
            } else {
                endDate = new Date();
                start.max(endDate);
                end.min(endDate);
            }
        }
        var start = $("#start").kendoDatePicker({
            format: 'dd.MM.yyyy',
            value: new Date(),
            change: startChange
        }).data("kendoDatePicker");

        var end = $("#end").kendoDatePicker({
            format: 'dd.MM.yyyy',
            value: new Date(),
            change: endChange
        }).data("kendoDatePicker");

        start.max(end.value());
        end.min(start.value());
        */
//        $("#iconButtonRefresh").kendoButton({
//            spriteCssClass: "k-icon k-i-refresh"
//        });

        $(".toolbar").kendoValidator({
            rules: {
                //implement your custom date validation
                dateValidation: function (e) {
                    var currentDate = kendo.parseDate($(e).val());
                    //Check if Date parse is successful
                    if (!currentDate) {
                        return false;
                    }
                    return true;
                }
            },
            messages: {
                //Define your custom validation massages
                required: "Не указана дата",
                dateValidation: "Неверная дата"
            }
        });


        var grnModel = kendo.observable({
            startDate: new Date(),
            endDate: new Date(),
            onstartChange : function() {},
            onendChange: function(){},
            onRefreshButton: function() {
                var grid=$("#grid1");
                grid.data("kendoGrid").dataSource.transport.options.read=
                    {url:"default.aspx?action=default/TimeLine_AJAX&action2=journal",
                        dataType: "json",
                        data: {d1: kendo.toString(this.get("startDate"),"yyyyMMdd"),
                                d2: kendo.toString(this.get("endDate"),"yyyyMMdd")}};
                grid.data("kendoGrid").dataSource.read();
            }
        });
        kendo.bind($("#Grid1Toolbar"), grnModel);

