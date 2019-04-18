# CREATING USERS
echo "------CREATING USERS------\n"
curl -d '{"email":"user1@gmail.com", "password":"user1"}' -H "Content-Type: application/json" -k -X POST http://localhost:5000/auth/signup
curl -d '{"email":"user2@gmail.com", "password":"user2"}' -H "Content-Type: application/json" -k -X POST http://localhost:5000/auth/signup
curl -d '{"email":"user3@gmail.com", "password":"user3"}' -H "Content-Type: application/json" -k -X POST http://localhost:5000/auth/signup
curl -d '{"email":"user4@gmail.com", "password":"user4"}' -H "Content-Type: application/json" -k -X POST http://localhost:5000/auth/signup
curl -d '{"email":"user5@gmail.com", "password":"user5"}' -H "Content-Type: application/json" -k -X POST http://localhost:5000/auth/signup

# AUTHENTICATING AND STORING JWT TOKEN
# echo "\n\n------GENERATING JWTs------\n"
# auth1=$(curl -d '{"email":"user1@gmail.com", "password":"user1"}' -H "Content-Type: application/json" -k -X POST http://localhost:5000/auth/login)
# echo $(echo $auth1 | tr -d '"')
jwtToken='a eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVzZXIxQGdtYWlsLmNvbSIsInVzZXJJZCI6IjVjYjc3OGE4NzI4MTgyMTk3MDhkMDg2NyIsImFjY0FkZHJlc3MiOiIweGQ1OEZBRDRjRDZEN0ZEZjZENjIxMTU5NTQ2ODQwMzJmZTlBQzM3YjQiLCJpYXQiOjE1NTU1Mjc4NjUsImV4cCI6MTU1NTU3MTA2NX0.wmxF1WsgC3lX-NgzoDxs80UQk8xQVcZtk-aqrZKCaOE'

# CREATING EVENTS
echo "\n------CREATING EVENTS------\n"
for i in {1..49}
do
    echo Creating event $i of 100
    curl -d '{"name": "Dummy Event",  "description": "Lorem ipsum dolor sit amet, ad eam dolore prodesset. Ei aliquip aperiam vel, in mea singulis abhorreant. Tantas luptatum nam cu, cu tibique ancillae patrioque eam. Vel diam veniam pericula ea. Meliore erroribus definitiones ne cum. An incorrupte persequeris mel, case dicit nemore eam id. Doming mentitum expetenda no sed, an fastidii electram elaboraret eos. Mea in partem dolorem. Purto aeque eirmod mel et, quaeque phaedrum est et, eu cum idque dissentias. Luptatum democritum elaboraret id nam, eum veritus epicuri legendos ne.",  "totalSupply": 10000, "faceValue": 28.25, "date": "2016-07-06T14:35:00"}' -H "Content-Type: application/json" -H "authorization: $jwtToken" -k -X POST http://localhost:5000/events
    echo \n
done