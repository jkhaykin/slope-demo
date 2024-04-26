import requests, base64, os

from dotenv import load_dotenv
load_dotenv()

username = os.getenv("SLOPE_USERNAME")
password = os.getenv("SLOPE_PW")
userpass = f"{username}:{password}"
b64auth = base64.b64encode(userpass.encode()).decode()

headers = {
    "accept": "application/json",
    "content-type": "application/json",
    "authorization": f"Basic {b64auth}"
}

def api_request(slope_endpoint, data={}):
    """
    A nice abstraction that make's it easier to call Slope's API across the app

    Args:
        slope_endpoint (string): The endpoint or resource we are calling (anything after /v3 in the url)
        data (dict): Payload for the request

    Returns:
        json: Response from Slope
    """
    url = "https://api.sandbox.slope.so/v3"
    response = requests.post(f"{url}/{slope_endpoint}", json=data, headers=headers)
    return response

def get_customer_id(payload):
    """
    Returns the customer id to be used when creating an order
    """
    response = api_request("customers", payload)
    return response.json()['id']

def get_order_id(payload):
    """
    Returns the order id to be used when creating a secret
    """
    response = api_request("orders", payload)
    return response.json()['id']

def get_intent_secret(order_id):
    """
    Returns the intent secret needed to initialize the Slope widget
    customers use to check out
    """
    response = api_request(f"orders/{order_id}/intent")
    return response.json()['secret']

def create_customer_order_intent(payload):
    """
    Used in the /create route

    Expects payload with customer and order data, creates a customer 
    and order for that customer, and then creates the intent secret for 
    that order.

    Returns:
        string: Order's intent secret
    """
    customer_info = payload["customer"]
    order_info = payload["order"]
    customer_id = get_customer_id(customer_info)
    order_info['customerId'] = customer_id
    order_id = get_order_id(order_info)
    intent_secret = get_intent_secret(order_id)
    return intent_secret