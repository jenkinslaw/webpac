/*
Jenkins Law Library
Originally written by Adam Brin (Modified by Andrew J. Sather for clarity and use on JLL JAC)
Modified August 11, 2008

Finds title and call number on JAC generated page and sends the variables to a script for emailing

Edits:
August 11, 2008
*The code needed some air, so I added about a trillion line breaks and correctly indented the entire thing.
*Comments have been rewritten for clarity. Additional comments have been made.
*Altered the structure of the code, which change the script for Jenkins Law Library
*Changed the help tip text to toggle on and off. (see function helpBox())
*/

//The following line should be the URL for the server-side script responsible for emailing the data to the cell phone
var smsurl = "http://www.jenkinslaw.org/sms.php?";
var debug = 0; // Declare debug variable. Set to an int. greater than one to enter debug mode.

var smsurl = "http://www.jenkinslaw.org/sms.php?"; //temporary

function helpBox()
/*
Controls the help box.
*/
{
	if (debug > 0)
	{
		alert('Inside helpBox()'); // Just a debug notice
	}
	if(document.getElementById('info').style.visibility == 'visible') //If the box is on
	{
		if (debug > 0)
		{
			alert('The box is on.'); // Just a debug notice
		}
		findPos(document.getElementById('smsbutton'),document.getElementById('info'),0,0);
		document.getElementById('info').style.visibility='hidden';
		return false;
	}
	else //If the box is off
	{
		if (debug > 0)
		{
			alert('The box is off.'); // Just a debug notice
		}
		findPos(document.getElementById('smsbutton'),document.getElementById('info'),0,0);
		document.getElementById('info').style.visibility='visible';
		return false;
	}
}

