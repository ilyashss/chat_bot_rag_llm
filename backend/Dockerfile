FROM python:3.12.3

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .

WORKDIR /app

EXPOSE 9000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "9000"]
