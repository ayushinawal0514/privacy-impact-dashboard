pipeline {
    agent any

    tools {
        nodejs "node22"
    }

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    environment {
        APP_NAME = "healthcare-privacy-platform"
        NODE_ENV = "production"

        NEXTAUTH_URL = "http://localhost:3000"
        NEXT_PUBLIC_API_URL = "http://localhost:3001/api"
        FRONTEND_URL = "http://localhost:3000"

        MONGODB_URI = "mongodb://localhost:27017/test"
        JWT_SECRET = credentials('jwt-secret')
        NEXTAUTH_SECRET = credentials('nextauth-secret')
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

        stage('Check Environment') {
            steps {
                bat 'node -v'
                bat 'npm -v'
                bat 'dir'
            }
        }

        stage('Install Backend Dependencies') {
            steps {
                dir('backend') {
                    bat 'if exist package-lock.json (npm ci --include=dev) else (npm install)'
                }
            }
        }

        stage('Install Frontend Dependencies') {
            steps {
                dir('frontend') {
                    bat 'if exist package-lock.json (npm ci --include=dev) else (npm install)'
                }
            }
        }

        stage('Build Backend') {
            steps {
                dir('backend') {
                    bat 'npm run build'
                }
            }
        }

        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    bat 'npm run build'
                }
            }
        }

        stage('Run Backend Tests') {
            steps {
                dir('backend') {
                    bat 'npm test -- --passWithNoTests'
                }
            }
        }

        stage('Run Frontend Tests') {
            steps {
                dir('frontend') {
                     bat 'if exist node_modules\\jest\\bin\\jest.js (npm test -- --passWithNoTests) else (echo No frontend tests configured)'
                }
            }
        }

        stage('Archive Build Artifacts') {
            steps {
                archiveArtifacts artifacts: 'backend/dist/**, frontend/.next/**', fingerprint: true, allowEmptyArchive: true
            }
        }
    }

    post {
        success {
            echo 'Build completed successfully.'
        }
        failure {
            echo 'Pipeline failed. Check console logs.'
        }
        always {
            echo 'Pipeline execution finished.'
            cleanWs()
        }
    }
}