from dotenv import load_dotenv
load_dotenv()
from app.main import create_app
import os

print("Looking for model at:", os.path.abspath("models/ct_model.pth"))
print("File exists:", os.path.exists("models/ct_model.pth"))

app = create_app()
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8000)