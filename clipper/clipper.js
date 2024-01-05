javascript: (function()
{
	var notesurl = "";
	var content = document.title + "\n" + document.location;
	window.open("https://" + notesurl + "?c=" + encodeURIComponent(content), "_blank", "popup,width=100,height=100");
})();
