Ti.include('and-common.js');

var searchData = [];
var nextpage = 1;
var loadMoreResults = false;
var query;
var inSearchView = false;
var infiniteScrolling = false;
var searching = false;
var searchBarVisible = false;

if (Ti.Platform.name == 'android' && Ti.Platform.Android.API_LEVEL > 11) {

    var searchBar = Ti.UI.Android.createSearchView({
        hintText: "Search",
        right: '5dp',
        zIndex: 100,
        top: 0,
        iconifiedByDefault: false,
        backgroundColor: '#f8f8f8',
        width: Ti.UI.FILL,
        height:'45dp',
        softKeyboardOnFocus: Titanium.UI.Android.SOFT_KEYBOARD_SHOW_ON_FOCUS,
    });

	var create_no_results_row = function(){
		var row = Titanium.UI.createTableViewRow({
			height: '45dp',
			backgroundColor:'transparent',
			width: Ti.Platform.displayCaps.platformWidth,
		});
		
		var label = Titanium.UI.createLabel({
			text: 'No results found!',
			color: 'darkgray',
			font:{
				fontSize: '14dp',
				fontStyle: 'italic',
				fontFamily: 'droidsans',
			}
		});
		row.add(label);
		return row;
	};
	
	var searchTable = create_table_view();
	
	var reComputeSearchTableRowsSize = function(){
	
		var tableData = searchTable.data[0];

		if (Ti.Gesture.landscape){
			for (i = 0; i < tableData.rowCount; i++){
				if (tableData.rows[i].className !== 'article')
					continue;
				tableData.rows[i].height = '120dp';
				tableData.rows[i].content_view.width = Ti.Platform.displayCaps.platformWidth;
				tableData.rows[i].content_view.height = '120dp';
				tableData.rows[i].text_view.left = '115dp';
				tableData.rows[i].text_view.height = '100dp';
				tableData.rows[i].title_label.font = {fontSize: '20dp', fontFamily: 'droidsans', fontWeight: 'bold'};
				tableData.rows[i].thumb.width = '100dp';
				tableData.rows[i].thumb.height = '100dp';
				tableData.rows[i].sharing.social.center = {x: 0.4 * Ti.Platform.displayCaps.platformWidth};
				tableData.rows[i].sharing.bookmark.center = {x: 0.6 * Ti.Platform.displayCaps.platformWidth};
			}
		}
		else{
			for (i = 0; i < tableData.rowCount; i++){
				if (tableData.rows[i].className !== 'article')
					continue;
				tableData.rows[i].height = '100dp';
				tableData.rows[i].content_view.width = Ti.Platform.displayCaps.platformWidth;
				tableData.rows[i].content_view.height = '100dp';
				tableData.rows[i].text_view.left = '95dp';
				tableData.rows[i].text_view.height = '80dp';  
				tableData.rows[i].title_label.font = {fontSize: '17dp', fontFamily: 'droidsans', fontWeight: 'bold'};
				tableData.rows[i].thumb.width = '80dp';
				tableData.rows[i].thumb.height = '80dp';
				tableData.rows[i].sharing.social.center = {x: 0.4 * Ti.Platform.displayCaps.platformWidth};
				tableData.rows[i].sharing.bookmark.center = {x: 0.6 * Ti.Platform.displayCaps.platformWidth};
			}
		}
	};

	searchTable.top = '45dp';
	searchTable.addEventListener('scroll', function(e) {
		if(!!current_row){
			current_row.articleRow.animate({
				left: 0,
				duration: 500
			});
			current_row = null;	
		}	
	});

	var create_searching_row = function(){
		var row = Titanium.UI.createTableViewRow({
			height: '45dp',
			backgroundColor:'transparent',
			width: Ti.Platform.displayCaps.platformWidth,
		});
		
		var label = Titanium.UI.createLabel({
			text: 'Searching...',
			color: 'darkgray',
			font:{
				fontSize: '14dp',
				fontStyle: 'italic',
				fontFamily: 'Helvetica',
			}
		});
		row.add(label);
		return row;
	};
	
	
	var getSearchResults = function(e){
		
		if(!Ti.Network.online){
			dialog('Couldn\'t fetch your results');
			searching = false;
			return;
		}
	
		if (infiniteScrolling)
			searchTable.removeEventListener('scroll',search_infinite_scroll);
			
		searchBar.blur();
		
		if (!inSearchView){
			inSearchView = true;
			win.add(searchTable);
			tbl.hide();	
		}
	
		nextpage = 1;
		searchData = [];
		//searchTable.setData([create_searching_row()]);
		searchTable.setData(null);
		searchTable.appendRow(create_searching_row());
		
		query = searchBar.value.replace(' ','+');
		
		var loader = Titanium.Network.createHTTPClient({
			timeout:10000
		});
		
		loader.open("GET",'http://s6062.p9.sites.pressdns.com/?json=1&count=10&s='+query);
	
		loader.onload = function() 
		{
			var searchResults = JSON.parse(this.responseText);
				
			for (var i = 0; i < searchResults.posts.length; i++)
			{	
				var articleContent = searchResults.posts[i].content; // The tweet message
				var articleTitle = searchResults.posts[i].title; // The screen name of the user
				var author = searchResults.posts[i].author.name;
				var id = searchResults.posts[i].id;
				var url = searchResults.posts[i].url;
				var date = searchResults.posts[i].date;
	
				var thumbail;
				
				if (searchResults.posts[i].attachments.length > 0)
					thumbnail = searchResults.posts[i].attachments[0].images.thumbnail.url;
				else 
					thumbnail = 'images/default_thumb.png';
	
				var articleRow = make_content_view(articleTitle, articleContent, thumbnail, url, id, date, author);
	
				searchData.push(articleRow);
			}
			
			if (searchResults.pages == 0){
				searchData.push(create_no_results_row());
			}
			else if (searchResults.pages > 1){
				nextpage++;
				searchTable.addEventListener('scroll', search_infinite_scroll);
				infiniteScrolling = true;
			}
			
			Ti.Gesture.addEventListener('orientationchange', reComputeSearchTableRowsSize);
			searchTable.data = searchData;
			searching = false;

		};
		
		loader.onerror = function(e){
			common.dialog('Couldn\'t fetch your results');
			searchData.push(create_no_results_row());
			searchTable.setData(searchData);
			searching = false;
		};
		
		loader.send();
	};
	
	
	var search_infinite_scroll = function(evt) {
		if (evt.totalItemCount < evt.firstVisibleItem + evt.visibleItemCount + 3) {
			searchTable.removeEventListener('scroll', search_infinite_scroll);	
			loadMoreResults = true;       
		}
	};
	
	setTimeout(function load_more_results() {
	
	    if (loadMoreResults == false || !Titanium.Network.online) {
	        setTimeout(load_more_results, 500);
	        return;
		}			
		
		loadMoreResults = false;	
		
		searchTable.removeEventListener('scroll',search_infinite_scroll);
		infiniteScrolling = false;

		searchTable.appendRow(create_loading_row());
	    
		var loader = Titanium.Network.createHTTPClient();
	
		loader.open("GET",'http://s6062.p9.sites.pressdns.com/?json=1&count=10&s='+query+'&page='+nextpage);
		
		loader.onload = function() 
		{
			searchTable.deleteRow(searchTable.data[0].rows.length-1);
			var searchResults = JSON.parse(this.responseText);
			
			for (var i = 0; i < searchResults.posts.length; i++)
			{
				var articleContent = searchResults.posts[i].content; // The tweet message
				var articleTitle = searchResults.posts[i].title; // The screen name of the user
				var author = searchResults.posts[i].author.name;
				var id = searchResults.posts[i].id;
				var url = searchResults.posts[i].url;
				var date = searchResults.posts[i].date;
				
				var thumbail;
		
				if (searchResults.posts[i].attachments.length > 0)
					thumbnail = searchResults.posts[i].attachments[0].images.thumbnail.url;
				else 
					thumbnail = 'images/default_thumb.png';
		
				// Create a row and set its height to auto
				var articleRow = make_content_view(articleTitle, articleContent, thumbnail, url, id, date, author);
				searchTable.appendRow(articleRow);
			}
				
			if (searchResults.pages > nextpage){
				nextpage++;
				searchTable.addEventListener('scroll',search_infinite_scroll);
				infiniteScrolling = true;
			}
			else{
				searchTable.removeEventListener('scroll', search_infinite_scroll);
				infiniteScrolling = false;
			}
		};
		
		loader.onerror = function(e){
			tbl.deleteRow(tbl.data[0].rows.length-1);
			tbl.addEventListener('scroll',infinite_scroll);
		};
		
		loader.send();
		
		setTimeout(load_more_results, 500);
	},500);
	
	
	searchBar.addEventListener('submit', function(){
		if (!searching){
			Ti.Gesture.removeEventListener('orientationchange', reComputeSearchTableRowsSize);
			searching = true;
			getSearchResults();
		}
			
	});
	
	var remove_searchView = function(){
		tbl.show();
		if (inSearchView)
			win.remove(searchTable);
		searchTable.setData(null);
		searchData = null;
		Ti.UI.Android.hideSoftKeyboard();
		win.remove(searchBar);
		inSearchView = false;
		searching = false;
		searchBarVisible = false;
		Ti.Gesture.removeEventListener('orientationchange', reComputeSearchTableRowsSize);
	};
	
	var toggle_searchView = function(){
		if (!searchBarVisible){
			win.add(searchBar);
			searchBar.focus();
			searchBarVisible = true;
		}
		else{
			remove_searchView();
		}	
	};
}