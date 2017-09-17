# MacroByte 
![pic/投影片2.JPG](pic/投影片2.JPG)

storageXXXX/storage 放在 /www/cgi-bin/  
runPyuthon 放在 /www/cgi-bin/  
blockly 放在 /www/  
在/www/ 建立 save/ 資料夾  
MBdisplay.py 放在 /root/
websocket_server.py 放在 /root/

要預先安裝pymata  
pip install pymata  
  
blockly客製化的功能分別放在  
index.html  負責blockly的主畫面以及相關按鈕  
code.js  客製化功能的javascript程式所在與錨點的連結  
storage.js  負責將blockly的xml資料儲存起來的功能  
  
原理：
在客戶端瀏覽器網址列輸入 http://macrobyte.local/blockly/demos/code/  
連覽器會從macrobyte 下載blockly的頁面以及相關的javascript到瀏覽器  
macrobyte的畫面中有下載按鈕以及上傳按鈕  
下載按鈕會使用網頁錨點#last  
這個錨點會啟動下載機制將最後編輯的blockly xml資料下載到瀏覽器  
上傳按鈕有兩個功能  
一個是藉由ajax上傳機制 傳送xml到 /www/cgi-bin/storage  
功能是將現在瀏覽器中的blockly xml資料上傳到macrobyte  
並且存放在/www/save/last檔案中  
而舊的last檔案會另存成last.old  
  
這個last錨點( http://macrobyte.local/blockly/demos/code/#last) 是Blockly內部原生機制在處理  
在/www/cgi-bin/storage 這裡只是收到Blockly處理過的結果，以cgi的方式送來  
原本Blockly是利用這個機制處理Blockly雲端存檔的需求，在#之後是接一組號碼，然後後台把號碼對應的xml傳給用戶端  
這裡把它改成存檔機制  
  
上傳按鈕另一個功能是執行上傳的python程式  
blockly中的javscript程式會以POST方法  
將記憶體中的程式碼上傳給 /www/cgi-bin/runPython  
而runPython程式會將收到的程式碼放在/root/  
並取名為pythonCode.py  
然後呼叫python執行這個pythonCode.py  

