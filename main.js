var defaultsettings =
{
	bgcolor: "white",
	fontfamily: "ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, 'Apple Color Emoji', Arial, sans-serif, 'Segoe UI Emoji', 'Segoe UI Symbol'",
	fontsize: "16px",
	fontcolor: "rgb(55,53,47)",
	lineheight: "24px",
	accentcolor: "rgb(55,53,47)",
	margins: "7%",

	savedelay: 2000,
	defaultpreviewinsplit: false,
	tagautocomplete: false,
	titleinaccentcolor: false,
	enablenetwork: false,
	titlebydefault: false,
	hideheaderbydefault: true,
	linksinnewtab: true
};

//builtin
var markerslist = ["* ", "- ", "    * ", "    - ", ">> ", "> ", "=> ", "— ", "[ ] ", "    ", "• ", "- [ ]"];
var sectionmarks = ["---", "### ", "## ", "# ", "```"];
var codelanguages = ["xml", "js", "sql"];

// globals
var currentnote = null;
var currentheader = "";
var fileindex = 0;
var workerid = null;
var backup = "";
var localdata = null;
var saved = true;
var pending = false;
var settings = null;
var tags = null;
var currentvault = "";
var currenttag = "";

var stat =
{
	ses:
	{
		q: 0,
		t: timestamp(),
		d: 0
	},
	cur:
	{
		q: 0,
		t: timestamp(),
		d: 0
	}
}

var themes =
{
	mingwdark:
	{
	    bgcolor: "rgb(46,52,64)",
	    fontfamily: "Lucida console",
	    fontsize: "14px",
	    fontcolor: "rgb(191,191,191)",
	    lineheight: "120%",
	    accentcolor: "rgb(177,54,186)"
	},
	mingw64:
	{
		bgcolor: "white",
		fontfamily: "Lucida console",
		fontsize: "13px",
		fontcolor: "black",
		lineheight: "110%",
	    accentcolor: "rgb(177,54,186)"
	},
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
		fontsize: "16px",
		fontcolor: "rgb(216,222,233)",
		lineheight: "120%",
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
	},
	Breakers:
	{
		bgcolor: "rgb(252,253,253)",
		fontfamily: "'Consolas', monospace",
		fontsize: "16px",
		fontcolor: "rgb(50,50,50)",
		lineheight: "120%",
		accentcolor: "rgb(95,180,180)"
	},
	Cryptee:
	{
		bgcolor: "white",
		fontfamily: "'Josefin Sans', sans-serif",
		fontsize: "16px",
		fontcolor: "rgb(78,78,78)",
		lineheight: "24px",
		accentcolor: "rgb(54,54,54)"		
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
	action: share,
	allowunsaved: true
},
{
	hint: "Share note (html)",
	action: sharehtml
},
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
	shortcut: "ctrl+g",
	hint: "Find in notes",
	action: showgrep
},
{
	shortcut: "ctrl+i",
	hint: "Toggle title",
	action: toggletitle,
	allowunsaved: true
},
{
	shortcut: "ctrl+m",
	hint: "Toggle preview",
	action: togglepreview,
	allowunsaved: true
},
{
	shortcut: "ctrl+shift+M",
	hint: "Toggle preview with merged subnotes",
	action: togglepreviewwithsubs,
	allowunsaved: true
},
{
	shortcut: "ctrl+d",
	hint: "Delete note",
	action: deletecurrentnote
},
{
	hint: "Restore note",
	action: restore
},
{
	shortcut: "ctrl+h",
	hint: "Toggle markdown header",
	action: toggleheader,
	allowunsaved: true
},
{
	shortcut: "F1",
	hint: "Show help",
	action: showhelp
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
	hint: "Load next note",
	action: loadnext,
	shortcut: "ctrl+shift+B"
},
{
	hint: "Sort text",
	action: sortselection,
	allowunsaved: true
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
	shortcut: "ctrl+o",
	allowunsaved: true
},
{
	hint: "Show connected notes",
	action: shownotelinks,
	shortcut: "ctrl+l"
},
{
	hint: "Switch local/remote vault",
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
	action: selecttheme,
	allowunsaved: true
},
{
	hint: "Show info",
	action: showinfo,
	shortcut: "ctrl+w",
	allowunsaved: true
},
{
	hint: "Force save",
	action: save,
	shortcut: "ctrl+s",
	allowunsaved: true
},
{
	hint: "Toggle spell check",
	action: togglespellcheck,
	allowunsaved: true,
	shortcut: "F7"
},
{
	hint: "Create subnote from selection",
	action: createsubnote
},
{
	hint: "Merge subnote",
	action: includesub
},
{
	hint: "Comment selection",
	action: comment
},
{
	hint: "Download current note",
	action: downloadnote
},
{
	hint: "Download current note with merged subnotes",
	action: downloadnotewithsubs
},
{
	hint: "Download all notes as flat markdown files",
	action: downloadnotes
},
{
	hint: "Download current vault",
	action: downloadvault,
	shortcut: "ctrl+shift+S"
},
{
	hint: "Download all vaults",
	action: downloadallvaults
},
{
	hint: "Insert text in todo",
	action: inserttodo
},
{
	hint: "Send by SMS",
	action: sms,
	remoteonly: true
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
	insert: (new Date).toISOString().substring(0, 10),
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
},
{
	command: "/*",
	insert: "• "
},
{
	command: "//",
	insert: "<!--\n\n-->",
	cursor: -4
}];


