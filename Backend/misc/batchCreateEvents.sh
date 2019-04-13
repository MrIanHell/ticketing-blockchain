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
jwtToken='a eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVzZXI1QGdtYWlsLmNvbSIsInVzZXJJZCI6IjVjYjIyN2Y3ZDZmNTUwMzVkZjExMmQ5ZSIsImFjY0FkZHJlc3MiOiIweGY0MDc5MmFEMUI3NzJGQmQ1MjE5Qjk3OTBiRjIzYTRkRmFGYTkyNTYiLCJpYXQiOjE1NTUxNzk2MTYsImV4cCI6MTU1NTIyMjgxNn0.O-HQ8EtAN6BcMX7A2OQh8gNAOyVjiqd6-JEMhUabzz0'

# CREATING EVENTS
echo "\n------CREATING EVENTS------\n"
for i in {1..100}
do
    echo Creating event $i of 100
    curl -d '{"name": "Dummy Event",  "totalSupply": 10000, "faceValue": 28.25, "date": "2016-07-06T12:35:00"}' -H "Content-Type: application/json" -H "authorization: $jwtToken" -k -X POST http://localhost:5000/events
    echo \n
done