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
var filter = "";
var intervalid = null;
var notes = null;
var currentnote = null;

function timestamp()
{
	var utc = new Date();
	var loc = new Date(utc - utc.getTimezoneOffset() * 60 * 1000);

	return loc.toISOString().replace("T", " ").replace(/\..*/, "").replace(/:/g, ".");
}

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

async function saveifneeded()
{
	var newcontent = fs.readFileSync("note.md", { encoding: "utf8", flag: "r" });
	if (currentnote.content != newcontent)
	{
		currentnote.content = newcontent;

		notes.splice(notes.indexOf(currentnote), 1);
		notes.unshift(currentnote);

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
			console.log("...done.");
		});
	}
	else
	{
		console.log("no change.");
	}
}

function editnote(index)
{
	currentnote = filteredlist()[index];
	if (currentnote)
	{
		// todo: use title instead? To put in data folder?
		fs.writeFileSync("note.md", currentnote.content);

		cp.exec(`${settings.command} note.md`, async function (err, stdout, stderr)
		{
			clearInterval(intervalid);
			saveifneeded();
		});
		intervalid = setInterval(saveifneeded, 10000);
	}
	else
	{
		console.log("No note found.");
	}
}

// Run part
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

	if (process.argv.length > 2 && process.argv[2] === "new")
	{
		var title = timestamp();
		currentnote = {
			title: title,
			content: ""
		}
		notes.unshift(currentnote);
		console.log("Creating new note: " + title);
		editnote(0);
	}
	else
	{
		if (process.argv.length > 2)
		{
			filter = process.argv[2];
		}

		var matchcount = filteredlist().length;
		if (matchcount == 1)
		{
			editnote(0);
		}
		else if (matchcount > 1)
		{
			console.log("Select a note or type 'q' to quit:");
			filteredlist()
			.every( (note, i) =>
			{
				console.log(`[${i}] ${note.title}`)
				return Boolean(filter) || i < settings.maxcountifnofilter;
			});
			rl.prompt();
			rl.on("line", async function (line)
			{
				if (line == "q")
				{
					rl.close();
				}
				else
				{
					editnote(line);
				}
			});
		}
	}
});
