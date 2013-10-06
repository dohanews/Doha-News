var get_relative_time = function(date){
	var text;
	var dateTime = date.split(' ');
	
	var pDate = dateTime[0].split('-');
	pYear = parseInt(pDate[0],10);
	pMonth = parseInt(pDate[1],10);
	pDay= parseInt(pDate[2],10);

	var pTime = dateTime[1].split(':');
	pHour = parseInt(pTime[0],10);
	pMin = parseInt(pTime[1],10);
	
	var currentTime = new Date();
	var zone = (currentTime.getTimezoneOffset())/60;
	currentTime = new Date(new Date()*1 + (1000*3600*(3+zone)));
	var hours = parseInt(currentTime.getHours(),10);
	var minutes = parseInt(currentTime.getMinutes(),10);
	var year = parseInt(currentTime.getFullYear(),10);
	var month = parseInt(currentTime.getMonth()+1,10);
	var day = parseInt(currentTime.getDate(),10);

	if (year == pYear && month == pMonth && day == pDay){
		
		if (pHour == hours){
			if (pMin == minutes)
				text = 'Just now';
			else{
				diff = Math.abs(pMin - minutes);
				text = diff == 1? diff + ' minute ago' : diff + ' minutes ago';
			}
		}
		else{
			diff = Math.abs(pHour - hours);
			if (diff == 1){
				diff = pMin - minutes;

				if (diff > 0){
					diff = 60 - diff;
					text = diff == 1? diff + ' minute ago' : diff + ' minutes ago';
				}
				else
					text = 'an hour ago';
			}
			else{
				text = diff + ' hours ago';
			}
		}
	}
	else{
		if (pYear == year){
			if (pMonth == month){
				diff = Math.abs(pDay - day);
				text = diff == 1? 'Yesterday' : diff + ' days ago';
			}
			else{
				diff = Math.abs(pMonth - month);
				text = diff == 1? 'Last month' : diff + ' months ago';
			}	
		}
		else{
			diff = Math.abs(pYear - year);
			text = diff == 1? 'Last year' : diff + ' years ago';
		}	
	}
	
	return text;
};


var create_date_label = function(date){
	
	var text = get_relative_time(date);
	
	var dateLabel = Ti.UI.createLabel({
		text: text,
		backgroundColor: 'transparent',
		font:{
			fontSize: '12dp',
			fontFamily: 'droidsans',
		},
		color: 'gray',
		height: Ti.UI.SIZE,
		bottom: 0,
	});
	return dateLabel;
};

