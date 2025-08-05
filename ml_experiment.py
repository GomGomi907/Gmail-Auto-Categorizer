"""Text classification experiments with local and pre-trained models.

This script demonstrates a comparison between a traditional machine
learning approach (TF-IDF + Logistic Regression) and a fine-tuned
pre-trained transformer model (DistilBERT).  It uses the 20 newsgroups
subset from scikit-learn for a small example.
"""

from __future__ import annotations

from typing import Tuple

from datasets import Dataset
from sklearn.datasets import fetch_20newsgroups
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from transformers import (AutoModelForSequenceClassification, AutoTokenizer,
                          Trainer, TrainingArguments)
import numpy as np


def load_dataset() -> Tuple[list[str], list[str], list[int], list[int]]:
    """Load and split the 20 newsgroups dataset.

    Returns:
        Tuple of train texts, test texts, train labels, test labels.
    """
    dataset = fetch_20newsgroups(
        subset="all",
        categories=["rec.autos", "sci.space", "talk.politics.mideast"],
        remove=("headers", "footers", "quotes"),
    )
    X_train, X_test, y_train, y_test = train_test_split(
        dataset.data, dataset.target, test_size=0.2, random_state=42
        )
    # Use a small subset for a fast demonstration
    X_train, y_train = X_train[:16], y_train[:16]
    X_test, y_test = X_test[:8], y_test[:8]
    return X_train, X_test, y_train, y_test


def train_sklearn_model(
    train_texts: list[str],
    train_labels: list[int],
    test_texts: list[str],
    test_labels: list[int],
) -> float:
    """Train a TF-IDF + Logistic Regression model and evaluate accuracy."""
    pipeline = Pipeline(
        [
            ("tfidf", TfidfVectorizer()),
            ("clf", LogisticRegression(max_iter=1000)),
        ]
    )
    pipeline.fit(train_texts, train_labels)
    preds = pipeline.predict(test_texts)
    return accuracy_score(test_labels, preds)


def fine_tune_distilbert(
    train_texts: list[str],
    train_labels: list[int],
    test_texts: list[str],
    test_labels: list[int],
) -> float:
    """Fine-tune DistilBERT for one epoch and return accuracy."""
    tokenizer = AutoTokenizer.from_pretrained("distilbert-base-uncased")
    model = AutoModelForSequenceClassification.from_pretrained(
        "distilbert-base-uncased", num_labels=3
    )

    train_enc = tokenizer(train_texts, truncation=True, padding=True)
    test_enc = tokenizer(test_texts, truncation=True, padding=True)

    train_dataset = Dataset.from_dict(
        {
            "input_ids": train_enc["input_ids"],
            "attention_mask": train_enc["attention_mask"],
            "labels": train_labels,
        }
    )
    test_dataset = Dataset.from_dict(
        {
            "input_ids": test_enc["input_ids"],
            "attention_mask": test_enc["attention_mask"],
            "labels": test_labels,
        }
    )

    training_args = TrainingArguments(
        output_dir="distilbert-output",
        num_train_epochs=1,
        per_device_train_batch_size=8,
        per_device_eval_batch_size=8,
        logging_steps=50,
    )

    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
        eval_dataset=test_dataset,
    )
    trainer.train()
    predictions = trainer.predict(test_dataset).predictions
    predicted_labels = np.argmax(predictions, axis=1)
    return accuracy_score(test_labels, predicted_labels)


def main() -> None:
    """Run experiments and print the accuracy of each model."""
    train_texts, test_texts, train_labels, test_labels = load_dataset()
    sklearn_acc = train_sklearn_model(train_texts, train_labels, test_texts, test_labels)
    print(f"Scikit-learn Logistic Regression accuracy: {sklearn_acc:.3f}")
    bert_acc = fine_tune_distilbert(train_texts, train_labels, test_texts, test_labels)
    print(f"DistilBERT fine-tuned accuracy: {bert_acc:.3f}")


if __name__ == "__main__":
    main()
