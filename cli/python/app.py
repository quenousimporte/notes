import io
import json
import subprocess
import urllib.parse
import os
import sys
import time

def listnotes(filter = "", grep = False):
	matching = []
	for i in reversed(range(len(data))):
		if filter.lower() in data[i]["title"].lower():
			print("[" + str(i) + "]", data[i]["title"])
			matching.append(data[i])
		elif grep and filter.lower() in data[i]["content"].lower():
			print("[" + str(i) + "]", data[i]["title"])
			for line in data[i]["content"].split("\n"):
				if filter.lower() in line.lower():
					index = line.lower().index(filter.lower())
					print("\t", line[index:index+30])
			matching.append(data[i])
	return matching

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
		savedata()

	else:
		print("no change")

def savedata():
	if settings["mode"] == "remote":
		writetextfile("data/data.json", json.dumps(data))
		subprocess.call([settings["commands"]["gpg"], "-q", "--encrypt", "--yes", "--trust-model", "always", "--output", "data/data.acs", "--armor", "-r", settings["gpguser"], "data/data.json"]);
		newdata = readtextfile("data/data.acs")
		postdata = "action=push&password=" + settings["password"] + "&data=" + urllib.parse.quote_plus(newdata)
		writetextfile("data/postdata", postdata)
		subprocess.call(["curl", "-s", "-X", "POST", "-d", "@data/postdata", settings["url"] + "/handler.php"])
	else:
		writetextfile("data/local.json", json.dumps(data))

def loaddata():
	if settings["mode"] == "remote":
		subprocess.call(["curl", "-s", "-X", "POST", "-F", "action=fetch", "-F", "password=" + settings["password"], "-o", "data/backupdata.acs", settings["url"] + "/handler.php"])
		subprocess.call([settings["commands"]["gpg"], "-q", "--yes", "--output", "data/backupdata.json", "--decrypt", "data/backupdata.acs"])
		return json.loads(readtextfile("data/backupdata.json"))
	else:
		return json.loads(readtextfile("data/local.json"))

def ask(question):
	answer = input(question)
	return answer == "y" or answer == "yes"

abspath = os.path.abspath(__file__)
dname = os.path.dirname(abspath)
os.chdir(dname)
settings = json.loads(readtextfile("settings.json"))

if os.path.isfile("data/backupdata.acs"):
	os.remove("data/backupdata.acs")

data = loaddata()

command = ""
if len(sys.argv) > 1:
	command = sys.argv[1]
	if command.startswith("notes://"):
		command = urllib.parse.unquote(command[8:-1])

while not (command == "quit" or command == "exit" or command == "q"):

	action = None
	if command[0:3] == "rm ":
		action = "delete"
		command = command[3:]
	elif command[0:3] == "mv ":
		action = "rename"
		command = command[3:]
	elif command[0:5] == "grep ":
		action = "grep"
		command = command[5:]

	try:
		index = int(command)
		note = data[index]
	except:
		note = next((note for note in data if note["title"] == command), None)

	if action == "delete":
		if note and ask("delete '" + note["title"] + "'? "):
			data.remove(note)
			savedata()
	elif action == "rename":
		if note:
			newname = input("new name: ")
			if newname:
				note["title"] = newname
				savedata()
	elif note and not action == "grep":
		editnote(note)
	else:
		matching = listnotes(command, action == "grep")
		if len(matching) == 0 and not action == "grep":
			if ask("create '" + command + "'? "):
				note = {
					"title": command,
					"content": "---\ntitle: " + command + "\ndate: " + time.strftime("%Y-%m-%d") + "\ntags: \n---\n\n"
				}
				data.insert(0, note)
				editnote(note)
		elif len(matching) == 1:
			editnote(matching.pop())

	command = input("> ")
