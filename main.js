var defaultsettings = 
{
	bgcolor: "white",
	fontfamily: "'Inconsolata', 'Consolas', monospace",
	fontsize: "90%",
	fontcolor: "black",
	lineheight: "130%",
    accentcolor: "#5AA7CE",

	savedelay: 2000,
	foldmarkstart: 22232,
	defaultpreviewinsplit: false,
	enablefolding: false,
	tagautocomplete: false,
	titleinaccentcolor: false
};

//builtin
var markerslist = ["* ", "- ", "    * ", "    - ", ">> ", "> ", "=> ", "— ", "[ ] "];
var sectionmarks = ["---", "### ", "## ", "# ", "```"];
var codelanguages = ["xml", "js", "sql"];

// globals
var currentnote = null;
var fileindex = 0;
var workerid = null;
var folds = [];
var backup = "";
var localdata = null;
var saved = true;
var pending = false;
var settings = null;
var tags = null;
var currentvault = "";
var currenttag = "";

var themes = 
{
	Default:
	{
		bgcolor: "white",
		fontfamily: "'Inconsolata', 'Consolas', monospace",
		fontsize: "90%",
		fontcolor: "black",
		lineheight: "130%",
	    accentcolor: "#5AA7CE"
	},
	Notion:
	{
		bgcolor: "white",
	    fontfamily: "ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, 'Apple Color Emoji', Arial, sans-serif, 'Segoe UI Emoji', 'Segoe UI Symbol'",
	    fontsize: "16px",
	    fontcolor: "rgb(55,53,47)",
	    lineheight: "24px",
	    accentcolor: "rgb(55,53,47)"
	},
	Monkey:
	{
		bgcolor: "rgb(227,227,227)",
		fontfamily: "'Hack', 'Consolas', monospace",
		fontsize: "14px",
		fontcolor: "rgb(55,55,55)",
		lineheight: "24px",
		accentcolor: "#5AA7CE"
	},
	Mariana:
	{
		bgcolor: "rgb(48,56,65)",
		fontfamily: "'Consolas', monospace",
		fontsize: "15px",
		fontcolor: "rgb(216,222,233)",
		lineheight: "110%",
		accentcolor: "rgb(249,174,88)"	
	},
	"Plus plus":
	{
		bgcolor: "white",
		fontfamily: "'Consolas', 'Courier New', monospace",
		fontsize: "15px",
		fontcolor: "black",
		lineheight: "110%",
		accentcolor: "rgb(128,0,255)"	
	},
	Calmly:
	{
		bgcolor: "rgb(250,250,250)",
		fontfamily: "'Droid Serif', serif",
		fontsize: "19px",
		fontcolor: "rgb(60,60,60)",
		lineheight: "28.5px",
		accentcolor: "rgb(60,60,60)"
	}
};

