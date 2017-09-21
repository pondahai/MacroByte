筆記
在server端有兩個cgi分別是runPython以及storage
而他們的call graph如下：

程式碼上傳使用隱藏表格的POST上傳方法 這個方法不必對程式文字內容編碼
-------- code.js ----------------- 
code.uploadScript() -> code.post() ... cgi-bin/runPython

原生blockly上傳機制使用 XMLHttpRequest POST方法 傳輸內容需要編碼 經測試後不適用在程式碼上傳
---- code.js ----            ------------------------ storage.js -------------------------
init()(bindClick())    ---> BlocklyStorage.link()        ----> BlocklyStorage.makeRequest_() ... cgi-bin/storage
uploadScript() _________/                                  /
loadBlocks()   ----------> BlocklyStorage.retrieveXml() __/

