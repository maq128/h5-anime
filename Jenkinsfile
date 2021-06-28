pipeline {
	agent any
	stages {
		stage('Build package') {
			agent {
				docker {
					image 'node:14-alpine'
					reuseNode true
				}
			}
			steps {
				sh 'npm install'
				sh "npm run build"
			}
		}

		stage('Build docker image') {
			steps {
				sh 'docker build -t h5-anime .'
			}
		}

		stage('Update service') {
			steps {
				sh "docker-compose up -d"
			}
		}
	}
}
