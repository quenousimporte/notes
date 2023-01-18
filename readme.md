# notes

## getting started

### local

* download files
* launch index.html

for a more app-feel on windows, try:

```
chrome_proxy.exe --app=index.html
```

### remote 

* put files on your php web server
* navigate to index.html
* edit settings (ctrl+shift+p, settings)
* change: remote=true
* reload page

to protect your data by a password, edit handler.php and change `$password` variable. 

your password will be sent from browser to server through a POST http query with no more encryption than ssl, if enabled. it is stored unencrypted in your browser local storage.

## usage

* help: f1
* notes list: ctrl+p
* command palette: ctrl+shift+p

## reclaim you data

your notes are stored in your browser local storage. download them in a single json file with ctrl+shift+s.

write a moulinette to flatten them as md files.