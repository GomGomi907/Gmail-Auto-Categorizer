"""Fine-tune a pre-trained DistilBERT model on sample email data."""

from typing import Tuple, List, Dict
import pandas as pd
from datasets import Dataset
from sklearn.model_selection import train_test_split
from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification,
    Trainer,
    TrainingArguments,
)


def load_dataset(path: str) -> Tuple[Dataset, Dataset, List[str]]:
    """Load the CSV data and return train/test Hugging Face datasets and label names."""
    df = pd.read_csv(path)
    train_df, test_df = train_test_split(
        df, test_size=0.3, random_state=42, stratify=df["label"]
    )
    labels = sorted(df["label"].unique())
    label2id: Dict[str, int] = {label: i for i, label in enumerate(labels)}
    train_df["label"] = train_df["label"].map(label2id)
    test_df["label"] = test_df["label"].map(label2id)
    return Dataset.from_pandas(train_df), Dataset.from_pandas(test_df), labels


def tokenize_function(examples, tokenizer):
    """Tokenize input texts for the model."""
    return tokenizer(
        examples["text"], truncation=True, padding="max_length", max_length=128
    )


def main() -> None:
    """Fine-tune DistilBERT and print evaluation metrics."""
    train_ds, test_ds, labels = load_dataset("data/sample_emails.csv")
    tokenizer = AutoTokenizer.from_pretrained("distilbert-base-uncased")
    train_enc = train_ds.map(lambda x: tokenize_function(x, tokenizer), batched=True)
    test_enc = test_ds.map(lambda x: tokenize_function(x, tokenizer), batched=True)

    model = AutoModelForSequenceClassification.from_pretrained(
        "distilbert-base-uncased",
        num_labels=len(labels),
        id2label={i: l for i, l in enumerate(labels)},
        label2id={l: i for i, l in enumerate(labels)},
    )

    training_args = TrainingArguments(
        output_dir="tmp_output",
        per_device_train_batch_size=4,
        per_device_eval_batch_size=4,
        num_train_epochs=1,
        eval_strategy="epoch",
        save_strategy="no",
        logging_steps=10,
    )

    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_enc,
        eval_dataset=test_enc,
        tokenizer=tokenizer,
    )

    trainer.train()
    metrics = trainer.evaluate()
    print(metrics)


if __name__ == "__main__":
    main()
