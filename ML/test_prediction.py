import requests
import json

def test_prediction():
    # Test data
    test_data = {
        "co2": 450.0,
        "pm25": 12.5,
        "co": 1.2,
        "temperature": 25.0,
        "humidity": 60.0
    }
    
    try:
        # Make prediction request
        response = requests.post(
            "http://localhost:8000/predict",
            json=test_data
        )
        
        # Print results
        print("Status Code:", response.status_code)
        print("Response:", json.dumps(response.json(), indent=2))
        
    except Exception as e:
        print(f"Error testing prediction: {str(e)}")

if __name__ == "__main__":
    test_prediction()