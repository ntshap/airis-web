import numpy as np
import tensorflow as tf
from sklearn.preprocessing import MinMaxScaler
import pandas as pd
import os

class AirQualityPredictor:
    def __init__(self, model_path='ML/models/air_quality_lstm_model.h5'):
        # Create a dummy model if the trained model doesn't exist
        if not os.path.exists(model_path):
            print("Warning: Model file not found. Creating a dummy model for testing.")
            self.model = tf.keras.Sequential([
                tf.keras.layers.LSTM(64, input_shape=(1, 5)),
                tf.keras.layers.Dense(5)
            ])
            self.model.compile(
                optimizer='adam',
                loss=tf.keras.losses.MeanSquaredError(),
                metrics=['mse']
            )
        else:
            try:
                # Update custom objects to use MeanSquaredError class
                custom_objects = {
                    'mse': tf.keras.losses.MeanSquaredError(),
                    'mean_squared_error': tf.keras.losses.MeanSquaredError()
                }
                
                # Load model with custom objects
                self.model = tf.keras.models.load_model(
                    model_path,
                    custom_objects=custom_objects,
                    compile=False  # Load without compilation
                )
                
                # Recompile the model
                self.model.compile(
                    optimizer='adam',
                    loss=tf.keras.losses.MeanSquaredError(),
                    metrics=['mse']
                )
                
            except Exception as e:
                raise RuntimeError(f"Error loading model: {str(e)}")
            
        self.scaler = MinMaxScaler()

    def preprocess_data(self, data):
        """Preprocess input data for prediction"""
        try:
            # Convert to DataFrame if necessary
            if isinstance(data, dict):
                data = pd.DataFrame([data])
            elif isinstance(data, list):
                data = pd.DataFrame(data)
                
            # Ensure correct columns are present
            required_columns = ['co2', 'pm25', 'co', 'temperature', 'humidity']
            if not all(col in data.columns for col in required_columns):
                raise ValueError(f"Missing required columns. Required: {required_columns}")
                
            # Scale the data
            scaled_data = self.scaler.fit_transform(data[required_columns])
            
            # Reshape for LSTM [samples, time steps, features]
            return np.reshape(scaled_data, (scaled_data.shape[0], 1, scaled_data.shape[1]))
            
        except Exception as e:
            raise ValueError(f"Error preprocessing data: {str(e)}")

    def predict(self, input_data):
        """Make predictions using the loaded model"""
        try:
            # Preprocess the data
            processed_data = self.preprocess_data(input_data)
            
            # Make prediction
            predictions = self.model.predict(processed_data)
            
            # Inverse transform predictions
            predictions = self.scaler.inverse_transform(predictions.reshape(-1, predictions.shape[-1]))
            
            # Return predictions as a dictionary
            prediction_dict = {
                'co2_prediction': float(predictions[0][0]),
                'pm25_prediction': float(predictions[0][1]),
                'co_prediction': float(predictions[0][2]),
                'temperature_prediction': float(predictions[0][3]),
                'humidity_prediction': float(predictions[0][4])
            }
            
            return prediction_dict
            
        except Exception as e:
            raise ValueError(f"Error making prediction: {str(e)}")