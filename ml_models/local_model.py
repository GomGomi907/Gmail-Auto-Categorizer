"""Train and evaluate a local TF-IDF + Logistic Regression model on sample email data."""

from typing import Tuple, List
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, accuracy_score


def load_data(path: str) -> Tuple[List[str], List[str]]:
    """Load email text and labels from a CSV file."""
    df = pd.read_csv(path)
    return df["text"].tolist(), df["label"].tolist()


def build_model() -> Pipeline:
    """Create a scikit-learn pipeline with TF-IDF features and logistic regression."""
    return Pipeline([
        ("tfidf", TfidfVectorizer()),
        ("clf", LogisticRegression(max_iter=1000)),
    ])


def main() -> None:
    """Train the local model and print evaluation metrics."""
    texts, labels = load_data("data/sample_emails.csv")
    X_train, X_test, y_train, y_test = train_test_split(
        texts, labels, test_size=0.3, random_state=42, stratify=labels
    )
    model = build_model()
    model.fit(X_train, y_train)
    preds = model.predict(X_test)
    print("Accuracy:", accuracy_score(y_test, preds))
    print(classification_report(y_test, preds))


if __name__ == "__main__":
    main()
