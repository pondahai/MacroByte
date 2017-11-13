import os

os.system("chmod +x /etc/init.d/mechacar")
os.system("ln -s /etc/init.d/mechacar /etc/rc.d/S99mechacar")
os.system("chmod +x /www/cgi-bin/roverLunar")
