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

        stage('Build & Deploy to K3s Kubernetes') {
            steps {
                script {
                    echo 'Building images with Docker...'
                    sh '''
                    docker build -t engrms/backend:latest ./backend
                    docker build -t engrms/admin-frontend:latest ./frontend
                    docker build -t engrms/student-frontend:latest ./student-frontend
                    '''
                    
                    echo 'Injecting images into K3s Cloud Cluster...'
                    sh '''
                    docker save engrms/backend:latest | sudo k3s ctr images import -
                    docker save engrms/admin-frontend:latest | sudo k3s ctr images import -
                    docker save engrms/student-frontend:latest | sudo k3s ctr images import -
                    '''
                    
                    echo 'Applying Kubernetes Manifests...'
                    sh '''
                    sudo k3s kubectl apply -f k8s/
                    sudo k3s kubectl rollout restart deployment backend-api
                    sudo k3s kubectl rollout restart deployment admin-frontend
                    sudo k3s kubectl rollout restart deployment student-frontend
                    '''
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
