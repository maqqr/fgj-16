from flask import Flask, request, send_from_directory

app = Flask(__name__, static_url_path='')


@app.route('/dist/<path:path>')
def send_dist(path):
    return send_from_directory('dist', path)


@app.route('/assets/<path:path>')
def send_assets(path):
    return send_from_directory('assets', path)


@app.route('/js/<path:path>')
def send_js(path):
    return send_from_directory('js', path)


@app.route('/')
def root():
    return app.send_static_file('index.html')


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=3074)
