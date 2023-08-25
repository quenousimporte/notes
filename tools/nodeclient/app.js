const axios = require("axios");
const readline = require("readline");
const fs = require("fs");
const openpgp = require("openpgp");
var cp = require("child_process");

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

var settings = JSON.parse(fs.readFileSync("settings.json", { encoding: "utf8", flag: "r" }));
var pgpkey = fs.readFileSync("key.acs", { encoding: "utf8", flag: "r" });
var filter = process.argv.length > 2 ? process.argv[2] : "";
var intervalid = null;
var notes = null;

function simplifystring(str)
{
	return str.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, "");
}

async function decrypt(str)
{
	var key = pgpkey.split("-----END PGP PUBLIC KEY BLOCK-----")[1];
	var privateKey = await openpgp.readKey({ armoredKey: key });
	var decrypted = await openpgp.decrypt({
		message: await openpgp.readMessage({ armoredMessage: str }),
		decryptionKeys: privateKey });
    const chunks = [];
    for await (const chunk of decrypted.data) {
        chunks.push(chunk);
    }
    return chunks.join('');
}

async function encrypt(str)
{
	var key = pgpkey.split("-----BEGIN PGP PRIVATE KEY BLOCK-----")[0];
	var publicKey = await openpgp.readKey({ armoredKey: key });
	return await openpgp.encrypt({
		message: await openpgp.createMessage({ text: str }),
		encryptionKeys: publicKey });
}

function filteredlist()
{
	return notes
	.filter(n => simplifystring(n.title).includes(simplifystring(filter)));
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
.then(async function(res)
{
	notes = JSON.parse(await decrypt(res.data));

	filteredlist()
	.every( (note, i) =>
	{
		console.log(`[${i}] ${note.title}`)
		return Boolean(filter) || i < settings.maxcountifnofilter;
	});

	// todo: open if only one match. quit if no match
	rl.prompt();
	rl.on("line", async function (line)
	{
		var note = filteredlist()[line];

		// todo: use title instead? To put in data folder?
		fs.writeFileSync("note.md", note.content);

		cp.exec(`${settings.command} note.md`, async function (err, stdout, stderr)
		{
			clearInterval(intervalid);
			var newcontent = fs.readFileSync("note.md", { encoding: "utf8", flag: "r" });
			if (note.content != newcontent)
			{
				note.content = newcontent;

				notes.splice(notes.indexOf(note), 1);
				notes.unshift(note);

				console.log("sending data file to server...");
				var encrypted = await encrypt(JSON.stringify(notes));
				axios.post(`${settings.url}/handler.php`,
				{
					action: "push",
					password: settings.password,
					data: encrypted
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

		intervalid = setInterval(async function()
			{
				//todo: refactor "save"
				var newcontent = fs.readFileSync("note.md", { encoding: "utf8", flag: "r" });
				if (note.content != newcontent)
				{
					note.content = newcontent;

					notes.splice(notes.indexOf(note), 1);
					notes.unshift(note);

					console.log("sending data file to server...");
					var encrypted = await encrypt(JSON.stringify(notes));
					axios.post(`${settings.url}/handler.php`,
					{
						action: "push",
						password: settings.password,
						data: encrypted
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
