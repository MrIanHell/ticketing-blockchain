# A Blockchain Based E-Ticketing System

Instructions to deploy the ticketing system:
1. Go into the "Blockchain Setup" directory
2. Run the following command: _docker-compose up -d_
3. Wait for the blockchain layer to be fully deployed
4. Install MongoDB and start it up using its default port (27017)
5. Go into the "Backend" directory
6. Run the following command: _docker-compose up -d_
7. Go into the "Frontend" directory
8. Run the following command: _docker-compose up -d_

Everything should now be successfully deployed, you can customise endpoints used to communicate between layers by editing their respective docker-compose files

### Resulting Services and their URL Endpoints
Service  | URL Endpoint
------------- | -------------
Frontend Web Application | http://localhost:5500
Backend API | http://localhost:5000
Ethereum network status monitor | http://localhost:3000
Ethereum Blockchain Explorer | http://localhost:8080