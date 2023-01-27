# notes

## getting started

navigate to index.html from your own web server or local computer, or try https://notes.ouvaton.org.

your notes are stored in your browser local storage.

## remote mode 

you can use remote mode with your own php server to access your notes from the cloud.

* put the source files on your php server
* navigate to index.html
* switch to remote mode: ctrl+shift+V

to protect your data by a password, edit handler.php and change `$password` variable. 

your password will be sent from browser to server through a POST http query with no more encryption than ssl, if enabled. it is stored unencrypted in your browser local storage.

## usage

* help: f1
* notes list: ctrl+p
* command palette: ctrl+shift+p

## reclaim your data

download your notes in a single json file with ctrl+shift+s.

write a moulinette to flatten them as md files.
