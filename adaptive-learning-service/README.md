### Install
```{r}
cd adaptive-learning-service
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
```

### Migrations
```{r}
alembic revision --autogenerate
alembic upgrade head
```

### Install
```{r}
uvicorn app.main:app --reload
```