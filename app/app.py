# Flask server code
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from itertools import product
import pandas as pd

app = Flask(__name__)
CORS(app)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/process_data", methods=["POST"])
def process_data():
    # Extract the table
    values = request.get_json()['data']
    
    result = []
    # loop over the inner list indices
    for i in range(len(values[0])):
        # create a new list of elements at the same inner list indices
        newlist = []
        for value in values:
            if i < len(value):
                newlist.append(value[i])
            else:
                newlist.append(value[-1])
        # get the cartesian product of the new list
        p = list(product(*newlist))
        result.extend(p)
    return pd.DataFrame(result).to_html(justify='left', index=False)

if __name__ == "__main__":
    app.run(debug=True)

