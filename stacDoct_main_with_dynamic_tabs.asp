<%= include("header.avfp") %>
<style>
	<!--
	.nav-tabs > li .close {
		margin: -2px 0 0 10px;
		font-size: 18px;
	}
	-->		
</style>

	
</HEAD>
<BODY data-spy="scroll" data-target=".subnav" data-offset="50">
<%= include("headerInfo.avfp") %>
<div class="container-fluid">
 <!--- автоматическое перенаправление на Login.avfp, если нет логина или таймаут --->
<%= include("loginInclude.avfp") %>
<%= include("StacDoct_Include.avfp") %>


 <div class="row-fluid"> 

    <div class="tabbable">
    <ul class="nav nav-tabs" id="mytabs">
    <li class="active"><a href="#s0" data-toggle="tab" id="tab0">Мои пациенты</a></li>
    <li><a href="#s1" data-toggle="tab" id="tab1">Поступившие</a></li>
    <li><a href="#s2" data-toggle="tab" id="tab2">Выписавшиеся</a></li>
    </ul>
    <div class="tab-content">
    <div class="tab-pane active" id="s0">
    <p>Мои пациенты.</p>
    </div>
    <div class="tab-pane" id="s1">
	<!-- DATAGRID MARKUP -->
	<table id="MyGrid2" class="table table-bordered datagrid">
		<thead>
		<tr>
			<th>
				<span class="datagrid-header-title">
					<div class="input-append search">
						<input type="text" class="input-medium" placeholder="Поиск"><button class="btn"><i class="icon-search"></i></button>
					</div>
				</span>
				
				<div class="datagrid-header-left"></div>
				<div class="datagrid-header-right">
					<div class="btn-group">
						<button class="btn btn-info" id="refresh2">Обновить</button>
					</div>  
				</div>
			</th>
		</tr>
		</thead>

		<tfoot>
		<tr>
			<th>
				<div class="datagrid-footer-left" style="display:none;">
					<div class="grid-controls">
						<span><span class="grid-start"></span> - <span class="grid-end"></span> из <span class="grid-count"></span></span>
						<select class="grid-pagesize">
						   <option>5</option>
						   <option>10</option> 
						   <option selected='selected'>15</option>
						   <option>20</option>
						   <option>25</option>
						   <option>30</option>
						</select>
						<span>на странице</span>
					</div>
				</div>
				<div class="datagrid-footer-right" style="display:none;">
					<div class="grid-pager">
						<button class="btn grid-prevpage"><i class="icon-chevron-left"></i></button>
						<span>Страница</span>
						<div class="input-append dropdown combobox">
							<input class="span4" type="text">
						</div>
						<span>из <span class="grid-pages"></span></span>
						<button class="btn grid-nextpage"><i class="icon-chevron-right"></i></button>
					</div>
				</div>
			</th>
		</tr>
		</tfoot>
	</table>
	<!-- END DATAGRID MARKUP -->

    </div>
    <div class="tab-pane" id="s2">
	<!-- DATAGRID MARKUP -->
	<table id="MyGrid" class="table table-bordered datagrid">
		<thead>
		<tr>
			<th>
				<span class="datagrid-header-title">Flickr Search</span>
				<div class="datagrid-header-left"></div>
				<div class="datagrid-header-right">
					<div class="input-append search">
						<input type="text" class="input-medium" placeholder="Поиск"><button class="btn"><i class="icon-search"></i></button>
					</div>
				</div>
			</th>
		</tr>
		</thead>

		<tfoot>
		<tr>
			<th>
				<div class="datagrid-footer-left" style="display:none;">
					<div class="grid-controls">
						<span><span class="grid-start"></span> - <span class="grid-end"></span> из <span class="grid-count"></span></span>
						<select class="grid-pagesize"><option>5</option><option>10</option></select>
						<span>на странице</span>
					</div>
				</div>
				<div class="datagrid-footer-right" style="display:none;">
					<div class="grid-pager">
						<button class="btn grid-prevpage"><i class="icon-chevron-left"></i></button>
						<span>Страница</span>
						<div class="input-append dropdown combobox">
							<input class="span4" type="text">
						</div>
						<span>из <span class="grid-pages"></span></span>
						<button class="btn grid-nextpage"><i class="icon-chevron-right"></i></button>
					</div>
				</div>
			</th>
		</tr>
		</tfoot>
	</table>
	<!-- END DATAGRID MARKUP -->
    </div>
    </div>
    </div><!-- /.tabbable -->
 </div>   
