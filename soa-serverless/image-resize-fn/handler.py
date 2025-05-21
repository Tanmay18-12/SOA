import base64
from io import BytesIO
from PIL import Image

def handle(req):
    try:
        image_data = base64.b64decode(req)
        img = Image.open(BytesIO(image_data))
        img = img.resize((100, 100))
        output = BytesIO()
        img.save(output, format='JPEG')
        return base64.b64encode(output.getvalue()).decode()
    except Exception as e:
        return str(e)
