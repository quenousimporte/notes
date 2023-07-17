# notes

## getting started

launch index.html from your web server or local computer, or try https://notes.ouvaton.org.

your notes are stored in your browser local storage.

## remote mode 

you can use remote mode with your own php server to access your notes from the cloud.

* put the source files on your php server
* browse index.html
* launch command "edit pgp keys" and paste your public and private keys as a single file (passphrase is not supported)
* switch to remote mode: ctrl+shift+V

your data file will always be pgp encrypted and will never reach the server unencrypted.

to protect your data file access by a password, edit settings.php and change `$password` variable.

your password will be sent from browser to server through a post http query with no more encryption than ssl, if enabled. password is stored unencrypted in your browser local storage and in the settings.php file on server side.

## usage

* help: f1
* notes list: ctrl+p
* command palette: ctrl+shift+p

## reclaim your data

download your notes in a single json file with ctrl+shift+s.

then you can write a moulinette to flatten them as md files.
