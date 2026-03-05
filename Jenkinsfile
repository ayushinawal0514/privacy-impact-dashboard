pipeline {
    agent any

    tools {
        nodejs "node22"
    }

    environment {
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

        stage('Install Dependencies') {
            steps {
                bat 'npm install'
            }
        }

        stage('Build Application') {
            steps {
                bat 'npm run build'
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
    }
}