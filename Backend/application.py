import os
import sys

# Ensure the current directory is in the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from core.wsgi import application
app = application