</div>

<script src="javascript/utils.js" type="text/javascript"></script>
<!-- Fuel UX CDN link to its javascript library -->
<script src="javascript/fuelux/loader.min.js" type="text/javascript"></script>
<!-- underscore.js for Datasources -->
<script src="javascript/underscore.js" type="text/javascript"></script>
<!-- moment.js for Date formatting -->
<script src="javascript/moment-with-langs.js" type="text/javascript"></script>
<!-- Data Source for Flickr API -->
<script src="javascript/datasource.js" type="text/javascript"></script>
<!-- Data Source for Flickr2 API -->
<script src="javascript/Datasources/NestedAjaxDataSource.js" type="text/javascript"></script>
<!-- Logic for Datagrid -->
<script>
	// init ib Tabs
	var ibCurrentTab;
	var ibCount=0; 	
	var ibList=[];
	var curStaticTab=0;
	$('#MyGrid').datagrid({
		dataSource: new FlickrDataSource({

			// Column definitions for Datagrid
			columns: [{
				property: 'image',
				label: 'Изображение',
				sortable: false
			},{
				property: 'title',
				label: 'Заголовок',
				sortable: false
			}],

			// Create IMG tag for each returned image
			formatter: function (items) {
				$.each(items, function (index, item) {
					item.image = '<img src="' + flickrUrl(item) + '"></a>';
				});
			}
		})
	});

	// Returns image URL for an image returned from Flickr API
	function flickrUrl(image) {
		return 'http://farm' + image.farm + '.staticflickr.com/' + image.server +  '/' + image.id + '_' + image.secret + '_t.jpg';
	}
//
var ajax_loader = jQuery('<img />').attr('src', 'images/ajax-loader-big.gif');

var dataSource2 = new NestedAjaxDataSource({
      data_url : 'default.aspx?action=StacDoct_CreateDiag_AJAX&action2=ib_list',
//		initial_load_from_server: true,
      data_key : 'ib_list',
      pageSize : 15,
		// Column definitions for Datagrid
			columns: [{
				property: 'descr',
				label: 'Пациент',
				sortable: true
			},
			{
				property: 'niib',
				label: '№ ИБ',
				sortable: true
			},
			{
				property: 'otd1',
				label: 'Отд',
				sortable: true
			},
			{
				property: 'palata',
				label: 'Палата',
				sortable: true
			},
			{
				property: 'sp150_rusdate',
				label: 'Д/Пост',
				sortable: true
			}
			/*
			,{
				property: 'sp160',
				label: 'Ask_id',
				sortable: true
			}
			*/
			],

			formatter: function (items) {
				$.each(items, function (index, item) {
				  item.descr="<a href='javascript:select_ib(1,"+'"' +item.sp160.trim()+'",'+item.niib+")'>"+item.descr.trim()+"</a>";
				  // искуственное добавление проперти с русской датой
				  // сортировка будет по исходной проперти (см. NestedAjaxDataSource.js)
  				  item.sp150_rusdate = moment(item.sp150).format('DD-MM-YYYY');
				});
			},
		delay : 0
	});

	$('#MyGrid2').datagrid({
		dataSource : dataSource2,
		dataOptions : {
         pageIndex : 0,
         pageSize : 15 
		},
		itemsText : 'записей',
		itemText : 'запись'
//    	stretchHeight : true   // фигня какая-то
	});
	
   $('#refresh2').click( function(e) {
      var grid=$('#MyGrid2');
      dataSource2.reload_data_from_server=true;
      grid.datagrid('reload');
   }); 

	$('#tab1').on('shown', function (e) {
//		e.target // activated tab
//		e.relatedTarget // previous tab
		if (!dataSource2.dataLoaded)	{
			var grid=$('#MyGrid2');
			dataSource2.reload_data_from_server=true;
			grid.datagrid('reload');
		}
	});
	
