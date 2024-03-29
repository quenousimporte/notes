var defaultsettings =
{
	fontsize: "16px",
	lineheight: "24px",
	margins: "20%",
	fontfamily: "helvetica,system-ui",
	savedelay: 2000,
	defaultpreviewinsplit: false,
	tagautocomplete: false,
	enablenetwork: true,
	titlebydefault: false,
	linksinnewtab: true,
	colors: true,
	password: "",
	sync: false,
	tagsinlists: true,
	uselinkpopup: true,
	autosorttodo: true
};

//builtin
var markerslist = ["* ", "- ", "    * ", "    - ", ">> ", "> ", "=> ", "— ", "[ ] ", "    ", "• ", "- [ ]", "[x] ", "- [x]"];
var codelanguages = ["xml", "js", "sql"];
var tagmark = "+";

// globals
var currentnote = null;
var fileindex = 0;
var workerid = null;
var backup = "";
var localdata = null;
var saved = true;
var lastsaved = "";
var pending = false;
var settings = null;
var tags = null;
var titlemap = {};

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

var commands = [
{
	hint: "Close menu"
},
{
	shortcut: "ctrl+shift+P",
	hint: "Command palette",
	allowunsaved: true,
	action: commandpalette,
	excludepalette: true
},
{
	shortcut: "ctrl+p",
	hint: "Show notes list",
	action: searchandloadnote
},
{
	shortcut: "ctrl+n",
	hint: "New note",
	action: startnewnote
},
{
	shortcut: "ctrl+shift+N",
	hint: "Quick new note",
	action: quicknewnote
},
{
	hint: "Force save",
	action: save,
	shortcut: "ctrl+s",
	allowunsaved: true
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
	hint: "Restore current note",
	action: restore
},
{
	hint: "Insert markdown header",
	action: insertheader,
	allowunsaved: true
},
{
	hint: "Show help",
	action: showhelp
},
{
	hint: "Search tags",
	action: searchtags,
	shortcut: "ctrl+shift+T"
},
{
	hint: "Toggle split view",
	action: togglesplit
},
{
	hint: "Load previous note",
	action: loadprevious,
	shortcut: "alt+ArrowLeft"
},
{
	hint: "Load next note",
	action: loadnext,
	shortcut: "alt+ArrowRight"
},
{
	hint: "Settings",
	action: editsettings
},
{
	hint: "Change a setting",
	action: changesetting
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
	hint: "Show stats",
	action: showinfo,
	shortcut: "ctrl+w",
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
	hint: "Download all notes (md files in zip archive)",
	action: downloadnotes,
	shortcut: "ctrl+shift+S"
},
{
	hint: "Download all notes (html files in zip archive)",
	action: downloadhtmlnotes
},
{
	hint: "Download all notes (json file)",
	action: downloadnotesjson
},
{
	hint: "Download all notes (encrypted json file)",
	action: downloadencrypted,
	remoteonly: true
},
{
	hint: "Insert text in todo",
	action: promptinserttodo
},
{
	hint: "Edit pgp keys",
	action: editpgpkeys
},
{
	hint: "Decrypt note",
	action: decryptnote
},
{
	hint: "Restore deleted note",
	action: restoredeleted
},
{
	hint: "Notes by size",
	action: notesbysize
},
{
	hint: "Replace",
	shortcut: "ctrl+h",
	action: searchandreplace
},
{
	hint: "Sort todo.txt list",
	action: sortcurrentastodo
},
{
	hint: "Sort text",
	action: sortselection,
	allowunsaved: true
},
{
	hint: "Show backlinks",
	action: backlinks
},
{
	hint: "Remove completed tasks",
	action: purgetodo,
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
	command: "/comment",
	hint: "Comment",
	insert: "<!--\n\n-->",
	cursor: -4
},
{
	command: "/x",
	hint: "Mark todo entry done",
	insert: "x " + (new Date).toISOString().substring(0, 10) + " "
}];

function purgetodo() {
	if (currentistodo() && confirm("Remove completed tasks?"))
	{
		seteditorcontent(currentnote.content.replace(/\nx .*/g, ""));
	}
}

function seteditorcontent(content, silent)
{
	md.value = content;
	applycolors();
	if (!silent)
	{
		datachanged();
	}
	resize();
}

function encryptstring(str)
{
	var key = localStorage.getItem("pgpkeys").split("-----BEGIN PGP PRIVATE KEY BLOCK-----")[0];
	var publicKey = null;
	return openpgp.readKey({ armoredKey: key })
	.then(res =>
	{
		publicKey = res;
		return openpgp.createMessage({ text: str });
	})
	.then(message =>
	{
		return openpgp.encrypt({
			message: message,
			encryptionKeys: publicKey });
	});
}

function decryptstring(str)
{
	if (!str.startsWith("-----BEGIN PGP MESSAGE-----"))
	{
		// console.log(str + ": string is not encrypted");
		return Promise.resolve(str);
	}

	var key = localStorage.getItem("pgpkeys").split("-----END PGP PUBLIC KEY BLOCK-----")[1];
	var privateKey = null;
	return openpgp.readKey({ armoredKey: key })
	.then(res =>
	{
		privateKey = res;
		return openpgp.readMessage({ armoredMessage: str })
	})
	.then(message =>
	{
		return openpgp.decrypt({
			message: message,
			decryptionKeys: privateKey });
	})
	.then(decrypted =>
	{
		const chunks = [];
		for (const chunk of decrypted.data) {
			chunks.push(chunk);
		}
		return chunks.join('');
	})
}

function getnote(title)
{
	return localdata.find(note => note.title == title);
}

function getrangecontent(range)
{
	return md.value.substring(range.start, range.end);
}