var commands = [
{
	hint: "Close menu"
},
{
	shortcut: "ctrl+p",
	hint: "Show notes list",
	action: searchandloadnote
},
{
	hint: "Share note",
	action: share
}/*,
{
	hint: "Share note (html)",
	action: sharehtml
}*/,
{
	shortcut: "ctrl+n",
	hint: "New note",
	action: startnewnote
},
{
	shortcut: "ctrl+shift+P",
	hint: "Command palette",
	allowunsaved: true,
	action: commandpalette,
	excludepalette: true
},
{
	shortcut: "ctrl+t",
	hint: "Open todo",
	action: loadtodo
},
{
	shortcut: "ctrl+q",
	hint: "Open quick note",
	action: loadquicknote
},
{
	shortcut: "ctrl+g",
	hint: "Find in notes",
	action: showgrep
},
{
	shortcut: "ctrl+i",
	hint: "Toggle title",
	action: toggletitle
},
{
	shortcut: "ctrl+m",
	hint: "Toggle preview",
	action: togglepreview
},
{
	shortcut: "ctrl+d",
	hint: "Delete note",
	action: deletenote
},
{
	hint: "Restore note",
	action: restore
},
{
	shortcut: "ctrl+h",
	hint: "Insert markdown header",
	action: insertheader,
	allowunsaved: true
},
{
	shortcut: "F1",
	hint: "Show help",
	action: showhelp
},
{
	shortcut: "ctrl+shift+C",
	hint: "Fold",
	action: fold
},
{
	shortcut: "ctrl+shift+O",
	hint: "Unfold",
	action: unfold
},
{
	hint: "Unfold all",
	action: unfoldall
},
{
	hint: "Download note",
	action: downloadnote
},
{
	hint: "Download local data",
	action: downloadlocal,
	shortcut: "ctrl+shift+S"
},
{
	hint: "Search tags",
	action: searchtags,
	shortcut: "ctrl+shift+T"
},
{
	hint: "Log out",
	action: logout,
},
{
	hint: "Toggle split view",
	action: togglesplit
},
{
	hint: "Load previous note",
	action: loadprevious,
	shortcut: "ctrl+b"
},
{
	hint: "Sort text",
	action: sortselection
},
{
	hint: "Settings",
	action: editsettings	
},
{
	hint: "Restore default settings",
	action: restoresettings	
},
{
	hint: "Note outline",
	action: showoutline,
	shortcut: "ctrl+o"
},
{
	hint: "Internal links",
	action: showinternallinks		
},
{
	hint: "Switch vault",
	action: switchvault,
	shortcut: "ctrl+shift+V"
},
{
	hint: "Add tag filter",
	action: addtagfilter,
	shortcut: "ctrl+shift+F",
},
{
	hint: "Select theme",
	action: selecttheme
},
{
	hint: "Show note info",
	action: showinfo,
	shortcut: "ctrl+w",
	allowunsaved: true
},
{
	hint: "Force save",
	action: save,
	shortcut: "ctrl+s",
	allowunsaved: true
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
},
{
	command: "/-",
	hint: "Dialog mark",
	insert: "— ",
	cursor: 0
}];

function showinfo()
{
	var tags = gettags(currentnote);
	var info = [ 
		"title: " + currentnote.title + "\n",
		"vault: " + currentvault + "\n",
		(tags ? "tags: " + tags + "\n" : ""),
		"saved: " + saved,
		"word count: " + getwords()];

	showtemporaryinfo(info);
}

function loadtheme(theme)
{
	for (var i in themes[theme])
	{
		settings[i] = themes[theme][i];
	}
	applystyle();
	resize();
}

function savesettings()
{
	window.localStorage.setItem("settings", JSON.stringify(settings));
}

function selecttheme()
{
	searchinlist(Object.keys(themes), loadtheme)
	.then(t => 
		{
			loadtheme(t);
			savesettings();
		});
}

function addtagfilter()
{
	var command = commands.find(c => c.action == addtagfilter);
	
	if (!currenttag)
	{
		tagslist()
		.then(t => 
			{
				currenttag = t;
				command.hint = "Remove tag filter '" + currenttag + "'";
				setwindowtitle();
			});	
	}
	else
	{
		currenttag = "";
		command.hint = "Add tag filter";
		setwindowtitle();
	}
}

function switchvault()
{
	window.localStorage.setItem("vault", othervault());
	init();
}

function showinternallinks()
{
	searchinlist(
		getnotecontent()
		.match(/\[\[([^\]]*)\]\]/g || [])
		.map(l => l.replace("[[", "").replace("]]", "")))
	.then(loadnote);	
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

function linkatpos()
{
	var s = md.selectionStart;
	while (s > 2 && md.value[s] != "\n")
	{
		if (md.value.substring(s - 2, s) == "[[")
		{
			var e = md.selectionStart;
			while (e < md.value.length - 2 && md.value[e-2] != "\n")
			{
				if (md.value.substring(e, e + 2) == "]]")
				{
					return md.value.substring(s, e);
				}
				e++;
			}
		}
		s--;
	}
	return "";
}

function tagatpos()
{
	if (md.value.substring(0, getpos()).split("\n").pop().startsWith("tags: "))
	{
		var s = md.selectionStart;
		while (s > 1 && md.value[s] != "\n")
		{
			var c = md.value[s-1];
			if (c == " " || c == ",")
			{
				var e = md.selectionStart;
				while (e < md.value.length - 1 && md.value[e-1] != "\n")
				{
					c = md.value[e];
					if (c == " " || c == "," || c == "\n")
					{
						return md.value.substring(s, e);
					}
					e++;
				}
			}
			s--;
		}
		return "";
	}
}

