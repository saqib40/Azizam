for i in {1..6};
do curl -X POST -H "Content-Type: application/json" -d '{"username":"admin","password":"SELECT * FROM users"}' http://localhost:4000/v1/userLogin;
done