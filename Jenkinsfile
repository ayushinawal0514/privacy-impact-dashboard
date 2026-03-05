pipeline {
    agent any

    stages {
        stage('Clone Repository') {
            steps {
                git branch: 'staging', url: 'https://github.com/ayushinawal0514/privacy-impact-dashboard.git'
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