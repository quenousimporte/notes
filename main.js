var defaultsettings = 
{
	savedelay: 1000,
	bgcolor: "white",
	fontfamily: "'Inconsolata', 'Consolas', monospace",
	foldmarkstart: 22232,
	defaultpreviewinsplit: false,
	remote: false,
	enablefolding: false
};

//builtin
var markerslist = ["* ", "- ", "    * ", "    - ", ">> ", "> ", "=> "];
var sectionmarks = ["---", "### ", "## ", "# ", "```"];
var codelanguages = ["xml", "js", "sql"];

// globals
var currentnote = null;
var fileindex = 0;
var timeoutid = null;
var folds = [];
var backup = "";
var localdata = null;
var saved = true;
var settings = null;

var commands = [
{
	hint: "Close menu"
},
{
	shortcut: "ctrl+p",
	hint: "Show notes list",
	savedonly: true,
	action: searchandloadnote
},
{
	hint: "Share note",
	savedonly: true,
	action: share
}/*,
{
	hint: "Share note (html)",
	savedonly: true,
	action: sharehtml
}*/,
{
	shortcut: "ctrl+n",
	hint: "New note",
	savedonly: true,
	action: startnewnote
},
{
	shortcut: "ctrl+shift+P",
	hint: "Command palette",
	savedonly: false,
	action: commandpalette,
	excludepalette: true
},
{
	shortcut: "ctrl+t",
	hint: "Open todo",
	savedonly: true,
	action: loadtodo
},
{
	shortcut: "ctrl+q",
	hint: "Open quick note",
	savedonly: true,
	action: loadquicknote
},
{
	shortcut: "ctrl+shift+F",
	hint: "Find in notes",
	savedonly: true,
	action: showgrep
},
{
	shortcut: "ctrl+i",
	hint: "Toggle title",
	savedonly: true,
	action: toggletitle
},
{
	shortcut: "ctrl+m",
	hint: "Toggle preview",
	savedonly: true,
	action: togglepreview
},
{
	shortcut: "ctrl+d",
	hint: "Delete note",
	savedonly: true,
	action: deletenote
},
{
	hint: "Restore note",
	savedonly: true,
	action: restore
},
{
	shortcut: "ctrl+h",
	hint: "Insert markdown header",
	action: insertheader
},
{
	savedonly: true,
	shortcut: "F1",
	hint: "Show help",
	action: showhelp
},
{
	savedonly: true,
	shortcut: "ctrl+shift+C",
	hint: "Fold",
	action: fold
},
{
	savedonly: true,
	shortcut: "ctrl+shift+O",
	hint: "Unfold",
	action: unfold
},
{
	savedonly: true,
	hint: "Unfold all",
	action: unfoldall
},
{
	savedonly: true,
	hint: "Download note",
	action: downloadnote
},
{
	savedonly: true,
	hint: "Download local data",
	action: downloadlocal,
	shortcut: "ctrl+shift+S"
}/*,
{
	savedonly: true,
	hint: "Download all notes",
	action: downloadnotes
}*/,
{
	hint: "Force push",
	action: push,
	shortcut: "ctrl+s"
},
{
	hint: "Search tags",
	action: searchtags,
	savedonly: true,
	shortcut: "ctrl+shift+T"
},
{
	hint: "Log out",
	action: logout,
	savedonly: true
},
{
	hint: "Toggle split view",
	savedonly: true,
	action: togglesplit
},
{
	hint: "Open last modified note",
	savedonly: true,
	action: loadlast,
	shortcut: "ctrl+l"
},
{
	hint: "Sort text",
	savedonly: true,
	action: sortselection
},
{
	hint: "Word count",
	action: wordcount,
	shortcut: "ctrl+w"
},
{
	hint: "Settings",
	savedonly: true,
	action: editsettings	
},
{
	hint: "Restore default settings",
	savedonly: true,
	action: restoresettings	
},
{
	hint: "Document outline",
	savedonly: true,
	action: showoutline		
},
{
	hint: "Internal links",
	savedonly: true,
	action: showinternallinks		
}];

