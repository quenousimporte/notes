import io
import json
import subprocess
import urllib.parse
import os
import sys
import time

abspath = os.path.abspath(__file__)
dname = os.path.dirname(abspath)
os.chdir(dname)

def listnotes(filter = ""):
	cnt = 0
	for i in reversed(range(len(data))):
		if filter in data[i]["title"]:
			print("[" + str(i) + "]", data[i]["title"])
			cnt += 1
	return cnt

def readtextfile(path):
	with io.open(path, mode = "r", encoding = "utf-8") as f:
		return f.read()

def writetextfile(path, content):
	with io.open(path, mode = "w", encoding = "utf-8") as f:
		f.write(content)

def editnote(note):
	content = note["content"]

	writetextfile("data/backupnote.md", content)
	writetextfile("data/note.md", content)

	subprocess.call(settings["commands"]["editor"] + ["data/note.md"])
	newcontent = readtextfile("data/note.md")

	if newcontent != content:

		subprocess.call(settings["commands"]["diff"] + ["data/backupnote.md", "data/note.md"])

		note["content"] = newcontent
		data.remove(note)
		data.insert(0, note)

		if settings["mode"] == "remote":
			writetextfile("data/data.json", json.dumps(data))
			subprocess.call([settings["commands"]["gpg"], "-q", "--encrypt", "--yes", "--trust-model", "always", "--output", "data/data.acs", "--armor", "-r", settings["gpguser"], "data/data.json"]);
			newdata = readtextfile("data/data.acs")
			postdata = "action=push&password=" + settings["password"] + "&data=" + urllib.parse.quote_plus(newdata)
			writetextfile("data/postdata", postdata)
			subprocess.call(["curl", "-s", "-X", "POST", "-d", "@data/postdata", settings["url"] + "/handler.php"])
		else:
			writetextfile("data/local.json", json.dumps(data))
	else:
		print("no change")

settings = json.loads(readtextfile("settings.json"))

if os.path.isfile("data/backupdata.acs"):
	os.remove("data/backupdata.acs")

if settings["mode"] == "remote":
	subprocess.call(["curl", "-s", "-X", "POST", "-F", "action=fetch", "-F", "password=" + settings["password"], "-o", "data/backupdata.acs", settings["url"] + "/handler.php"])
	subprocess.call([settings["commands"]["gpg"], "-q", "--yes", "--output", "data/backupdata.json", "--decrypt", "data/backupdata.acs"])
	data = json.loads(readtextfile("data/backupdata.json"))
else:
	data = json.loads(readtextfile("data/local.json"))

command = ""
if len(sys.argv) > 1:
	command = sys.argv[1]
	if command.startswith("notes://"):
		command = urllib.parse.unquote(command[8:-1])

while not (command == "quit" or command == "exit" or command == "q"):

	try:
		index = int(command)
		note = data[index]
	except:
		note = next((note for note in data if note["title"] == command), None)

	if note:
		editnote(note)
	else:
		cnt = listnotes(command)

	if cnt == 0:
		answer = input("create '" + command + "'? ")
		if answer == "y" or answer == "yes":
			note = {
				"title": command,
				"content": "---\ntitle: " + command + "\ndate: " + time.strftime("%Y-%m-%d") + "\ntags: \n---\n\n"
			}
			data.insert(0, note)
			editnote(note)

	command = input("> ")
