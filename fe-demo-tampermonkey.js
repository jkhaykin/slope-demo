// ==UserScript==
// @name         Best Buy Slope Button
// @namespace    http://tampermonkey.net/
// @version      2024-04-24
// @description  try to take over the world!
// @author       You
// @match        https://www.bestbuy.com/checkout/r/fast-track
// @icon         https://www.google.com/s2/favicons?sz=64&domain=bestbuy.com
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
    'use strict';

    // Inject the Slope script
    var slopeScript = document.createElement('script');
    slopeScript.src = 'https://checkout.sandbox.slope.so/slope.min.js';
    document.head.appendChild(slopeScript);

    // Function to inject the Slope payment button
    function injectSlopePaymentButton() {
        var otherPaymentOptionsButtons = document.querySelector('.otherPaymentOptionsButtons');

        if (otherPaymentOptionsButtons) {
            var slopePaymentButtonHTML = `
                <button id="slopeBtn" onclick="window.Slope.open()" style="background-color: #FF6B00; color: white; border: none; border-radius: 4px; padding: 12px 24px; font-size: 16px; font-weight: bold; display: flex; align-items: center; justify-content: center; cursor: pointer;">
                    <img src="https://demo.slope.so/images/icon_white.svg" alt="Slope Logo" height="20" style="margin-right: 8px;">
                    <span>Pay with Slope</span>
                </button>
            `;

            otherPaymentOptionsButtons.insertAdjacentHTML('afterbegin', slopePaymentButtonHTML);
        }
    }

    // Run the injection on page load
    window.addEventListener('load', injectSlopePaymentButton);

    function extractCustomerInfo() {
        const addressText = document.querySelector('.billingAddressCard').innerText;

        // Extract address details
        const addressLines = addressText.split('\n').map(line => line.trim()).filter(line => line !== '');
        const [name, line1, line2, cityStateZip] = addressLines;
        const [city, stateZip] = cityStateZip.split(', ');
        const [state, postalCode] = stateZip.split(' ');

        // Create the customer object
        const customer = {
            email: "demo+skip-pre_qualify@slope.so",
            phone: "+16175551212",
            businessName: "Stark Industries, Inc",
            address: {
                line1,
                line2,
                city,
                state,
                postalCode,
                country: "US"
            }
        };

        // Get the total from the order summary
        const prices = document.querySelectorAll('.order-summary__price');
        const totalElement = prices[prices.length-1]
        const total = totalElement ? totalElement.innerText.trim() : '';
        const totalInCents = parseFloat(total.replace(/[^0-9.-]+/g,"") * 100);

        // Create the order object
        const order = {
            total: totalInCents,
            currency: "usd"
        };

        // Create the final JSON object
        const data = {
            customer,
            order
        };

        return data;
    }

    // Function that injects the script for the Slope widget
    function injectSlopeScript(orderIntentSecret) {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.text = `
        window.initializeSlope({
            intentSecret: '${orderIntentSecret}',
            onSuccess: function(payload) {
                alert("Confirm successful payment on backend and call Slope's /finalize endpoint.")
            },
        });
    `;

    document.head.appendChild(script);
}

    // Function to send customer information to the API endpoint
    function callSlope() {
        // Call the function to extract customer information
        const customerInfo = extractCustomerInfo();

        // Convert the customer object to JSON string
        const customerJson = JSON.stringify(customerInfo);
        console.log(customerJson)

        GM_xmlhttpRequest({
            method: 'POST',
            url: 'http://127.0.0.1:5000/api/create',
            headers: {
                'Content-Type': 'application/json'
            },
            data: customerJson,
            onload: function(response) {
                if (response.status === 200) {
                    const intentSecret = response.responseText
                    injectSlopeScript(intentSecret)
                } else {
                    console.error('Failed to send customer information');
                }
            },
            onerror: function(error) {
                console.error('Error sending customer information:', error);
            }
        });
    }

    // Call the function to send customer information to the API endpoint
    // Run the injection on page load
    window.addEventListener('load', callSlope);
})();