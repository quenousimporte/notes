javascript: (function()
{
	var notesurl = "";
	var bm = {
		title: document.title,
		url: document.location.href,
		time: Date.now()
	};
	window.open("https://" + notesurl + "?c=" + encodeURIComponent(JSON.stringify(bm)), "_blank", "popup,width=100,height=100");
})();
