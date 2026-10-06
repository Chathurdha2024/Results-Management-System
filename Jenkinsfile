pipeline {
    agent any

    environment {
        // You can add Jenkins credentials or env vars here if needed
        COMPOSE_HTTP_TIMEOUT = "200"
    }

    stages {
        stage('Checkout Code') {
            steps {
                checkout scm
                echo 'Source code checked out successfully.'
            }
        }

        stage('Build & Deploy with Docker Compose') {
            steps {
                script {
                    echo 'Building and starting Docker containers...'
                    sh 'sudo docker compose up --build -d'
                }
            }
        }
    }

    post {
        success {
            echo 'Deployment Pipeline completed successfully!'
        }
        failure {
            echo 'Deployment Pipeline failed. Please check the logs.'
        }
    }
}
