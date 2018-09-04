2018-9-4
將辨識輸入項目增加到16項
修改的地方如下：
html:
複製原本的thumb-box
修改id為command1 command2 ... command12
index.js
修改變數
CONTROLS 陣列內增加command1 ... command12
增加按鍵變數 如下12組
var command1Button = document.getElementById('command1');
增加ts內想預測的數目
NUM_CLASSES = 16
