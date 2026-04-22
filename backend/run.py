from app.main import create_app
<<<<<<< HEAD
import os

print("Looking for model at:", os.path.abspath("models/ct_model.pth"))
print("File exists:", os.path.exists("models/ct_model.pth"))

app = create_app()
=======

app = create_app()

>>>>>>> 29e6eecb1ec5419e4ad03a848cf86054c0bc3171
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8000)