function sms()
{
	if (confirm("Send note by SMS?"))
	{
		queryremote({action: "sms", data: currentnote.content.replace(/\n/g, " ")})
		.then(data =>
		{
			showtemporaryinfo("SMS sent. Result: '" + data.result + "'");
		});
	}
}

function ask(question)
{
	return new Promise( (resolve) => 
	{
		filter.placeholder = question;
		return searchinlist(["Yes", "No"])
		.then(answer => 
		{
			resolve(answer);
		});
	});
}

function getnote(title)
{
	return localdata.find(note => note.title == title);
}

function getrangecontent(range)
{
	return md.value.substring(range.start, range.end);
}

function createsubnote(suggestedtitle)
{
	var name = [];
	if (suggestedtitle)
	{
		name.push(suggestedtitle);
	}
	var range = getlinesrange();
	var content = getrangecontent(range);
	filter.placeholder = "Create subnote...";
	searchinlist(name)
	.then(title => 
	{
		if (!title)
		{
			showtemporaryinfo("No title provided");
			setpos(md.selectionStart);
		}
		else if (getnote(title))
		{
			showtemporaryinfo("'" + title + "' already exists");
			setpos(md.selectionStart);
		}
		else
		{
			var newnote = 
			{
				title: title,
				content: content
			}
			localdata.unshift(newnote);
			md.value = md.value.substring(0, range.start)
			+ "[[" + title + "]]"
			+ md.value.substring(range.end);
			datachanged();
		}
	});
}

function comment()
{
	md.value = md.value.substring(0, md.selectionStart)
	+ "<!-- "
	+ md.value.substring(md.selectionStart, md.selectionEnd)
	+ " -->"
	+ md.value.substring(md.selectionEnd);
}

function includesub()
{
	var range = linkrangeatpos();
	if (range)
	{
		var title = linkatpos();
		if (confirm("Replace [[" + title + "]] by its content?"))
		{
			var subnote = getnote(title);
			md.value = 
			md.value.substring(0, range.start)
			+ subnote.content
			+ md.value.substring(range.end);

			if (confirm("Delete '" + title + "'?"))
			{
				deletenote(subnote);
				datachanged();
			}
		}
	}
}

function togglespellcheck()
{
	md.spellcheck = !md.spellcheck;
}

function formatsize(size)
{
	var unit = "b";
	if (size > 1024)
	{
		size /= 1024;
		unit = "kb";
	}
	if (size > 1024)
	{
		size /= 1024;
		unit = "mb";
	}
 	return size.toFixed(2) + " " + unit;
}

