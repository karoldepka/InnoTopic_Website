# Project README

FIXME: rename from shirtGen to smth like TopicFansGen
* q and a
* posters
* wallpapers
* shirts
* mouse pads :D

## Overview

This project is designed to create a highly efficient and scalable backend system using FastAPI, Chroma, Prometheus, and Grafana. The system is designed for generating and managing SVG logos based on user input, with advanced features such as monitoring, logging, caching, and customizable query settings.

## Getting Started

### Prerequisites

Ensure you have the following installed on your system:
- Python 3.8+
- FastAPI

### Project Structure

The project consists of the following key components:
- **FastAPI Backend**: Handles requests, processes inputs, and generates SVG logos.
- **Chroma Vector Database**: Stores and retrieves embeddings for efficient search.
- **Prometheus**: Collects and monitors metrics.
- **Grafana**: Visualizes metrics and provides real-time dashboards.

### Installation

1. **Clone the Repository:**
   ```bash
   git clone <repository_url>
   cd <repository_directory>
   ```

2. **Install Python Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Setup Environment Variables:**
   - Create a `.env` file in the project root with the necessary configurations.
   - Example:
     ```
     PORT=8000
     DATABASE_URL=sqlite:///./test.db
     ```

### Running the Application

1. **Start the FastAPI Server:**
   ```bash
   uvicorn main:app --reload
   ```

2. **(Optional) Configure and Run Prometheus and Grafana:**

   #### **Prometheus Configuration:**
   - Ensure Prometheus is configured to use a non-conflicting port. The default port is `9090`.
   - To change the port, edit the `prometheus.yml` file:
     ```yaml
     global:
       scrape_interval: 15s
     scrape_configs:
       - job_name: 'prometheus'
         static_configs:
           - targets: ['localhost:9090']
     ```
   - Update `localhost:9090` to another port if needed to avoid conflicts.

   #### **Grafana Configuration:**
   - Ensure Grafana is configured to use a non-conflicting port. The default port is `3000`.
   - To change the port, edit the `grafana.ini` file located in the `conf` directory:
     ```ini
     [server]
     http_port = 4000
     ```
   - Update `4000` to another port if needed.

   #### **Running Prometheus and Grafana:**
   - Place the Prometheus and Grafana executable files in the project directory.
   - Open new terminal windows and navigate to their respective directories, then execute the following commands:

     **For Prometheus:**
     ```bash
     .\prometheus.exe --config.file="C:\path\to\prometheus.yml"
     ```


     **For Grafana:**
     ```bash
     .\grafana-server
     ```

### Optional: Prometheus and Grafana Setup

#### Prometheus and Grafana Integration

1. **Add Prometheus as a Data Source in Grafana:**
   - Open Grafana in your browser (`http://localhost:3000`).
   - Log in with the default credentials (`admin`/`admin`).
   - Go to **Configuration** > **Data Sources**.
   - Click **Add data source** and select **Prometheus**.
   - Set the URL to `http://localhost:9090` (or the port you've configured Prometheus to use).
   - Click **Save & Test** to confirm the setup.

2. **Create Grafana Dashboards:**
   - Go to **Create** > **Dashboard**.
   - Add new panels with Prometheus queries to visualize data.
   - Save the dashboard and monitor the real-time data.

### Troubleshooting

- **Port Conflicts**: If you encounter issues with ports, verify that Prometheus, Grafana, and FastAPI are all running on different ports. Modify the configuration files as mentioned above.
- **Server Not Starting**: Ensure no other services are running on the configured ports. Restart the terminals and re-run the commands.

### Customizable Query Settings

- **Number of Results**: Users can configure how many results are returned from the RAG database.
- **Result Variance**: Adjust the proximity threshold for more varied or precise results.
- **Image Scrolling**: Enable or disable scrolling through images based on user preferences.

### Contribution

If you wish to contribute to this project, please fork the repository and submit a pull request with your changes.

### License

This project is licensed under the MIT License. See the `LICENSE` file for more details.

---

This README file should provide all the information needed to set up and run the project, including optional integration with Prometheus and Grafana. Ensure you follow each step carefully, and feel free to reach out if you encounter any issues.