make_content_view = function(title, content, thumbnail, url, id, date, author, modified, loadFromDictionary) {

	var content_view = Ti.UI.createView({
		height: Ti.Gesture.landscape? '120dp': '100dp',
		width: Titanium.Platform.displayCaps.platformWidth,
		left: 0,
		backgroundColor: 'white',
		zIndex: 500,
	});
	
	var thumb = Ti.UI.createImageView({
		height: Ti.Gesture.landscape? '100dp': '80dp',
		width: Ti.Gesture.landscape? '100dp': '80dp',
		left: '5dp',
		image: thumbnail,
	});

	var textView = Ti.UI.createView({
		//top: '0dp',
		left: Ti.Gesture.landscape? '115dp': '95dp',
		right: '20dp',
		height: Ti.Gesture.landscape? '100dp':'80dp',
		backgroundColor:'transparent',
		layout: 'vertical',
	});
	
	var authorTimeView = Ti.UI.createView({
		// left: '80dp',
		// right: '20dp',
		left: 0,
		height: Ti.UI.SIZE,
		layout: 'horizontal',
	});
	
	var titleLabel = Ti.UI.createLabel({
		text: title,
		color:'#4A4A4A',
		ellipsize: true,
		left: 0,
		height: '64dp',
		verticalAlign: Titanium.UI.TEXT_VERTICAL_ALIGNMENT_TOP,
		font: {
			fontSize: Ti.Gesture.landscape? '20dp': '17dp',
			fontFamily: 'droidsans',
			fontWeight: 'bold',
		},
		backgroundColor:'transparent',
	});
	
	var authorLabel = Ti.UI.createLabel({
		text: author,
		color:'#70193c',
		// top: '0dp',
		// left: '80dp',
		// right: '20dp',
		left: '3dp',
		height: Ti.UI.SIZE,
		font: {
			fontSize: '12dp',
			fontFamily: 'droidsans',
		},
		backgroundColor:'transparent',
	});
	
	var date_label = create_date_label(date);
	textView.add(titleLabel);
	authorTimeView.add(date_label);
	authorTimeView.add(authorLabel);
	textView.add(authorTimeView);
	content_view.add(thumb);
	content_view.add(textView);
	
	var row = Ti.UI.createTableViewRow({
		height: Ti.Gesture.landscape? '120dp' : '100dp',
		width: Ti.Platform.displayCaps.platformWidth,
		backgroundColor:'#fff',
		className: 'article',
		url: url,
		content: content,
		articleTitle: title,
		id: id,
		author: author,
		date: date,
		modified: modified,
		date_label: date_label,
		title_label: titleLabel,
		text_view: textView,
		content_view: content_view,
		thumb: thumb,
	});
	
	row.articleRow = content_view;
	row.sharing = create_sharing_options_view(url, title, content, thumbnail, id, date, author);
	row.add(row.sharing);
	row.add(row.articleRow);
	
	row.addEventListener('longclick', sharing_animation);

	row.articleRow.addEventListener ('click', function(e){
		var articleWindow;
		if (loadFromDictionary)
			articleWindow = Ti.UI.createWindow({
				backgroundColor:'#fff',
				url: 'detail.js',
				modal: false,
				content: table_rows[id].content, 
				id: table_rows[id].id,
				articleUrl: table_rows[id].url,
				articleTitle: table_rows[id].articleTitle,
				thumbnail: table_rows[id].thumb.image,
				date: table_rows[id].date,
				author: table_rows[id].author,
				navBarHidden: true,
			});
		else
			articleWindow = Ti.UI.createWindow({
				backgroundColor:'#fff',
				url: 'detail.js',
				modal: false,
				content: content, 
				id: id,
				articleUrl: url,
				articleTitle: title,
				thumbnail: thumbnail,
				date: date,
				author: author,
				navBarHidden: true,
			});
		
		articleWindow.addEventListener('open', function(e) {
			setTimeout(function(){
			var actionBar = win.getActivity().actionBar;
				if (actionBar){
					actionBar.icon = "images/header-logo.png";
					actionBar.title = "";
					actionBar.displayHomeAsUp = true;
					actionBar.onHomeIconItemSelected = function() {
						articleWindow.close();
					};
				}
			}, 500);
		});
		
		articleWindow.open({
			animated:true,
		});
		
		win.addEventListener('close',function(){
			Ti.UI.currentTab.fireEvent('focus');
		});

		if (!!current_row) {
			current_row.articleRow.animate({
				opacity: 1,
				duration: 500
			});
			current_row = null;
		}
	});

	return row;
};

var create_header = function(){
	var header = Titanium.UI.createView({
		backgroundColor: '#DDDDDD',
		top: 0,
		height: '45dp',
		zIndex: 2
	});
	
	var headerStrip = Titanium.UI.createView({
		backgroundColor: '#D2D2D2',
		height: '3px',
		bottom: 0,
	});
	
	header.add(headerStrip);
	
	var headerStripDark = Titanium.UI.createView({
		backgroundColor: '#BABABA',
		height: '1px',
		bottom: 0,
	});
	
	header.add(headerStripDark);
	
	var headerLogo = Titanium.UI.createImageView({
		width: '32dp',
		height: '32dp',
		image: 'images/header-logo.png',
		left: '13dp',
		top: '8dp',
	});
	
	var headerBack = Titanium.UI.createImageView({
		width: '15px',
		height: '28px',
		image: 'images/back-arrow.png',
		left: '5dp',
	});
	header.add(headerBack);
	headerLogo.addEventListener('click', function(){
		win.close();
	});
	
	header.add(headerLogo);
	
	return header;
};


var create_table_view = function(){
	var table = Ti.UI.createTableView({
		backgroundColor:'white',
		rowHeight: Ti.UI.SIZE,
		left: '5dp',
		right: '5dp',
		bubbleParent: false,
		selectionStyle: 'none',
		separatorColor: '#e9e5df',
	});
	return table;
};


var dialog = function(title, msg){
	title = title || 'Couldn\'t fetch your articles';
	msg = msg || 'Please check internet connectivity';
	
	var notification = Titanium.UI.createNotification({
		message: title + '\n' + msg,
		duration: Ti.UI.NOTIFICATION_DURATION_LONG,
	});
	
	notification.addEventListener('click',function(){
		notification.hide();
	});
	notification.show();
};