function showinfo()
{
	var tags = gettags(currentnote);
	showtemporaryinfo(
		[
			"saved: " + saved,
			"title: " + currentnote.title,
			"cursor position: " + md.selectionStart + " (" + (100 * md.selectionStart / md.value.length).toFixed(2) + "%)",
			"vault: " + currentvault,
			(tags ? "tags: " + tags : ""),
			"spell check: " + (md.spellcheck ? "en" : "dis") + "abled",
			"notes count: " + localdata.length,
			"word count: " + getwords(),
			"current filter: " + currenttag || "",
			"current note start: " + stat.cur.t,
			"current note queries: " + stat.cur.q,
			"current note data sent: " + formatsize(stat.cur.d),
			"session start: " + stat.ses.t,
			"session queries: " + stat.ses.q,
			"session data sent: " + formatsize(stat.ses.d)
		].join("\n"));
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

function applyvault(vault)
{
	window.localStorage.setItem("vault", vault);
	init();
}

function switchvault()
{
	var newvault = currentvault == "local" ? "remote" : "local";
	if (confirm("Switch to " + newvault + "?"))
	{
		applyvault(newvault);
	}	
}

function ancestors(note)
{
	var list = [note];
	var result = [];
	
	while (list.length)
	{
		var current = list.shift();
		if (result.indexOf(current) == -1)
		{
			result.push(current);
			list = list.concat(parents(current));
		}
	}
	return result;
}

function descendants(note)
{
	var list = [note];
	var result = [];
	
	while (list.length)
	{
		var current = list.shift();
		if (result.indexOf(current) == -1)
		{
			result.push(current);
			list = list.concat(children(current));
		}
	}
	return result;
}

function children(note)
{
	return (note.content
		.match(/\[\[([^\]]*)\]\]/g) || [])
		.map(l => l.replace("[[", "").replace("]]", ""))
		.map(l => getnote(l));
}

function parents(note)
{
	return localdata
		.filter(n => n.content.indexOf("[[" + note.title + "]]") != -1);
}

function connected(note)
{
	var list = [note];
	var result = [];
	
	while (list.length)
	{
		var current = list.shift();
		if (result.indexOf(current) == -1)
		{
			result.push(current);
			list = list.concat(children(current)).concat(parents(current));
		}
	}
	return result;
}

function shownotelinks()
{
	if (settings.enablenetwork)
	{
		networkpage.hidden = false;
		md.hidden = true;
		function id(note)
		{
			return localdata.indexOf(note);
		}

		var nodes = [];
		var edges = [];

		var list = [currentnote];
		
		while (list.length)
		{
			var current = list.shift();
			if (!nodes.find(n => n.id == id(current)))
			{
				nodes.push(
					{
						id: id(current),
						label: current.title
					});

				var buddies = children(current).concat(parents(current));

				list = list.concat(buddies);

				buddies.
				forEach(buddy => {
					if (!edges.find(edge => (edge.to == id(current) && edge.from == id(buddy)) || (edge.to == id(buddy) && edge.from == id(current))))
					{
						edges.push({
							from: id(current),
							to: id(buddy)
						});
					}				
				});
			}
		}

		var data = {
			nodes: nodes,
			edges: edges
		};

		var options = 
		{
			nodes:
			{
				color:
				{
					background: settings.bgcolor,
					border: settings.fontcolor,
				},
				font:
				{
					color: settings.fontcolor,
					size: 16,
					face: settings.fontfamily
				}
			}
		};
		
		var graph = new vis.Network(network, data, options);
		graph.on("click", function(event)
		{
			networkpage.hidden = true;
			md.hidden = false;
			loadnote(nodes.find(n => n.id == event.nodes[0]).label);
		});
	}
	else
	{
		searchinlist(connected(currentnote).map(n => n.title))
		.then(loadnote);
	}
}


