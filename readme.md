# notes

## Getting started

Launch index.html from your web server or try https://notes.ouvaton.org.

Your notes are stored in your browser local storage.

## Usage

* command palette: ctrl+shift+p
* notes list: ctrl+p

## Sync feature

To sync your notes in the cloud:

* put the source files on your php server
* browse index.html
* paste your public and private PGP keys as a single file (passphrase is not supported)
* refresh the page

Your data is always encrypted before reaching the server.

To protect your data file access by a password, edit settings.php and change `$password` variable. The password is sent from browser to server through a post http query, encrypted with ssl if enabled. It is stored unencrypted in your browser local storage and in the settings.php file on server side.

## Cli tool

```
cd cli
python3 app.py
```

Requires python3, curl, gnupg and a text editor.

## Export your data

You can download your notes in a single json data file, or as flat markdown files in a zip archive.
