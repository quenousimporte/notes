import io
import json
import subprocess
import urllib.parse
import os
import sys
import time
import re
import shutil

def filename(note):
	return re.sub(r'[\?\"<>|\*:\/\\]', '_', note["title"]) + ".md"

def listnotes(filter = "", checkcontent = False):
	matching = []
	for i in reversed(range(len(data))):

		if filter.lower() in data[i]["title"].lower():
			print("[" + str(i) + "]", data[i]["title"])
			matching.append(data[i])

		elif checkcontent and filter.lower() in data[i]["content"].lower():
			print("[" + str(i) + "]", data[i]["title"])
			lines = data[i]["content"].split("\n")
			for j in range(len(lines)):
				line = lines[j]
				if filter.lower() in line.lower():
					index = line.lower().index(filter.lower())
					print("\t" + str(j) + ":", line[:100])
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

	backupfilepath = "session/" + filename(note) + str(time.time())
	writetextfile(backupfilepath, content)
	writetextfile("session/" + filename(note), content)

	subprocess.call(settings["commands"]["editor"] + ["session/" + filename(note)])
	newcontent = readtextfile("session/" + filename(note) )

	if newcontent != content:
		subprocess.call(settings["commands"]["diff"] + [backupfilepath, "session/" + filename(note)])
		note["content"] = newcontent
		data.remove(note)
		data.insert(0, note)
		savedata()

	else:
		print("no change")

def savedata():
	if settings["mode"] == "remote":
		writetextfile("session/data.json", json.dumps(data))
		subprocess.call([settings["commands"]["gpg"], "-q", "--encrypt", "--yes", "--trust-model", "always", "--output", "session/data.acs", "--armor", "-r", settings["gpguser"], "session/data.json"]);
		newdata = readtextfile("session/data.acs")
		postdata = "action=push&password=" + settings["password"] + "&data=" + urllib.parse.quote_plus(newdata)
		writetextfile("session/postdata", postdata)
		output = subprocess.check_output(["curl", "-X", "POST", "-d", "@session/postdata", settings["url"] + "/handler.php"]).decode("utf-8")
		print("curl output: " + output)
		if output != '{"result": "ok"}':
			if ask("Save failed. Try again?"):
				savedata()
	else:
		writetextfile("session/local.json", json.dumps(data))

def loaddata():
	if settings["mode"] == "remote":

		subprocess.call(["curl", "-X", "POST", "-F", "action=fetch", "-F", "password=" + settings["password"], "-o", "session/data.acs", settings["url"] + "/handler.php"])
		subprocess.call([settings["commands"]["gpg"], "-q", "--yes", "--output", "session/data.json", "--decrypt", "session/data.acs"])

		return json.loads(readtextfile("session/data.json"))

	else:
		return json.loads(readtextfile("session/local.json"))

def ask(question):
	answer = input(question + " [Y/n] ")
	return answer == "y" or answer == "yes" or answer == ""

def initdatapath():
	if not os.path.exists("history"):
	  os.mkdir("history")
	if  os.path.exists("session"):
		shutil.make_archive("history/session" + str(time.time()), "zip", "session")
		shutil.rmtree("session")
	os.mkdir("session")

abspath = os.path.abspath(__file__)
dname = os.path.dirname(abspath)
os.chdir(dname)

initdatapath()
settings = json.loads(readtextfile("settings.json"))
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
	elif command[0:1] == "/":
		action = "grep"
		command = command[1:]
	elif command[0:4] == "sms ":
		action = "sms"
		command = command[4:]
	elif command[0:7] == "export ":
		action = "export"
		command = command[7:]
	elif command == "settings":
		action = "settings"

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
	elif action == "sms":
		if note and ask("send '" + note["title"] + "' by sms? "):
			subprocess.call(["curl", "-s", "-X", "POST", "-F", "action=sms", "-F", "password=" + settings["password"], "-F", "data=" + urllib.parse.quote_plus(note["content"]), settings["url"] + "/handler.php"])
	elif action == "export":
		if note:
			writetextfile("session/" + note["title"] + ".md", note["content"])
	elif action == "settings":
		subprocess.call(settings["commands"]["editor"] + ["settings.json"])
		settings = json.loads(readtextfile("settings.json"))
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
			note = matching.pop()
			if ask("open '" + note["title"] + "'?"):
				editnote(note)

	command = input("> ")
