# Connectify

This repository contains a full-stack web application developed as part of a Web Programming Course. The project demonstrates the implementation of a client-server architecture, featuring a custom backend, database integration, and a static frontend. 

The repository showcases the progression of the application through different developmental stages, specifically organized into a `lab_2` module and a `project_final` directory.

## 🛠️ Tech Stack

*   **Backend:** Python-based server implementation (`server.py`).
*   **Database:** SQLite database management utilizing SQL schemas and Python helper scripts (`database.db`, `schema.sql`, `database_helper.py`).
*   **Frontend:** Static web interface built with standard HTML, CSS, and JavaScript (`client.html`, `client.css`, `client.js`).
*   **Testing:** Automated test suites included for backend validation (`tests.py`).

## 📂 Project Structure

*   **`lab_2/`**: Contains the earlier iterations of the backend server, database configuration files, and testing scripts.
*   **`project_final/`**: Contains the complete, final version of the application. 
    *   Includes the finalized `server.py`, `database_helper.py`, and database files.
    *   Contains a `static/` directory housing all the frontend web assets, including a `wimage.png` file.

## 🚀 Getting Started

### Prerequisites
*   Python 3.10 or higher (based on the `__pycache__` compiled files).
*   A modern web browser.

### Installation & Setup
1. Clone the repository to your local machine.
2. Navigate to the `project_final/` directory.
3. Ensure the database is initialized. If necessary, run the schema file to build the database structure:
   ```bash
   sqlite3 database.db < schema.sql
