pipeline {
    agent any

    tools {
        nodejs "node22"
    }

    environment {
        APP_NAME = "healthcare-privacy-platform"
        NODE_ENV = "development"
        NEXTAUTH_URL = "http://localhost:3000"
        NEXTAUTH_SECRET = "testsecret"
        MONGODB_URI = "mongodb://localhost:27017/test"
    }

    stages {
        stage('Clean Workspace') {
            steps {
                deleteDir()
            }
        }

        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Check Node Version') {
            steps {
                bat 'node -v'
                bat 'npm -v'
            }
        }

        stage('Check Files') {
            steps {
                bat 'dir'
            }
        }

        stage('Install Backend Dependencies') {
            steps {
                bat 'cd backend && npm install'
            }
        }

        stage('Install Frontend Dependencies') {
            steps {
                bat 'cd frontend && npm install'
            }
        }

        stage('Build Backend') {
            steps {
                bat 'cd backend && npm run build'
            }
        }

        stage('Build Frontend') {
            steps {
                bat 'cd frontend && npm run build'
            }
        }
    }

    post {
        success {
            echo 'Build completed successfully!'
        }
        failure {
            echo 'Pipeline failed. Check logs.'
        }
        always {
            echo 'Pipeline execution finished.'
        }
    }
}