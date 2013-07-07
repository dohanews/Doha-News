Ti.include('and-common');

var searchData = [];
var nextpage = 1;
var loadMoreResults = false;
var query;
var alreadyInSearch = false;
var infiniteScrolling = false;
var searching = false;

if (Ti.Platform.name == 'android' && Ti.Platform.Android.API_LEVEL > 11) {
    // Use action bar search view
    var searchBar = Ti.UI.Android.createSearchView({
        hintText: "Table Search",
        right: '5dp',
        zIndex: 100,
    });
    
	var create_no_results_row = function(){
		var row = Titanium.UI.createTableViewRow({
			height: Ti.UI.SIZE,
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
		})
		row.add(label);
		return row;
	}
	
	var searchTable = create_table_view();

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
			height: Ti.UI.SIZE,
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
		})
		row.add(label);
		return row;
	}
	
	
	var getSearchResults = function(e){
		if (infiniteScrolling)
			searchTable.removeEventListener('scroll',search_infinite_scroll);
			
		searchBar.blur();
		
		nextpage = 1;
		searchData = [];
		searchTable.setData([create_searching_row()]);	
		
		if (!alreadyInSearch)
		win.add(searchTable);
	
		tbl.hide();	
		
		query = searchBar.value.replace(' ','+');
		
		var loader = Titanium.Network.createHTTPClient();
		loader.open("GET",'http://dev.dohanews.co/?json=1&count=10&s='+query);
	
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
					thumbnail = searchResults.posts[i].attachments[0].images.small.url
				else 
					thumbnail = "http://www.the-brights.net/images/icons/brights_icon_50x50.gif";	
	
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
		
			searchTable.data = searchData;
			searching = false;

		}
		
		loader.send();
	};
	
	
	var search_infinite_scroll = function(evt) {
		if (evt.totalItemCount < evt.firstVisibleItem + evt.visibleItemCount + 3) {
			searchTable.removeEventListener('scroll', search_infinite_scroll);	
			loadMoreResults = true;       
		}
	};
	
	setTimeout(function load_more_results() {
	
	    if (loadMoreResults == false) {
	        setTimeout(load_more_results, 500);
	        return;
		}			
		
		loadMoreResults = false;	
		
		searchTable.removeEventListener('scroll',search_infinite_scroll);
		infiniteScrolling = false;

		searchTable.appendRow(create_loading_row());
	    
		var loader = Titanium.Network.createHTTPClient();
	
		loader.open("GET",'http://dev.dohanews.co/?json=1&count=10&s='+query+'&page='+nextpage);
		
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
					thumbnail = searchResults.posts[i].attachments[0].images.small.url
				else 
					thumbnail = "http://www.the-brights.net/images/icons/brights_icon_50x50.gif";
		
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
		}
		
		loader.send();
		
		setTimeout(load_more_results, 500);
	},500);
	
	
	searchBar.addEventListener('submit', function(){
		tbl.hide();
		if (!searching){
			searching = true;
			getSearchResults();
		}
			
	});
	
	searchBar.addEventListener('cancel',function(){
		if (searchBar.value == ''){
			tbl.show();
			win.remove(searchTable);
			searchData = null;
			alreadyInSearch = false;
		}
    });
	
	searchBar.addEventListener('change', function(e){
		if (searchBar.value == ''){
			tbl.show();
			win.remove(searchTable);
			searchData = null;
			alreadyInSearch = false;
		}
	});
}



