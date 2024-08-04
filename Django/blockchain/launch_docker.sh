docker rm -f transcendance-blockchain-container
docker build -t transcendance-blockchain .
docker run -d --name transcendance-blockchain-container -p 8545:8545 transcendance-blockchain
sleep 9
docker exec -it transcendance-blockchain-container /bin/bash