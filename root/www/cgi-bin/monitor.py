import os
#from websocket_server import WebsocketServer
import websocket_server
import threading
import subprocess
import select
#import Queue
#import copy

message_from_ws = None

#def process_run(subprocess,server):
#  proc = subprocess.Popen(['python','/root/pythonCode.py'],stdout=subprocess.PIPE,stderr=subprocess.PIPE)
#  server.send_message_to_all('python is running.')
#  while proc.poll() is None:
#    out = proc.stdout.readline()
#    server.send_message_to_all(out)
#  server.send_message_to_all('process stop.')

#q = Queue.Queue()

#def passing_global_variable(v):
#  global message_from_ws
#  message_from_ws = v
def message_received(client, server, message):
  #server.send_message_to_all(message)
  #passing_global_variable(message)
  
  global message_from_ws
  message_from_ws = message 
  #global q
  #q.put(message)
  
server = websocket_server.WebsocketServer(8008,host='0.0.0.0')
server.set_fn_message_received(message_received)
try:
  #thread.start_new_thread(server.run_forever,())
  t_ws = threading.Thread(target=server.run_forever)
  t_ws.daemon = True
  t_ws.start()
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


proc = subprocess.Popen(['python','-u','/root/pythonCode.py'],stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
#print proc.pid

#poll_obj_stdout = select.poll()
#poll_obj_stdout.register(proc.stdout, select.POLLIN)   
#poll_obj_stderr = select.poll()
#poll_obj_stderr.register(proc.stderr, select.POLLIN)   

def stdin_process(server,proc):
  global message_from_ws
  #global q
  if message_from_ws is not None:
  #if not q.empty():
  #  message_from_ws = q.get()
  #  print message_from_ws
  #  server.send_message_to_all(message_from_ws)
    proc.stdin.write(message_from_ws)
    proc.stdin.flush()
    message_from_ws = None

def stdout_process():
  global proc
  global server
  while True:
    for out in iter(proc.stdout.readline,b''):
      server.send_message_to_all(out)

def stderr_process():
  global proc
  global server
  while True:
    for out in iter(proc.stderr.readline,b''):
      server.send_message_to_all(out)

print "processing stdout thread"
try:
  t_stdout = threading.Thread(target=stdout_process)
  t_stdout.daemon = True
  t_stdout.start()
except:
  pass

print "processing stderr thread"
try:
  t_stderr = threading.Thread(target=stderr_process)
  t_stderr.daemon = True
  t_stderr.start()
except:
  pass

server.send_message_to_all('python is running.\n')  
i = 0  
while proc.poll() is None:
#  print i
#  i += 1
  
#  stdout,stderr = proc.communicate(None)
#  print "test stdout"
#  if stdout is not None:
#    print "processing stdout"
#    try:
#      if stdout is not '':
#        server.send_message_to_all(stdout)  
#    except:
#      pass
#  print "test stderr"
#  if stderr is not None:
#    print "processing stderr"
#    try:
#      if stderr is not '':
#        server.send_message_to_all(stderr)  
#    except:
#      pass
      
      
#  poll_result = poll_obj_stdout.poll(0)
#  if poll_result:
#  print "processing stdout"
#  for out in iter(proc.stdout.readline,b''):
#  while True:
#    line = proc.stdout.readline().rstrip()
#    if not line:
#      break
#    server.send_message_to_all(line)
    #proc.stdout.flush()
#  poll_result = poll_obj_stderr.poll(0)
#  if poll_result:
#  print "test stderr"
#  for out in iter(proc.stderr.readline,b''):
#  while True:
#    line = proc.stderr.readline().rstrip()
#    if not line:
#      break
#    server.send_message_to_all(line)
    #proc.stderr.flush()

#  print "test stdin"
  stdin_process(server,proc)
#  if message_from_ws is not None:
  #if not q.empty():
  #  message_from_ws = q.get()
#    print "message_from_ws=",message_from_ws
#    server.send_message_to_all(message_from_ws)
#    proc.stdin.write(message_from_ws)
#    proc.stdin.flush()
#    message_from_ws = None
  
server.send_message_to_all('process stop.\n')