function showsms()
{
/*
Reveals the sms DIV to user for phone information input
*/
	if(document.getElementById('info').style.visibility == 'visible') //If the help tip text box is on
	{
		helpBox(); //This will effectively turn of help tip box off.
	}
	
	try // Try this. On error, rever to the "Catch" block, which will catch the error.
	{
		var title = ''; // Declare variable for the media title and set to an empty string.
		var callNumber = ''; //Declare variable for the media call number and set to an empty string.
		var f = document.getElementById('bib_detail'); //The starting point for this data harvesting. This element should be a table.

		try // Try this. On error, rever to the "Catch" block, which will catch the error.
		{
			var tr = document.getElementsByTagName('TR'); // We have to iterate through every TR b/c we can't get to the title otherwise
			
			for(i = 0; i < tr.length; i++) //For every TR in the document
			{
				var x = tr[i].getElementsByTagName('TD'); // Get all of the Columns
				
				if (x.length > 0 && x[0].innerHTML == "TITLE") // ASSUME the row has two columns. Find the row with a TD.innerHTML of "Title"
				//if (x.length == 2 && x[0].innerHTML == "Title")  //REMOVED IN AUGUST 11, 2008 EDIT. (The array length requirement is really unnecessary in our situation and I don't want to restrict results more than we have to. - AJS)
				{  
					title = x[1].innerHTML.replace(/(<([^>]+)>)/ig,""); //Strip out all of the HTML so we just have text.

					if (debug > 0)
					{
						alert('Found Title: ' + title); // Just a debug notice
					}
				}
				
				//The following was added in the August 11, 2008 edit (AJS)
				if (x.length > 0 && x[0].innerHTML == "CALL #") // ASSUME the row has two columns. Find the row with a TD.innerHTML of "Call #"
				{  
					callNumber = x[1].innerHTML.replace(/(<([^>]+)>)/ig,""); //Strip out all of the HTML so we just have text.

					if (debug > 0)
					{
						alert('Found Call Number: ' + callNumber); // Just a debug notice
					}
				}
				//End this addition for the August 11, 2008 edit. (AJS)
			}
		} 
		catch (e) //What's the point of a catch that doesn't DO ANYTHING?? Death with Grace is hardly useful without notification. I'm adding at least an alert for devs.. - AJS
		{
			if(debug > 0)
			{
				alert('Error! ' + e.description); //Notify developer if there's an error. "Just a debug notice."
			}
		}

		var sms = document.getElementById('sms'); // this is the DIV that we're going to put the text into
		
		var smsCookie = smsCookie = readCookie('JenkSMS');
		var cArray = smsCookie.split(':');
		//var sProvider[cArray[1]] = "selected"; 
		
		// we'll load the 'out' variable with all the html and then put it into the sms div...
		
		//First part of the DIV
		var out = "<h3>Send this title to your mobile phone.</h3><form name='sms_form' method=post><p><b>Title</b>: "+ title +"</p>";

		//The rest of the DIV
		out += '<input type=hidden name=title value=\"'+title+'\">';	//dump the title into a hidden form variable
		out += '<p><b>Enter your mobile phone #</b>: <input name=phone type=text value=\"'+cArray[0]+'\"></p>';	// input for the phone #
		out += "<p class=eg>(Use the full 10 digits of your phone #, no spaces, no dashes eg. 6105265000)</p>";
		out += "<p><b>Select your provider:</b> <select name=provider>";	// pull-down for each of phone carriers the values will be parsed by the perl script
		/*
		out += "<option value=att "+sProvider['att']+">AT&amp;T</option>";
		out += "<option value=nextel>Nextel</option>";
		out += "<option value=sprint>Sprint</option>";
		out += "<option value=tmobile>T-Mobile</option>";
		out += "<option value=verizon>Verizon</option>";
		out += "<option value=virgin>Virgin</option>";
		*/
		
		var providers = new Array("Alltel", "AT&amp;T", "Boost","Cricket","Nextel", "Qwest","Sprint", "T-Mobile", "Verizon", "Virgin");
		
		for(pi = 0; pi < providers.length; pi++)
		{
			if(providers[pi] == cArray[1])
			{
				out += "<option value='"+providers[pi]+"' selected>"+providers[pi]+"</option>";	
			}
			else
			{
				out += "<option value='"+providers[pi]+"'>"+providers[pi]+"</option>";	
			}
		}
		
		out += "</select></p>";
		
		//out += "<p><b>choose an item near you:</b><ol>";

		var itms = document.getElementById('bib_items'); //Get the ITEM table.
		var tr = itms.getElementsByTagName('TR'); // Get each row of the ITEM table.
		
		for(i = 1; i < tr.length; i++)
		{
			var x = tr[i].getElementsByTagName('TD'); //Get each cell
			
			if (x.length == 3) // if there's only 3 cells (like our ITEM table)
			{								
				var copyVolume = x[0].innerHTML.replace(/(<([^>]+)>|&nbsp;)/ig,""); //Get the copy/volume info (remove tags)
				var status = x[1].innerHTML.replace(/(<([^>]+)>|&nbsp;)/ig,""); //Get the status (remove tags)
				var location = x[2].innerHTML.replace(/(<([^>]+)>|&nbsp;)/ig,"");	//Get the location (remove tags)
			}

			var chck = '';
			if (i == 1) chck = ' checked '; // if we're on the first row, check it

			// append the input
			//out += "<li><input " + chck + " type = radio name = \"loc\" value = \"" + copyVolume + "~|~" + callNumber + "~|~" + title + "~|~" + location + "\">"; //Create the bullet
			//out += copyVolume + " " + location + "(" + status + ")"; //Create the list
			//out += "</li>" //End the item
			out += "<input type='hidden' name = \"loc\" value = \"" + copyVolume + "~|~" + callNumber + "~|~" + title + "~|~" + location + "\">";
			
			//out += '<li><input '+chck+' type = radio name = \"loc\" value=\"\nloc:' + copyVolume + '\n' + 'call #:' + callNumber + '\">'+ copyVolume + ": "+status+"("+location+")</li>";

			if (debug > 0) 
			{
				alert('found item: ' + copyVolume + '|' + status + ' | ' + location ); //Just a debug alert
			}
		}

		// close the list and add note
		out += "</ol></p>";
		out += "<p><B>NOTE:</B> <i>Carrier charges may apply. Information collected here will be used <br>only to send a one-time text message on your behalf.</i></p>";

		// add buttons at bottom.  note the return false which stops the forms from actually doing anything
		out += "<p><a href='#here' id='sendmessage' onClick='sendSMS();return false;'><img src='/screens/smssend.gif' border=0></a> <a href='#here' id='clearmessage' onClick='clearsms();return false;'><img src='/screens/smsclear.gif' border=0></a></p>";

		// we use the innerHTML property to actually set the HTML into the page
		sms.innerHTML = out+"</form>";

		// now we make the div visible
		sms.style.visibility = 'visible';
		sms.style.display = 'block';

		//findPos(document.getElementById('smsbutton'),sms,-350,-300); // Some fancy positioning
		findPos(document.getElementById('smsbutton'),sms,0,0); // Some fancy positioning
		
	} 
	catch (e)
	{
		// doesn't work?  hide the SMS buttons
		//document.getElementById('smsfeatures').style.visibility = 'hidden';
		if (debug > 0) 
		{
			alert("Yarr! An Error!");
		}
	}
	return false;
}


