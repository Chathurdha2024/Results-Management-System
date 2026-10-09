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

        stage('Build Images & Deploy to Kubernetes') {
            steps {
                script {
                    echo 'Building images inside the Minikube Cloud Cluster...'
                    sh '''
                    # Tell Docker to build images directly inside Minikube
                    export MINIKUBE_HOME=/home/ubuntu
                    eval $(minikube docker-env)
                    
                    docker build -t engrms/backend:latest ./backend
                    docker build -t engrms/admin-frontend:latest ./frontend
                    docker build -t engrms/student-frontend:latest ./student-frontend
                    '''
                    
                    echo 'Applying Kubernetes Manifests...'
                    sh '''
                    export MINIKUBE_HOME=/home/ubuntu
                    minikube kubectl -- apply -f k8s/
                    
                    # Force Kubernetes to use the newly built images
                    minikube kubectl -- rollout restart deployment backend-api
                    minikube kubectl -- rollout restart deployment admin-frontend
                    minikube kubectl -- rollout restart deployment student-frontend
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
