const axios = require("axios");
const readline = require("readline");
const fs = require("fs");
var cp = require("child_process");

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

var settings = JSON.parse(fs.readFileSync("settings.json", { encoding: "utf8", flag: "r" }));

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
	notes.every( (note, i) =>
	{
		console.log(`[${i}] ${note.title}`)
		return i < settings.maxcount;
	});

	rl.prompt();
	rl.on("line", (line) =>
	{
		var note = notes[line]

		fs.writeFileSync("note.md", note.content);

		cp.exec("sublime_text.exe -w note.md", function (err, stdout, stderr)
		{
			var newcontent = fs.readFileSync("note.md", { encoding: "utf8", flag: "r" });

			if (note.content != newcontent)
			{
				note.content = newcontent;
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
