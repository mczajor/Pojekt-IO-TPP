import sys
import eel

# these imports are required to load exposed functions
from backend.file_service import FileService
from backend.data_service import DataService


## CONSTANTS ##
is_production = len(sys.argv) > 1 and sys.argv[1] == '--prod'
path = 'build' if is_production else 'web'

## INIT EEL ##
eel.init(path)

## EXAMPLE FROM PYTHON TO JS USAGE ##
@eel.expose
def from_python_to_js(num):
    print("from python",num)
    return 2 * num

## EXAMPLE FROM JS TO PYTHON USAGE ##
def handle_js(num):
    print("from js",num)


### EEL SETUP ###

eel_kwargs = dict(
    host='localhost',
    port=8080,
    size=(1280, 800),
    mode=None,
)

## RUN AS DESKTOP APPLICATION ##
if is_production:
    del eel_kwargs['mode']

eel.start("index.html", **eel_kwargs)