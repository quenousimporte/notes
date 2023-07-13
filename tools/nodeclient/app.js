const axios = require("axios");
const readline = require("readline");
const fs = require("fs");
var cp = require("child_process");

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

var settings = JSON.parse(fs.readFileSync("settings.json", { encoding: "utf8", flag: "r" }));
var filter = process.argv.length > 2 ? process.argv[2] : "";
var intervalid = null;
var notes = null;

function filteredlist()
{
	return notes
	.filter(n => n.title.toLowerCase().includes(filter.toLowerCase()));
}

axios.post(`${settings.url}/handler.php`,
{
	action: "fetch",
	password: settings.password
},
{
	headers:
	{
		"Content-type": "application/x-www-form-urlencoded"
	}
})
.then(res =>
{
	notes = res.data;

	filteredlist()
	.every( (note, i) =>
	{
		console.log(`[${i}] ${note.title}`)
		return i < settings.maxcount;
	});

	// todo: open if only one match. quit if no match
	rl.prompt();
	rl.on("line", (line) =>
	{
		var note = filteredlist()[line];

		// todo: use title instead? To put in data folder?
		fs.writeFileSync("note.md", note.content);

		cp.exec(`${settings.command} note.md`, function (err, stdout, stderr)
		{
			clearInterval(intervalid);
			var newcontent = fs.readFileSync("note.md", { encoding: "utf8", flag: "r" });
			if (note.content != newcontent)
			{
				note.content = newcontent;

				notes.splice(notes.indexOf(note), 1);
				notes.unshift(note);

				console.log("sending data file to server...");
				axios.post(`${settings.url}/handler.php`,
				{
					action: "push",
					password: settings.password,
					data: JSON.stringify(notes)
				},
				{
					headers:
					{
						"Content-type": "application/x-www-form-urlencoded"
					}
				}).then(res => {
					console.log("done.");
				});
			}
			else
			{
				console.log("no change.");
			}
		})

		intervalid = setInterval(function()
			{
				//todo: refactor "save"
				var newcontent = fs.readFileSync("note.md", { encoding: "utf8", flag: "r" });
				if (note.content != newcontent)
				{
					note.content = newcontent;

					notes.splice(notes.indexOf(note), 1);
					notes.unshift(note);

					console.log("sending data file to server...");
					axios.post(`${settings.url}/handler.php`,
					{
						action: "push",
						password: settings.password,
						data: JSON.stringify(notes)
					},
					{
						headers:
						{
							"Content-type": "application/x-www-form-urlencoded"
						}
					}).then(res => {
						console.log("done.");
					});
				}
			}, 10000);

		rl.close();
	});
});
