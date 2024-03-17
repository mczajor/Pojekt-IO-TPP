import eel

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
eel.start("index.html", size = (320, 320))
