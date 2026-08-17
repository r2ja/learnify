import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Input, LSTM, Dense, Dropout
from tensorflow.keras.optimizers import Adam
from sklearn.metrics import classification_report, confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns

class RevisedLSTMLearningStyleDisabilityModel:
    def __init__(self, lstm_units=64, dropout_rate=0.5):
        self.lstm_units = lstm_units
        self.dropout_rate = dropout_rate
        self.le_question = LabelEncoder()
        self.le_style = LabelEncoder()
        self.le_disability = LabelEncoder()
        self.model = None
        self.learning_style_columns = ['Active_Reflective', 'Sensing_Intuitive', 'Visual_Verbal', 'Sequential_Global']
        self.learning_disability_columns = ['ADHD', 'Dyslexia', 'Dyscalculia', 'AuditoryProcessingDisorder']
        
    def preprocess_data(self, X, y_style, y_disability):
        # Encode questions
        X_encoded = X.apply(lambda col: self.le_question.fit_transform(col))
        X_processed = X_encoded.values.reshape((X_encoded.shape[0], X_encoded.shape[1], 1))
        
        # Encode learning styles
        y_style_encoded = y_style.apply(self.le_style.fit_transform)
        
        # Encode learning disabilities
        y_disability_encoded = y_disability.apply(self.le_disability.fit_transform)
        
        return X_processed, y_style_encoded, y_disability_encoded
    
    def build_model(self, input_shape, num_style_classes, num_disability_classes):
        inputs = Input(shape=input_shape)
        x = LSTM(self.lstm_units, return_sequences=True)(inputs)
        x = Dropout(self.dropout_rate)(x)
        x = LSTM(self.lstm_units)(x)
        x = Dropout(self.dropout_rate)(x)
        
        style_outputs = [Dense(num_style_classes[i], activation='softmax', name=f'style_{i}')(x) for i in range(4)]
        disability_outputs = [Dense(num_disability_classes[i], activation='softmax', name=f'disability_{i}')(x) for i in range(4)]
        
        self.model = Model(inputs=inputs, outputs=style_outputs + disability_outputs)
        self.model.compile(optimizer=Adam(learning_rate=0.001),
                           loss=['sparse_categorical_crossentropy']*8,
                           metrics=['accuracy'])
    
    def fit(self, X, y_style, y_disability, epochs=50, batch_size=32):
        X_processed, y_style_encoded, y_disability_encoded = self.preprocess_data(X, y_style, y_disability)
        
        num_style_classes = [len(np.unique(y_style_encoded[col])) for col in y_style_encoded.columns]
        num_disability_classes = [len(np.unique(y_disability_encoded[col])) for col in y_disability_encoded.columns]
        
        self.build_model(X_processed.shape[1:], num_style_classes, num_disability_classes)
        
        history = self.model.fit(
            X_processed,
            [y_style_encoded[col] for col in y_style_encoded.columns] + 
            [y_disability_encoded[col] for col in y_disability_encoded.columns],
            epochs=epochs,
            batch_size=batch_size,
            validation_split=0.2,
            verbose=1
        )
        return history
    
    def predict(self, X):
        X_encoded = X.apply(lambda col: self.le_question.transform(col))
        X_processed = X_encoded.values.reshape((X_encoded.shape[0], X_encoded.shape[1], 1))
        predictions = self.model.predict(X_processed)
        
        style_predictions = [self.le_style.inverse_transform(np.argmax(predictions[i], axis=1)) for i in range(4)]
        disability_predictions = [self.le_disability.inverse_transform(np.argmax(predictions[i+4], axis=1)) for i in range(4)]
        
        style_df = pd.DataFrame(np.column_stack(style_predictions), columns=self.learning_style_columns, index=X.index)
        disability_df = pd.DataFrame(np.column_stack(disability_predictions), columns=self.learning_disability_columns, index=X.index)
        
        return style_df, disability_df
    
    def evaluate(self, X, y_style, y_disability):
        style_pred, disability_pred = self.predict(X)
        
        for style in self.learning_style_columns:
            print(f"\nClassification Report for {style}:")
            print(classification_report(y_style[style], style_pred[style]))
            
            cm = confusion_matrix(y_style[style], style_pred[style])
            plt.figure(figsize=(8, 6))
            sns.heatmap(cm, annot=True, fmt='d', cmap='Blues')
            plt.title(f'Confusion Matrix for {style}')
            plt.xlabel('Predicted')
            plt.ylabel('True')
            plt.show()
        
        for disability in self.learning_disability_columns:
            print(f"\nClassification Report for {disability}:")
            print(classification_report(y_disability[disability], disability_pred[disability]))
            
            cm = confusion_matrix(y_disability[disability], disability_pred[disability])
            plt.figure(figsize=(8, 6))
            sns.heatmap(cm, annot=True, fmt='d', cmap='Blues')
            plt.title(f'Confusion Matrix for {disability}')
            plt.xlabel('Predicted')
            plt.ylabel('True')
            plt.show()
    
    def generate_recommendations(self, student_responses):
        style_pred, disability_pred = self.predict(student_responses.to_frame().T)
        styles = style_pred.iloc[0]
        disabilities = disability_pred.iloc[0]
        
        recommendations = ["Based on the analysis, this student's learning profile is:"]
        for style, value in styles.items():
            recommendations.append(f"- {style}: {value}")
        
        recommendations.append("\nLearning style recommendations:")
        if styles['Active_Reflective'] == 'Active':
            recommendations.append("- Engage in group discussions and hands-on activities")
        elif styles['Active_Reflective'] == 'Reflective':
            recommendations.append("- Provide time for individual reflection and thought")
        else:
            recommendations.append("- Mix group activities with individual reflection time")
        
        if styles['Sensing_Intuitive'] == 'Sensing':
            recommendations.append("- Use concrete examples and practical applications")
        elif styles['Sensing_Intuitive'] == 'Intuitive':
            recommendations.append("- Explore theoretical concepts and abstract ideas")
        else:
            recommendations.append("- Balance concrete examples with theoretical concepts")
        
        if styles['Visual_Verbal'] == 'Visual':
            recommendations.append("- Utilize diagrams, charts, and visual aids in learning materials")
        elif styles['Visual_Verbal'] == 'Verbal':
            recommendations.append("- Focus on written and spoken explanations")
        else:
            recommendations.append("- Combine visual aids with verbal explanations")
        
        if styles['Sequential_Global'] == 'Sequential':
            recommendations.append("- Present information in a step-by-step, logical progression")
        elif styles['Sequential_Global'] == 'Global':
            recommendations.append("- Provide big-picture overviews before delving into details")
        else:
            recommendations.append("- Alternate between detailed steps and big-picture concepts")
        
        recommendations.append("\nLearning disability considerations:")
        for disability, value in disabilities.items():
            if value == 'Yes':
                if disability == 'ADHD':
                    recommendations.append("- Implement structured routines and break tasks into smaller, manageable parts")
                elif disability == 'Dyslexia':
                    recommendations.append("- Use multisensory teaching approaches and provide extra time for reading tasks")
                elif disability == 'Dyscalculia':
                    recommendations.append("- Use visual aids for mathematical concepts and provide manipulatives for hands-on learning")
                elif disability == 'AuditoryProcessingDisorder':
                    recommendations.append("- Provide written instructions and use visual cues to supplement auditory information")
            elif value == 'Suspected':
                recommendations.append(f"- Consider professional assessment for {disability}")
        
        return recommendations