function sendSMS()
{
	if (debug > 0) 
	{
		alert('Entered sendSMS function.'); //Just a debug alert
	}
	
	var frm = document.sms_form; // get the SMS form
	var phone = frm.phone.value; // get the phone number
	
	phone = phone.replace(/[^\d]/ig,""); // remove all non-digit characters

	//Get the values to send to the cell phone and put them in a results array
	if (frm.loc.length == undefined) //If there's only one book/medium available
	{
		
			//Find the value of the bullet and split it using "~|~" as a delininator. (~|~ is unkikely to be used in a book title)
			var copyVolume = frm.loc.value.split("~|~")[0];
			var callNumber = frm.loc.value.split("~|~")[1];
			var title = frm.loc.value.split("~|~")[2];
			var location = frm.loc.value.split("~|~")[3];
			
			if (debug > 0) 
			{
				alert('Only one option...'); //Just a debug alert
				alert('Title: ' + title + '\nCallNumber: ' + callNumber + '\ncopyVolume: ' + copyVolume + 'Location ' + location); //Just a debug alert
			}
	}
	else //If there are many books/media available.
	{
		
		for (i=0;i<frm.loc.length;i++) //For each book/media available, go through the auto-generated bullet points and find the desired, checked box.
		{
			// for each item, get the checked one 		
			//if (frm.loc[i].checked == true) // if checked....
			//{
				//Find the value of the bullet and split it using "~|~" as a delininator.
				var copyVolume = frm.loc[i].value.split("~|~")[0];
				var callNumber = frm.loc[i].value.split("~|~")[1];
				var title = frm.loc[i].value.split("~|~")[2];
				var location = frm.loc[i].value.split("~|~")[3];
				
				if (debug > 0) 
				{
					alert('Title: ' + title + '\nCallNumber: ' + callNumber + '\ncopyVolume: ' + copyVolume + 'Location ' + location); //Just a debug alert
				}			
			//}
		}	
	}

	//alert(copyVolume + " " + callNumber + " " + title + " " + location);
	
	if (phone.length == 10) // if 10 chars, we're good
	{	
		var url = smsurl; // start creating the URL
		url += "copyVolume="+encodeURIComponent(copyVolume); // Add the copy/volume id to the url.
		url += "&callNumber="+encodeURIComponent(callNumber); // Add the call number to the url.
		url += "&title="+encodeURIComponent(title); // Add the title to the url.
		url += "&location="+encodeURIComponent(location); // Add the location to the url.
		url += "&phoneNumber="+encodeURIComponent(frm.phone.value); //Add the user's phone number to the url.
		//url += "&provider="+encodeURIComponent(frm.provider.options[frm.provider.selectedIndex].value);	// Add the provider to the url.
		url += "&provider="+encodeURIComponent(frm.provider.value);
		/*
		if (debug > 0) 
		{
			alert(url);
		}
		*/
		var cookieStr = phone + ":" + frm.provider.value;
		createCookie('JenkSMS',cookieStr,30);
		
		clearsms(); //Make the box disappear after the data has been collected and an email is about to be sent.
		var head = document.getElementsByTagName("head")[0]; // now we create a <SCRIPT> tag in the <HEAD> to get the response
		var script = document.createElement('script');
		script.setAttribute('type','text/javascript');
		script.setAttribute('src',url);	// The SRC is a PHP script
		head.appendChild(script); // append the script
		
		alert("Message Sent!"); //Alert the user.
	} 
	else // invalid phone #, send message
	{
		//alert('please enter a valid phone #');
		alert('Please enter a valid 10-digit phone number. Remember not to use hyphens.'); //A slightly more user-friendly message, no? -AJS
	}
}


function clearsms()
{
/*
Clear/hide the SMS DIV
*/
	var sms = document.getElementById('sms');
	sms.style.visibility = 'hidden';
	sms.style.display = 'none';
}



function findPos(obj,obj2,lofset,tofset)
{
/*
Get the position of an item, good for putting the SMS form in a useful place.
*/
	var curleft = curtop = 0;
	if (obj.offsetParent)
	{
		curleft = obj.offsetLeft
		curtop = obj.offsetTop
		
		while (obj = obj.offsetParent)
		{
			curleft += obj.offsetLeft
			curtop += obj.offsetTop
		}
	
	}
	obj2.style.left = curleft+lofset;
	obj2.style.top = curtop+tofset;
}


function createCookie(name,value,days) {
	if (days) {
		var date = new Date();
		date.setTime(date.getTime()+(days*24*60*60*1000));
		var expires = "; expires="+date.toGMTString();
	}
	else var expires = "";
	document.cookie = name+"="+value+expires+"; path=/";
}

function readCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return ':';
}

function eraseCookie(name) {
	createCookie(name,"",-1);
}
