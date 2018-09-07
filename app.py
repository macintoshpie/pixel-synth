from flask import Flask, render_template, send_file
app = Flask(__name__)
app.config['TEMPLATES_AUTO_RELOAD'] = True

@app.route('/')
def index():
	return render_template('indexNew.html')

if __name__ == '__main__':
    app.run()
