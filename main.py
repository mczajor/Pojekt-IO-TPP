import eel

# these imports are required to load exposed functions
from backend.file_service import FileService
from backend.data_service import DataService
from backend.visualization_service import VisualizationService

## INIT EEL ##
eel.init('web')

## EXAMPLE FROM PYTHON TO JS USAGE ##
@eel.expose
def from_python_to_js(num):
    print("from python",num)
    return 2 * num

## EXAMPLE FROM JS TO PYTHON USAGE ##
def handle_js(num):
    print("from js",num)

eel.from_js_to_python(10)(handle_js)

### EEL SETUP ###

eel_kwargs = dict(
    host='localhost',
    port=8080,
    size=(1280, 800),
    mode=None,
)

eel.start("index.html", **eel_kwargs)