//	$(function () {
		
		//when ever any tab is clicked this method will be call
		$('#mytabs').on("click", "a", function(e){
			var href=$(this).attr('href');
			var id=href.substring(1);
			var className='';
			e.preventDefault();
			$('div.active').removeClass('active').removeClass('in');
			$('li.active').removeClass('active');
			$('div#'+id).addClass('active in');
			className = $('#'+id).attr('class');
			if (id.substr(0,3)==='ib-') {
				$ibCurrentTab=$(this);
			}	
			else {
				curStaticTab=$(this).attr('id').substr(3);	
			}
			$(this).tab('show');
		});
		

//		registerComposeButtonEvent();
//		registerCloseEvent();
//	}); 	
	var fixedTabs=3;
	function select_ib(iStaticTab,sId,sNiib) {
		curStaticTab=iStaticTab;	// index starts from 0
		var tabId  = 'ib-'+sId.substr(0,4)+'-'+sNiib;	//this is id on tab content div where the 
		var idx=ibList.indexOf(tabId);
		if (idx>=0) {
			$(".ibtab").eq(idx).tab('show'); // Select that tab
		}
		else {
			$('div.active').removeClass('active').removeClass('in');
			$('li.active').removeClass('active');
			$('.nav-tabs').append('<li><a href="#'+tabId+'" data-toggle="tab" class="ibtab"><button class="close closeTab" type="button" ><i class="icon-remove"></i></button>№ ' + sNiib+'&nbsp;</a></li>');
			$('.tab-content').append('<div class="tab-pane in active" id="'+tabId+'"> <p>Load AJAX content here... '+sNiib+'</p><div class="row-fluid"><iframe height="700px" width="99%" src="default.aspx"></iframe></div></div>'); 
			ibList.push(tabId);	
			ibCount = ibCount + 1;	//increment compose count //		alert(sId);
//			createNewTabAndLoadUrl("","default.aspx?action=stacdoct_ib_sample","#"+tabId);
			$(this).tab('show');
			showTab(tabId);
 			registerCloseEvent();
		}
	};
	//this method will register event on close icon on the tab..
	function registerCloseEvent(){

		$(".closeTab").click(function () {
		
			//there are multiple elements which has .closeTab icon so close the tab whose close icon is clicked
			var tabContentId = $(this).parent().attr("href");
			var tabId=tabContentId.substring(1);
			var idx=ibList.indexOf(tabId);
			if (idx>=0) {
				ibList.splice(idx,1);	// remove 	
			}
			
			$(this).parent().parent().remove();//remove li of tab
			$(tabContentId).remove();//remove respective tab content
			if (ibList.length===0) {
				$('#mytabs a').eq(curStaticTab).tab('show'); 	// show last-visited static tab
			}
			else {
				$('#mytabs a:last').tab('show'); // Select last tab
			}

		});
	};
	//shows the tab with passed content div id..paramter tabid indicates the div where the content resides
	function showTab(tabId){
//		$('#myTab a[href="#'+tabId+'"]').tab('show');
		$('a[href="#'+tabId+'"]').tab('show');
	}
	//return current active tab
	function getCurrentTab(){
		return ibCurrent;
	}

	//This function will create a new tab here and it will load the url content in tab content div.
	function createNewTabAndLoadUrl(parms,url,loadDivSelector){
		
		$(""+loadDivSelector).load(url, function(response, status, xhr) {
			if (status == "error") {
				var msg = "Sorry but there was an error getting details ! ";
				$(""+loadDivSelector).html(msg + xhr.status + " " + xhr.statusText);
			}
		});
		
//		$(""+loadDivSelector).append("<p>Load Ajax Content Here... " + loadDivSelector +"</p>");

	}

	//this will return element from current tab
	//example : if there are two tabs having  textarea with same id or same class name then when $("#someId") whill return both the text area from both tabs
	//to take care this situation we need get the element from current tab.
	function getElement(selector){
		var tabContentId = $ibCurrent.attr("href");
		return $(""+tabContentId ).find(""+selector);
		
	}


	function removeCurrentTab(){
		var tabContentId = $ibCurrentTab.attr("href");
		$ibCurrentTab.parent().remove();//remove li of tab
//		$('#myTab a:last').tab('show'); // Select first tab
		$(tabContentId).remove();//remove respective tab content
	}  	
</script>

<%=include("footer.avfp")%>
