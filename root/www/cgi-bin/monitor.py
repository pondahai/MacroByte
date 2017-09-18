import os
from websocket_server import WebsocketServer
import thread
import subprocess


def process_run(subprocess,server):
  proc = subprocess.Popen(['python','/root/pythonCode.py'],stdout=subprocess.PIPE,stderr=subprocess.PIPE)
  server.send_message_to_all('python is running.')
  while proc.poll() is None:
    out = proc.stdout.readline()
    server.send_message_to_all(out)
  server.send_message_to_all('process stop.')
  
def message_received(client, server, message):
  pass
server = WebsocketServer(8008,host='0.0.0.0')
server.set_fn_message_received(message_received)
try:
  thread.start_new_thread(server.run_forever,())
except:
  pass

if not os.path.isdir("/sys/class/gpio/gpio3"):
  os.system("echo 3 > /sys/class/gpio/export")
os.system("echo 'out' > /sys/class/gpio/gpio3/direction")
os.system("echo 0 > /sys/class/gpio/gpio3/value")
os.system("echo 1 > /sys/class/gpio/gpio3/value")
#os.system("kill `pgrep -f pythonCode`")
#os.system("python /root/pythonCode.py&")

#try:
#  thread.start_new_thread(process_run,(subprocess,server))
#except:
#  pass


proc = subprocess.Popen(['python','-u','/root/pythonCode.py'],stdout=subprocess.PIPE,stderr=subprocess.PIPE)
server.send_message_to_all('python is running.')
while proc.poll() is None:
  out = proc.stdout.readline()
  server.send_message_to_all(out)
server.send_message_to_all('process stop.')
