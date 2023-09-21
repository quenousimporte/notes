# notes

## Getting started

Launch index.html from your web server or try https://notes.ouvaton.org.

Your notes are stored in your browser local storage.

## Remote mode

You can use remote mode with your own php server to access your notes from the cloud.

* put the source files on your php server
* browse index.html
* launch command "edit pgp keys" and paste your public and private keys as a single file (passphrase is not supported)
* switch to remote mode: ctrl+shift+V

Your data file will never reach the server unencrypted.

To protect your data file access by a password, edit settings.php and change `$password` variable.

Your password will be sent from browser to server through a post http query with no more encryption than ssl, if enabled. Password is stored unencrypted in your browser local storage and in the settings.php file on server side.

## Usage

* help: f1
* notes list: ctrl+p
* command palette: ctrl+shift+p

## Cli tool

```
cd cli
python3 app.py
```

Requires python3, curl, gpg and a text editor.

## reclaim your data

Download your notes in a single json file with ctrl+shift+S.

Dowload a zip file of your notes as markdown files with command "Download all notes in a zip file"