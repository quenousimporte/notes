function timestamp()
{
	var utc = new Date();
	var loc = new Date(utc - utc.getTimezoneOffset() * 60 * 1000);

	return loc.toISOString().replace("T", " ").replace(/\..*/, "").replace(/:/g, ".");
}

function editnote()
{
	var file = std.open("data/note.md", "w");
	file.puts(currentnote.content);
	file.close();

	os.exec(["cp", "data/note.md", "data/backup.md"]);

	os.exec(settings.editor.concat("data/note.md"));

	var newcontent = std.loadFile("data/note.md");
	if (currentnote.content != newcontent)
	{
		os.exec(["diff", "--color", "data/backup.md", "data/note.md"]);
		currentnote.content = newcontent;

		notes.splice(notes.indexOf(currentnote), 1);
		notes.unshift(currentnote);

		file = std.open("data/data2.json", "w");
		file.puts(JSON.stringify(notes));
		file.close();

		os.exec([settings.gpg, "--encrypt", "--yes", "--trust-model", "always", "--output", "data/data2.acs", "--armor", "-r", settings.gpguser, "data/data2.json"]);
		var newdata = std.loadFile("data/data2.acs");
		console.log("sending data file to server...");

		var postdata = "action=push&password=" + settings.password + "&data=" + encodeURIComponent(newdata);
		file = std.open("data/postdata", "w");
		file.puts(postdata);
		file.close();

		os.exec(["curl", "-X", "POST",
			"-d", "@data/postdata",
			settings.url + "/handler.php"]);

		console.log("...done.");
	}
	else
	{
		console.log("no change.");
	}
}

// Init
var settings = JSON.parse(std.loadFile("settings.json"));
var command = scriptArgs.length <= 1 ? "list" : scriptArgs[1];
var currentnote = null;

// Run part
if (command == "help" || command == "-h" || command == "--help")
{
	var appcmd = "./qjs q.js";
	print(`list notes: ${appcmd} [list]`);
	print(`edit a note: ${appcmd} [open|edit] <title|index>`);
	print(`create a note: ${appcmd} new|create|add [<title>]`);
	print(`display help: ${appcmd} help|-h|--help`);
}
else
{
	os.exec(["curl", "-X", "POST", "-F", "action=fetch", "-F", "password=" + settings.password, "-o", "data/data.acs", settings.url + "/handler.php"]);
	os.exec([settings.gpg, "--yes", "--output", "data/data.json", "--decrypt", "data/data.acs"]);
	var notes = JSON.parse(std.loadFile("data/data.json"));

	switch (command)
	{
		case "new":
		case "create":
		case "add":
			var title = timestamp();
			if (scriptArgs.length > 2)
			{
				title = scriptArgs[2];
			}
			if (notes.find(n => n.title == title))
			{
				console.log(`${title}: already exists`);
			}
			else
			{
				currentnote = {
					title: title,
					content: ""
				}
				notes.unshift(currentnote);
				console.log(`Creating new note: ${title}`);
				editnote();
			}
			break;

		case "list":
			for (var i = notes.length - 1; i >= 0; i--)
			{
				console.log(`[${i}] ${notes[i].title}`);
			}
			break;

		default:
			var arg = command;
			if (arg === "open" || arg === "edit")
			{
				arg = scriptArgs[2];
			}
			if (isNaN(parseInt(arg)))
			{
				currentnote = notes.find(n => n.title == arg);
			}
			else
			{
				currentnote = notes[parseInt(arg)];
			}
			if (currentnote)
			{
				console.log(`Editing ${currentnote.title}`);
				editnote();
			}
			else
			{
				console.log(`Note ${arg} not found`);
			}
			break;
	}
}