var snippets = [
{
	command: "/code",
	hint: "Code block",
	insert: "```\n\n```",
	cursor: -4
},
{
	command: "/date",
	hint: "Current date",
	insert: (new Date).toISOString().substring(0, 10) + " ",
	cursor: 0
},
{
	command: "/bonjour",
	hint: "Standard answer (fr)",
	insert: "Bonjour ,\n\n\n\nBien cordialement,\nSimon",
	cursor: -29
},
{
	command: "/hello",
	hint: "Standard answer (en)",
	insert: "Hello ,\n\n\n\nKind regards,\nSimon",
	cursor: -24
}];

function showinternallinks()
{
	searchinlist(
		getnotecontent()
		.match(/\[\[([^\]]*)\]\]/g || [])
		.map(l => l.replace("[[", "").replace("]]", "")))
	.then(loadfile);	
}

function showoutline()
{
	var outline = {};
	var pos = 0;
	getnotecontent().split("\n").forEach(line =>
	{
		pos += line.length + 1;
		if (line.startsWith("#"))
		{
			line = line
			.replace("# ", "")
			.replace(/#/g, "\xa0\xa0\xa0\xa0");
			outline[line] = pos;
		}		
	});
	searchinlist(Object.keys(outline))
	.then(line =>
	{
		md.setSelectionRange(outline[line], outline[line]);
		md.focus();
	});
}

function restoresettings()
{
	if (confirm("Restore default settings?"))
	{
		window.localStorage.setItem("settings", JSON.stringify(defaultsettings));
		loadsettings();
	}
}

function editsettings()
{
	bindfile(
	{
		title: "settings.json",
		content: JSON.stringify(settings, null, "    ")
	});
}

function showtemporaryinfo(str)
{
	/*var prev = mark.textContent;
	mark.textContent = str;
	setTimeout(function()
	{
		mark.textContent = prev;
	}, 5000);*/
	alert(str);
}

function wordcount()
{
	showtemporaryinfo(getnotecontent().split(/\s+\b/).length);
}

function issplit()
{
	return window.location !== window.parent.location;
}

function togglesplit()
{
	if (issplit())
	{
		window.parent.location = "index.html";
	}
	else
	{
		window.location = "split.html";
	}
}

function logout()
{
	window.localStorage.removeItem("password");
	togglepassword();
}

function searchtags()
{
	var tags = {};

	localdata
	.filter(n => !n.title.startsWith("."))
	.forEach(n => 
	{
		var ts = gettags(n);
		ts.forEach(t => 
		{
			tags[t] = tags[t] || [];
			tags[t].push(n.title);
		});
	});

	searchinlist(Object.keys(tags).sort())
	.then(tag => searchinlist(tags[tag]))
	.then(loadfile);
}

function gettags(note)
{
	var i = note.content.indexOf("tags: ");
	if (i > -1)
	{
		var j = note.content.indexOf("\n", i);
		return note.content.substring(i + 6, j).split(",").map(t => t.toLowerCase().trim());
	}
	return [];
}

function marksaved()
{
	saved = true;
	mark.textContent = "\xa0";
}

function markunsaved(text)
{
	saved = false;
	if (text)
	{
		mark.textContent = text;
	}
}

function share(html)
{
	if (navigator.share)
	{
		navigator.share(
		{
			text: html ? "<html>" + md2html(getnotecontent()) + "</html>": getnotecontent(),
			title: currentnote.title
		});	
	}	
}

function sharehtml()
{
	share(true);
}

function download(filename, content)
{
	// trick: https://www.bitdegree.org/learn/javascript-download
	// to improve...
	var element = document.createElement('a');
	element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
	element.setAttribute('download', filename);
	element.style.display = 'none';
	document.body.appendChild(element);
	element.click();
	document.body.removeChild(element);
}

function downloadnotes()
{
	localdata
	.filter(note => !note.title.startsWith("."))
	.forEach(note =>
	{
		download(note.title + ".md", note.content);
	});
}

function downloadlocal()
{
	download(timestamp() + " " + (window.location.hostname || "serverless") + " notes.json", JSON.stringify(localdata));
}

function downloadnote()
{
	download(currentnote.title + ".md", getnotecontent());
}

function serialize()
{
	putontop();

	window.localStorage.setItem("data", JSON.stringify(localdata));

	if (currentnote.title == "settings.json")
	{
		window.localStorage.setItem("settings", getnotecontent());
	}

	if (settings.remote)
	{
		clearTimeout(timeoutid);
		timeoutid = setTimeout(push, settings.savedelay);		
	}
	else
	{
		marksaved();
	}
}

function remotecallfailed(error)
{
	markunsaved("!");
	if (error)
	{
		console.warn(error);
		showtemporaryinfo(error);
	}
}

function loadstorage()
{
	var item = window.localStorage.getItem("data");
	localdata = item ? JSON.parse(item) : [];

	if (currentnote)
	{
		currentnote = localdata.find(n => n.title == currentnote.title);
	}

	if (currentnote)
	{
		bindfile(currentnote);
	}
	else
	{
		loadlast();
	}
}

function loadsettings()
{
	settings = {...defaultsettings};
	var item = window.localStorage.getItem("settings");
	if (item)
	{
		item = JSON.parse(item);
		for (var key in item)
		{
			settings[key] = item[key];
		}
	}

	document.body.style.background = settings.bgcolor;
	document.body.style.fontFamily = settings.fontfamily;

	if (!settings.enablefolding)
	{
		commands = commands.filter(c => !c.hint.toLowerCase().includes("fold"));
	}
}

function checksaved()
{
	if (!saved)
	{
		return "not saved";
	}	
}

function init()
{
	loadsettings();

	window.onbeforeunload = checksaved;
	window.onclick = focuseditor;
	window.onstorage = loadstorage;

	codelanguages.forEach(lang =>
	{
		if (!snippets.includes(s => s.command == "/" + lang))
		{
			snippets.push(
			{
				command: "/" + lang,
				hint: lang + " code block",
				insert: "```" + lang + "\n\n```",
				cursor: -4
			});
		}
	});

	if (settings.remote)
	{
		markunsaved();
		queryremote({action: "fetch"})
		.then(data =>
		{
			marksaved();
			localdata = data;
			loadlast();
		})
		.catch(remotecallfailed);
	}
	else
	{
		delete commands.find(c => c.action == push).action;
		loadstorage();
	}

	if (issplit())
	{
		if (settings.defaultpreviewinsplit && name == "right")
		{
			togglepreview();	
		} 
		else if (name == "left")
		{
			md.focus();	
		}
	}
}

function togglepassword()
{
	password.value = "";
	authentpage.hidden = false;
	notepage.style.display = "none";
	document.title = "notes";
	password.focus();
}

function push()
{
	if (localdata)
	{
		clearTimeout(timeoutid);
		var content = getnotecontent();
		queryremote({action: "push", data: JSON.stringify(localdata)})
		.then(() => {
			console.log("Data sent to server");
			if (getnotecontent() == content)
			{
				marksaved();
			}
			else
			{
				console.warn("Content changed");
				timeoutid = setTimeout(push, settings.savedelay);
			}
		})
		.catch(remotecallfailed);
	}
	else
	{
		console.warn("Cannot push empty data");
	}
}

function queryremote(params)
{
	return new Promise( (apply, failed) => {

		params.password = window.localStorage.getItem("password");

		var paramlist = [];
		for (var i in params)
		{
			paramlist.push(i + "=" + encodeURIComponent(params[i]));
		}

		var xhr = new XMLHttpRequest();
		xhr.open("POST", "handler.php");
		xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

		xhr.onerror = function()
		{
			failed("XMLHttpRequest error");
		}

		xhr.onload = function()
		{
			if (xhr.status !== 200)
			{
				failed("Http status " + xhr.status);
			}
			else
			{
				var data = {};
				try
				{
					data = JSON.parse(xhr.responseText);

					if (data.error)
					{
						if (data.error == "authent")
						{
							failed(null);
							togglepassword();
						}
						else
						{
							failed("Remote handler returned an error: " + data.error);
						}
					}
					else
					{
						authentpage.hidden = true;
						notepage.style.display = "table";
						apply(data);
					}
				}
				catch(error)
				{
					failed("Handler result is not valid. JS error: " + error);
				}			
			}
		}
		xhr.send(paramlist.join("&"));
	});
}

function applyfolds(content)
{
	for (var i = folds.length - 1; i >= 0; i--)
	{
		content = content.replace(String.fromCodePoint(settings.foldmarkstart + i), folds[i]);
	}
	return content;
}

function getlinesrange()
{
	var start = md.selectionStart;
	var end = md.selectionEnd;

	while (start > 0 && md.value[start - 1] != "\n") start--;
	while (end < md.value.length && md.value[end] != "\n") end++;

	return {
		start: start,
		end: end
	};
}

function sortselection()
{
	var content = getnotecontent();
	var range = {start: 0, end: content.length};
	if (md.selectionStart != md.selectionEnd)
	{
		range = getlinesrange();
	}

	var selection = content.substring(range.start, range.end);
	var sorted = selection.split("\n").sort().join("\n");
	md.value = content.substring(0, range.start) + sorted + content.substring(range.end);
	notecontentchanged();
}

function selectlines()
{
	var range = getlinesrange();
	md.selectionStart = range.start;
	md.selectionEnd = range.end;
}

function isfold(linecontent)
{
	var res = linecontent.length == 1 && linecontent.codePointAt(0) >= settings.foldmarkstart;
	if (res)
	{
		//security: if > 100, probably not a fold. Maybe an emoji. To improve.
		res &= foldindex(linecontent) < 100;
	}
	return res;
}

function foldindex(foldmark)
{
	return foldmark.codePointAt(0) - settings.foldmarkstart;
}

function fold()
{
	// todo: forbid if > 100?
	var start = md.selectionStart;
	selectlines();

	var content = md.value;
	var char = String.fromCodePoint(settings.foldmarkstart + folds.length);
	var value = content.substring(md.selectionStart, md.selectionEnd)

	folds.push(value);

	setnotecontent(content.substring(0, md.selectionStart)
		+ char
		+ content.substring(md.selectionEnd));

	md.focus();
	setpos(start);

	resize();
}

function unfold()
{
	var range = getlinesrange();
	var linecontent = md.value.substring(range.start, range.end);
	if (isfold(linecontent))
	{
		var i = foldindex(linecontent);
		md.value = md.value.replace(linecontent, folds[i]);
		md.focus();
		setpos(range.start + folds[i].length);
	}

	resize();
}

function unfoldall()
{
	md.value = getnotecontent();
	resetfolds();
	setpos(0);
	md.focus();

	resize();
}

function checkfolding()
{
	if (!settings.enablefolding)
	{
		console.log("folding is disabled.");
		return;
	}

	var range = getlinesrange();
	var line = md.value.substring(range.start, range.end);
	var sectionmark = sectionmarks.find(m => line.startsWith(m));
	if (sectionmark)
	{
		event.preventDefault();

		// move to next line
		setpos(range.end + 1);
		range = getlinesrange();
		var nextline = md.value.substring(range.start, range.end);

		if (isfold(nextline))
		{
			unfold();
		}
		else
		{
			// find next occurence. If not found take all the remaining file.
			if (md.value.includes("\n" + sectionmark, range.end))
			{
				sectionend = md.value.indexOf("\n" + sectionmark, range.end);
			}
			else
			{
				sectionend = md.value.length;
			}

			// keep last empty line if any
			if (md.value[sectionend] == "\n")
			{
				sectionend--;
			}

			md.setSelectionRange(range.start, sectionend);
			fold();
		}
	}
	else if (isfold(line))
	{
		unfold();
	}
}

function setnotecontent(content)
{
	md.value = content;
}

function getnotecontent()
{
	return applyfolds(md.value);
}

function ontopbarclick()
{
	if (title.hidden)
	{
		commandpalette();
	}
}

/*function checkfoldmismatch()
{
	start = settings.foldmarkstart.toString(16);
	end = (settings.foldmarkstart + 100).toString(16);
	var match = md.value.match(new RegExp("[\\u" + start + "-\\u" + end + "]", "g"));
	var markcount = 0;
	if (match)
	{
		markcount = match.length;
	}
	var diff = folds.length - markcount;
	if (diff)
	{
		console.warn(diff + " fold(s) missing.");
	}
}*/

function md2html(content)
{
	// dumb fallback for offline mode
	if (typeof showdown == "undefined") return content
		.replace(/\*\*([^\*]*)\*\*/g, "<strong>$1</strong>")
		.replace(/\*([^\*]*)\*/g, "<em>$1</em>")
		.replace(/\## (.*)/g, "<h2>$1</h2>")
		.replace(/\# (.*)/g, "<h1>$1</h1>")
		.replace(/\n/g, "<br>");
	var converter = new showdown.Converter();
	converter.setOption("simplifiedAutoLink", true);
	converter.setOption("simpleLineBreaks", true);
	converter.setOption("metadata", true);

	var html = converter.makeHtml(content);

	// internal links
	html = html.replace(/\[\[([^\]]*)\]\]/g, "<a href='#' onclick='loadfile(\"$1\");'>$1</a>");

	return html;
}

function list()
{
	return localdata.map(n => n.title).filter(t => !t.startsWith("."));
}

function loadlast()
{
	loadfile(list().shift() || timestamp());
}

function grep(needle)
{
	var result = {};

	localdata
	.filter(n => !n.title.startsWith("."))
	.forEach(note =>
	{
		if (note.title.toLowerCase().includes(needle.toLowerCase()))
		{
			result[note.title] = {};
		}
		note.content.split("\n")
		.forEach((line, nb) => {
			if (line.toLowerCase().includes(needle.toLowerCase()))
			{
				result[note.title] = result[note.title] || {};
				result[note.title][nb] = line;
			}
		});
	});

	return result;
}

function showgrepresult(grepresult)
{
	var grepcontent = ["# Search results: \"" + filter.value + "\""];
	for (var file in grepresult)
	{
		grepcontent.push("[[" + file + "]]");
		for (var l in grepresult[file])
		{
			grepcontent.push("[" + l + "] " + grepresult[file][l].replace(new RegExp("(" + filter.value + ")", "gi"), "**$1**"));
		}
		grepcontent.push("");
	}

	if (grepcontent.length == 0)
	{
		grepcontent.push("No result.");
	}

	bindfile(
	{
		title: "Search result",
		content: grepcontent.join("\n")
	});

	if (preview.hidden)
	{
		togglepreview();
	}
}

function showgrep()
{
	filteredlist.hidden = true;
	searchdialog.hidden = false;
	filter.focus();
	filter.select();

	filter.onkeydown = function()
	{
		if (event.key === "Enter")
		{
			event.preventDefault();
			searchdialog.hidden = true;
			showgrepresult(grep(filter.value));			
		}
	}

	// live search
	/*filter.oninput = function()
	{
		if (filter.value.length > 1)
		{
			showgrepresult(grep(filter.value));
		}		
	}*/
}

function commandpalette()
{
	searchinlist(commands
		.filter(c => !c.excludepalette)
		.map(c => c.hint)
		.concat(snippets.map(s => "Insert snippet: " + s.hint)))
	.then(hint =>
	{
		var command = commands.find(c => c.hint == hint);
		if (command && command.action)
		{
			command.action();
		}
		else
		{
			var snippet = snippets.find(s => "Insert snippet: " + s.hint == hint);
			if (snippet)
			{
				insert(snippet.insert, snippet.cursor);
				notecontentchanged();
				md.focus();
			}
		}
	});
}

function insert(text, cursoroffset = 0, nbtodelete = 0)
{
	var pos = md.selectionStart;
	var content = md.value;
	md.value =
	content.substring(0, pos - nbtodelete)
	+ text
	+ content.substring(pos);
	setpos(pos - nbtodelete + text.length + cursoroffset);
	resize();
}

function searchinlist(list)
{
	return new Promise(selectitem =>
	{
		fileindex = 0;
		searchdialog.hidden = false;
		filteredlist.hidden = false;

		filteredlist.innerHTML = "";
		filter.value = "";
		filter.focus();

		list.forEach(item =>
		{
			var elt = document.createElement("div");
			elt.textContent = item;
			elt.onclick = function()
			{
				searchdialog.hidden = true;
				selectitem(item);
			}
			filteredlist.appendChild(elt);
		});

		applyfilter();

		filter.onkeydown = function()
		{
			// doesn't work if focus is lost.
			if (event.key === "Enter")
			{
				event.preventDefault();
				searchdialog.hidden = true;
				var selected = document.getElementsByClassName("selected")[0];
				selectitem(selected ? selected.textContent : filter.value);
			}
		}
	});
}

function applyfileindex()
{
	var i = 0;
	[...filteredlist.children].forEach(child =>
	{
		if (child.nodeName == "DIV")
		{
			child.className = "";
			if(!child.hidden)
			{
				if (i++ == fileindex)
				{
					child.className = "selected";
				}
			}
		}
	});
}

function getpos()
{
	return md.selectionStart;
}

function setpos(pos)
{
	md.setSelectionRange(pos, pos);
}

function before(nb)
{
	return md.value.substring(getpos() - nb, getpos());
}

function resize()
{
	if (md.clientHeight > md.scrollHeight) return;

	console.log("resize");
	md.style.height = md.scrollHeight + 'px';

	/*md.rows = (md.value.match(/\n/g) || []).length + 1;
	while (md.scrollHeight > md.clientHeight)
	{
		md.rows *= 1.5;
	}*/
}

function putontop()
{
	if (localdata.find(n => n == currentnote))
	{
		localdata.splice(localdata.indexOf(currentnote), 1);
		localdata.unshift(currentnote);	
	}
}

function notecontentchanged()
{
	markunsaved("*");

	// check snippets and autocomplete
	if (before(2) == "[[")
	{
		searchautocomplete();
	}
	else
	{
		var snippet = snippets.find(s => before(s.command.length) == s.command);
		if (snippet)
		{
			insert(snippet.insert, snippet.cursor, snippet.command.length);
		}
	}
	resize();

	// save
	var content = getnotecontent();
	if (content == "" || content == "null" || content == "undefined")
	{
		console.warn("Invalid content '" + content + "', file '" + currentnote.title + "' not saved");
	}
	else
	{
		currentnote.content = content;
		serialize();
	}
}

function loadtodo()
{
	loadfile("todo");
}

function loadquicknote()
{
	loadfile("Quick note");
}

function timestamp()
{
	return (new Date).toISOString().replace("T", " ").replace(/\..*/, "").replace(/:/g, ".");
}

function startnewnote()
{
	loadfile(timestamp());
}

function showhelp()
{
	var help = ["# Notes"];
	help.push("## Shortcuts");

	commands
	.filter(command => Boolean(command.shortcut))
	.forEach(command => help.push(command.hint + ": " + command.shortcut));

	help.push("## Snippets");
	snippets.forEach(snippet =>
	{
		help.push(snippet.hint + ": " + snippet.command);
	});

	help.push("## Libs");
	help.push("[Showdown](https://showdownjs.com/)");
	help.push("[Inconsolata](https://levien.com/type/myfonts/inconsolata.html)");

	help.push("## Inspiration");
	help.push("[rwtxt](https://rwtxt.com)");
	help.push("[Offline Notepad](https://offlinenotepad.com/)");
	help.push("[Writemonkey3](http://writemonkey.com/wm3/)");
	help.push("[Sublime Text](https://www.sublimetext.com/)");

	bindfile(
	{
		title: "Help",
		content: help.join("\n")
	});

	if (preview.hidden)
	{
		togglepreview();
	}
}

function toggletitle()
{
	if (title.hidden)
	{
		title.hidden = false;
		title.focus();
	}
	else
	{
		title.hidden = true;
		md.focus();
	}
}

function selectnote()
{
	return searchinlist(list());
}

function searchautocomplete()
{
	selectnote().then(insertautocomplete);
}

function searchandloadnote()
{
	selectnote().then(loadfile);
}

function rename(newname)
{
	if (localdata.find(n => n.title == newname))
	{
		var error = newname + " alreday exists";
		console.warn(error);
		return error;
	}

	// rename internal references
	localdata
	.filter(note => note != currentnote)
	.forEach(note =>
	{
		note.content = note.content.replaceAll("[[" + currentnote.title + "]]", "[[" + newname + "]]");
	});

	currentnote.title = newname;

	serialize();
	return "";
}

function deletenote()
{
	if (confirm('delete "' + currentnote.title + '"?'))
	{
		var error = rename(".deleted_" + currentnote.title)
		if (!error)
		{
			loadlast();
		}
		else
		{
			console.warn("Failed to delete '" + currentnote.title + "'");
		}
	}
}

function restore()
{
	if (confirm('restore "' + currentnote.title + '"?'))
	{
		setnotecontent(backup);
		notecontentchanged();
	}
}

function insertheader()
{
	if (!getnotecontent().startsWith("---"))
	{
		var headers = "---\ndate: " + (new Date).toISOString().substring(0, 10) + "\ntags: \n---\n\n";
		md.value = headers + md.value;
		setpos(27);
	}
	resize();
}

function splitshortcut(s)
{
	var r = {};
	s = s.split("+");
	r.key = s.pop();
	s.forEach(e => {
		r[e] = true;
	})
	return r;
}

function mainkeydownhandler()
{
	if (event.key == "Escape")
	{
		if (!searchdialog.hidden)
		{
			event.preventDefault();
			searchdialog.hidden = true;
			md.focus();
		}
		else if (currentnote.title == "Help")
		{
			loadlast();
		}
		else if (preview.hidden == false)
		{
			togglepreview();
		}
	}

	if (!searchdialog.hidden && (event.key == "Tab" || event.keyCode == "40" || event.keyCode == "38"))
	{
		event.preventDefault();
		fileindex += (event.shiftKey || event.keyCode == "38") ? -1 : 1;
		fileindex = Math.min(fileindex, filteredlist.children.length - 1);
		fileindex = Math.max(fileindex, 0);
		applyfileindex();
	}

	commands.filter(c => c.shortcut)
	.forEach(command =>
	{
		var s = splitshortcut(command.shortcut);
		if (event.key == s.key && !(s.ctrl && !event.ctrlKey && !event.altKey) && !(s.shift && !event.shiftKey))
		{
			event.preventDefault();
			if (command.savedonly && !saved)
			{
				console.log("Data note saved, try again")
			}
			else if (command.action)
			{
				command.action();
			}			
		}
	});
}

function ontitlechange()
{
	var oldname = currentnote.title;
	var error = rename(title.value);

	if (!error)
	{
		console.log("'" + oldname + "' renamed to '" + currentnote.title + "'");
		document.title = title.value;
	}
	else
	{
		title.value = currentnote.title;
	}
}

function applyfilter()
{
	[...filteredlist.children].forEach(div =>
	{
		div.hidden = div.textContent.toLowerCase().indexOf(filter.value.toLowerCase()) < 0;
	});

	fileindex = 0;
	applyfileindex();
}

function backspace(nb)
{
	var pos = getpos();
	var c = md.value;
	md.value = c.substring(0, pos - nb) + c.substring(pos);
	setpos(pos - nb);
}

function editorkeydown()
{
	if (event.key == "Enter")
	{
		var currentline = md.value.substring(0, getpos()).split("\n").pop();
		markerslist.filter(marker => currentline.startsWith(marker))
		.forEach(marker =>
		{
			event.preventDefault();
			if (currentline != marker)
			{
				insert("\n" + marker);
			}
			else
			{
				backspace(marker.length);
			}
			notecontentchanged();
		});
	}
	else if (event.key === "Tab")
	{
		event.preventDefault();
        // todo: reverse with shift
		if (before(2) == "* " || before(2) == "- ")
		{
			setpos(getpos() - 2);
			insert("    ", 2);
		}
		// disable tab
		/*else 
		{
			insert("    ");
		}*/
	}
}

function insertautocomplete(selectednote)
{
	md.focus();
	insert(selectednote + "]] ");
	notecontentchanged();
}

function togglepreview()
{
	preview.innerHTML = md2html(getnotecontent());
	md.hidden = !md.hidden;
	preview.hidden = !preview.hidden;

	if (preview.hidden)
	{
		resize();
		md.focus();
	}
}

function resetfolds()
{
	folds = [];
}

function bindfile(note)
{
	if (currentnote && currentnote.title == "settings.json")
	{
		loadsettings();
	}

	backup = note.content;
	currentnote = note;
	title.value = note.title;
	document.title = note.title;

	setnotecontent(note.content || "");
	preview.innerHTML = md2html(getnotecontent());

	resetfolds();
	resize();
	setpos(0);

	// to improve...
	if (!issplit())
	{
		md.focus();
	}
}

function loadfile(name)
{
	var note = localdata.find(n => n.title == name);
	if (!note)
	{
		note = {title: name, content: ""};
		localdata.unshift(note);
	}

	if (!preview.hidden)
	{
		togglepreview();
	}

	bindfile(note);
}

function sendpassword()
{
	if (event.type == "blur" || event.key == "Enter")
	{
		event.preventDefault();
		window.localStorage.setItem("password", password.value);
		init();
	}
}

function focuseditor()
{
	if (document.documentElement == event.srcElement)
	{
		md.focus();
		console.log("Forced focus");
	}
}