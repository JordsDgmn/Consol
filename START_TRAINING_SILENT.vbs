Set objFSO = CreateObject("Scripting.FileSystemObject")
strScript = objFSO.GetParentFolderName(WScript.ScriptFullName)

Set objShell = CreateObject("WScript.Shell")
objShell.Run "python """ & strScript & "\training_monitor.py""", 0, False