function currentrange()
{
	return {
		start: md.selectionStart,
		end: md.selectionEnd
	};
}

function createsubnote()
{
	var title = prompt("Subnote tite:");
	if (!title)
	{
		showtemporaryinfo("No title provided");
		setpos(md.selectionStart);
		md.focus();
	}
	else if (getnote(title))
	{
		showtemporaryinfo("'" + title + "' already exists");
		setpos(md.selectionStart);
		md.focus();
	}
	else
	{
		var range = currentrange();
		var content = getrangecontent(range);
		var newnote =
		{
			title: title,
			content: content
		}
		localdata.unshift(newnote);
		seteditorcontent(md.value.substring(0, range.start)
			+ "[[" + title + "]]"
			+ md.value.substring(range.end));
	}
}


function comment()
{
	seteditorcontent(md.value.substring(0, md.selectionStart)
		+ "<!-- "
		+ md.value.substring(md.selectionStart, md.selectionEnd)
		+ " -->"
		+ md.value.substring(md.selectionEnd));
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
			seteditorcontent(md.value.substring(0, range.start)
				+ subnote.content
				+ md.value.substring(range.end));

			if (confirm("Delete '" + title + "'?"))
			{
				deletenote(subnote);
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

function pospercent()
{
	return md.value.length > 0 ?(100 * md.selectionStart / md.value.length).toFixed(2) : 100;
}

function showinfo()
{
	var tags = gettags(currentnote);
	showtemporaryinfo(
		[
			"saved: " + saved + (lastsaved? " (" + lastsaved + ")": ""),
			"sync: " + (settings.sync ? "en" : "dis") + "abled",
			"title: " + currentnote.title,
			"line count: " + md.value.split("\n").length,
			"word count: " + getwords(),
			"cursor position: " + md.selectionStart + " (" + pospercent() + "%)",
			(tags ? "tags: " + tags : ""),
			"current note start: " + stat.cur.t,
			"current note queries: " + stat.cur.q,
			"current note data sent: " + formatsize(stat.cur.d),
			"session start: " + stat.ses.t,
			"session queries: " + stat.ses.q,
			"session data sent: " + formatsize(stat.ses.d),
			"notes count: " + localdata.length,
			"spell check: " + (md.spellcheck ? "en" : "dis") + "abled"
		].join("\n"));
}

function savesettings()
{
	window.localStorage.setItem("settings", JSON.stringify(settings));
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
		.filter(l => !l.includes("(deleted)"))
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

function toggleeditor(hidden)
{
	md.hidden = hidden;

	if (settings.colors)
	{
		colored.hidden = hidden;
	}
}

function id(note)
{
	return localdata.indexOf(note);
}

function shownotelinks()
{
	if (settings.enablenetwork)
	{
		networkpage.hidden = false;
		toggleeditor(true);

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

		// todo: use theme colors
		var options =
		{
			nodes:
			{
				color:
				{
					background: "white",
					border: "black",
				},
				font:
				{
					color: "black",
					size: 16
				}
			}
		};

		var graph = new vis.Network(network, data, options);
		graph.on("click", function(event)
		{
			networkpage.hidden = true;
			toggleeditor(false);
			loadnote(nodes.find(n => n.id == event.nodes[0]).label);
		});
		graph.setSelection(
		{
			nodes : [id(currentnote)]
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
	md.value.split("\n").forEach((line, index, lines) =>
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
			var next = lines.find((current, i) =>
			{
				return i > index && current != "";
			});
			if (next)
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

function removelinkdialog()
{
	if (typeof linkdialog != "undefined")
	{
		notepage.removeChild(linkdialog);
	}
}

function showlinkdialog(link)
{
	var div = document.createElement("div");
	div.setAttribute("style", "top:" + event.pageY + "px;left:" + event.pageX + "px");
	div.setAttribute("id", "linkdialog");

	var a = document.createElement("a");
	a.setAttribute("id", "linkelt");

	if (link.startsWith("http"))
	{
		a.setAttribute("href", link);
		a.setAttribute("target", "_blank");
		div.onclick = removelinkdialog;

		if (settings.sync)
		{
			if (titlemap[link])
			{
				a.innerHTML = titlemap[link];
			}
			else
			{
				a.innerText = link;
				queryremote({action: "title", data: link})
				.then(res =>
				{
					if (res.title)
					{
						a.innerHTML = res.title;
						titlemap[link] = res.title;
						localStorage.setItem("titlemap", JSON.stringify(titlemap));
					}
				});
			}
		}
		else
		{
			a.innerText = link;
		}
	}
	else
	{
		a.setAttribute("href", "#");
		a.innerText = link;
		div.onclick = function()
		{
			removelinkdialog();
			loadnote(link);
		};
	}

	div.appendChild(a);

	notepage.appendChild(div);
}

function checkatpos(pos)
{
	if (pos > 0 && md.value[pos - 1] == "[" && md.value[pos + 1] == "]")
	{
		return {
			pos: pos,
			val: md.value[pos]
		};
	}
	return null;
}

function clickedcheck()
{
	return checkatpos(md.selectionStart) || checkatpos(md.selectionStart + 1) || checkatpos(md.selectionStart - 1);
}

function clickeditor()
{
	var word, link;
	if (event.ctrlKey)
	{
		if (!saved)
		{
			console.log("Not saved, ctrl+click ignored.");
			return;
		}
		link = linkatpos();
		var tag = tagatpos();
		word =  wordatpos();
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
		else if (word.startsWith("http"))
		{
			window.open(word, '_blank');
		}
	}
	else if (clickedcheck())
	{
		var res = clickedcheck();
		seteditorcontent(md.value.substring(0, res.pos)
			+ (res.val == " " ? "x" : " ")
			+ md.value.substring(res.pos + 1));
		setpos(res.pos);
	}
	else if (settings.uselinkpopup)
	{
		removelinkdialog();
		link = linkatpos();
		if (link)
		{
			showlinkdialog(link);
		}
		else
		{
			word =  wordatpos();
			if (word.startsWith("http"))
			{
				showlinkdialog(word);
			}
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

function editsetting(name)
{
	if (typeof settings[name] != "undefined")
	{
		var value = settings[name];
		var type = typeof value;
		if (type != "undefined")
		{
			value = prompt(name, value);
			if (value !== null)
			{
				if (type == "number")
				{
					value = parseInt(value);
				}
				else if (type == "boolean")
				{
					value = value === "true";
				}
				settings[name] = value;
				savesettings();
				loadsettings();
			}
		}
	}
}

function changesetting()
{
	searchinlist(Object.keys(settings).map(name => name + ": " + settings[name]))
	.then(setting =>
	{
		editsetting(setting.split(":").shift());
	});
}

function decryptnote()
{
	decryptstring(md.value)
	.then(decrypted =>
	{
		seteditorcontent(decrypted);
		resize();
	});
}

function editpgpkeys()
{
	bindfile(
	{
		title: "pgpkeys",
		content: localStorage.getItem("pgpkeys") || ""
	});
}

function showtemporaryinfo(info)
{
	alert(info);
}

function getwords()
{
	return md.value.split(/\s+\b/).length;
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
		return note.content.substring(i + 6, j)
			.split(",")
			.map(t => t.toLowerCase().trim())
			.filter(t => t.length);
	}
	return [];
}

function share()
{
	if (navigator.share)
	{
		navigator.share(
		{
			text: md.value,
			title: currentnote.title
		});
	}
}

function sharehtml()
{
	if (navigator.share)
	{
		var file = new File(['<html><body>' + md2html(md.value) + '</body></html>'],
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

function getfilename(title)
{
	return title.replace(/[\?\"<>|\*:\/\\]/g, "_") + ".md";
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
	var zip = new JSZip();
	localdata.forEach(note =>
	{
		zip.file(getfilename(note.title), note.content);
	});
	zip.generateAsync({type:"blob"})
	.then(function(content)
	{
		saveAs(content, "notes-" + timestamp() + ".zip");
	});
}

function downloadhtmlnotes()
{
	var zip = new JSZip();
	localdata.forEach(note =>
	{
		zip.file(getfilename(note.title).replace(".md", ".html"), md2html(note.content));
	});
	zip.generateAsync({type:"blob"})
	.then(function(content)
	{
		saveAs(content, "notes-html-" + timestamp() + ".zip");
	});
}

function headerandtext(note)
{
	var content = note.content;
	var result =
	{
		header: "",
		text: content
	};
	if (content.startsWith("---\n"))
	{
		var end = content.indexOf("---\n", 4);
		if (end > -1)
		{
			result.header = content.substring(0, end + 4);
			result.text = content.substring(end + 4);
		}
	}
	return result;
}

function inserttodo(text)
{
	var todo = getorcreate("todo", "");
	var split = headerandtext(todo);
	todo.content = split.header + text + "\n" + split.text;
	if (todo == currentnote)
	{
		seteditorcontent(todo.content, true);
	}
	return datachanged();
}

function promptinserttodo()
{
	var text = prompt("Text:");
	if (text)
	{
		inserttodo(text);
	}
}

function downloadnotesjson()
{
	download("notes-" + timestamp() + ".json", window.localStorage.getItem("data"));
}

function downloadencrypted()
{
	encryptstring(JSON.stringify(localdata))
	.then(encrypted =>
	{
		download("notes-encrypted-" + timestamp() + ".acs", encrypted);
	});
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
	download(currentnote.title + ".md", md.value);
}

function remotecallfailed(error)
{
	if (error)
	{
		console.warn(error);
		showtemporaryinfo("Error: " + error);
	}
	else
	{
		console.warn("remotecallfailed without details");
	}
}

function gotoline(line)
{
	var i = 0;
	var pos = 0;
	while (i < line && pos > -1)
	{
		pos = currentnote.content.indexOf("\n", pos + 1);
		i++;
	}
	if (pos > -1)
	{
		setpos(pos + 1);
	}
}

function loadstorage()
{
	var item = window.localStorage.getItem("data");
	localdata = item ? JSON.parse(item) : [];

	var params = new URLSearchParams(window.location.search);
	var title = params.get("n") || params.get("name");
	var line = params.get("l");
	var tags = params.get("t");
	var clip = params.get("c");

	if (clip)
	{
		settings.savedelay = 0;
		colored.hidden = true;
		md.hidden = true;
		var msg = document.createElement("div");
		msg.innerText = "Clipping...";
		notepage.appendChild(msg);

		inserttodo("@clip " + clip).then(window.close);
	}

	if (currentnote)
	{
		currentnote = getnote(currentnote.title);
	}
	else if (title)
	{
		currentnote = getnote(title);
		if (!currentnote)
		{
			var newcontent = params.get("description") || defaultheaders(tags);
			currentnote = {title: title, content: newcontent, pos: newcontent.length};
			localdata.unshift(currentnote);
		}
	}

	if (currentnote)
	{
		bindfile(currentnote);
		if (line)
		{
			gotoline(line);
		}
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
		for (var key in settings)
		{
			if (typeof item[key] !== "undefined")
			{
				settings[key] = item[key];
			}
		}
	}

	document.body.style.fontSize = settings.fontsize;
	document.body.style.lineHeight = settings.lineheight;
	document.body.style.marginLeft = settings.margins;
	document.body.style.marginRight = settings.margins;
	document.body.style.fontFamily = settings.fontfamily;

	if (settings.titlebydefault && title.hidden)
	{
		toggletitle();
	}

	colored.hidden = !settings.colors;
	md.style.color = settings.colors ? "transparent" : "inherit";
	md.style.background = settings.colors ? "transparent" : "inherit";
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

function init()
{
	loadsettings();

	window.onbeforeunload = checksaved;
	window.onclick = focuseditor;

	initsnippets();

	if (settings.sync)
	{
		titlemap = JSON.parse(localStorage.getItem("titlemap")) || {};
		if (localStorage.getItem("pgpkeys") && localStorage.getItem("pgpkeys").startsWith("-----BEGIN PGP PUBLIC KEY BLOCK-----"))
		{
			queryremote({action: "fetch"})
			.then(data =>
			{
				if (data.length)
				{
					window.localStorage.setItem("data", JSON.stringify(data));
				}
				loadstorage();
			})
			.catch(err =>
				{
					if (err == "Authent failed")
					{
						settings.password = prompt("Password: ", settings.password);
						savesettings();
						init();
					}
					else
					{
						showtemporaryinfo(err);
					}
				});
		}
		else
		{
			loadstorage();
			editpgpkeys();
			showtemporaryinfo("Pgp key empty or invalid. Enter PGP keys and refresh.");
		}
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

function getorcreate(title, content)
{
	var note = getnote(title);
	if (!note)
	{
		note = {title: title, content: content, pos: content.length};
		localdata.push(note)
	}

	return note;
}

function queryremote(params)
{
	return new Promise( (apply, failed) => {

		stat.cur.q++;
		stat.ses.q++;

		params.password = settings.password;

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

				decryptstring(xhr.responseText)
				.then(decrypted =>
				{
					data = JSON.parse(decrypted);

					if (data.error)
					{
						if (data.error == "authent")
						{
							failed("Authent failed");
						}
						else
						{
							failed("Remote handler returned an error: " + data.error);
						}
					}
					else
					{
						apply(data);
					}
				})
				.catch( error =>
				{
					failed("Could not decrypt or parse data file.");
					console.error(error);
				});
			}
		}

		var paramstring = paramlist.join("&");
		console.log("http request length: " + formatsize(paramstring.length));
		xhr.send(paramstring);
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

function backlinks()
{
	searchinlist(localdata
		.filter(n => n.content.includes("[[" + currentnote.title + "]]"))
		.map(n => n.title))
	.then(loadnote);
}

function sortselection()
{
	var content = md.value;
	var range = {start: 0, end: content.length};
	if (md.selectionStart != md.selectionEnd)
	{
		range = getlinesrange();
	}

	var selection = content.substring(range.start, range.end);
	var sorted = selection.split("\n").sort().join("\n");
	seteditorcontent(content.substring(0, range.start) + sorted + content.substring(range.end));
}

function wordatpos()
{
	var words = md.value.split(/\s/);
	var i = 0;
	var word = "";
	while (i < md.selectionStart)
	{
		word = words.shift();
		i += word.length + 1;
	}
	return word;
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
	var converter = new showdown.Converter();
	converter.setOption("simplifiedAutoLink", true);
	converter.setOption("simpleLineBreaks", true);
	converter.setOption("metadata", true);
	converter.setOption("tasklists", true);
	converter.setOption("literalMidWordUnderscores", true);

	if (settings.linksinnewtab)
	{
		converter.setOption("openLinksInNewWindow", true);
	}

	var html = converter.makeHtml(content);

	// internal links
	html = html.replace(/\[\[([^\]]*)\]\]/g, "<a href='#' onclick='loadnote(\"$1\");'>$1</a>");

	return html;
}

function loadlast()
{
	loadnote(localdata.length ? localdata[0].title : timestamp());
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
	if (index > -1 && index > 0)
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

function showgrepresult(needle, grepresult)
{
	var grepcontent = ["# Search results: \"" + needle + "\""];
	for (var file in grepresult)
	{
		grepcontent.push("[[" + file + "]]");
		for (var l in grepresult[file])
		{
			grepcontent.push("[<a href=?n=" + encodeURIComponent(file) + "&l=" + l + ">" + l + "</a>] " + grepresult[file][l]);
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
	var text = prompt("Search:", md.selectionEnd > md.selectionStart ? md.value.substr(md.selectionStart, md.selectionEnd - md.selectionStart).trim() : "");
	if (text)
	{
		showgrepresult(text, grep(text));
	}
}

function commandpalette()
{
	searchinlist(commands
		.filter(command => !command.excludepalette)
		.map(command =>
		{
			return {
				prefix: "command ",
				text: command.hint,
				suffix: command.shortcut ? [command.shortcut.toLowerCase()] : null
			};
		})
		.concat(snippets.map(s =>
		{
			return {
				prefix: "snippet ",
				text: s.hint,
				suffix: [s.command]
			};
		}))
		.concat(localdata.map(n =>
		{
			return {
				prefix: "note ",
				text: n.title,
				suffix: gettags(n).map(t => tagmark + t)
			};
		}))
		.concat(Object.keys(settings).map(s =>
		{
			return {
				prefix: "setting ",
				text: s,
				suffix: s == "password" ? null : [settings[s]]
			};
		})))
	.then(selected =>
	{
		if (selected.prefix == "snippet ")
		{
			var snippet = snippets.find(s => s.hint == selected.text);
			insert(snippet.insert, snippet.cursor);
			md.focus();
		}
		else if (selected.prefix == "note ")
		{
			loadnote(selected.text);
		}
		else if (selected.prefix == "setting ")
		{
			editsetting(selected.text);
		}
		else
		{
			var command = commands.find(c => c.hint == selected.text);
			if (command)
			{
				executecommand(command);
			}
			else
			{
				// if unknown command, create a new note
				loadnote(selected);
			}
		}
	});
}

function insert(text, cursoroffset = 0, nbtodelete = 0)
{
	var pos = md.selectionStart;
	var content = md.value;
	seteditorcontent(
		content.substring(0, pos - nbtodelete)
		+ text
		+ content.substring(pos));
	setpos(pos - nbtodelete + text.length + cursoroffset);
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

		list.forEach(item =>
		{
			var elt = document.createElement("div");
			elt.tag = item;

			if (typeof item === "string")
			{
				elt.textContent = item;
			}
			else
			{
				var ts = document.createElement("span");
				ts.setAttribute("class", "searchlistprefix");
				ts.innerHTML = item.prefix || "";
				elt.appendChild(ts);

				ts = document.createElement("span");
				ts.innerHTML = item.text;
				elt.appendChild(ts);

				if (item.suffix)
				{
					item.suffix.forEach(t =>
					{
						ts = document.createElement("span");
						ts.setAttribute("class", "searchlistsuffix");
						ts.innerHTML = "&nbsp;" + t;
						elt.appendChild(ts);
					});
				}
			}

			elt.onclick = function()
			{
				searchdialog.hidden = true;
				selectitem(elt.tag);
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
				selectitem(selected ? selected.tag : filter.value);
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
			child.className = "searchitem";
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

function setsaved()
{
	unsavedmark.hidden = true;
	saved = true;
	lastsaved = timestamp();
}

function save()
{
	return new Promise(function(resolve, reject)
	{
		clearTimeout(workerid);

		if (currentnote.title == "settings.json")
		{
			settings = JSON.parse(md.value);
			savesettings();
			loadsettings();
			setsaved();
			resolve();
		}
		else if (currentnote.title == "pgpkeys")
		{
			localStorage.setItem("pgpkeys", md.value);
			setsaved();
			resolve();
		}
		else if (!localdata)
		{
			showtemporaryinfo("cannot push empty data");
			reject();
		}
		else if (pending)
		{
			console.log("pending query: save cancelled");
			reject();
		}
		else if (saved)
		{
			console.log("nothing to save");
			reject();
		}
		else
		{
			var content = md.value;
			if ((content == "" && backup != "") || content == "null" || content == "undefined")
			{
				showtemporaryinfo("Invalid content '" + content + "', file '" + currentnote.title + "' not saved");
				reject();
			}
			else
			{
				currentnote.pos = md.selectionStart;
				currentnote.content = content;
				putontop();

				window.localStorage.setItem("data", JSON.stringify(localdata));

				if (settings.sync)
				{
					var datatosend = JSON.stringify(localdata);
					return encryptstring(datatosend)
					.then(encrypted =>
					{
						console.log("sending data to php server...");
						pending = true;
						return queryremote({action: "push", data: encrypted})
					})
					.then(() =>
					{
						console.log("...data saved on server");
						setsaved();
					})
					.catch(remotecallfailed)
					.finally(() =>
					{
						pending = false;
						if (content != md.value)
						{
							console.log("but content changed: will save again");
							return datachanged();
						}
						else if (!saved)
						{
							console.log("save failed. Data unsaved on server. Will retry.");
							return datachanged();
						}
						else
						{
							resolve();
						}
					});
				}
				else
				{
					setsaved();
					resolve();
				}
			}
		}
	});
}

function escapeHtml(unsafe) {
	return unsafe
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
 }

var languagekeywords = {
	"sql": ["select", "from", "where", "and", "or"],
	"js": ["var", "for", "if", "else"],
	"zsh": ["sudo"]
}

function currentline()
{
	return (md.value.substring(0, md.selectionStart).match(/\n/g) || []).length;
}

function lineatpos(pos)
{
	return (md.value.substring(0, pos).match(/\n/g) || []).length;
}

function currentcol()
{
	return md.selectionStart - Math.max(0, md.value.lastIndexOf("\n", md.selectionStart - 1)) - 1;
}

function rawline(index)
{
	return md.value.split("\n")[index];
}

var emptyline = "<br>";
function rawline2html(line, index, options)
{
	line = escapeHtml(line);

	// headings
	if (line.startsWith("#"))
	{
		line = line.replace(/(#* )/, "<span class='color-heading-mark'>$1</span>");
		line = "<span class='color-heading'>" + line + "</span>";
	}

	// bold and italics
	var temp = line;
	if (line.startsWith("* "))
	{
		temp = line.substring(2);
	}
	temp = temp.replace(/\*\*([^\*]*)\*\*/g, "<span class='color-bold'>&#42;&#42;$1&#42;&#42;</span>");
	temp = temp.replace(/\*([^\*]*)\*/g, "<span class='color-emphasis'>&#42;$1&#42;</span>");

	if (line.startsWith("* "))
	{
		line = "* " + temp;
	}
	else
	{
		line = temp;
	}

	// lists
	markerslist.forEach(marker =>
	{
		if (line.startsWith(marker) && marker.trim())
		{
			line = line.replace(marker, "<span class='color-list-marker'>" + marker + "</span>");
		}
	});

	// md header
	if (index == 0 && line == "---")
	{
		options.header = true;
	}
	if (options.header)
	{
		if (index > 0 && line == "---")
		{
			options.header = false;
		}
		line = line || emptyline;
		line = "<span class='color-header'>" + line + "</span>";
	}

	// code blocks
	if (line.startsWith("```") && !options.code)
	{
		options.code = true;
		options.language = line.substring(3);
		line = "<div class='color-code'>" + line.replace(new RegExp("(" + options.language + ")"), "<span class='color-code-language'>$1</span>") + "</div>";
	}
	else if (line == "```" && options.code)
	{
		options.code = false;
		options.language = "";
		line = "<div class='color-code'>" + line + "</div>";
	}
	else if (options.code)
	{
		var comment = false;
		if (line.match(/^\s*\/\//))
		{
			line = "<span class='color-code-comment'>" + line + "</span>";
			comment = true;
		}
		line = "<div class='color-code'>" + (line || emptyline) + "</div>";
		if (!comment && languagekeywords[options.language])
		{
			var keywords = languagekeywords[options.language];
			keywords.forEach(keyword =>
			{
				line = line.replace(new RegExp("\\b(" + keyword + ")\\b", "ig"), "<span class='color-code-keyword'>$1</span>");
			});
		}
	}

	// internal links
	line = line.replace(/\[\[(.*)\]\]/g, "[[<span class='color-link'>$1</span>]]");

	// comments
	line = line.replace(/&lt;\!--(.*)/g, "<span class='color-comment'>&lt;!--$1</span>");

	if (line.includes("&lt;!--") && !line.includes("--&gt;"))
	{
		options.comment = true;
	}
	else if (options.comment)
	{
		line = line || emptyline;
		line = "<span class='color-comment'>" + line
		if (line.includes("--&gt;"))
		{
			options.comment = false;
		}
		else
		{
			line += "</span>";
		}
	}

	line = line.replace(/\-\-&gt;/g, "--&gt;</span>");

	if (line.startsWith("// "))
	{
		line = "<span class='color-comment'>" + line + "</span>";
	}

	// autocomplete snippets
	if (index == currentline())
	{
		var raw = rawline(index);
		var pos = currentcol();
		var slashpos = raw.substring(0, pos).lastIndexOf("/");
		if (slashpos > -1)
		{
			var spacepos = raw.substring(0, pos).lastIndexOf(" ");
			if (slashpos > spacepos)
			{
				var snippetpart = raw.substring(slashpos);
				var matching = snippets
				.filter(s => s.command.startsWith(snippetpart))
				.map(s => s.command.substring(1));

				if (matching.length)
				{
					line += "<span class='color-autocomplete'>";
					line += matching.join().substr(pos - slashpos - 1);
					line += "</span>";
				}
			}
		}
	}

	// todo.txt
	if (currentistodo())
	{
		if (line.startsWith("x "))
		{
			line = "<span class='color-todo-complete'>" + line + "</span>";
		}
		else
		{
			line = line.replace(/(\(\w\))/g, "<span class='color-todo-priority'>$1</span>");
			line = line.replace(/(@\w*)/g, "<span class='color-todo-project'>$1</span>");
			line = line.replace(/(\s\+\w*)/g, "<span class='color-todo-context'>$1</span>");
		}
	}

	// inline code
	line = line.replace(/`(.*)`/, "<span class='color-code'>`$1`</span>");

	// links
	line = line.replace(/(http[^\s]*)/, "<span class='color-link'>$1</span>");

	return line;
}

function applycolors(currentonly)
{
	if (!settings.colors)
	{
		return;
	}

	var options =
	{
		header: false,
		code: false,
		comment: false,
		language: ""
	};

	var linediv = null;
	if (currentonly)
	{
		var index = currentline();
		linediv = document.getElementById("line" + index);
		options = JSON.parse(linediv.getAttribute("tag"));
		var line = rawline(index);
		line = rawline2html(line, index, options);
		linediv.innerHTML = line || emptyline;
	}
	else
	{
		console.log("redrawing all colored div");
		var lines = md.value.split("\n");
		var i = 0;
		for (; i < lines.length; i++)
		{
			linediv = document.getElementById("line" + i);
			if (!linediv)
			{
				linediv = document.createElement("div");
				colored.appendChild(linediv);
			}
			linediv.setAttribute("id", "line" + i);
			linediv.setAttribute("tag", JSON.stringify(options));
			linediv.innerHTML = rawline2html(lines[i], i, options) || emptyline;
		}

		// remove remanining
		linediv = document.getElementById("line" + (i++));
		while (linediv)
		{
			colored.removeChild(linediv);
			linediv = document.getElementById("line" + (i++));
		}
	}
}

function editorinput()
{
	// criteria to improve. Or redraw only after?
	var multiline = md.value.substring(md.selectionStart, md.selectionEnd).includes("\n");
	applycolors(!multiline && event.data && (event.inputType == "insertText" || event.inputType == "deleteContentBackward" || event.inputType == "deleteContentForward"));
	datachanged();
	resize();
}

function datachanged()
{
	saved = false;
	unsavedmark.hidden = !settings.sync;

	return postpone()
	.then(save);
}

function timestamp()
{
	var utc = new Date();
	var loc = new Date(utc - utc.getTimezoneOffset() * 60 * 1000);

	return loc.toISOString().replace("T", " ").replace(/\..*/, "").replace(/:/g, ".");
}

function quicknewnote()
{
	loadnote(timestamp());
	datachanged();
}

function startnewnote()
{
	var title = prompt("Note title: ", timestamp());
	if (title)
	{
		loadnote(title);
		datachanged();
	}
}

function showhelp()
{
	var help = ["# Notes"];
	help.push("## Shortcuts");

	commands
	.filter(command => Boolean(command.shortcut))
	.forEach(command => help.push(command.hint + ": " + command.shortcut.toLowerCase()));

	help.push("## Snippets");
	snippets.forEach(snippet =>
	{
		help.push(snippet.hint + ": " + snippet.command);
	});

	help.push("## Libs");
	help.push("[Showdown](https://showdownjs.com/)");
	help.push("[vis-network](https://visjs.org/)");
	help.push("[openpgpjs](https://openpgpjs.org/)");
	help.push("[jszip](https://stuk.github.io/jszip/)");
	help.push("[FileSaver](http://eligrey.com)");

	help.push("## Inspiration");
	help.push("[rwtxt](https://rwtxt.com)");
	help.push("[Offline Notepad](https://offlinenotepad.com/)");
	help.push("[Writemonkey3](http://writemonkey.com/wm3/)");
	help.push("[Sublime Text](https://www.sublimetext.com/)");
	help.push("[Notion](https://www.notion.so/)");
	help.push("[Calmly Writer](https://calmlywriter.com/)");
	help.push("[Cryptee](https://crypt.ee/)");

	help.push("##Sources");
	help.push("https://github.com/quenousimporte/notes");

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
	return searchinlist(
		localdata.map(n =>
		{
			return {
				text: n.title,
				suffix: gettags(n).map(t => tagmark + t)
			}
		}));
}

function searchautocomplete()
{
	selectnote().then(selected =>
	{
		insertautocomplete(selected.text || selected);
	});
}

function searchandloadnote()
{
	selectnote().then(selected =>
	{
		loadnote(selected.text || selected);
	});
}

function istodo(note)
{
	return note.title.includes("todo") || gettags(note).includes("todo");
}

function currentistodo()
{
	return istodo(currentnote);
}

function sorttodotxt(note)
{
	var hat = headerandtext(note);
	var olditems = hat.text.split("\n");
	var prio = [];
	var std = [];
	var done = [];
	olditems.forEach(item =>
	{
		if (item)
		{
			if (item.startsWith("("))
			{
				item = item.substring(4);
				var priority = String.fromCharCode(65 + prio.length);
				prio.push(`(${priority}) ${item}`);
			}
			else if (item.startsWith("x "))
			{
				done.push(item);
			}
			else
			{
				std.push(item);
			}
		}
	});

	prio = prio.sort((a,b) => a.localeCompare(b));
	done = done.sort((a,b) => a.localeCompare(b));
	var all = prio.concat(std).concat(done);
	note.content = hat.header + all.join("\n");
}

function sortcurrentastodo()
{
	if (currentistodo())
	{
		sorttodotxt(currentnote);
		seteditorcontent(currentnote.content);
	}
}

function searchandreplace()
{
	var oldvalue = prompt("Search:");
	if (!oldvalue)
	{
		return;
	}

	var newvalue = prompt("Replace by:");
	if (!newvalue)
	{
		return;
	}

	var doit = confirm(`Replace '${oldvalue}' by '${newvalue}'?`);
	if (!doit)
	{
		return;
	}

	seteditorcontent(md.value.replaceAll(oldvalue, newvalue));
}

function notesbysize()
{
	var sortedtitles = localdata.sort( (n1,n2) => { return n2.content.length - n1.content.length})
	.map(n => n.title + ": " + formatsize(n.content.length));

	searchinlist(sortedtitles)
	.then(titlewithsize =>
	{
		var title = titlewithsize.substring(0, titlewithsize.lastIndexOf(": "));
		loadnote(title);
	});
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

function restoredeleted()
{
	var trash = window.localStorage.getItem("trash");
	if (trash)
	{
		trash = JSON.parse(window.localStorage.getItem("trash"));
		searchinlist(trash.map(note => note.title + " - deleted on " + note.deletiondate))
		.then(item =>
		{
			if (confirm("Restore " + item + "?"))
			{
				var title = item.split(" - deleted on ").shift();
				var stamp = item.split(" - deleted on ").pop();
				var index = trash.findIndex(n => n.title == title && (!n.deletiondate || n.deletiondate == stamp));
				if (index > -1)
				{
					var notetorestore = trash.splice(index, 1).pop();
					notetorestore.title += " - restored on " + timestamp();
					delete notetorestore.deletiondate;
					localdata.unshift(notetorestore);
					loadnote(notetorestore.title);
					datachanged();
					window.localStorage.setItem("trash", JSON.stringify(trash));
				}
			}
		});
	}
}

function deletenote(note)
{
	var trash = JSON.parse(window.localStorage.getItem("trash") || "[]");
	note.deletiondate = timestamp();
	trash.push(note);
	window.localStorage.setItem("trash", JSON.stringify(trash));

	localdata = localdata.filter(n => n != note);

	renamereferences(note.title + " (deleted)");
	datachanged();
}

function deletecurrentnote()
{
	if (confirm('delete "' + currentnote.title + '"?'))
	{
		deletenote(currentnote);
		loadlast();
	}
}

function restore()
{
	if (confirm('restore "' + currentnote.title + '"?'))
	{
		seteditorcontent(backup);
	}
}

function insertheader()
{
	if (preview.hidden && !md.value.startsWith("---\n"))
	{
		var headers = defaultheaders();
		seteditorcontent(headers + md.value);
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

function shortcutmatches(event, shortcut)
{
	var s = splitshortcut(shortcut);
	return (event.key == s.key && !(s.ctrl && !event.ctrlKey && !event.altKey) && !(s.shift && !event.shiftKey) && !(s.alt && !event.altKey))
}

function executecommand(command)
{
	if (!command.allowunsaved && !saved)
	{
		showtemporaryinfo("Cannot perform '" + command.hint + "' because current note is not saved.");
	}
	else if (command.remoteonly && !settings.sync)
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
	else if (settings.uselinkpopup && typeof linkdialog != "undefined")
	{
		removelinkdialog();
	}
	else if (currentnote.title == "Help" || currentnote.title == "Search result")
	{
		loadlast();
	}
	else if (networkpage.hidden == false)
	{
		networkpage.hidden = true;
		toggleeditor(false);
	}
	else if (preview.hidden == false)
	{
		togglepreview();
	}
	else
	{
		commandpalette();
	}
}

function boldify()
{
	var pos = currentrange();
	var newcontent;
	var offset = 2;
	if (md.value.substr(pos.start - 2, 2) == "**" && md.value.substr(pos.end, 2) == "**")
	{
		newcontent = md.value.substr(0, pos.start - 2) + md.value.substr(pos.start, pos.end - pos.start) + md.value.substr(pos.end + 2);
		offset = -2;
	}
	else
	{
		newcontent = md.value.substr(0, pos.start) + "**" + md.value.substr(pos.start, pos.end - pos.start) + "**" + md.value.substr(pos.end);
	}

	seteditorcontent(newcontent);
	md.setSelectionRange(pos.start + offset, pos.end + offset);
}

function snippetautocomplete()
{
	var tocursor = md.value.substr(0, md.selectionStart)
	var slashindex = tocursor.lastIndexOf("/");
	if (slashindex > tocursor.lastIndexOf(" ") && slashindex > tocursor.lastIndexOf("\n"))
	{
		var commandbegin = tocursor.substr(slashindex);
		var snippet = snippets.find(s => s.command.startsWith(commandbegin));
		if (snippet)
		{
			insert(snippet.insert, snippet.cursor, commandbegin.length);
			return true;
		}
	}
	return false;
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
	else if (event.ctrlKey && event.key == " " || event.key == "F1")
	{
		commandpalette();
		event.preventDefault();
	}
	else if (event.ctrlKey && event.key == "b" && md.selectionStart < md.selectionEnd)
	{
		boldify();
		event.preventDefault();
	}
	else if (event.ctrlKey && event.shiftKey && (event.keyCode == "40" || event.keyCode == "38"))
	{
		var pos = currentrange();
		var direction = event.keyCode == "40" ? 1 : -1;
		var start = lineatpos(md.selectionStart);
		var end = lineatpos(md.selectionEnd);
		var lines = md.value.split("\n");
		if (direction > 0 && end < lines.length || direction < 0 && start > 0)
		{
			var block = lines.splice(start, end - start + 1);
			lines.splice(start + direction, 0, ...block);
			seteditorcontent(lines.join("\n"));
			var posshift = direction > 0 ? lines[start].length + 1 :  - 1 - lines[end].length;
			md.setSelectionRange(pos.start + posshift, pos.end + posshift);

		}
		event.preventDefault();
	}
	else if (event.ctrlKey || event.altKey)
	{
		// notes shortcuts
		var note = localdata.find(n =>
		{
			var shortcut = n.content.match(/shortcut: (.*)/);
			if (shortcut && shortcutmatches(event, shortcut[1]))
			{
				console.log("Loading note '" + n.title + "' from header shortcut " + shortcut[1]);
				event.preventDefault();
				loadnote(n.title);
				return true;
			}
			return false;
		});

		// commands shortcuts
		if (!note)
		{
			commands.filter(c => c.shortcut)
			.every(command =>
			{
				if (shortcutmatches(event, command.shortcut))
				{
					event.preventDefault();
					executecommand(command);
					return false;
				}
				return true;
			});
		}
	}
}

function setwindowtitle()
{
	document.title = currentnote.title;
}

function ontitlechange()
{
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

	if (!settings.titlebydefault)
	{
		toggletitle();
	}
}

function simplifystring(str)
{
	return str.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, "");
}

function applyfilter()
{
	[...filteredlist.children].forEach(div =>
	{
		div.hidden = simplifystring(div.textContent).indexOf(simplifystring(filter.value)) < 0;
	});

	fileindex = 0;
	applyfileindex();
}

function backspace(nb)
{
	var pos = getpos();
	var c = md.value;
	seteditorcontent(c.substring(0, pos - nb) + c.substring(pos));
	setpos(pos - nb);
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
				insert("\n" + marker.replace("[x]", "[ ]"));
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
		if (!snippetautocomplete())
		{
			var init = currentrange();
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
			seteditorcontent(md.value.substring(0, range.start)
				+ newtext
				+ md.value.substring(range.end));

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
	preview.innerHTML = md2html(md.value);
	toggleeditor(!md.hidden);
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
		content: md.value
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
		toggleeditor(!md.hidden);
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

	seteditorcontent(note.content || "", true);

	if (changed)
	{
		md.style.height = "0px";
	}
	resize();

	setpos(note.pos || 0);

	if (!issplit() && searchdialog.hidden)
	{
		// force to scroll to cursor pos
		md.blur();
		md.focus();
	}
}

function defaultheaders(tags = "")
{
	return [
		"---",
		"date: " + timestamp().substr(0,10),
		"tags: " + (tags || ""),
		"---",
		"",""].join("\n");
}

function loadnote(name)
{
	var note = getorcreate(name, defaultheaders());

	if (gettags(note).includes("journal"))
	{
		// remove empty entries
		note.content = note.content.replace(/\d{4}-\d{2}-\d{2}\n*(\d{4}-\d{2}-\d{2})/g, "$1");

		// create new entry for today
		var hat = headerandtext(note);
		var today = timestamp().substr(0,10);
		if (!hat.text.startsWith(today) && !hat.text.startsWith("\n" + today))
		{
			note.content = hat.header + "\n" + today + "\n\n" + hat.text;
			note.pos = hat.header.length + 12;
		}
	}

	if (settings.autosorttodo && istodo(note))
	{
		sorttodotxt(note);
	}

	bindfile(note);

	stat.cur.q = 0;
	stat.cur.d = 0;
	stat.cur.t = timestamp();

	if (!preview.hidden || (preview.hidden && (gettags(note).indexOf("preview") !== -1)))
	{
		togglepreview();
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
