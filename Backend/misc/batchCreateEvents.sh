# CREATING USERS
echo "------CREATING USERS------\n"
curl -d '{"email":"user1@gmail.com", "password":"user1"}' -H "Content-Type: application/json" -k -X POST http://localhost:5000/auth/signup
curl -d '{"email":"user2@gmail.com", "password":"user2"}' -H "Content-Type: application/json" -k -X POST http://localhost:5000/auth/signup
curl -d '{"email":"user3@gmail.com", "password":"user3"}' -H "Content-Type: application/json" -k -X POST http://localhost:5000/auth/signup
curl -d '{"email":"user4@gmail.com", "password":"user4"}' -H "Content-Type: application/json" -k -X POST http://localhost:5000/auth/signup
curl -d '{"email":"user5@gmail.com", "password":"user5"}' -H "Content-Type: application/json" -k -X POST http://localhost:5000/auth/signup

# AUTHENTICATING AND STORING JWT TOKEN
echo "\n\n------GENERATING JWTs------\n"
auth1=$(curl -d '{"email":"user1@gmail.com", "password":"user1"}' -H "Content-Type: application/json" -k -X POST http://localhost:5000/auth/login)
echo $(echo $auth1 | tr -d '"')
jwtToken='a eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVzZXIxQGdtYWlsLmNvbSIsInVzZXJJZCI6IjVjYjMyNjY2Y2NiNjY3NWNhOTA3OTFmZCIsImFjY0FkZHJlc3MiOiIweGIyNmEwMWU1QUY2ODFERTQ0YzBCOEI5RTBiZERCZWNhNGMwNDQzRDgiLCJpYXQiOjE1NTUyNDQ2NjIsImV4cCI6MTU1NTI4Nzg2Mn0.WexL9tDPtj2Qkz4-BIRJwkROwQ_OImTUYVdSCmBDO58'

# CREATING EVENTS
echo "\n------CREATING EVENTS------\n"
for i in {1..100}
do
    echo Creating event $i of 100
    curl -d '{"name": "Dummy Event",  "totalSupply": 10000, "faceValue": 28.25, "date": "2016-07-06T12:35:00"}' -H "Content-Type: application/json" -H "authorization: $jwtToken" -k -X POST http://localhost:5000/events
    echo \n
done