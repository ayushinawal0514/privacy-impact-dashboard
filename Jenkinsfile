pipeline {
    agent any

    environment {
        PATH = "C:\\nvm4w\\nodejs;${env.PATH}"
    }

    stages {

        stage('Clean Workspace') {
            steps {
                deleteDir()
            }
        }

        stage('Clone Repository') {
            steps {
                git branch: 'staging', url: 'https://github.com/ayushinawal0514/privacy-impact-dashboard.git'
            }
        }

        stage('Check Node Version') {
            steps {
                bat 'node -v'
                bat 'npm -v'
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

        stage('Run Application') {
            steps {
                bat 'npm start'
            }
        }

    }
}