function showoutline()
{
	var outline = {};
	var pos = 0;
	geteditorcontentwithheader().split("\n").forEach((line, index, lines) =>
	{
		pos += line.length + 1;
		if (line.startsWith("#"))
		{
			line = line
			.replace("# ", "")
			.replace(/#/g, "\xa0".repeat(4));
			outline[line] = pos;
		}
		else if (line == "---" && index != 0 && index != 3)
		{
			var next;
			if (next = lines.find((current, i) => 
			{
				return i > index && current != "";
			}))
			{
				var nbcar = 80;
				next = next.length < nbcar ? next : next.substring(0, nbcar) + "...";
				outline[next] = pos;
			}
		}
	});

	var keys = Object
	.keys(outline)
	.sort((a,b) =>
		{
			return outline[a] - outline[b];
		});

	searchinlist(keys)
	.then(line =>
	{
		md.setSelectionRange(outline[line], outline[line]);
		md.focus();
	});
}

function linkrangeatpos()
{
	var start = md.value.lastIndexOf("[[", md.selectionStart);
	if (start == -1 || md.value.substring(start, md.selectionStart).indexOf("\n") != -1) return null
	
	var end = md.value.indexOf("]]", md.selectionStart);
	if (end == -1 || md.value.substring(md.selectionStart, end).indexOf("\n") != -1) return null;

	return {
		start: start,
		end: end + 2
	};	
}

function linkatpos()
{
	var range = linkrangeatpos();
	if (range)
	{
		return md.value.substring(range.start + 2, range.end - 2);
	}
	return null;
}

function tagatpos()
{
	if (md.value.lastIndexOf("tags: ", md.selectionStart) < md.value.lastIndexOf("\n", md.selectionStart) || md.selectionStart < 6)
	{
		return null;
	}

	var start = md.value.lastIndexOf(" ", md.selectionStart);
	if (start == -1 || md.value.substring(start, md.selectionStart).indexOf("\n") != -1) return "";
	
	var eol = md.value.indexOf("\n", md.selectionStart);
	var end = md.value.indexOf(",", md.selectionStart);

	if (end == -1 || eol < end)
	{
		end = eol;
	}
	
	return md.value.substring(start + 1, end);
}

function clickeditor()
{
	if (!saved)
	{
		console.log("Not saved, ctrl+click ignored.");
		return;
	}
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

function showtemporaryinfo(info)
{
	alert(info);
}

function getwords()
{
	return geteditorcontentwithheader().split(/\s+\b/).length;
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

function share()
{
	if (navigator.share)
	{
		navigator.share(
		{
			text: geteditorcontentwithheader(),
			title: currentnote.title
		});
	}
}

function sharehtml()
{
	if (navigator.share)
	{
		var file = new File(['<html><body>' + md2html(geteditorcontentwithheader()) + '</body></html>'],
			currentnote.title + ".html",
			{
		  		type: "text/html",
			});

		navigator.share(
		{
		    title: currentnote.title,
		    files: [file]
		});
	}
}

function download(filename, content)
{
	var element = document.createElement('a');
	element.setAttribute('href', 'data:text/markdown;charset=utf-8,' + encodeURIComponent(content));
	element.setAttribute('download', filename);
	element.style.display = 'none';
	document.body.appendChild(element);
	element.click();
	document.body.removeChild(element);
	element = null;
}

function downloadnotes()
{
	var copy = localdata.slice();
	console.log(copy.length + " notes to download");
	var id = setInterval(() => 
	{
		var note = copy.pop();
		download(note.title + ".md", note.content);
		if (copy.length == 0)
		{
			clearInterval(id);
		}
	}, 500);
}

function inserttodo()
{
	filter.placeholder = "Text...";
	filter.value = "";
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
			getnote("todo").content += "\n" + filter.value;
			datachanged();
		}
	}
}

function downloadallvaults()
{
	var data =
	{
		local: JSON.parse(window.localStorage.getItem("local")),
		remote: JSON.parse(window.localStorage.getItem("remote")),
		trash: JSON.parse(window.localStorage.getItem("trash")),
	};
	download("notes " + timestamp() + ".json", JSON.stringify(data));
}

function downloadvault()
{
	download("notes " + timestamp() + " " + currentvault + ".json", window.localStorage.getItem(currentvault));
}

function downloadnotewithsubs()
{
	var note = withsubs();
	if (note)
	{
		download(note.title + ".md", note.content);	
	}	
}

function downloadnote()
{
	download(currentnote.title + ".md", geteditorcontentwithheader());
}

function remotecallfailed(error)
{
	if (error)
	{
		console.warn(error);
		showtemporaryinfo("Error: " + error);
	}
}

function loadstorage()
{
	var item = window.localStorage.getItem(currentvault);
	localdata = item ? JSON.parse(item) : [];

	var urlparam = (new URLSearchParams(window.location.search)).get("n");

	if (currentnote)
	{
		currentnote = getnote(currentnote.title);
	}
	else if (urlparam)
	{
		currentnote = getnote(urlparam);
		if (!currentnote)
		{
			currentnote = {title: urlparam, content: ""};
			localdata.unshift(currentnote);
		}
	}

	if (currentnote)
	{
		bindfile(currentnote);
	}
	else
	{
		loadlast();
	}
	initshortcuts();
}

function applystyle()
{
	document.body.style.background = settings.bgcolor;
	document.body.style.fontFamily = settings.fontfamily;
	document.body.style.fontSize = settings.fontsize;
	document.body.style.lineHeight = settings.lineheight;
	document.body.style.color = settings.fontcolor;
	document.body.style.caretColor = settings.accentcolor;
	document.body.style.marginLeft = settings.margins;
	document.body.style.marginRight = settings.margins;

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

	if (settings.titlebydefault)
	{
		toggletitle();
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
}

function initvault()
{
	currentvault = window.localStorage.getItem("vault") || "local";
}

function initshortcuts()
{
	localdata
	.filter(n => n.content.includes("shortcut: "))
	.forEach(n => {
		var hint = "Open " + n.title;
		if (!commands.find(c => c.hint == hint))
		{
			var shortcut = n.content.match(/shortcut: (.*)/)[1];
			commands.unshift({
				hint: hint,
				shortcut: shortcut,
				action: function()
				{
					loadnote(n.title);
				}
			});
		}
	});
}

function init()
{
	loadsettings();
	initvault();

	window.onbeforeunload = checksaved;
	window.onclick = focuseditor;

	history.pushState({}, '', '.');
	window.onpopstate = function(evt)
	{
		history.pushState({}, '', '.');
		if (!searchdialog.hidden)
		{
			esc(evt);
		}
		else
		{
			loadprevious();	
		}
	}

	initsnippets();

	currenttag = "";

	if (isremote())
	{
		queryremote({action: "fetch"})
		.then(data =>
		{
			window.localStorage.setItem("remote", JSON.stringify(data));
			loadstorage();
			checkevents();
		})
		.catch(remotecallfailed);
	}
	else
	{
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

function cvdt(text)
{
	var day = text.substr(0,8);
	var time = text.substr(9,6);
	return new Date(
		day.substr(0,4),
		parseInt(day.substr(4,2)) - 1,
		day.substr(6,2),
		time.substr(0,2),
		time.substr(2,2),
		time.substr(4,2));
}

function ics2json(ics)
{
	var events = [];
	ics.split("BEGIN:VEVENT").forEach(block =>
	{
		var evt = {};
		block.split("\r\n").forEach(line =>
		{
			var tuple = line.split(":");
			if (tuple.length > 1)
			{
				var field = tuple.shift().split(";")[0];
				var value = tuple.join(":");
				if (field == "DTSTART")
				{
					evt.DTSTART = cvdt(value);
				}
				else if (field == "UID" || field == "SUMMARY")
				{
					evt[field] = value;
				}
			}
		});

		if (evt.UID && evt.SUMMARY && evt.DTSTART)
		{
			events.push(evt);
		}
	});
	return events.sort( (a,b) => a.DTSTART - b.DTSTART);
}

function checkevents()
{
	queryremote({action: "cal"})
	.then(data =>
	{
		if (!isremote())
		{
			console.log("ignore events because current vault is " + currentvault);
			return;
		}

		if (!data.ics)
		{
			console.warn("could not retrieve events");
			return;
		}

		var note = getnote("events.json");
		if (!note)
		{
			note = {
				title: "events.json",
				content: "[]"
			};
			localdata.push(note);
		}

		var events = ics2json(data.ics);
		var existing = JSON.parse(note.content).map(e =>
			{
				e.DTSTART = new Date(e.DTSTART);
				return e;
			});

		// keep future only
		events = events.filter(e => e.DTSTART >= new Date);
		existing = existing.filter(e => e.DTSTART >= new Date);

		// check added, deleted, changed
		var newcontent = [];
		events.forEach(evt =>
		{
			var previous = existing.find(e => e.UID == evt.UID);
			if (!previous)
			{
				newcontent.push("new event: " + evt.DTSTART.toLocaleString() + " " + evt.SUMMARY);
			}
			else if (previous.SUMMARY != evt.SUMMARY)
			{
				newcontent.push("changed event: " + evt.DTSTART.toLocaleString() + " " + evt.SUMMARY);
			}
		});

		existing.forEach(evt =>
		{
			if (!events.find(e => e.UID == evt.UID))
			{
				newcontent.push("deleted event: " + evt.DTSTART.toLocaleString() + " " + evt.SUMMARY);
			}
		});

		if (newcontent.length)
		{
			showtemporaryinfo("Calendar changes to check");
			var todo = getnote("todo");
			var idx = 0;
			if (todo.content.startsWith("---"))
			{
				idx = todo.content.indexOf("---", 3) + 4;
			}
			todo.content = todo.content.substring(0, idx)
			+ newcontent.join("\n")
			+ "\n---\n"
			+ todo.content.substring(idx);

			// reload todo if open
			if (currentnote == todo)
			{
				bindfile(todo);
			}

			note.content = JSON.stringify(events);
			datachanged();
		}
	})
	.catch(remotecallfailed);
}

function queryremote(params)
{
	return new Promise( (apply, failed) => {

		stat.cur.q++;
		stat.ses.q++;

		params.password = window.localStorage.getItem("password");

		var paramlist = [];
		for (var i in params)
		{
			paramlist.push(i + "=" + encodeURIComponent(params[i]));
		}

		stat.cur.d += paramlist.join("&").length;
		stat.ses.d += paramlist.join("&").length;

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
	var content = geteditorcontentwithheader();
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

function seteditorcontent(content)
{
	md.value = content;
}

function geteditorcontentwithheader()
{
	return currentheader + md.value;
}

function ontopbarclick()
{
	if (title.hidden)
	{
		commandpalette();
	}
}

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
	converter.setOption("tasklists", true);

	if (settings.linksinnewtab)
	{
		converter.setOption("openLinksInNewWindow", true);
	}
	
	var html = converter.makeHtml(content);

	// internal links
	html = html.replace(/\[\[([^\]]*)\]\]/g, "<a href='#' onclick='loadnote(\"$1\");'>$1</a>");

	return html;
}

function list()
{
	return localdata
	.filter(n => currenttag == "" || gettags(n).includes(currenttag))
	.map(n => n.title);
}

function loadlast()
{
	loadnote(list().shift() || timestamp());
}

function loadprevious()
{
	var index = localdata.indexOf(currentnote);
	if (index > -1 && index < localdata.length - 1)
	{
		loadnote(localdata[index + 1].title);
	}
}

function loadnext()
{
	var index = localdata.indexOf(currentnote);
	if (index > -1 && index > 1)
	{
		loadnote(localdata[index - 1].title);
	}
}

function grep(needle)
{
	var result = {};

	localdata
	.filter(note => note.title != "events.json")
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
			grepcontent.push("[" + l + "] " + grepresult[file][l]);
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
		.concat(snippets.map(s => "Insert snippet: " + s.hint))
		.concat(list().map(t => "Open note: " + t))
		)
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
			else if (hint.startsWith("Open note: "))
			{
				loadnote(hint.replace("Open note: ", ""));
			}
			else
			{
				// if unknown command, create a new note
				loadnote(hint);
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

function searchinlist(list, customevent, index)
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
		if (index)
		{
			fileindex = index;
			applyfileindex();
		}

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
	if (md.clientHeight < md.scrollHeight)
	{
		md.style.height = md.scrollHeight + 'px';
	}
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

	if (currentnote.title == "settings.json")
	{
		settings = JSON.parse(md.value);
		savesettings();
		loadsettings();
		saved = true;
		return;
	}

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

	if (saved)
	{
		console.log("nothing to save");
		return;
	}

	var content = geteditorcontentwithheader();
	if ((content == "" && backup != "") || content == "null" || content == "undefined")
	{
		showtemporaryinfo("Invalid content '" + content + "', file '" + currentnote.title + "' not saved");
		return;
	}

	currentnote.pos = md.selectionStart;
	currentnote.content = content;
	putontop();

	window.localStorage.setItem(currentvault, JSON.stringify(localdata));
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
			if (content != geteditorcontentwithheader())
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

function loadreview()
{
	loadnote("press review");
}

function loadquicknote()
{
	loadnote("Quick note");
}

function timestamp()
{
	var utc = new Date();
	var loc = new Date(utc - utc.getTimezoneOffset() * 60 * 1000);

	return loc.toISOString().replace("T", " ").replace(/\..*/, "").replace(/:/g, ".");
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
	help.push("[vis-network](https://visjs.org/)");

	help.push("## Fonts");
	help.push("[Inconsolata](https://levien.com/type/myfonts/inconsolata.html)");
	help.push("[Hack](https://sourcefoundry.org/hack/)");
	help.push("[Droid Serif](https://fonts.adobe.com/fonts/droid-serif)");
	help.push("[Josefin Sans](https://fonts.google.com/specimen/Josefin+Sans)");

	help.push("## Inspiration");
	help.push("[rwtxt](https://rwtxt.com)");
	help.push("[Offline Notepad](https://offlinenotepad.com/)");
	help.push("[Writemonkey3](http://writemonkey.com/wm3/)");
	help.push("[Sublime Text](https://www.sublimetext.com/)");
	help.push("[Notion](https://www.notion.so/)");
	help.push("[Calmly Writer](https://calmlywriter.com/)");
	help.push("[Cryptee](https://crypt.ee/)");

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

function renamereferences(newname)
{
	localdata
	.filter(note => note != currentnote)
	.forEach(note =>
	{
		note.content = note.content.replaceAll("[[" + currentnote.title + "]]", "[[" + newname + "]]");
	});	
}

function rename(newname)
{
	if (localdata.find(n => n.title == newname))
	{
		var error = newname + " alreday exists";
		console.warn(error);
		return error;
	}

	renamereferences(newname);

	currentnote.title = newname;

	datachanged();
	return "";
}

function deletenote(note)
{
	var trash = JSON.parse(window.localStorage.getItem("trash")) || [];
	trash.push(note);
	window.localStorage.setItem("trash", JSON.stringify(trash));

	localdata = localdata.filter(n => n != note);

	renamereferences(note.title + " (deleted)");
}

function deletecurrentnote()
{
	if (confirm('delete "' + currentnote.title + '"?'))
	{
		deletenote(currentnote);
		loadlast();
		datachanged();
	}
}

function restore()
{
	if (confirm('restore "' + currentnote.title + '"?'))
	{
		seteditorcontent(backup);
		datachanged();
	}
}

function toggleheader()
{
	if (preview.hidden)
	{
		if (md.value.startsWith("---"))
		{
			var idx = md.value.indexOf("---", 3);
			var header = md.value.substring(0, idx + 4);
			currentheader = header;
			md.value = md.value.substring(idx + 4);
		}
		else if (currentheader)
		{
			md.value = currentheader + md.value;
			currentheader = "";
		}
		else
		{
			var headers = "---\ndate: " + (new Date).toISOString().substring(0, 10) + "\ntags: \n---\n\n";
			md.value = headers + md.value;
			setpos(27);
		}

		resize();
	}
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
	else if (command.remoteonly && !isremote())
	{
		showtemporaryinfo(command.hint + " is not available in local mode.");
	}
	else if (command.action)
	{
		command.action();
	}
}

function esc(event)
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
	else if (networkpage.hidden == false)
	{
		networkpage.hidden = true;
		md.hidden = false;
	}
	else if (preview.hidden == false)
	{
		togglepreview();
	}
}

function mainkeydownhandler()
{
	if (event.key == "Escape")
	{
		esc(event);
	}
	else if (!searchdialog.hidden && (event.key == "Tab" || event.keyCode == "40" || event.keyCode == "38"))
	{
		event.preventDefault();
		fileindex += (event.shiftKey || event.keyCode == "38") ? -1 : 1;
		fileindex = Math.min(fileindex, filteredlist.children.length - 1);
		fileindex = Math.max(fileindex, 0);
		applyfileindex();
	}
	else if (event.ctrlKey && event.key == " " || event.key == "F2")
	{
		commandpalette();
	}
	else
	{
		commands.filter(c => c.shortcut)
		.every(command =>
		{
			var s = splitshortcut(command.shortcut);
			if (event.key == s.key && !(s.ctrl && !event.ctrlKey && !event.altKey) && !(s.shift && !event.shiftKey))
			{
				event.preventDefault();
				executecommand(command);
				return false;
			}
			return true;
		});
	}
}

function setwindowtitle()
{
	document.title = currentnote.title;
}

function ontitlechange()
{
	var oldname = currentnote.title;

	if (localdata.find(n => n.title == title.value))
	{
		showtemporaryinfo(title.value + " alreday exists");
		title.value = currentnote.title;
		return;
	}

	// rename internal references
	localdata
	.filter(note => note != currentnote)
	.forEach(note =>
	{
		note.content = note.content.replaceAll("[[" + currentnote.title + "]]", "[[" + title.value + "]]");
	});

	currentnote.title = title.value;

	datachanged();
	setwindowtitle();
	toggletitle();
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
		.every(marker =>
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
			return false;
		});
	}
	else if (event.key === "Tab")
	{
		event.preventDefault();
		var init = {
			start: md.selectionStart,
			end: md.selectionEnd
		};
		var range = getlinesrange();
		range.start--;
		range.end--;
		var selection = md.value.substring(range.start, range.end);
		var newtext;
		if (event.shiftKey)
		{
			newtext = selection.replaceAll("\n    ", "\n");
		}
		else
		{
			newtext = selection.replaceAll("\n", "\n    ");

		}
		md.value = md.value.substring(0, range.start)
		+ newtext
		+ md.value.substring(range.end);

		var shift = 0;
		if (newtext.length < selection.length)
		{
			shift = -4;
		}
		else if (newtext.length > selection.length)
		{
			shift = 4;
		}

		md.selectionStart = init.start + shift;
		md.selectionEnd = init.end + (newtext.length - selection.length);
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
	preview.innerHTML = md2html(geteditorcontentwithheader());
	md.hidden = !md.hidden;
	preview.hidden = !preview.hidden;

	if (preview.hidden)
	{
		resize();
		md.focus();
	}
}

function withsubs()
{
	try
	{
		descendants(currentnote);	
	}
	catch (err)
	{
		showtemporaryinfo(err);
		return null;
	}

	var tempnote = 
	{
		title: currentnote.title + " (with subnotes)",
		content: geteditorcontentwithheader()
	};

	var kids = children(tempnote);
	while (kids.length)
	{
		kids.forEach(kid =>
		{
			var kidcontent = kid.content;
			if (kidcontent.startsWith("---\n"))
			{
				var pos = kidcontent.indexOf("---\n", 4);
				kidcontent = kidcontent.substring(pos + 4);
			}
			tempnote.content = tempnote.content.replaceAll("[[" + kid.title + "]]", kidcontent);
		});
		kids = children(tempnote);
	}

	return tempnote;
}

function togglepreviewwithsubs()
{
	var note = withsubs();
	if (note)
	{
		preview.innerHTML = md2html(note.content);
		md.hidden = !md.hidden;
		preview.hidden = !preview.hidden;

		if (preview.hidden)
		{
			resize();
			md.focus();
		}	
	}	
}

function bindfile(note)
{
	var changed = currentnote != note;

	backup = note.content;
	currentnote = note;
	title.value = note.title;
	setwindowtitle();

	seteditorcontent(note.content || "");
	preview.innerHTML = md2html(geteditorcontentwithheader());

	if (changed)
	{
		md.style.height = "0px";
	}	
	resize();

	// to improve...
	if (!issplit() && searchdialog.hidden)
	{
		md.focus();
	}

	currentheader = "";
	if (settings.hideheaderbydefault && md.value.startsWith("---"))
	{
		toggleheader();
	}

	setpos(note.pos || 0);
}

function loadnote(name)
{
	var note = localdata.find(n => n.title == name);
	if (!note)
	{
		note = {title: name, content: ""};
		localdata.unshift(note);
	}

	bindfile(note);

	stat.cur.q = 0;
	stat.cur.d = 0;
	stat.cur.t = timestamp();

	if (!preview.hidden || (preview.hidden && gettags(note).indexOf("preview") !== -1))
	{
		togglepreview();
	}	
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
