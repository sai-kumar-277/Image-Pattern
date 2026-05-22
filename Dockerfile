FROM python:3.10-slim

# Create a non-root user
RUN useradd -m -u 1000 user
USER user
ENV PATH="/home/user/.local/bin:$PATH"

WORKDIR /app

COPY --chown=user:user requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY --chown=user:user . .

ENV PORT=7860
EXPOSE 7860

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]


