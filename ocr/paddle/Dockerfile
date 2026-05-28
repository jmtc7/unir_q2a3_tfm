FROM python:3.10

RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxrender1 \
    libxext6 \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir \
    fastapi \
    uvicorn \
    pillow \
    python-multipart \
    numpy==1.26.4 \
    opencv-python-headless==4.8.1.78 \
    paddleocr==2.7.3 \
    paddlepaddle==2.6.2

ENV FLAGS_use_pir_api=False
ENV FLAGS_enable_pir=False
ENV FLAGS_use_mkldnn=False

WORKDIR /app
COPY app.py .

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]