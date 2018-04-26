筆記
在server端有兩個cgi分別是runPython以及storage
而他們的call graph如下：

程式碼上傳使用隱藏表格的POST上傳方法 這個方法不必對程式文字內容編碼
-------- code.js ----------------- 
code.uploadScript() -> code.post() ... cgi-bin/runPython

原生blockly上傳機制使用 XMLHttpRequest POST方法 傳輸內容需要編碼 經測試後不適用在程式碼上傳
link()裡面用到saveAS()做本地儲存
---- code.js ----            ------------------------ storage.js -------------------------
init()(bindClick())    ---> BlocklyStorage.link()        ----> BlocklyStorage.makeRequest_() ... cgi-bin/storage ... handleRequest_() ---> monitorChanges_()
uploadScript() _________/                                  /                                                            \_loadXml_()
loadBlocks()   ----------> BlocklyStorage.retrieveXml() __/
                                                         /
strtStream()   -----------------------------------------
stopStream()   ----------------------------------------/
runProgram()   ---------------------------------------/
stopProgram()  --------------------------------------/

                             BlocklyStorage.save() ---> saveAs()
              
載入本地程式碼
folderButton ---> importBlock() ....> handleFileSelect() ....> reader.onloadend() ---> monitorChanges_()
                                                                   \_loadXml_()
在handleRequest_()裡面
httpRequest_.name == 'xml' 代表xml資料上傳
httpRequest_.name == 'key' 代表xml資料下載

2017-10-11
原本BlocklyStorage.link()是用來上傳xml，但我把本地存檔也放在這裡
今天把本地存檔API獨立出來： BlocklyStorage.save()

2017-10-25
Blockly數值欄位沒有支援0x語法
今天修改blockly原始碼，加入「數字資料允許hex字串」
以及python碼 數值的產生方式
call graph如下 
core/generator.js -> valueToCode -> blockToCode ...> python/math.js -> Blockly.Python['math_number'] = function(block)
                                                                                                  ^___ 在這裡加入HEX字串判斷
加入I2C讀寫積木																																																	
加入參數欄位可擴展積木 "create parameter with" 修改自 "create list with
避免終端機訊息太多拖垮網頁瀏覽器
增加arduino資料夾擺放32u4端的firmata程式
增加gyro積木

2017-11-12
gyro感測器需要另外用mcu讀取與轉換
改用lua作為cgi 整個上傳與反應時間大大縮短 （原本用python）
統一cgi檔案為一個  名稱為roverLunar
增加post-install作為執行軟體檔案更新後的後段動作 例如更改檔案屬性
目前按下執行後5秒，終端機連通，再13秒後程式開始執行，這中間的延遲是python在7688內的反應時間

2017-11-13
python加入 int float兩個函數
修改地方分別在blockly原始碼的： 
block/math.js 
以及 
generators/python/math.js

google blockly 有更新，在build.py 399行 HTTPConnection -> HTTPSConnection

小結目前為止blockly已經客製化的項目：
1.數值積木可以輸入0x開頭的十六進數字（例：0xff）
2.新積木：輸入串列輸出逗點分隔字串 List->Create Parameter Lists ，功能：用來產生不定數目的函式引數（parameters）
3.加入python專用int 與float兩函數，供字串變數轉換為數字運算用

2018-4-26
加入 OLED 積木
加入 MBdisplay.py 這是本來用來推另一片OLED的程式碼，發現用來推這個麥可拿給我的也可以