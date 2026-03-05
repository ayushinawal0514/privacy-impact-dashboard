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
                 bat 'C:\\nvm4w\\nodejs\\npm.cmd install'
            }
        }

        stage('Build Application') {
            steps {
                bat 'C:\\nvm4w\\nodejs\\npm.cmd run build'
            }
        }

        stage('Run Application') {
            steps {
                bat 'C:\\nvm4w\\nodejs\\npm.cmd start'
            }
        }
    }
}