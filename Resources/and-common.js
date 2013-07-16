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
	var hours = parseInt(currentTime.getUTCHours(),10);
	var minutes = parseInt(currentTime.getUTCMinutes(),10);
	var year = parseInt(currentTime.getUTCFullYear(),10);
	var month = parseInt(currentTime.getUTCMonth()+1,10);
	var day = parseInt(currentTime.getUTCDate(),10);

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
}


create_date_label = function(date){
	
	var text = get_relative_time(date);
	
	var dateLabel = Ti.UI.createLabel({
		text: text,
		backgroundColor: 'transparent',
		font:{
			fontSize: '12dp',
			fontFamily: 'Helvetica-Bold',
		},
		color: 'gray',
		bottom: 0,
	}) 
	return dateLabel;
}

make_content_view = function(title, content, thumbnail, url, id, date, author) {

	var content_view = Ti.UI.createView({
		height: Ti.UI.FILL,
		width: Titanium.Platform.displayCaps.platformWidth,
		left: 0,
		backgroundColor: 'white',
	})
	
	var thumb = Ti.UI.createImageView({
		height: '70dp',
		width: '70dp',
		left: '5dp',
		image: thumbnail,
	});

	var textView = Ti.UI.createView({
		//top: '0dp',
		left: '85dp',
		right: '20dp',
		height: Ti.UI.SIZE,
		backgroundColor:'transparent',
		layout: 'vertical',
	})
	
	var authorTimeView = Ti.UI.createView({
		top: '2dp',
		// left: '80dp',
		// right: '20dp',
		left: 0,
		height: Ti.UI.SIZE,
		backgroundColor:'transparent',
		layout: 'horizontal',
	});
	
	var titleLabel = Ti.UI.createLabel({
		text: title,
		color:'#4A4A4A',
		ellipsize: true,
		// top: '0dp',
		// left: '80dp',
		// right: '20dp',
		left: 0,
		height: '60dp',
		verticalAlign: Titanium.UI.TEXT_VERTICAL_ALIGNMENT_TOP,
		font: {
			fontSize: '15dp',
			fontFamily: 'Helvetica-Bold',
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
			fontFamily: 'Helvetica-Bold',
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
		height: '90dp',
		width: Ti.Platform.displayCaps.platformWidth,
		backgroundColor:'#fff',
		className: 'article',
		url: url,
		content: content,
		articleTitle: title,
		id: id,
		author: author,
		date: date,
		date_label: date_label,
	});

	row.articleRow = content_view;
	row.sharing = create_sharing_options_view(url, title, content, thumbnail, id, date, author);
	row.add(row.sharing);
	row.add(row.articleRow);
	
	row.addEventListener('longclick', sharing_animation);

	row.articleRow.addEventListener ('click', function(e){
		var win = Ti.UI.createWindow({
			backgroundColor:'#fff',
			url: 'detail.js',
			modal: true,
			content: content, 
			id: id,
			articleUrl: url,
			articleTitle: title,
			thumbnail: thumbnail,
			date: date,
			author: author,
		})
		
		win.open({
			animated:true,
		});
		
		win.addEventListener('close',function(){
			Ti.UI.currentTab.fireEvent('focus');
		})

		if (!!current_row) {
			current_row.articleRow.animate({
				opacity: 1,
				duration: 500
			});
			current_row = null;
		}
	});

	return row;
}

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
}

var create_header = function(){
	var header = Titanium.UI.createView({
		backgroundColor: '#f8f8f8',
		top: 0,
		height: '45dp',
		zIndex: 2
	});
	
	var headerStrip = Titanium.UI.createView({
		backgroundColor: '#70193c',
		height: '5dp',
		top: 0,
	})
	header.add(headerStrip);
	
	var topLogo = Titanium.UI.createLabel({
		width: Ti.UI.SIZE,
		text: 'Doha News',
		color: '#70193c',
		top: '5dp',
		font: {fontSize: '18dp', fontFamily: 'Helvetica-Bold'}
	});
	
	header.add(topLogo);
	
	return header;
}

var dialog = function(title, msg){
	title = title || 'Couldn\'t fetch your articles';
	msg = msg || 'Please check internet connectivity';
	
	var notification = Titanium.UI.createNotification({
		message: title + '\n' + msg,
		duration: Ti.UI.NOTIFICATION_DURATION_LONG,
	}) 
	
	notification.addEventListener('click',function(){
		notification.hide();
	})
	notification.show();
}