function clickeditor()
{
	if (event.ctrlKey)
	{
		var link = linkatpos();
		var tag = tagatpos();
		if (link)
		{
			loadnote(link);
		}
		else if (tag)
		{
			tagslist();
			searchinlist(tags[tag.toLowerCase()])
			.then(loadnote);
		}
		else
		{
			checkfolding();
		}
	}
}

function restoresettings()
{
	if (confirm("Restore default settings?"))
	{
		settings = defaultsettings;
		savesettings();
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

function showtemporaryinfo(data)
{
	if (typeof data == "string")
	{
		data = new Array(data);
	}

	filter.placeholder = "Info";
	searchinlist(data)
	.then(() => 
		{
			filter.placeholder = "Search...";
		});
	md.focus();
}

function getwords()
{
	return getnotecontent().split(/\s+\b/).length;
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

function isremote()
{
	return currentvault == "remote";
}

function logout()
{
	if (isremote())
	{
		window.localStorage.removeItem("password");
		togglepassword();	
	}	
}

function tagslist()
{
	tags = {};

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

	return searchinlist(Object.keys(tags).sort());
}

function searchtags()
{
	tagslist()
	.then(tag => searchinlist(tags[tag]))
	.then(loadnote);
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

function share(html)
{
	if (navigator.share)
	{
		navigator.share(
		{
			text: html ? md2html(getnotecontent()) : getnotecontent(),
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
	var data = 
	{
		local : JSON.parse(window.localStorage.getItem("local")),
		remote : JSON.parse(window.localStorage.getItem("remote"))
	};
	download(timestamp() + " notes.json", JSON.stringify(data));
}

function downloadnote()
{
	download(currentnote.title + ".md", getnotecontent());
}

function remotecallfailed(error)
{
	if (error)
	{
		console.warn(error);
		showtemporaryinfo(error);
	}
}

function loadstorage()
{
	var item = window.localStorage.getItem(currentvault);
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

function applystyle()
{
	document.body.style.background = settings.bgcolor;
	document.body.style.fontFamily = settings.fontfamily;
	document.body.style.fontSize = settings.fontsize;
	document.body.style.lineHeight = settings.lineheight;
	document.body.style.color = settings.fontcolor;
	document.body.style.caretColor = settings.accentcolor;
	
	if (settings.titleinaccentcolor)
	{
		title.style.color = settings.accentcolor;	
	}
}

function loadsettings()
{
	settings = {...defaultsettings};
	var item = window.localStorage.getItem("settings");
	if (item)
	{
		item = JSON.parse(item);
		for (var key in settings)
		{
			if (typeof item[key] !== "undefined")
			{
				settings[key] = item[key];	
			}
		}
	}

	applystyle();

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

function initsnippets()
{
	// code languages
	codelanguages.forEach(lang =>
	{
		if (!snippets.find(s => s.command == "/" + lang))
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

	// md headings
	for (var i = 1; i <= 3; i++)
	{
		if (!snippets.find(s => s.command ==  "/" + i))
		{
			snippets.push(
			{
				command: "/" + i,
				hint: "Heading " + i,
				insert: "#".repeat(i) + " ",
				cursor: 0
			});
		}
	}
}

function othervault()
{
	return isremote() ? "local" : "remote";
}

function initvault()
{
	currentvault = window.localStorage.getItem("vault") || "local";
}

function init()
{
	loadsettings();
	initvault();

	commands.find(c => c.action == switchvault).hint = "Switch to " + othervault() + " vault";

	window.onbeforeunload = checksaved;
	window.onclick = focuseditor;
	
	initsnippets();

	currenttag = "";

	if (isremote())
	{
		queryremote({action: "fetch"})
		.then(data =>
		{
			localdata = data;
			loadlast();
		})
		.catch(remotecallfailed);
	}
	else
	{
		loadstorage();
	}

	if (issplit())
	{
		window.onstorage = loadstorage;
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
							failed();
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
	datachanged();
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
		event.preventDefault();
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
	html = html.replace(/\[\[([^\]]*)\]\]/g, "<a href='#' onclick='loadnote(\"$1\");'>$1</a>");

	return html;
}

function list()
{
	return localdata
	.filter(n => currenttag == "" || gettags(n).includes(currenttag))
	.map(n => n.title)
	.filter(t => !t.startsWith("."));
}

function loadlast()
{
	loadnote(list().shift() || timestamp());
}

function loadprevious()
{
	loadnote(list()[1]);
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
		if (command)
		{
			executecommand(command);	
		}
		else
		{
			var snippet = snippets.find(s => "Insert snippet: " + s.hint == hint);
			if (snippet)
			{
				insert(snippet.insert, snippet.cursor);
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
	datachanged();
}

function searchinlist(list, customevent)
{
	return new Promise(selectitem =>
	{
		fileindex = 0;
		searchdialog.hidden = false;
		filteredlist.hidden = false;

		filteredlist.innerHTML = "";
		filter.value = "";

		list.forEach(item =>
		{
			var elt = document.createElement("div");
			elt.textContent = item;
			elt.onclick = function()
			{
				searchdialog.hidden = true;
				selectitem(item);
			}
			elt.customevent = customevent;
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

		filter.focus();
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
					if (child.customevent)
					{
						child.customevent(child.textContent);
						filter.focus();
					}
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
	if (md.clientHeight >= md.scrollHeight) return;

	//console.log("resize");
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

function postpone()
{
	return new Promise(function(resolve)
	{
		clearTimeout(workerid);
		workerid = setTimeout(resolve, settings.savedelay);
	});
}

function save()
{
	clearTimeout(workerid);

	if (!localdata)
	{
		showtemporaryinfo("cannot push empty data");
		return;
	}

	if (pending)
	{
		console.log("pending query: save cancelled");
		return;
	}

	var content = getnotecontent();
	if ((content == "" && backup != "") || content == "null" || content == "undefined")
	{
		showtemporaryinfo("Invalid content '" + content + "', file '" + currentnote.title + "' not saved");
		return;
	}

	currentnote.pos = md.selectionStart;
	currentnote.content = content;

	window.localStorage.setItem(currentvault, JSON.stringify(localdata));

	if (currentnote.title == "settings.json")
	{
		settings = JSON.parse(content);
		savesettings();
	}
	console.log("data serialized in local storage")

	if (isremote())
	{
		console.log("sending data to php server...");

		pending = true;
		queryremote({action: "push", data: JSON.stringify(localdata)})
		.then(() =>
		{
			console.log("...data saved on server");
			saved = true;
		})
		.catch(remotecallfailed)
		.finally(() =>
		{
			pending = false;
			if (content != getnotecontent())
			{
				console.log("but content changed: will save again");
				datachanged();
			}
			else if (!saved)
			{
				console.log("save failed. Data unsaved on server, manual action required.");
			}
		});

	}
	else
	{
		saved = true;
	}
}

function datachanged()
{
	resize();

	saved = false;

	postpone()
	.then(save);
}

function loadtodo()
{
	loadnote("todo");
}

function loadquicknote()
{
	loadnote("Quick note");
}

function timestamp()
{
	return (new Date).toISOString().replace("T", " ").replace(/\..*/, "").replace(/:/g, ".");
}

function startnewnote()
{
	loadnote(timestamp());
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

	help.push("## Fonts");
	help.push("[Inconsolata](https://levien.com/type/myfonts/inconsolata.html)");
	help.push("[Hack](https://sourcefoundry.org/hack/)");
	help.push("[Droid Serif](https://fonts.adobe.com/fonts/droid-serif)");

	help.push("## Inspiration");
	help.push("[rwtxt](https://rwtxt.com)");
	help.push("[Offline Notepad](https://offlinenotepad.com/)");
	help.push("[Writemonkey3](http://writemonkey.com/wm3/)");
	help.push("[Sublime Text](https://www.sublimetext.com/)");
	help.push("[Notion](https://www.notion.so/)");
	help.push("[Calmly Writer](https://calmlywriter.com/)");

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
	return searchinlist(list()/*, loadnote*/);
}

function searchautocomplete()
{
	selectnote().then(insertautocomplete);
}

function searchandloadnote()
{
	selectnote().then(loadnote);
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

	datachanged();
	return "";
}

function deletenote()
{
	if (confirm('delete "' + currentnote.title + '"?'))
	{
		var error = rename(".deleted_" + currentnote.title);
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
		datachanged();
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

function executecommand(command)
{
	if (!command.allowunsaved && !saved)
	{
		showtemporaryinfo("Cannot perform '" + command.hint + "' because current note is not saved.");
	}
	else if (command.action)
	{
		command.action();
	}
}

function mainkeydownhandler()
{
	if (event.key == "Escape")
	{
		if (!searchdialog.hidden)
		{
			event.preventDefault();
			searchdialog.hidden = true;
			filter.placeholder = "Search...";
			md.focus();
		}
		else if (currentnote.title == "Help" || currentnote.title == "Search result")
		{
			loadlast();
		}
		else if (preview.hidden == false)
		{
			togglepreview();
		}
	}
	else if (!searchdialog.hidden && (event.key == "Tab" || event.keyCode == "40" || event.keyCode == "38"))
	{
		event.preventDefault();
		fileindex += (event.shiftKey || event.keyCode == "38") ? -1 : 1;
		fileindex = Math.min(fileindex, filteredlist.children.length - 1);
		fileindex = Math.max(fileindex, 0);
		applyfileindex();
	}
	else
	{
		commands.filter(c => c.shortcut)
		.forEach(command =>
		{
			var s = splitshortcut(command.shortcut);
			if (event.key == s.key && !(s.ctrl && !event.ctrlKey && !event.altKey) && !(s.shift && !event.shiftKey))
			{
				event.preventDefault();
				executecommand(command);		
			}
		});
	}
}

function setwindowtitle()
{
	document.title = currentvault + " -";
	if (currenttag)
	{
		document.title += " tag:" + currenttag + " -";
	}
	document.title += " " + currentnote.title;
}

function ontitlechange()
{
	var oldname = currentnote.title;
	var error = rename(title.value);

	if (!error)
	{
		console.log("'" + oldname + "' renamed to '" + currentnote.title + "'");
		setwindowtitle();
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
	datachanged();
}

function editorkeydown()
{
	if (event.key == "Enter")
	{
		var line = md.value.substring(0, getpos()).split("\n").pop();
		markerslist.filter(marker => line.startsWith(marker))
		.forEach(marker =>
		{
			event.preventDefault();
			if (line != marker)
			{
				insert("\n" + marker);
			}
			else
			{
				backspace(marker.length);
			}
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
	else if (event.key === "[" && before(1) == "[")
	{
		event.preventDefault();
		insert("[");
		searchautocomplete();
	}
	else if (settings.tagautocomplete && event.key == " " && before(1) == "," && md.value.substring(0, getpos()).split("\n").pop().startsWith("tags: "))
	{
		event.preventDefault();
		// search in tags list
		console.log(event.key);
		tagslist()
		.then(tag => 
		{
			insert(" " + tag);
			md.focus();
		})
	}
	else
	{
		var snippet = snippets.find(s => before(s.command.length - 1) + event.key == s.command);
		if (snippet)
		{
			event.preventDefault();
			insert(snippet.insert, snippet.cursor, snippet.command.length - 1);
		}
	}
}

function insertautocomplete(selectednote)
{
	md.focus();
	insert(selectednote + "]] ");
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
	setwindowtitle();

	setnotecontent(note.content || "");
	preview.innerHTML = md2html(getnotecontent());

	resetfolds();
	resize();
	setpos(note.pos || 0);

	// to improve...
	if (!issplit() && searchdialog.hidden)
	{
		md.focus();
	}
}

function loadnote(name)
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
	putontop();
}

function sendpassword()
{
	if (!authentpage.hidden && (event.type == "blur" || event.key == "Enter"))
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