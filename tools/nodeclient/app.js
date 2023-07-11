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
	var notes = res.data;

	notes
	.filter(n => n.title.includes(filter))
	.every( (note, i) =>
	{
		console.log(`[${i}] ${note.title}`)
		return i < settings.maxcount;
	});

	rl.prompt();
	rl.on("line", (line) =>
	{
		var note = notes.filter(n => n.title.includes(filter))[line];

		fs.writeFileSync("note.md", note.content);

		cp.exec("sublime_text.exe -w note.md", function (err, stdout, stderr)
		{
			var newcontent = fs.readFileSync("note.md", { encoding: "utf8", flag: "r" });

			if (note.content != newcontent)
			{
				note.content = newcontent;

				notes.splice(notes.indexOf(note), 1);
				notes.unshift(note);

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
				});
			}
		})
		rl.close();
	});
});
