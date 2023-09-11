const axios = require("axios");
const fs = require("fs");
const openpgp = require("openpgp");
var cp = require("child_process");

var settings = JSON.parse(fs.readFileSync("settings.json", { encoding: "utf8", flag: "r" }));
var pgpkey = fs.readFileSync("key.acs", { encoding: "utf8", flag: "r" });
var intervalid = null;
var notes = null;
var currentnote = null;
var command = null;

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

function decrypt(str)
{
	var keystring = pgpkey.split("-----END PGP PUBLIC KEY BLOCK-----")[1];
	var key = null;

	return openpgp.readKey({ armoredKey: keystring })
	.then(privateKey =>
	{
		key = privateKey;
		return openpgp.readMessage({ armoredMessage: str });
	})
	.then(message =>
	{
		return openpgp.decrypt({
		message: message,
		decryptionKeys: key })
	})
	.then(decrypted =>
	{
		var chunks = [];
		for (const chunk of decrypted.data) {
	        chunks.push(chunk);
	    }
	    return chunks.join('');
	});
}

function encrypt(str)
{
	var keystring = pgpkey.split("-----BEGIN PGP PRIVATE KEY BLOCK-----")[0];
	var key = null;
	return openpgp.readKey({ armoredKey: keystring })
	.then(publicKey =>
	{
		key = publicKey;
		return openpgp.createMessage({ text: str });
	})
	.then(message =>
	{
		return openpgp.encrypt({
			message: message,
			encryptionKeys: key });
	})
}

function saveifneeded()
{
	var newcontent = fs.readFileSync("note.md", { encoding: "utf8", flag: "r" });
	if (currentnote.content != newcontent)
	{
		currentnote.content = newcontent;

		notes.splice(notes.indexOf(currentnote), 1);
		notes.unshift(currentnote);

		console.log("sending data file to server...");
		encrypt(JSON.stringify(notes))
		.then(encrypted =>
		{
			return axios.post(`${settings.url}/handler.php`,
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
			});
		})
		.then(res => {
			console.log("...done.");
		});
	}
	else if (!intervalid)
	{
		console.log("no change.");
	}
}

function editnote()
{
	fs.writeFileSync("note.md", currentnote.content);
	cp.exec(`${settings.command} note.md`,
	function (err, stdout, stderr)
	{
		clearInterval(intervalid);
		intervalid = null;
		saveifneeded();
	});
	intervalid = setInterval(saveifneeded, 10000);
}

// Run part
if (process.argv.length <= 2)
{
	command = "list";
}
else
{
	command = process.argv[2];
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
.then(function(res)
{
	return decrypt(res.data);
})
.then(json =>
{
	notes = JSON.parse(json);
	switch (command)
	{
		case "help":
		case "-h":
		case "--help":
			var appcmd = "notes";
			console.log(`list notes: ${appcmd} [list]`);
			console.log(`edit a note: ${appcmd} [open|edit] <title|index>`);
			console.log(`create a note: ${appcmd} new|create|add [<title>]`);
			console.log(`display help: ${appcmd} help|-h|--help`);
			break;

		case "new":
		case "create":
		case "add":
			var title = timestamp();
			if (process.argv.length > 3)
			{
				title = process.argv[3];
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
				arg = process.argv[3];
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
});
