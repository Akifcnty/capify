from app import create_app

app = create_app()

if __name__ == "__main__":
    import os
    port = int(os.environ.get("FLASK_RUN_PORT", 5000))
    app.run(debug=True, port=port)