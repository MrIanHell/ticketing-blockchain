# A Blockchain Based E-Ticketing System

Instructions to deploy the ticketing system:
1. Go into the "Blockchain Setup" directory
2. Run the following command: docker-compose up -d
3. Wait for the blockchain layer to be fully deployed
4. Install MongoDB and start it up using its default port
5. Go into the "Backend" directory
6. Ensure you have npm and node v10.15.3 installed
7. Run the following command: npm install -g nodemon
7. Run the following command: npm install
8. Run the following command to deploy the backend API: nodemon server.js
9. Go into the "Frontend" directory
10. Run the following command: docker-compose up -d

Everything should now be successfully deployed

Use the these URLs to access the following services:
    Frontend web application: http://localhost:5500/
    Backend API: http://localhost:5000/
    Ethereum network status monitor: http://localhost:3000/
    Ethereum Blockchain Explorer: http://localhost:8080/