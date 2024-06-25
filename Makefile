all: up

up:
	docker-compose -f ./docker-compose.yml up --build

detach:
	docker-compose -f ./docker-compose.yml up -d --build

down:
	docker compose -f ./docker-compose.yml down

clean: down
	docker volume rm $$(docker volume ls -q)
	docker builder prune -a

.PHONY: all detach up down clean