from flask import Flask, send_from_directory, jsonify, request
import os

app = Flask(__name__)

# Directory where the icons are stored
ICONS_DIR = 'icons'

@app.route('/icon/<icon_name>', methods=['GET'])
def get_icon(icon_name):
    try:
        return send_from_directory(ICONS_DIR, icon_name)
    except FileNotFoundError:
        return jsonify({"error": "Icon not found"}), 404

@app.route('/icons', methods=['GET'])
def list_icons():
    icons = os.listdir(ICONS_DIR)
    return jsonify(icons)

if __name__ == '__main__':
    app.run(debug=True)

