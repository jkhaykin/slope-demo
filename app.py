from flask import Flask
from flask import request

from helpers import create_customer_order_intent

app = Flask(__name__)

@app.route("/api/create", methods=["POST"])
def create():
    customer_and_order_data = request.json
    intent_secret = create_customer_order_intent(customer_and_order_data)
    return intent_secret
